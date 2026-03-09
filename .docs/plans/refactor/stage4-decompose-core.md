# Stage 4: Decompose datatables.js and mappings.js

## Objective

Break the two core monolith files into focused modules. After Stage 3 extracted standalone utilities, this stage tackles the remaining interconnected pieces.

## Current File Analysis

### `js/datatables.js` (570 lines)

After Stage 3 extracts formatters and pagination, what remains:

| Content | Lines | Destination |
|---------|-------|-------------|
| `sections = []` | 1 | `shared/sections.js` |
| Formatters | 7-211 | Already extracted (Stage 3) |
| `sdkcallwaiter` | 214-229 | `shared/sdkcall.js` |
| `sdkcall` (browser v2) | 231-568 | `web/sdkcall-browser.js` (Stage 7) |
| Comment "Service-specific mappings" | 570 | Removed |

### `js/mappings.js` (4971 lines)

| Content | Lines | Destination |
|---------|-------|-------------|
| Logging functions (`f2log`, `f2trace`) | 1-3 | Stays in consumers (CLI/browser) |
| Global state (`outputs`, `tracked_resources`, etc.) | 9-16 | `shared/mappings/index.js` (scoped) |
| `getLogicalToPhysicalIdMap` | 18-20 | `shared/mappings/index.js` |
| `MD5` | 22-107 | `shared/mappings/index.js` (internal) |
| Mapping helper functions | 109-2054 | `shared/mappings/helpers.js` |
| `getResourceName` | 2056-2196 | `shared/mappings/index.js` |
| `outputMapTroposphere` | 2198-2243 | `shared/mappings/troposphere.js` |
| `outputMapCdk` | 2245-2321 | `shared/mappings/cdk.js` |
| `outputMapCdkv2` | 2323-2508 | `shared/mappings/cdk.js` |
| `outputMapCfn` | 2510-2548 | `shared/mappings/cfn.js` |
| `outputMapTf` | 2550-2603 | `shared/mappings/terraform.js` |
| `outputMapPulumi` | 2605-2704 | `shared/mappings/pulumi.js` |
| `outputMapCdktf` | 2706-4214 | `shared/mappings/cdktf.js` |
| `compileOutputs` | 4216-4801 | `shared/mappings/index.js` |
| `performF2Mappings` | 4803-4861 | `shared/mappings/index.js` |
| `doubleQuotedString` (YAML helper) | 4890-4971 | `shared/mappings/helpers.js` |

## Detailed Tasks

### 4.1 Create `shared/sections.js` — Section Registry

```js
// shared/sections.js

/**
 * Section registry. Collects section definitions from all services.
 * In the module world, sections are aggregated from service exports.
 * This module provides the registry for backward compatibility.
 */
const sections = [];

function registerSection(section) {
    sections.push(section);
}

function getSections() {
    return sections;
}

module.exports = { sections, registerSection, getSections };
```

**Note:** In the fully converted system (Stage 6+), sections are derived directly from `services.map(s => s.section)`. This registry is a transitional utility.

### 4.2 Create `shared/sdkcall.js` — Sdkcall Contract

```js
// shared/sdkcall.js

/**
 * Sdkcall interface contract.
 *
 * Two implementations exist:
 * - cli/sdk-v3-shim.js: AWS SDK v3 for Node.js CLI
 * - web/sdkcall-browser.js: AWS SDK v2 for browser (Stage 7)
 *
 * Both implementations handle:
 * - Service-specific region overrides (GlobalAccelerator→us-west-2, CostExplorer→us-east-1)
 * - Throttling with exponential backoff
 * - Pagination (delegated to shared/pagination.js)
 * - Error classification (AccessDenied, NetworkError, etc.)
 *
 * @see shared/types.js for SdkcallFn typedef
 */

/**
 * Region overrides for specific services.
 * Shared between CLI and browser sdkcall implementations.
 */
const SERVICE_REGION_OVERRIDES = {
    'GlobalAccelerator': 'us-west-2',
    'CostExplorer': 'us-east-1',
};

/**
 * Service-specific options.
 */
const SERVICE_OPTIONS = {
    'DynamoDB': { dynamoDbCrc32: false },
};

/**
 * Throttling error codes that trigger retry with backoff.
 */
const THROTTLE_CODES = [
    'TooManyRequestsException',
    'ThrottlingException',
    'RequestLimitExceeded',
    'TimeoutError',
];

const THROTTLE_MESSAGES = [
    'Too Many Requests',
    'Rate exceeded',
];

module.exports = {
    SERVICE_REGION_OVERRIDES,
    SERVICE_OPTIONS,
    THROTTLE_CODES,
    THROTTLE_MESSAGES,
};
```

