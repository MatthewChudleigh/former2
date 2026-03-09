# Stage 2: Build the Dual-Loader

## Objective

Create a compatibility layer that lets converted (module-based) and unconverted (global-based) service files coexist. This is the key risk mitigation — it enables incremental migration with a working system at every step.

## Current Loading Mechanism (CLI)

From `cli/main.js:149-167`:
```js
// Load browser scripts into VM sandbox
vm.runInContext(fs.readFileSync('js/mappings.js'), context);
vm.runInContext(fs.readFileSync('js/datatables.js'), context);
var items = fs.readdirSync('js/services');
for (var i = 0; i < items.length; i++) {
    vm.runInContext(fs.readFileSync('js/services/' + items[i]), context);
}
```

After loading, the CLI accesses:
- `context.sections` — array populated by `sections.push()` calls in each service file
- `context['updateDatatable' + nav(category) + nav(service)]` — function registered as a global by each service file
- `context.performF2Mappings()` / `context.compileOutputs()` — from mappings.js
- `context.sdkcall` — overridden after loading with v3 shim

## Detailed Tasks

### 2.1 Create the Service Registry

A central registry that collects sections and mapping functions from both loading paths.

Create `shared/services/registry.js`:

```js
/**
 * Service registry that collects sections and mapping functions
 * from both converted modules and legacy VM-loaded globals.
 */
const registry = {
    sections: [],
    mappingFunctions: [],
    updateFunctions: {},  // keyed by nav(category) + nav(service)
};

function registerService(serviceModule, nav) {
    registry.sections.push(serviceModule.section);
    registry.mappingFunctions.push(serviceModule.mapResources);

    const key = nav(serviceModule.section.category) + nav(serviceModule.section.service);
    registry.updateFunctions[key] = serviceModule.updateDatatable;
}

module.exports = { registry, registerService };
```

### 2.2 Create the Dual-Loader for CLI

Create `shared/services/loader.js`:

```js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { registry, registerService } = require('./registry');

/**
 * Load all services — converted modules via require(), legacy via VM sandbox.
 *
 * @param {Object} vmContext - The VM sandbox context (for legacy files)
 * @param {Object} context - The Former2Context (for converted modules)
 * @param {Function} nav - The nav() helper for building function name keys
 */
function loadAllServices(vmContext, context, nav) {
    const servicesDir = path.join(__dirname, '../../js/services');
    const convertedDir = path.join(__dirname);

    const items = fs.readdirSync(servicesDir);

    for (const filename of items) {
        const basename = path.basename(filename, '.js');
        const convertedPath = path.join(convertedDir, basename + '.js');

        if (fs.existsSync(convertedPath) && basename !== 'registry' && basename !== 'loader' && basename !== 'index') {
            // Converted module — load via require()
            const serviceModule = require('./' + basename);

            // Wrap updateDatatable to inject context and bridge to cli_resources
            const wrappedUpdate = async () => {
                const resources = await serviceModule.updateDatatable(context);
                // Feed resources into the same collection path as legacy files
                if (resources && resources.length) {
                    context.onResources(resources);
                }
            };

            registerService({
                section: serviceModule.section,
                mapResources: serviceModule.mapResources,
                updateDatatable: wrappedUpdate,
            }, nav);
        } else {
            // Legacy file — load via VM sandbox (existing path)
            vm.runInContext(
                fs.readFileSync(path.join(servicesDir, filename), 'utf8'),
                vmContext,
                { filename: 'js/services/' + filename }
            );
        }
    }

    // Collect sections and mapping functions from VM-loaded services
    // These were pushed to vmContext.sections and vmContext.service_mapping_functions
    // The registry merges both sources
}

module.exports = { loadAllServices };
```

### 2.3 Convert One Service as Proof-of-Concept

Convert `js/services/simpledb.js` (99 lines, simplest service) to validate the dual-loader.

