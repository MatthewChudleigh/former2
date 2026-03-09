# Stage 6: Update CLI to Import Directly

## Objective

Remove the VM sandbox from `cli/main.js`. Replace with direct `require()` calls to shared modules. This eliminates the `vm` module dependency and all browser environment simulation.

## Current CLI Architecture (`cli/main.js`, 527 lines)

The CLI currently:

1. **Simulates browser globals** (lines 27-147):
   - `blockUI()`, `unblockUI()` — no-op stubs
   - `$()` → `$obj` — jQuery mock that collects resources via `cli_resources`
   - `$.notify` — no-op
   - `window: undefined`
   - `AWS: {}`, `_AWS: {}`
   - `console`, `setTimeout`, `Promise`, `Buffer` — Node builtins passed through

2. **Loads browser JS into VM sandbox** (lines 149-167):
   - `vm.runInContext(mappings.js, context)`
   - `vm.runInContext(datatables.js, context)`
   - `vm.runInContext(services/*.js, context)` — all 139 files

3. **Overrides sdkcall** (lines 178-182):
   - Replaces the v2 sdkcall (from datatables.js) with v3 implementation from `sdk-v3-shim.js`

4. **Orchestrates scan** (lines 357-438):
   - Filters sections by service name
   - Runs `updateDatatable*` functions in parallel
   - Collects resources via `cli_resources` array
   - Calls `performF2Mappings()` and `compileOutputs()` for IaC output

## Target CLI Architecture

After conversion, `cli/main.js` should:

1. **Import shared modules directly** — no VM, no browser mocks
2. **Create context object** — with sdkcall, region, utilities
3. **Run services** — call `updateDatatable(context)` directly
4. **Map and compile** — call shared mapping functions

## Detailed Tasks

### 6.1 Remove VM Sandbox Infrastructure

Delete from `cli/main.js`:

```js
// DELETE: VM module import
const vm = require('vm');

// DELETE: jQuery mock (lines 97-109)
function $(selector) { return new $obj(selector) }
$obj = function (selector) { };
$obj.prototype.bootstrapTable = function (action, data) { ... }
$obj.prototype.deferredBootstrapTable = function (action, data) { ... }
$.notify = function () { }

// DELETE: blockUI/unblockUI stubs (lines 27-28)
function blockUI() { }
function unblockUI() { }

// DELETE: VM context creation (lines 117-147)
var context = vm.createContext({ ... });

// DELETE: VM script loading (lines 149-167)
vm.runInContext(fs.readFileSync('js/mappings.js'), context);
vm.runInContext(fs.readFileSync('js/datatables.js'), context);
var items = fs.readdirSync('js/services');
for (...) { vm.runInContext(...); }

// DELETE: sdkcall override (lines 178-182)
context.sdkcall = createSdkcallV3({ ... }, scanReport);
```

### 6.2 Import Shared Modules

Replace with:

```js
const services = require('../shared/services');
const { performF2Mappings, compileOutputs, getLogicalToPhysicalIdMap } = require('../shared/mappings');
const { createSdkcallV3, configureV3 } = require('./sdk-v3-shim');
const { nav, applySearchFilter, applyRegexFilter, applyServiceFilter } = require('./utils');
```

### 6.3 Create Context Object

Replace the VM context with a plain object:

```js
function createContext(region, scanReport, opts) {
    const sdkcall = createSdkcallV3({
        f2debug: opts.debug ? (msg) => console.log(Date.now() + ": " + msg) : () => {},
        f2log: opts.debug ? (msg) => console.log(msg) : () => {},
        f2trace: opts.debug ? (err) => console.trace(err) : () => {},
    }, scanReport);

    return {
        sdkcall,
        region,
        getResourceTags,       // defined in main.js (uses context.sdkcall internally)
        stripAWSTags,          // pure function
        deepmerge: require('deepmerge'),
        include_default_resources: opts.includeDefaultResources || false,
    };
}
```

**Note:** `getResourceTags` (lines 29-72) references `context.sdkcall` internally. This creates a circular dependency — it needs the context to call sdkcall, but it's part of the context. Resolution: define `getResourceTags` as a closure that captures the sdkcall reference:

```js
function createGetResourceTags(sdkcall) {
    const cache = {};
    return async function getResourceTags(arn) {
        // ... existing implementation using sdkcall instead of context.sdkcall
    };
}
```

### 6.4 Rewrite Main Scan Loop