### 4.3 Decompose `mappings.js` → `shared/mappings/`

This is the most significant task in this stage. `mappings.js` is 4971 lines and contains tightly coupled code.

#### 4.3.1 `shared/mappings/index.js` — Core Functions

Contains:
- `performF2Mappings(objects, mappingFunctions)` — the main mapping loop
- `compileOutputs(tracked_resources, cfn_deletion_policy)` — generates all output formats
- `getResourceName(service, requestId, cfntype)` — logical ID generation
- `getLogicalToPhysicalIdMap()` — returns the `global_used_refs` map
- `MD5()` — internal hash function for resource naming
- Global state: `outputs`, `tracked_resources`, `global_used_refs`, `cfnspacing`, `logicalidstrategy`, `service_mapping_functions`, `tracked_relationships`, `include_default_resources`

**Key refactoring change:** `performF2Mappings` currently iterates `service_mapping_functions` (a global array). After conversion, it accepts the mapping functions array as a parameter:

```js
// Before (global):
function performF2Mappings(objects) {
    service_mapping_functions.forEach(fn => fn(reqParams, obj, tracked_resources));
}

// After (parameterized):
function performF2Mappings(objects, mappingFunctions) {
    mappingFunctions.forEach(fn => fn(reqParams, obj, tracked_resources));
}
```

**State management:** The module-level state (`outputs`, `global_used_refs`, etc.) currently persists across calls. This needs to either:
1. Be reset at the start of `performF2Mappings`/`compileOutputs` (current behavior — they reset at start)
2. Be encapsulated in a class or factory function

Current behavior confirmed: `performF2Mappings` (line 4804) resets `tracked_resources = []` and `global_used_refs = {}` at the top. `compileOutputs` uses `outputs` which is populated during mapping. This means module-level state is fine as long as the call sequence is always performF2Mappings → compileOutputs.

#### 4.3.2 `shared/mappings/cfn.js` — CloudFormation Output

Extract `outputMapCfn` (lines 2510-2548). This function generates CloudFormation YAML for a single tracked resource.

```js
// shared/mappings/cfn.js
function outputMapCfn(index, service, type, options, region, was_blocked, logicalId, cfn_deletion_policy, tracked_resources) { ... }
module.exports = { outputMapCfn };
```

#### 4.3.3 `shared/mappings/terraform.js` — Terraform Output

Extract `outputMapTf` (lines 2550-2603).

#### 4.3.4 `shared/mappings/cdk.js` — CDK v1 and v2 Output

Extract `outputMapCdk` (lines 2245-2321) and `outputMapCdkv2` (lines 2323-2508).

#### 4.3.5 `shared/mappings/troposphere.js` — Troposphere Output

Extract `outputMapTroposphere` (lines 2198-2243).

#### 4.3.6 `shared/mappings/pulumi.js` — Pulumi Output

Extract `outputMapPulumi` (lines 2605-2704).

#### 4.3.7 `shared/mappings/cdktf.js` — CDKTF Output

Extract `outputMapCdktf` (lines 2706-4214). This is the largest output generator at ~1500 lines.

#### 4.3.8 `shared/mappings/helpers.js` — Shared Mapping Helpers

Extract helper functions used by the output generators (lines 109-2054):
- Various `output*` helper functions for formatting parameters
- `doubleQuotedString` (YAML string escaping, lines 4890-4971)
- Parameter formatting helpers

