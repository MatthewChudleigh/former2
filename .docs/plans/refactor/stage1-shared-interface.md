# Stage 1: Define the Shared Interface

## Objective

Design and document the shared contracts that all subsequent stages conform to. This is a pure design stage — no runtime code changes, only type/interface definitions.

## Deliverables

Create `shared/types.js` (JSDoc-annotated module) defining all interfaces.

## Detailed Tasks

### 1.1 Define the Context Object

The context object replaces all implicit globals that service files currently depend on. Based on analysis of the 139 service files, the following globals are referenced:

```js
/**
 * @typedef {Object} Former2Context
 * @property {SdkcallFn} sdkcall - AWS SDK call function (v3 CLI or v2 browser)
 * @property {string} region - Current AWS region (e.g. 'us-east-1')
 * @property {Function} getResourceTags - Tag lookup helper (takes ARN, returns tags or null)
 * @property {Function} stripAWSTags - Strips aws:-prefixed tags from tag arrays/objects
 * @property {typeof deepmerge} deepmerge - Paginated response merging (npm deepmerge)
 * @property {boolean} [include_default_resources] - Include default VPCs etc.
 * @property {Function} [blockUI] - No-op in CLI, UI blocker in browser (called but ignorable)
 * @property {Function} [unblockUI] - No-op in CLI, UI unblocker in browser
 */
```

**Globals identified from service files:**
- `sdkcall` — every service file (442+ calls across 139 files)
- `region` — used for `f2region: region` in resource objects
- `getResourceTags` — some services call this for ARN-based tag lookup
- `stripAWSTags` — used in mapping functions
- `blockUI` / `unblockUI` — called at start/end of every updateDatatable (no-op in CLI)
- `deepmerge` — used by some services for merging paginated sub-results
- `include_default_resources` — checked by ec2/vpc services to skip defaults

**Not included in context (stay global/separate):**
- `$` / jQuery — eliminated entirely; services return data instead of DOM manipulation
- `sections` — each service exports its own section, aggregated by the loader
- `service_mapping_functions` — each service exports its own mapResources function
- `nav` — CLI-only utility for section name navigation
- `primaryFieldFormatter`, `textFormatter`, etc. — browser-only formatters, not used by shared logic

### 1.2 Define the Sdkcall Function Signature

```js
/**
 * @callback SdkcallFn
 * @param {string} service - AWS service constructor name (e.g. 'S3', 'EC2', 'DynamoDB')
 * @param {string} method - API method name (e.g. 'listBuckets', 'describeInstances')
 * @param {Object} params - Request parameters
 * @param {boolean} alertOnErrors - Whether to surface errors (true) or silently reject (false)
 * @param {number} [backoff] - Internal retry backoff (ms), callers don't set this
 * @returns {Promise<Object>} - Resolves with the API response data
 */
```

**Notes:**
- Pagination is handled internally by sdkcall (both v2 browser and v3 CLI versions)
- Services call `sdkcall(...).then(data => {...}).catch(() => {})` extensively
- The v3 shim (`cli/sdk-v3-shim.js`, 476 lines) maps v2 service names to v3 `@aws-sdk/client-*` packages
- The browser v2 sdkcall (`js/datatables.js:231-568`) handles ~15 different pagination token patterns

### 1.3 Define the Service Export Shape

Each of the 139 service files will export three things:

```js
/**
 * @typedef {Object} ServiceModule
 * @property {SectionDefinition} section - UI section metadata (category, service, resourcetypes)
 * @property {UpdateDatatableFn} updateDatatable - Data collection function
 * @property {MapResourcesFn} mapResources - IaC mapping function
 */

/**
 * @typedef {Object} SectionDefinition
 * @property {string} category - e.g. 'Storage', 'Compute', 'Networking & Content Delivery'
 * @property {string} service - e.g. 'S3', 'EC2', 'Lambda'
 * @property {Object.<string, ResourceTypeDefinition>} resourcetypes - Resource type definitions
 */

/**
 * @typedef {Object} ResourceTypeDefinition
 * @property {Array<Array<ColumnDefinition>>} columns - Bootstrap table column definitions
 */
```

### 1.4 Define the UpdateDatatable Return Type

Currently, `updateDatatable*()` functions append to `$('#section-...').deferredBootstrapTable('append', [{...}])`. After conversion, they return the resource array instead.

```js
/**
 * @callback UpdateDatatableFn
 * @param {Former2Context} context - Injected dependencies
 * @returns {Promise<Array<ResourceRecord>>} - Collected resources
 */

/**
 * @typedef {Object} ResourceRecord
 * @property {string} f2id - Resource identifier (e.g. bucket name, instance ID, ARN)
 * @property {string} f2type - Resource type key (e.g. 's3.bucket', 'ec2.instance')
 * @property {Object} f2data - Full API response data for the resource
 * @property {string} f2region - AWS region where the resource was found
 * @property {string} [f2link] - AWS console link (browser-only, optional)
 * @property {...*} [displayFields] - Additional fields for table display (name, arn, etc.)
 */
```

**Key patterns identified in service files:**
- Resources are appended to multiple different datatable IDs within a single updateDatatable function (e.g. S3 appends to buckets, bucket policies, access points, etc.)
- After conversion, ALL resources from a single service are returned as one flat array, differentiated by `f2type`
- The `f2type` values follow a consistent pattern: `servicename.resourcetype` (e.g. `s3.bucket`, `s3.bucketpolicy`, `ec2.instance`)

### 1.5 Define the MapResources Signature

```js
/**
 * @callback MapResourcesFn
 * @param {Object} reqParams - Output parameter bags: { boto3, go, cfn, cli, tf, pulumi, cdktf, iam }
 * @param {Object} obj - Resource object: { id, type, data, region }
 * @param {Array} tracked_resources - Mutable array to push mapped resources into
 * @returns {boolean} - true if this function handled the resource type, false otherwise
 */
```

**Notes:**
- `reqParams` has sub-objects for each output format. Mapping functions populate `reqParams.cfn`, `reqParams.tf`, etc.
- `tracked_resources` is mutated by pushing objects with shape: `{ obj, logicalId, region, service, type, terraformType, options, returnValue, ... }`
- The `getResourceName(service, requestId, cfntype)` function is called inside mapResources — it needs to be importable from shared utilities
- `stripAWSTags(tags)` is also called inside mapResources — comes from context or imported utility

## File to Create

```
shared/
  types.js       # JSDoc type definitions and documentation
```

## Validation Criteria

- All type definitions are consistent with actual usage in the 139 service files
- The context object covers every global referenced by service code
- The return type for updateDatatable can represent all resource records currently appended via `deferredBootstrapTable`
- Type definitions are importable and usable for JSDoc type-checking in VS Code

## Dependencies

None — this is the first stage.

## Estimated Scope

- 1 new file (`shared/types.js`)
- ~150-200 lines of JSDoc definitions
- No functional code changes
