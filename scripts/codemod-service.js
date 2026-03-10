#!/usr/bin/env node
/**
 * Converts a Former2 service file from global-based to module-based.
 *
 * Usage:
 *   node scripts/codemod-service.js js/services/s3.js shared/services/s3.js
 *   node scripts/codemod-service.js --all          # Convert all unconverted files
 *   node scripts/codemod-service.js --dry-run      # Show what would be converted
 */

const fs = require('fs');
const path = require('path');

const INFRA_FILES = new Set(['registry', 'loader', 'index']);
const SHARED_DIR = path.join(__dirname, '..', 'shared', 'services');
const LEGACY_DIR = path.join(__dirname, '..', 'js', 'services');

// Formatter globals that need to become string references in module context
const FORMATTERS = [
    'primaryFieldFormatter',
    'textFormatter',
    'dateFormatter',
    'tickFormatter',
    'byteSizeFormatter',
    'timeAgoFormatter',
    'lambdaRuntimeFormatter',
];

function convertFile(source) {
    let output = source;

    // ── 0. Remove leading comment header ──
    output = output.replace(/^\/\*[\s\S]*?\*\/\s*\/\/[^\n]*\n\/\*[\s\S]*?\*\/\s*\n*/m, '');

    // ── 1. sections.push({...}) → const section = {...} ──
    // Match sections.push( and find the matching closing );
    const sectionsMatch = output.match(/^sections\.push\(/m);
    if (sectionsMatch) {
        const startIdx = sectionsMatch.index;
        // Find the matching closing paren+semicolon by brace/paren counting
        const pushStart = startIdx + 'sections.push('.length;
        let depth = 1; // we're inside the push( paren
        let i = pushStart;
        while (i < output.length && depth > 0) {
            if (output[i] === '(' || output[i] === '{' || output[i] === '[') depth++;
            else if (output[i] === ')' || output[i] === '}' || output[i] === ']') depth--;
            i++;
        }
        // i is now past the closing ), look for ;
        const endIdx = output.indexOf(';', i - 1) + 1;
        const innerContent = output.substring(pushStart, i - 1);
        output = output.substring(0, startIdx) + 'const section = ' + innerContent + ';' + output.substring(endIdx);
    }

    // ── 2. Convert formatter bare references to strings in section definition ──
    // Only in the section definition (before the first async function)
    const firstAsync = output.indexOf('async function');
    if (firstAsync > 0) {
        let sectionPart = output.substring(0, firstAsync);
        for (const fmt of FORMATTERS) {
            // Match formatter: formatterName or footerFormatter: formatterName
            // but NOT already-quoted ones
            const re = new RegExp(`((?:footer)?[Ff]ormatter:\\s*)${fmt}(?!['"])`, 'g');
            sectionPart = sectionPart.replace(re, `$1'${fmt}'`);
        }
        output = sectionPart + output.substring(firstAsync);
    }

    // ── 3. Rename updateDatatable function and add resources array ──
    output = output.replace(
        /async function updateDatatable\w+\(\)\s*\{/,
        'async function updateDatatable(context) {\n    const resources = [];'
    );

    // ── 4. Remove blockUI/unblockUI lines ──
    output = output.replace(/^\s*blockUI\([^)]*\);\s*\n/gm, '');
    output = output.replace(/^\s*unblockUI\([^)]*\);\s*\n/gm, '');

    // ── 5. Remove deferredBootstrapTable('removeAll') lines ──
    output = output.replace(/^\s*\$\([^)]*\)\.deferredBootstrapTable\('removeAll'\);\s*\n/gm, '');

    // ── 6. Replace deferredBootstrapTable('append', [...]) → resources.push(...) ──
    // This handles multi-line append calls with nested objects
    output = replaceDeferredAppends(output);

    // ── 7. Replace global references with context.* ──
    // sdkcall( → context.sdkcall( (but not .sdkcall or context.sdkcall)
    output = output.replace(/(?<![.\w])sdkcall\(/g, 'context.sdkcall(');

    // f2region: region → f2region: context.region (but not obj.region, data.region, etc.)
    output = output.replace(/f2region:\s*region\b/g, 'f2region: context.region');

    // getResourceTags( → context.getResourceTags(
    output = output.replace(/(?<![.\w])getResourceTags\(/g, 'context.getResourceTags(');

    // stripAWSTags stays as a bare reference — bridged as a Node global by the loader,
    // since it's used in both updateDatatable and mapResources (where context isn't in scope).

    // include_default_resources → context.include_default_resources
    output = output.replace(/(?<![.\w])include_default_resources\b/g, 'context.include_default_resources');

    // ── 8. Convert service_mapping_functions.push(function(...) {...}); ──
    output = convertMappingFunction(output);

    // ── 9. Add return resources before the closing brace of updateDatatable ──
    output = addReturnResources(output);

    // ── 10. Add module.exports ──
    // Remove trailing whitespace
    output = output.trimEnd();
    output += '\n\nmodule.exports = { section, updateDatatable, mapResources };\n';

    return output;
}

/**
 * Replace all $(...).deferredBootstrapTable('append', [...]) with resources.push(...)
 */
function replaceDeferredAppends(source) {
    let output = source;
    let safety = 0;

    while (safety++ < 1000) {
        const match = output.match(/\$\([^)]*\)\.deferredBootstrapTable\('append',\s*\[/);
        if (!match) break;

        const startIdx = match.index;
        // Find the start of the array argument [
        const arrayStart = output.indexOf('[', startIdx + match[0].length - 1);

        // Find matching ] for the outer array
        let depth = 1;
        let i = arrayStart + 1;
        while (i < output.length && depth > 0) {
            if (output[i] === '[') depth++;
            else if (output[i] === ']') depth--;
            i++;
        }
        const arrayEnd = i; // past the ]

        // Find the closing ); after the array
        let afterArray = output.substring(arrayEnd).match(/^\s*\)/);
        const fullEnd = arrayEnd + (afterArray ? afterArray[0].length : 0);

        // Find the semicolon
        const semiEnd = output.indexOf(';', fullEnd - 1);
        const realEnd = semiEnd >= 0 ? semiEnd + 1 : fullEnd;

        // Extract the array contents (between [ and ])
        const arrayContents = output.substring(arrayStart + 1, arrayEnd - 1).trim();

        // Determine indentation of the original line
        let lineStart = startIdx;
        while (lineStart > 0 && output[lineStart - 1] !== '\n') lineStart--;
        const indent = output.substring(lineStart, startIdx).match(/^\s*/)[0];

        // The array contents is typically [{...}] — we want resources.push({...})
        // If it's a single-element array [{...}], unwrap to just {...}
        let pushContent = arrayContents;
        if (pushContent.startsWith('{')) {
            // Single object in array — push directly
            output = output.substring(0, lineStart) + indent + 'resources.push(' + pushContent + ');\n' + output.substring(realEnd).replace(/^\s*\n/, '');
        } else {
            output = output.substring(0, lineStart) + indent + 'resources.push(' + pushContent + ');\n' + output.substring(realEnd).replace(/^\s*\n/, '');
        }
    }

    return output;
}

/**
 * Convert service_mapping_functions.push(function(...) {...}); to function mapResources(...) {...}
 */
function convertMappingFunction(source) {
    const marker = source.match(/service_mapping_functions\.push\((async\s+)?function/);
    if (!marker) return source;
    const idx = marker.index;
    const isAsync = !!marker[1];

    // Find the function signature: function(reqParams, obj, tracked_resources) {
    const sigStart = idx + 'service_mapping_functions.push('.length;
    const braceStart = source.indexOf('{', sigStart);
    const signature = source.substring(sigStart, braceStart).trim();

    // Extract params from "function(reqParams, obj, tracked_resources)" or "async function(...)"
    const paramsMatch = signature.match(/(?:async\s+)?function\s*\(([^)]*)\)/);
    const params = paramsMatch ? paramsMatch[1] : 'reqParams, obj, tracked_resources';

    // Find the matching closing brace for the function body
    let depth = 1;
    let i = braceStart + 1;
    while (i < source.length && depth > 0) {
        if (source[i] === '{') depth++;
        else if (source[i] === '}') depth--;
        i++;
    }
    const bodyEnd = i; // past the closing }

    // Now we're at the closing } of the function. After it should be );
    const afterBody = source.substring(bodyEnd).match(/^\s*\)\s*;/);
    const fullEnd = afterBody ? bodyEnd + afterBody[0].length : bodyEnd;

    const functionBody = source.substring(braceStart + 1, bodyEnd - 1);

    // Build the new function
    const asyncPrefix = isAsync ? 'async ' : '';
    const newFunc = `${asyncPrefix}function mapResources(${params}) {${functionBody}}`;

    return source.substring(0, idx) + newFunc + source.substring(fullEnd);
}

