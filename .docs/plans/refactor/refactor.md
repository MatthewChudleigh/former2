# Shared Code Refactor Plan

## Motivation

The CLI (`cli/main.js`) loads the browser JS files (`js/mappings.js`, `js/datatables.js`, `js/services/*.js`) into a `vm.createContext()` sandbox to reuse them without modification. This works but is fragile:

- Browser scripts use implicit globals instead of module exports
- The CLI must simulate a browser environment (jQuery stubs, `window`, `$`, etc.)
- `sdkcall` is overridden via a shim after eval — not proper dependency injection
- Service functions mix AWS API calls with jQuery DOM manipulation (`$('#section-...').deferredBootstrapTable('append', ...)`)
- Testing requires recreating the full VM context
- Debugging stack traces through `vm.runInContext` is harder than normal modules

The current approach exists because the `js/` files are the original upstream codebase from iann0036/former2, and keeping them untouched allowed clean merges. Once we diverge from upstream, this constraint no longer applies.

## Goal

Extract shared code into a module-based structure that both the CLI and web UI import from, removing the VM sandbox hack. The core challenge is **decoupling data collection from DOM manipulation** inside each service function — that's what makes the code truly shareable.

## Proposed Structure

```
shared/
  services/            # 139 files, one per AWS service
    s3.js              # exports: section, updateDatatable, mapResources
    ec2.js             # exports: section, updateDatatable, mapResources
    ...
    index.js           # collects and re-exports all services
  sdkcall.js           # sdkcall interface definition
  formatters.js        # primaryFieldFormatter, dateFormatter, byteSizeFormatter, etc.
  sections.js          # section registry (collects from all services)
  pagination.js        # pagination helpers (NextToken, Marker, etc.)
  deepmerge.js         # paginated response merging
  relationships.js     # RelationshipTypeMap
  mappings/
    index.js           # performF2Mappings(), compileOutputs()
    cfn.js             # CloudFormation output
    terraform.js       # Terraform output
    cdk.js             # CDK output
    ...

cli/
  main.js              # orchestrator — injects SDK v3 sdkcall
  sdk-v3-shim.js       # v3 sdkcall implementation (already exists)
  utils.js             # filtering utilities (already exists)

web/
  app.js               # browser orchestrator (UI wiring, tab building)
  index.html           # bundled via webpack/vite, imports from shared/
  sdkcall-browser.js   # browser-side sdkcall implementation
```

## Service Export Shape

Each service file currently does three things via globals. All three must be exported:

```js
// Current (browser global) pattern:
sections.push({ category: 'Storage', service: 'S3', resourcetypes: { ... } });

async function updateDatatableStorageS3() {
    await sdkcall("S3", "listBuckets", {}, true).then((data) => {
        $('#section-storage-s3-buckets-datatable').deferredBootstrapTable('append', [{
            f2id: ..., f2type: ..., f2data: ..., f2region: region, ...
        }]);
    });
}

service_mapping_functions.push(function(reqParams, obj, tracked_resources) {
    if (obj.type == "s3.bucket") { ... }
});
```

```js
// After (module export):
const section = { category: 'Storage', service: 'S3', resourcetypes: { ... } };

async function updateDatatable(context) {
    const resources = [];
    await context.sdkcall("S3", "listBuckets", {}, true).then((data) => {
        resources.push({
            f2id: ..., f2type: ..., f2data: ..., f2region: context.region, ...
        });
    });
    return resources;  // return data, don't touch the DOM
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "s3.bucket") { ... }
}

module.exports = { section, updateDatatable, mapResources };
```

Key change: services **return** collected resources instead of appending to mock DOM elements. This eliminates the jQuery mock dependency from shared code entirely.

## Context Object

Replaces all implicit globals used by service functions:

```js
const context = {
    sdkcall,          // AWS SDK call function (v3 CLI or v2 browser implementation)
    region,           // current AWS region
    getResourceTags,  // tag lookup helper
    deepmerge,        // paginated response merging
};
```

## Stages

### Stage 1: Define the shared interface ✓ COMPLETE

Design and document:
- The `context` object shape (what services receive)
- The service export shape (`{ section, updateDatatable, mapResources }`)
- The return type for `updateDatatable` (array of resource objects with `f2id`, `f2type`, `f2data`, `f2region`, etc.)
- The `sdkcall` function signature

