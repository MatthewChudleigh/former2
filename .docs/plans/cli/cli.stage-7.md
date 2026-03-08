# Stage 7: Replace eval() Architecture ✅ COMPLETED

## 1. Goal and Context

The CLI (`cli/main.js`) currently uses `eval()` to load browser-targeted JavaScript files (`js/mappings.js`, `js/datatables.js`, `js/services/*.js`) into the Node.js global scope. This is fragile, insecure, and makes reasoning about shared state difficult. Stage 7 replaces all `eval()` calls with Node.js `vm.createContext` / `vm.runInContext`, providing an explicit, controlled sandbox for shared globals while leaving browser JS files completely untouched.

### Why vm.createContext instead of other approaches

- **Browser files remain unmodified.** No `module.exports` additions, no wrapper IIFEs, no build step. The browser continues to load them via `<script>` tags as today.
- **Explicit shared state.** The context object documents exactly which globals flow in and out.
- **Better than raw eval.** Code runs in a defined context rather than polluting the Node.js module scope.
- **Testable.** A context object can be inspected in tests without global side effects.

## 2. Files Modified

**Only `cli/main.js` is modified.** No changes to any file under `js/`.

## 3. Detailed vm.createContext Implementation

### 3.1 Add the vm require

At the top of `cli/main.js`, alongside the existing `require` statements (around line 5-7):

```javascript
const vm = require('vm');
```

### 3.2 Build the context object

Replace lines 124-132 (the eval block) with the following. The context object must contain every global that the eval'd scripts expect to find already defined:

```javascript
// Build sandbox context with all globals the browser scripts depend on
const context = vm.createContext({
    // --- Globals defined by main.js that scripts read ---
    CLI: CLI,                              // const, line 16
    cli_resources: cli_resources,          // var, line 24 — array ref shared
    check_objects: check_objects,          // var, line 25 — array ref shared
    blockUI: blockUI,                      // function, line 27
    unblockUI: unblockUI,                  // function, line 28
    nav: nav,                              // function, lines 29-31
    getResourceTags: getResourceTags,      // async function, lines 32-75
    stripAWSTags: stripAWSTags,            // function, lines 77-95
    resource_tag_cache: resource_tag_cache,// var, line 97
    iaclangselect: iaclangselect,          // const, line 98
    $: $,                                  // jQuery stub, lines 100-112
    region: region,                        // var, lines 114-120
    stack_parameters: stack_parameters,    // var, line 122
    window: undefined,                     // line 125

    // --- Node.js builtins the scripts may reference ---
    console: console,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    Promise: Promise,
    Buffer: Buffer,

    // --- npm modules used inside eval'd scripts ---
    AWS: AWS,
    deepmerge: deepmerge,

    // --- Placeholders for globals the scripts DEFINE ---
    // These will be populated by the scripts themselves:
    //   outputs, tracked_resources, sections,
    //   compileOutputs, performF2Mappings, sdkcall,
    //   f2log, f2trace, f2debug,
    //   outputMapCfn, outputMapTf, outputMapCdk, outputMapCdkv2,
    //   outputMapTroposphere, outputMapPulumi, outputMapCdktf,
    //   service_mapping_functions, include_default_resources,
    //   getLogicalToPhysicalIdMap,
    //   updateDatatable* functions (148+)
});
```

### 3.3 Load scripts with vm.runInContext

Replace the `eval()` calls with `vm.runInContext()`. Skip `deepmerge.js` entirely (see section 8).

```javascript
// Load mappings.js
vm.runInContext(
    fs.readFileSync(path.join(__dirname, '../js/mappings.js'), 'utf8'),
    context,
    { filename: 'js/mappings.js' }   // improves stack traces
);

// Load datatables.js
vm.runInContext(
    fs.readFileSync(path.join(__dirname, '../js/datatables.js'), 'utf8'),
    context,
    { filename: 'js/datatables.js' }
);

// Load all service files
var items = fs.readdirSync(path.join(__dirname, '../js/services'));
for (var i = 0; i < items.length; i++) {
    vm.runInContext(
        fs.readFileSync(path.join(__dirname, '../js/services', items[i]), 'utf8'),
        context,
        { filename: 'js/services/' + items[i] }
    );
}
```

The third argument `{ filename: ... }` is critical for readable stack traces (see section 9.3).

### 3.4 Handling bidirectional globals

Globals flow in two directions:

**main.js -> scripts (inputs):** Populated in the context object before `vm.runInContext` (section 3.2). Since objects/arrays are passed by reference, mutations inside the context (e.g., `cli_resources.push(...)`) are visible in main.js. Primitives (like `region`) are copied by value; if a script reassigns `region`, it only changes within the context.

