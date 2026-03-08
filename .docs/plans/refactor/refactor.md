# Shared Code Refactor Plan

## Motivation

The CLI (`cli/main.js`) loads the browser JS files (`js/mappings.js`, `js/datatables.js`, `js/services/*.js`) into a `vm.createContext()` sandbox to reuse them without modification. This works but is fragile:

- Browser scripts use implicit globals instead of module exports
- The CLI must simulate a browser environment (jQuery stubs, `window`, `$`, etc.)
- `sdkcall` is overridden via a shim after eval — not proper dependency injection
- Testing requires recreating the full VM context
- Debugging stack traces through `vm.runInContext` is harder than normal modules

The current approach exists because the `js/` files are the original upstream codebase from iann0036/former2, and keeping them untouched allowed clean merges. Once we diverge from upstream, this constraint no longer applies.

## Goal

Extract shared code into a module-based structure that both the CLI and web UI import from, removing the VM sandbox hack.

## Proposed Structure

```
shared/
  mappings.js          # performF2Mappings(), compileOutputs()
  datatables.js        # sections[] registry
  services/            # ~200 files, one per AWS service
    s3.js              # export updateDatatableStorageS3
    ec2.js             # export updateDatatableComputeEC2
    ...
  sdkcall.js           # sdkcall interface (implementation injected)

cli/
  main.js              # orchestrator — injects SDK v3 sdkcall
  sdk-v3-shim.js       # v3 sdkcall implementation (already exists)
  utils.js             # filtering utilities (already exists)

web/
  index.html           # bundled via webpack/vite, imports from shared/
  sdkcall-browser.js   # browser-side sdkcall (if needed, or use API proxy)
```

## Work Required

### 1. Add module exports to shared code

Each `js/services/*.js` file currently defines a global `updateDatatable*` function. Convert to:

```js
// Before (browser global)
function updateDatatableStorageS3() { ... }

// After (module export)
module.exports = function updateDatatableStorageS3(context) { ... }
```

The `context` parameter replaces implicit globals (`sdkcall`, `region`, `cli_resources`, etc.) with explicit dependency injection.

This is the largest piece of work — ~200 files need mechanical conversion.

### 2. Convert datatables.js and mappings.js

- `datatables.js`: export `sections` array and any shared functions
- `mappings.js`: export `performF2Mappings`, `compileOutputs`, `getLogicalToPhysicalIdMap`

### 3. Update CLI to import directly

Replace the VM sandbox with normal `require()`:

```js
// Before
vm.runInContext(fs.readFileSync('js/mappings.js'), context);
context.sdkcall = createSdkcallV3(...);

// After
const { performF2Mappings, compileOutputs } = require('../shared/mappings');
const services = require('../shared/services');
```

### 4. Add bundler for web UI

The web UI currently loads scripts via `<script>` tags. After converting to modules, it needs a bundler (webpack or vite) to produce browser-compatible bundles.

### 5. sdkcall dependency injection

Define a `sdkcall` interface that both CLI and web can implement:

```js
// CLI injects SDK v3 implementation
const sdkcall = createSdkcallV3(config);

// Web injects browser-side implementation (existing AWS SDK v2 or v3 browser bundle)
const sdkcall = createSdkcallBrowser(config);
```

Pass `sdkcall` into service functions via the context object rather than relying on globals.

## Considerations

- **Mechanical conversion**: The 200+ service files follow a consistent pattern. A codemod script could handle most of the conversion automatically.
- **Testing**: Once services accept a context object, they become trivially testable — mock `sdkcall` and assert on appended resources.
- **Web UI build step**: Currently the web UI has no build step. This refactor introduces one. This is a reasonable trade-off for a maintained fork.
- **Incremental approach**: Could convert one service at a time, keeping both the VM loader (for unconverted files) and direct imports (for converted files) working simultaneously during migration.

## Status

Not started — this is a future plan for when the fork fully diverges from upstream.