```js
async function main(opts) {
    // Region and profile setup (unchanged)
    // ...

    const context = createContext(region, scanReport, opts);

    // Get sections from all services
    let sections = services.map(s => s.section);
    sections = applyServiceFilter(sections, opts);

    const b1 = new cliprogress.SingleBar({ ... });
    b1.start(sections.length, 0);

    const allResources = [];
    const scanErrors = [];

    await Promise.all(
        sections.map((section, index) => {
            // Find the service module that owns this section
            const serviceModule = services.find(s => s.section === section);

            return new Promise(async resolve => {
                try {
                    const resources = await serviceModule.updateDatatable(context);
                    if (resources && resources.length) {
                        allResources.push(...resources);
                    }
                } catch (err) {
                    scanErrors.push({
                        service: section.service,
                        category: section.category,
                        error: err
                    });
                } finally {
                    b1.increment();
                    resolve();
                }
            });
        })
    );

    b1.stop();
    printScanReport(scanErrors, scanReport, opts, sections.length);

    // Raw data output
    if (opts.outputRawData) {
        fs.writeFileSync(opts.outputRawData, JSON.stringify(allResources, null, 4));
    }

    // IaC output
    saveOutput(opts, allResources, services);
}
```

### 6.5 Rewrite saveOutput

```js
function saveOutput(opts, resources, services) {
    if (opts.sortOutput) {
        resources = resources.sort((a, b) => (a.f2id > b.f2id) ? 1 : -1);
    }

    if (opts.outputCloudformation || opts.outputTerraform || /* ... */) {
        let filtered = applySearchFilter(resources, opts.searchFilter);
        filtered = applyRegexFilter(filtered, opts.regexFilter);

        const output_objects = filtered.map(resource => ({
            id: resource.f2id,
            type: resource.f2type,
            data: resource.f2data,
            region: resource.f2region,
        }));

        // Collect mapping functions from all services
        const mappingFunctions = services.map(s => s.mapResources);

        const tracked_resources = performF2Mappings(output_objects, mappingFunctions);
        const mapped_outputs = compileOutputs(tracked_resources, opts.cfnDeletionPolicy);

        if (opts.outputLogicalIdMapping) {
            fs.writeFileSync(opts.outputLogicalIdMapping, JSON.stringify(getLogicalToPhysicalIdMap()));
        }

        // Write output files (unchanged)
        if (opts.outputCloudformation) {
            fs.writeFileSync(opts.outputCloudformation, mapped_outputs['cfn']);
        }
        // ... etc
    }
}
```

### 6.6 Rewrite Filter Command

The `filter` command loads resources from a file and generates IaC output. Update similarly:

```js
cliargs
    .command('filter')
    .action((opts) => {
        parseOpts(opts);
        const resources = JSON.parse(fs.readFileSync(opts.inputFile).toString());
        // ... apply filters and generate output using shared modules
    });
```

### 6.7 Update `parseOpts`

Remove VM context references:

```js
// Before:
if (!opts.outputCdk) { context.outputMapCdk = function(){}; }

// After:
// This is handled by compileOutputs — only generate requested outputs
// These no-op overrides are no longer needed
```

The `parseOpts` function currently no-ops output generators by replacing them on the VM context. In the new architecture, `compileOutputs` generates all formats and the caller picks which ones to write. The no-op optimization can be handled differently:
- Pass a set of requested output formats to `compileOutputs`
- Or: keep generating all and only write requested ones (simpler, minor perf impact)

## Lines Removed vs Added (Estimated)

| Section | Lines Removed | Lines Added |
|---------|---------------|-------------|
| VM module import | 1 | 0 |
| jQuery mock | 12 | 0 |
| blockUI/unblockUI stubs | 2 | 0 |
| VM context creation | 31 | 0 |
| VM script loading | 19 | 2 (imports) |
| sdkcall override | 5 | 0 |
| Context creation | 0 | 20 |
| Main scan loop rewrite | 20 | 25 |
| saveOutput rewrite | 15 | 20 |
| **Total** | **~105** | **~67** |

Net reduction: ~38 lines, plus elimination of the `vm` dependency.

## Files to Modify

```
cli/main.js           # Major rewrite (~105 lines removed, ~67 added)
```

## Files Not Modified

```
cli/sdk-v3-shim.js    # Unchanged (still provides createSdkcallV3)
cli/utils.js          # Unchanged (still provides nav, filters)
```

## Validation Criteria

- `node cli/main.js generate --output-cloudformation out.yaml` produces identical output
- `node cli/main.js filter --input-file raw.json --output-terraform out.tf` produces identical output
- No `require('vm')` in CLI code
- No jQuery references (`$`, `$obj`, `deferredBootstrapTable`)
- No `blockUI`/`unblockUI` references
- Scan report (access denied, errors, etc.) works identically
- `--debug` flag works (logging)
- `--services` and `--exclude-services` filters work
- `--profile` and `--region` flags work
- `--proxy` flag works

## Dependencies

- Stage 5 (all 139 services converted to modules)
- Stage 4 (mappings decomposed into shared modules)

## Estimated Scope

- 1 file modified (`cli/main.js`)
- ~170 lines changed
- Net reduction in file size
- No new files