**scripts -> main.js (outputs):** After running all scripts, main.js must read back globals defined by the scripts. This is done by accessing `context.propertyName`. See sections 4-7 for each specific case.

## 4. Replacing eval(dtname) at Line 278

The current code at lines 276-278:

```javascript
sections.map(section => {
    let dtname = 'updateDatatable' + nav(section.category) + nav(section.service);
    return eval(dtname);
})
```

Replace with direct property access on the context object:

```javascript
context.sections.map(section => {
    let dtname = 'updateDatatable' + nav(section.category) + nav(section.service);
    return context[dtname];
})
```

This works because each service file defines its `updateDatatable*` function with `async function updateDatatableXY() { ... }` which, when executed via `vm.runInContext`, becomes a property of the context object (function declarations are hoisted to the context scope, equivalent to `var`-declared names).

## 5. Replacing outputMap* Stubbing

In `parseOpts()` (lines 208-214), the code assigns to global `outputMap*` variables. These must now target the context:

```javascript
context.outputMapCdk = function(){};
context.outputMapCdkv2 = function(){};
context.outputMapTroposphere = function(){};
context.outputMapPulumi = function(){};
context.outputMapCdktf = function(){};
if (!opts.outputCloudformation) { context.outputMapCfn = function(){}; }
if (!opts.outputTerraform) { context.outputMapTf = function(){}; }
```

This requires `context` to be accessible from `parseOpts`. Since `context` is defined at module scope (replacing the eval block at line 124), and `parseOpts` is also at module scope (line 189), this is straightforward.

## 6. Handling f2log / f2trace / f2debug

These functions have a special lifecycle:

1. **Defined in mappings.js** (lines 2-3): `f2log = function(msg) { ... }` and `f2trace = function(err) { ... }` — these become `context.f2log` and `context.f2trace`.
2. **Overridden by main.js** (lines 134-135): Currently `f2log = function(msg){};` — must change to `context.f2log = function(msg){};`
3. **Conditionally re-overridden in parseOpts** (lines 195-198 under `opts.debug`): Must change to `context.f2log = ...`, `context.f2trace = ...`, `context.f2debug = ...`.
4. **Used in saveOutput** (line 161): `f2log(...)` — must change to `context.f2log(...)`.

Replace lines 134-135:

```javascript
context.f2log = function(msg){};
context.f2trace = function(err){};
```

Replace lines 195-198 inside `parseOpts`:

```javascript
if (opts.debug) {
    context.f2log = function(msg){ console.log(msg); };
    context.f2trace = function(err){ console.trace(err); };
    context.f2debug = function(msg){ console.log(Date.now().toString() + ": " + msg); };
}
```

Replace usage in `saveOutput` (line 161):

```javascript
context.f2log(`${ok?"":"NOT-"}MATCHED: ${jsonres}`);
```

## 7. Handling include_default_resources

Set in `parseOpts` (line 217), read by service mapping functions inside the context:

```javascript
if (opts.includeDefaultResources) {
    context.include_default_resources = true;
}
```

Since service mapping functions run inside the context and reference `include_default_resources` as a context-scope variable, this works correctly.

## 8. Removing Redundant deepmerge.js eval

Line 126 currently loads `../js/deepmerge.js` via eval. However, line 9 already does `const deepmerge = require('deepmerge');` which loads the npm package. The browser-bundled `js/deepmerge.js` is a UMD module that detects `module.exports` and exports accordingly, but it is redundant in the CLI since the npm package is already available.

**Action:** Simply remove the `deepmerge.js` eval line. The npm `require('deepmerge')` on line 9 is passed into the context as `deepmerge: deepmerge` (section 3.2), making it available to any script that references it.

If any eval'd script references `deepmerge` as a global (verify by searching `js/mappings.js`, `js/datatables.js`, and `js/services/*.js` for bare `deepmerge` usage), the context property covers it.

## 9. Edge Cases

### 9.1 Scripts that reference `this` (global context)

In browser `<script>` execution, `this` at the top level refers to `window`. In `vm.runInContext`, `this` at the top level refers to the context object — which is the desired behavior. If any script uses `this.someProperty`, it will resolve against the context, which is correct.

No changes needed. This is a natural advantage of `vm.createContext`.

### 9.2 Async functions in context (updateDatatable*)