/**
 * Add 'return resources;' before the closing brace of updateDatatable
 */
function addReturnResources(source) {
    // Find 'async function updateDatatable(context)'
    const funcStart = source.indexOf('async function updateDatatable(context)');
    if (funcStart < 0) return source;

    // Find the opening brace
    const braceStart = source.indexOf('{', funcStart);

    // Find the matching closing brace
    let depth = 1;
    let i = braceStart + 1;
    while (i < source.length && depth > 0) {
        if (source[i] === '{') depth++;
        else if (source[i] === '}') depth--;
        i++;
    }
    const closingBrace = i - 1;

    // Insert 'return resources;' before the closing brace
    const before = source.substring(0, closingBrace);
    const after = source.substring(closingBrace);

    // Check if return resources already exists
    if (before.includes('return resources;')) return source;

    return before.trimEnd() + '\n\n    return resources;\n' + after;
}

// ── CLI entry point ──

function main() {
    const args = process.argv.slice(2);

    if (args.includes('--all') || args.includes('--dry-run')) {
        const dryRun = args.includes('--dry-run');
        const legacyFiles = fs.readdirSync(LEGACY_DIR).filter(f => f.endsWith('.js')).sort();

        let converted = 0;
        let skipped = 0;

        for (const filename of legacyFiles) {
            const basename = path.basename(filename, '.js');
            const sharedPath = path.join(SHARED_DIR, filename);

            if (INFRA_FILES.has(basename)) continue;

            if (fs.existsSync(sharedPath)) {
                skipped++;
                continue;
            }

            if (dryRun) {
                console.log(`Would convert: ${filename}`);
                converted++;
                continue;
            }

            const source = fs.readFileSync(path.join(LEGACY_DIR, filename), 'utf8');
            const result = convertFile(source);
            fs.writeFileSync(sharedPath, result);
            console.log(`Converted: ${filename}`);
            converted++;
        }

        console.log(`\n${converted} converted, ${skipped} already exist`);
        if (dryRun) console.log('(dry run — no files written)');
    } else if (args.length >= 1) {
        const inputPath = args[0];
        const outputPath = args[1] || path.join(SHARED_DIR, path.basename(inputPath));

        const source = fs.readFileSync(inputPath, 'utf8');
        const result = convertFile(source);
        fs.writeFileSync(outputPath, result);
        console.log(`Converted: ${inputPath} → ${outputPath}`);
    } else {
        console.log('Usage:');
        console.log('  node scripts/codemod-service.js <input> [output]');
        console.log('  node scripts/codemod-service.js --all');
        console.log('  node scripts/codemod-service.js --dry-run');
    }
}

module.exports = { convertFile };

if (require.main === module) {
    main();
}
