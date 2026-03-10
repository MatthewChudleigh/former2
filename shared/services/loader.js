/**
 * Dual-loader for service files.
 *
 * Loads converted modules via require() and legacy files via VM sandbox.
 * Both paths feed into the registry AND bridge into the VM context, so
 * cli/main.js sees a unified view through the same vmContext properties
 * it already uses (sections, updateDatatable*, service_mapping_functions).
 *
 * A service is considered "converted" when a file with the same basename
 * exists in shared/services/ (this directory). Infrastructure files
 * (registry.js, loader.js, index.js) are excluded from the check.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { registry, registerService } = require('./registry');

const INFRA_FILES = new Set(['registry', 'loader', 'index']);

/**
 * Load all services — converted modules via require(), legacy via VM sandbox.
 *
 * Converted modules are bridged into vmContext so that cli/main.js can
 * consume them through the same paths as legacy services:
 *   - section → vmContext.sections[]
 *   - updateDatatable → vmContext['updateDatatable' + key]
 *   - mapResources → vmContext.service_mapping_functions[]
 *
 * @param {Object} vmContext   - The VM sandbox context (for legacy files)
 * @param {Object} context     - The Former2Context (for converted modules)
 * @param {Function} nav       - The nav() helper for building function name keys
 */
function loadAllServices(vmContext, context, nav) {
    const legacyDir = path.join(__dirname, '../../js/services');
    const convertedDir = __dirname;

    // Build the set of all service basenames from both directories.
    // This allows converted-only services (no legacy counterpart) to be loaded.
    const legacyFiles = fs.readdirSync(legacyDir).filter(f => f.endsWith('.js'));
    const convertedFiles = fs.readdirSync(convertedDir)
        .filter(f => f.endsWith('.js') && !INFRA_FILES.has(path.basename(f, '.js')));

    const allBasenames = new Set();
    for (const f of legacyFiles) allBasenames.add(path.basename(f, '.js'));
    for (const f of convertedFiles) allBasenames.add(path.basename(f, '.js'));

    const sorted = Array.from(allBasenames).sort();

    for (const basename of sorted) {
        const convertedPath = path.join(convertedDir, basename + '.js');
        const legacyPath = path.join(legacyDir, basename + '.js');
        const hasConverted = fs.existsSync(convertedPath);
        const hasLegacy = fs.existsSync(legacyPath);

        if (hasConverted) {
            // Converted module — load via require()
            const serviceModule = require('./' + basename);

            // Wrap updateDatatable to inject context and bridge resources to cli_resources
            const wrappedUpdate = async () => {
                const resources = await serviceModule.updateDatatable(context);
                if (resources && resources.length) {
                    for (const r of resources) {
                        vmContext.cli_resources.push(r);
                    }
                }
            };

            // Register in the module-based registry (for future direct consumption)
            registerService({
                section: serviceModule.section,
                mapResources: serviceModule.mapResources,
                updateDatatable: wrappedUpdate,
            }, nav);

            // Bridge into VM context so main.js works without modification
            vmContext.sections.push(serviceModule.section);

            const key = nav(serviceModule.section.category) + nav(serviceModule.section.service);
            vmContext['updateDatatable' + key] = wrappedUpdate;

            // Wrap mapResources to bridge getResourceName from VM context.
            // getResourceName is defined in mappings.js (loaded into vmContext)
            // and uses VM-scoped state (global_used_refs, logicalidstrategy, etc.).
            // We expose it as a Node global so converted modules can reference it.
            vmContext.service_mapping_functions.push(function(reqParams, obj, tracked_resources) {
                const prevGetResourceName = global.getResourceName;
                global.getResourceName = vmContext.getResourceName;
                try {
                    return serviceModule.mapResources(reqParams, obj, tracked_resources);
                } finally {
                    global.getResourceName = prevGetResourceName;
                }
            });
        } else if (hasLegacy) {
            // Legacy file — load via VM sandbox (existing path)
            vm.runInContext(
                fs.readFileSync(legacyPath, 'utf8'),
                vmContext,
                { filename: 'js/services/' + basename + '.js' }
            );
        }
    }
}

module.exports = { loadAllServices };