The `updateDatatable*` functions are `async`. When retrieved via `context[dtname]`, they return a function reference just like `eval(dtname)` did. Calling `await context[dtname]()` works identically to `await eval(dtname)()`. Promises created inside the vm context use the same Node.js event loop and Promise implementation (passed in via the context).

No special handling needed, but ensure `Promise` is in the context object (section 3.2).

### 9.3 Error stack traces from vm context

Stack traces from code running in `vm.runInContext` show `evalmachine.<anonymous>` by default, which is unhelpful. The `{ filename: 'js/services/EC2.js' }` option passed to `vm.runInContext` replaces this with the actual filename.

Line and column numbers are preserved correctly. This is actually an improvement over raw `eval()`, which shows `eval at <anonymous>` with no filename.

### 9.4 Performance impact of vm vs eval

`vm.createContext` has a one-time cost to create the sandbox proxy. `vm.runInContext` has similar performance characteristics to `eval()` — both compile and execute the source string. In practice, the difference is negligible compared to the network I/O of AWS API calls that dominate CLI runtime.

No mitigation needed.

### 9.5 Variables defined with `var` vs `let`/`const` in scripts

This is the most critical edge case:

- **`var` declarations and function declarations** inside `vm.runInContext` are hoisted to the context object and become properties of it. This is the desired behavior — `var sections = [];` in datatables.js becomes `context.sections`.
- **`let` and `const` declarations** are script-local. They do NOT become properties of the context object. They exist only for the duration of that `vm.runInContext` call.

**Impact:** If any variable in `js/mappings.js`, `js/datatables.js`, or service files is declared with `let` or `const`, it will not be accessible from main.js via `context.propertyName`, and it will not be visible to subsequently-loaded scripts.

**Mitigation:** Before implementation, audit all eval'd JS files for `let` and `const` declarations at the top level. If found:
- If the variable is only used within that file, no issue.
- If it is used cross-file (e.g., defined in datatables.js, used in a service file), it must be declared with `var` or assigned as a property of the global object. However, since we are not modifying browser JS files, we would instead pre-declare it in the context: `context.thatVariable = undefined;` — and the script's `let` would shadow it within that script's execution, but cross-file access would use the context property. This requires case-by-case analysis.

**Likely safe:** The codebase was originally written for browser `<script>` tag loading where `let`/`const` at top level are also script-scoped. So any variable that needs cross-file access was likely declared with `var` or as a bare assignment (which becomes a context property in vm).

### 9.6 Bare assignments (no var/let/const)

Assignments like `f2log = function(msg) { ... }` (no declaration keyword) create properties on the context object in `vm.runInContext`. This is the correct behavior and matches browser global scope. The `outputMap*` functions in mappings.js follow this pattern.

### 9.7 The `region` variable

`region` is a primitive (string) passed into the context by value. If a script reassigns `region` inside the context, it does not propagate back to main.js's `region` variable. However, main.js also passes `region` to the context, and after scripts load, main.js can read `context.region` if needed. Audit whether any eval'd script reassigns `region` — if not, no issue.

Additionally, main.js reassigns `region` in the `main()` function (lines 233, 238). After these reassignments, update the context:

```javascript
if (AWS.config.region) {
    region = AWS.config.region;
    context.region = region;    // sync to context
}

if (opts.region) {
    AWS.config.update({region: opts.region});
    region = opts.region;
    context.region = region;    // sync to context
}
```

## 10. Code Style Notes

Maintain the existing code style of `cli/main.js`:
- 4-space indentation
- Double quotes for strings
- Semicolons at end of statements
- camelCase for variables and functions
- Mix of `var`/`const`/`let` as appropriate (use `const` for the context, `var` where existing code uses `var`)

## 11. All References to Context Globals in main.js

Every place in `main.js` that currently references a global defined by the eval'd scripts must be updated to use `context.propertyName`. Complete list:

| Current reference | Location | Change to |
|---|---|---|
| `f2log = function(msg){};` | Line 134 | `context.f2log = ...` |
| `f2trace = function(err){};` | Line 135 | `context.f2trace = ...` |
| `f2log(...)` | Line 161 (saveOutput) | `context.f2log(...)` |
| `performF2Mappings(...)` | Line 172 (saveOutput) | `context.performF2Mappings(...)` |
| `compileOutputs(...)` | Line 173 (saveOutput) | `context.compileOutputs(...)` |
| `getLogicalToPhysicalIdMap()` | Line 176 (saveOutput) | `context.getLogicalToPhysicalIdMap()` |
| `f2log = function(msg){...}` | Line 195 (parseOpts) | `context.f2log = ...` |
| `f2trace = function(err){...}` | Line 196 (parseOpts) | `context.f2trace = ...` |
| `f2debug = function(msg){...}` | Line 197 (parseOpts) | `context.f2debug = ...` |
| `outputMapCdk = function(){};` | Line 208 (parseOpts) | `context.outputMapCdk = ...` |
| `outputMapCdkv2 = function(){};` | Line 209 | `context.outputMapCdkv2 = ...` |
| `outputMapTroposphere = function(){};` | Line 210 | `context.outputMapTroposphere = ...` |
| `outputMapPulumi = function(){};` | Line 211 | `context.outputMapPulumi = ...` |
| `outputMapCdktf = function(){};` | Line 212 | `context.outputMapCdktf = ...` |
| `outputMapCfn = function(){};` | Line 213 | `context.outputMapCfn = ...` |
| `outputMapTf = function(){};` | Line 214 | `context.outputMapTf = ...` |
| `include_default_resources = true` | Line 217 | `context.include_default_resources = true` |
| `sections` (filtering) | Lines 256-262 (main) | `context.sections` |
| `sections.length` | Line 272 | `context.sections.length` |
| `sections.map(...)` | Line 276 | `context.sections.map(...)` |
| `eval(dtname)` | Line 278 | `context[dtname]` |
| `service_mapping_functions` | If referenced in main.js | `context.service_mapping_functions` |

## 12. Verification Steps

### 12.1 Byte-for-byte output comparison

Run the CLI before and after changes against the same AWS account/region and compare outputs:

```bash
# Before changes (on current branch, stash changes)
node cli/main.js --output-cloudformation before-cfn.json --output-terraform before-tf.json --region us-east-1

# After changes
node cli/main.js --output-cloudformation after-cfn.json --output-terraform after-tf.json --region us-east-1

# Compare
diff before-cfn.json after-cfn.json
diff before-tf.json after-tf.json
```

Both should produce identical output.

### 12.2 Debug mode verification

```bash
node cli/main.js --output-cloudformation out.json --region us-east-1 --debug 2>&1 | head -50
```

Verify `f2log` and `f2trace` produce console output when `--debug` is passed.

### 12.3 Service filtering

```bash
node cli/main.js --output-cloudformation out.json --region us-east-1 --services EC2
node cli/main.js --output-cloudformation out.json --region us-east-1 --exclude-services EC2
```

Verify `context.sections` filtering works correctly.

### 12.4 Error handling

Intentionally break a service file (add a syntax error to one service file) and verify the error message includes the filename from the `{ filename: ... }` option.

### 12.5 Edge case: include_default_resources

```bash
node cli/main.js --output-cloudformation out.json --region us-east-1 --include-default-resources
```

Verify this flag propagates through `context.include_default_resources` and affects output.

## 13. Risk Mitigation and Rollback

### Risks

1. **Missed global reference.** If main.js references a context global without the `context.` prefix, it will be `undefined` at runtime. Mitigation: The comprehensive table in section 11 covers all references. A search for all identifiers defined in mappings.js/datatables.js that appear in main.js will catch any omissions.

2. **let/const scoping surprise.** If a top-level `let` or `const` in a browser JS file is relied upon cross-file, it will not be in the context. Mitigation: Audit before implementation (section 9.5). If found, pre-seed the context with the variable name and have the script use bare assignment (but this would require modifying the browser file, violating our constraint). Alternative: wrap the problematic script in a `var` redeclaration in the context before loading.

3. **Subtle behavior differences.** `vm.runInContext` has minor differences from `eval` in edge cases (e.g., `arguments` object, strict mode propagation). Mitigation: The eval'd scripts are straightforward imperative code; these edge cases are unlikely. The byte-for-byte output comparison (section 12.1) will catch any functional differences.

4. **Performance regression.** Unlikely (section 9.4), but if observed, the context creation can be optimized by reducing the number of properties. AWS API I/O dominates runtime regardless.

### Rollback

The change is entirely contained in `cli/main.js`. Reverting a single commit restores the original `eval()` behavior. No other files are modified, so there are no coordination concerns.

### Implementation order

1. Add `const vm = require('vm');`
2. Build the context object (section 3.2)
3. Replace eval calls with vm.runInContext (section 3.3)
4. Remove deepmerge.js eval (section 8)
5. Update all global references in main.js to use `context.` prefix (section 11)
6. Replace `eval(dtname)` with `context[dtname]` (section 4)
7. Sync `region` to context after reassignment (section 9.7)
8. Test with byte-for-byte comparison (section 12)