Deliverable: `shared/types.js` — JSDoc definitions verified against all 139 service files. See `stage1-shared-interface.md` for validation details.

### Stage 2: Build the dual-loader ✓ COMPLETE

Create a compatibility layer that lets both old-style globals and new-style modules coexist. This enables incremental migration rather than a risky big-bang conversion.

For the CLI:
```js
// Load converted modules directly
const s3 = require('../shared/services/s3');
// Load unconverted files via existing VM sandbox
vm.runInContext(fs.readFileSync('js/services/ec2.js'), context);
```

For the web:
```html
<!-- Load converted modules via bundler -->
<script src="dist/services-bundle.js"></script>
<!-- Load unconverted files via script tags -->
<script src="js/services/ec2.js"></script>
```

Both paths feed into the same `sections[]` array and `service_mapping_functions[]` collection.

Deliverable: dual-loader working in CLI with one service converted as proof-of-concept. SimpleDB converted and legacy file removed; 138 legacy + 1 module = 139 services loading correctly.

### Stage 3: Extract utilities

Pull standalone utilities out of `datatables.js` and `mappings.js` into focused modules. These have no dependencies on the service pattern and can be done first:

- `shared/formatters.js` — `primaryFieldFormatter`, `dateFormatter`, `byteSizeFormatter`, `tickFormatter`, `timeAgoFormatter`, etc. (currently in `datatables.js`)
- `shared/pagination.js` — pagination helpers for 40+ AWS services using NextToken, Marker, etc. (currently duplicated between `datatables.js` and `cli/sdk-v3-shim.js`)
- `shared/deepmerge.js` — paginated response merging (currently `js/deepmerge.js`)
- `shared/relationships.js` — resource relationship map (currently `js/RelationshipTypeMap.js`)

Deliverable: utility modules with the originals updated to delegate to them (or dual-loaded).

### Stage 4: Decompose datatables.js and mappings.js

**datatables.js** (~24KB) currently contains:
- `sections[]` array definition
- `sdkcall` base implementation
- Pagination logic
- Formatters
- jQuery mock helpers (`deferredBootstrapTable`)
- Error handling

Break into:
- `shared/sections.js` — section registry
- `shared/sdkcall.js` — sdkcall interface/contract
- Formatters and pagination already extracted in Stage 3

**mappings.js** (~239KB) currently contains:
- `service_mapping_functions[]` array
- `performF2Mappings()` — iterates mapping functions
- `compileOutputs()` — generates IaC code
- Output generators for CFN, Terraform, CDK, Pulumi, CDKTF, Troposphere
- Resource name generation (`getResourceName`, `getLogicalToPhysicalIdMap`)

Break into:
- `shared/mappings/index.js` — `performF2Mappings`, `compileOutputs`, resource name helpers
- `shared/mappings/cfn.js`, `terraform.js`, `cdk.js`, etc. — output format generators

Deliverable: decomposed modules, with original files reduced to thin wrappers that re-export (for backward compatibility during migration).

### Stage 5: Convert service files incrementally

Migrate the 139 service files one at a time or in batches using a codemod script. For each file:

1. Export `section` metadata (previously pushed to global `sections[]`)
2. Export `updateDatatable(context)` that **returns** resources instead of calling `$().deferredBootstrapTable('append', ...)`
3. Export `mapResources` function (previously pushed to global `service_mapping_functions[]`)
4. Replace implicit globals (`sdkcall`, `region`, etc.) with `context.*` references

The files follow a consistent pattern, so a codemod can handle most of the conversion:
- Replace `sections.push({...})` → `const section = {...}; module.exports.section = section;`
- Replace `$('#...').deferredBootstrapTable('append', [{...}])` → `resources.push({...})`
- Replace bare `sdkcall(` → `context.sdkcall(`
- Replace bare `region` → `context.region`
- Wrap `service_mapping_functions.push(function(...) { ... })` → `module.exports.mapResources = function(...) { ... }`

The dual-loader from Stage 2 allows each file to be converted and tested independently. Converted files are loaded via `require()`, unconverted files continue through the VM sandbox.

Deliverable: all 139 service files converted, dual-loader only using the module path.

### Stage 6: Update CLI to import directly

Remove the VM sandbox from `cli/main.js`. Replace with direct `require()` calls:

```js
const services = require('../shared/services');
const { performF2Mappings, compileOutputs } = require('../shared/mappings');

// Collect all sections from converted services
const sections = services.map(s => s.section);

// Run all update functions with injected context
const context = { sdkcall: createSdkcallV3(config), region, ... };
const results = await Promise.all(
    services.map(s => s.updateDatatable(context))
);
const resources = results.flat();

// Generate outputs
const tracked = performF2Mappings(resources, services.map(s => s.mapResources));
const output = compileOutputs(tracked, deletionPolicy);
```

Deliverable: CLI works without `vm` module. Remove `blockUI`/`unblockUI` stubs, jQuery mocks, and all VM-related code.

### Stage 7: Add bundler and update web UI

The web UI currently loads 139+ files via `<script>` tags in `index.html` with no build step. This stage introduces a bundler and refactors the browser-side orchestrator.

1. **Add webpack or vite** — configure to bundle `shared/` modules for browser consumption
2. **Refactor `app.js`** (~16KB) — the browser orchestrator that builds tabs from `sections[]`, wires click handlers to `updateDatatable*` functions, and manages output generation. Update to import from `shared/` and handle the new return-value-based service interface (render returned resources into the DOM)
3. **Create `web/sdkcall-browser.js`** — browser-side `sdkcall` implementation wrapping AWS SDK v2 or v3 browser bundle
4. **Update `index.html`** — replace 139+ `<script>` tags with a single bundled script

Deliverable: web UI works with bundled modules, no more global script loading.

### Stage 8: Remove compatibility layer

Once both CLI and web consume modules directly:

1. Remove the dual-loader from Stage 2
2. Delete original `js/` files (now replaced by `shared/`)
3. Remove jQuery mock infrastructure
4. Clean up any shims or backward-compatibility wrappers

Deliverable: clean module-only codebase, no legacy loading paths.

## Considerations

- **Codemod script**: The 139 service files follow a consistent pattern. A codemod script should handle most of the Stage 5 conversion automatically. Worth investing time in the codemod rather than doing manual conversions.
- **Testing**: Once services accept a context object and return resources, they become trivially testable — mock `sdkcall` and assert on returned resource arrays. Consider adding tests as part of each service conversion in Stage 5.
- **Web UI build step**: Currently the web UI has no build step. This refactor introduces one. This is a reasonable trade-off for a maintained fork.
- **Risk mitigation**: The dual-loader (Stage 2) is the key risk mitigation strategy. It allows incremental migration with a working system at every step. Each converted service can be tested in isolation before moving on.
- **mappings.js decomposition**: At 239KB, `mappings.js` is a monolith. Stage 4 proposes breaking it up, but this is optional — it could remain a single module if the output format code is stable and rarely changed. Prioritize based on how often this file is modified.

## Dependency Graph

Stage 1: Define Shared Interface
    │
    ├──────────────────┐
    ▼                  ▼
Stage 2: Dual-Loader  Stage 3: Extract Utilities  ← parallel
    │                  │
    │                  ▼
    │            Stage 4: Decompose Core
    │                  │
    ├──────────────────┘
    ▼
Stage 5: Convert Services (requires 2, 3, 4)
    │
    ├──────────────────┐
    ▼                  ▼
Stage 6: Update CLI   Stage 7: Bundler + Web UI   ← parallel
    │                  │
    ├──────────────────┘
    ▼
Stage 8: Remove Compatibility

Parallel opportunities:

- Stage 2 + Stage 3: Dual-loader builds CLI loading infrastructure; utilities extract pure functions. No shared files modified.  
- Stage 6 + Stage 7: CLI rewrite and web UI bundler touch completely different consumer code (cli/main.js vs web/app.js + index.html). Both consume from shared/ but don't modify it

Sequential constraints:

- Stage 4 depends on Stage 3 — decomposing datatables.js and mappings.js needs formatters and pagination already extracted to avoid moving the same code twice.
- Stage 5 depends on 2, 3, and 4 — service conversion needs the dual-loader (for incremental testing), formatters (for column definition imports), and getResourceName (extracted in Stage 4 for mapResources).
- Stage 8 depends on 6 + 7 — can't delete legacy files until both consumers are migrated.

Critical path: 1 → 3 → 4 → 5 → 6 or 7 → 8

Stage 5 (converting 139 service files) is the bottleneck, it has the most dependencies and is the largest by file count.
Everything before it should be optimized to unblock it as early as possible.