Create `shared/services/simpledb.js`:

```js
const section = {
    'category': 'Other',
    'service': 'SimpleDB',
    'resourcetypes': {
        'Domains': {
            'columns': [/* ... same column definitions ... */]
        }
    }
};

async function updateDatatable(context) {
    const resources = [];

    await context.sdkcall("SimpleDB", "listDomains", {}, false).then(async (data) => {
        await Promise.all(data.DomainNames.map(domainname => {
            return context.sdkcall("SimpleDB", "domainMetadata", {
                DomainName: domainname
            }, true).then((data) => {
                data['DomainName'] = domainname;
                resources.push({
                    f2id: "SDB " + data.DomainName,
                    f2type: 'simpledb.domain',
                    f2data: data,
                    f2region: context.region,
                    domainname: domainname,
                    itemcount: data.ItemCount
                });
            });
        }));
    }).catch(() => { });

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "simpledb.domain") {
        reqParams.cfn['Description'] = "REPLACEME";
        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('simpledb', obj.id, 'AWS::SDB::Domain'),
            'region': obj.region,
            'service': 'simpledb',
            'type': 'AWS::SDB::Domain',
            'options': reqParams,
            'returnValue': { 'Ref': obj.data.DomainName }
        });
    } else {
        return false;
    }
    return true;
}

module.exports = { section, updateDatatable, mapResources };
```

**Issue to resolve:** `mapResources` calls `getResourceName()` which is defined in `mappings.js`. Options:
1. Pass it via context (adds to context shape)
2. Import from `shared/mappings` (requires Stage 4 extraction)
3. For now, pass it as an additional argument or keep mapResources in the legacy path until Stage 4

**Recommended:** Option 1 — add `getResourceName` to context for now. It's a pure function with no side effects (only depends on `global_used_refs` state).

### 2.4 Update CLI main.js to Use Dual-Loader

Modify `cli/main.js` to:

1. After VM loading, also check `shared/services/` for converted modules
2. Merge `registry.sections` with `context.sections`
3. When running updateDatatable, check registry first, fall back to VM context
4. When running performF2Mappings, iterate both `registry.mappingFunctions` and `context.service_mapping_functions`

Key changes in `cli/main.js`:
- Lines 149-167: Replace direct service loading with dual-loader call
- Lines 394: Merge sections from both sources
- Lines 407-426: Check both sources for updateDatatable functions
- Line 207: Include both mapping function arrays in performF2Mappings

### 2.5 Integration Test

Verify the proof-of-concept:
1. Remove `simpledb.js` from `js/services/` (it's now in `shared/services/`)
2. Run CLI with `--services SimpleDB` against a test AWS account
3. Verify identical output to the pre-conversion version
4. Run full CLI scan to verify no regressions from the dual-loader

## Files to Create

```
shared/
  services/
    registry.js     # Service registry (sections, mappings, update functions)
    loader.js       # Dual-loader (require for converted, VM for legacy)
    simpledb.js     # Proof-of-concept converted service
    index.js        # Re-exports all converted services
```

## Files to Modify

```
cli/main.js         # Use dual-loader instead of direct VM loading
```

## Validation Criteria

- CLI produces identical output with SimpleDB loaded via module path vs legacy VM path
- All 138 remaining services still load correctly via VM sandbox
- No changes needed to `mappings.js` or `datatables.js`
- Both `generate` and `filter` commands work

## Dependencies

- Stage 1 (type definitions to conform to)

## Risks

- The `getResourceName()` dependency in mapResources needs resolution before full Stage 5 conversion
- The `context.onResources` callback pattern needs to bridge cleanly to `cli_resources` array
- VM context globals (`sections`, `service_mapping_functions`) need to be accessible from the loader

## Estimated Scope

- 4 new files in `shared/services/`
- Modifications to `cli/main.js` (~30-50 lines changed)
- 1 service file moved/converted (`simpledb.js`)