**Dependency analysis for output generators:**

Each `outputMap*` function depends on:
- `outputs` array (module state in `index.js`)
- Helper functions for parameter formatting
- `cfnspacing` constant
- `iaclangselect` global (CDK/Pulumi/CDKTF language selection)
- `doubleQuotedString` (YAML helper)
- `tracked_relationships` (for CFN/TF relationship handling)

These dependencies need to be passed as parameters or imported from sibling modules.

### 4.4 Create Backward-Compatible Wrappers

Replace `js/datatables.js` and `js/mappings.js` with thin wrappers that delegate to the shared modules, maintaining browser `<script>` tag compatibility:

**`js/datatables.js` (wrapper):**
```js
// Backward-compatible wrapper — delegates to shared modules
// This file is loaded by <script> tag in the browser

var sections = [];

// Formatters remain inline (referenced as globals by service files)
function textFormatter(data) { return data; }
// ... other formatters ...

// sdkcall remains inline (browser-specific v2 implementation)
function sdkcall(svc, method, params, alert_on_errors, backoff) { ... }
```

**`js/mappings.js` (wrapper):**
```js
// Backward-compatible wrapper
// In browser: this file defines globals that service files reference
// The actual logic is in shared/mappings/

var service_mapping_functions = [];

// performF2Mappings and compileOutputs are defined here for browser global access
// They delegate to the shared implementation
function performF2Mappings(objects) {
    return require('../shared/mappings').performF2Mappings(objects, service_mapping_functions);
}
// ... etc
```

**Alternative approach (simpler):** Don't create wrappers yet. Keep the original files intact. The shared modules are consumed only by converted code (CLI after Stage 6, browser after Stage 7). The originals are removed in Stage 8.

**Recommended:** The simpler approach. Create the shared modules as new files. Don't modify the originals. Both paths coexist via the dual-loader.

## Files to Create

```
shared/
  sections.js                  # Section registry
  sdkcall.js                   # Sdkcall constants and contract
  mappings/
    index.js                   # performF2Mappings, compileOutputs, getResourceName
    helpers.js                 # Shared mapping helper functions
    cfn.js                     # CloudFormation output generator
    terraform.js               # Terraform output generator
    cdk.js                     # CDK v1 and v2 output generators
    troposphere.js             # Troposphere output generator
    pulumi.js                  # Pulumi output generator
    cdktf.js                   # CDKTF output generator
```

## Files to Modify

None — originals remain as-is for backward compatibility.

## Validation Criteria

- `shared/mappings/index.js` `performF2Mappings()` produces identical `tracked_resources` as the original
- `shared/mappings/index.js` `compileOutputs()` produces identical output strings for all 7 formats (CFN, TF, CDK v1, CDK v2, Troposphere, Pulumi, CDKTF)
- All output generators handle the same edge cases as the originals
- Modules can be `require()`'d independently

## Testing Strategy

Create a test that:
1. Loads a known set of resources (from a raw data dump via `--output-raw-data`)
2. Runs `performF2Mappings` + `compileOutputs` via both the original `mappings.js` globals and the new shared modules
3. Diffs the outputs — they must be identical

## Dependencies

- Stage 3 (formatters, pagination extracted)

## Risks

- `mappings.js` helper functions have complex interdependencies (module-level state, closures over `outputs` array)
- The `iaclangselect` global is set by the CLI and read by output generators — needs to be threaded through
- `compileOutputs` is ~600 lines with template literals that reference many variables — easy to break during extraction

## Estimated Scope

- 9 new files under `shared/`
- ~5000 lines total (mostly moved, not new)
- `index.js`: ~300 lines (performF2Mappings, compileOutputs, getResourceName, MD5)
- `helpers.js`: ~400 lines
- `cfn.js`: ~40 lines
- `terraform.js`: ~55 lines
- `cdk.js`: ~270 lines
- `troposphere.js`: ~50 lines
- `pulumi.js`: ~100 lines
- `cdktf.js`: ~1510 lines
- No changes to existing files
