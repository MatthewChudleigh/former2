# Stage 3: Extract Utilities

## Objective

Pull standalone utility functions out of `datatables.js` (570 lines) and existing standalone JS files into focused modules under `shared/`. These utilities have no dependencies on the service pattern and can be extracted independently.

## Current State Analysis

### Utilities in `js/datatables.js`

| Function | Lines | Purpose | Used By |
|----------|-------|---------|---------|
| `textFormatter` | 7-9 | Identity passthrough | Column definitions in service files |
| `primaryFieldFormatter` | 11-17 | Links in primary field | Column definitions in service files |
| `dateFormatter` | 19-61 | Relative time display ("2 days ago") | Column definitions |
| `tickFormatter` | 63-69 | Boolean → checkmark | Column definitions |
| `primaryTextFormatter` | 71-84 | Primary field + "Added" button | Column definitions (browser-only) |
| `detailFormatter` | 86-94 | Expand row detail | Browser-only |
| `recursivePrettyPrintMap` | 96-148 | Pretty-print nested objects | `detailFormatter` |
| `byteSizeFormatter` | 150-162 | Bytes → human readable | Column definitions |
| `timeAgoFormatter` | 164-211 | Timestamp → relative time | Column definitions |
| `sdkcall` | 231-568 | AWS SDK v2 call with pagination | Every service file |
| `sdkcallwaiter` | 214-229 | SDK waiter helper | Some service files |

### Standalone JS Files

| File | Lines | Purpose |
|------|-------|---------|
| `js/deepmerge.js` | 105 | Paginated response merging |
| `js/RelationshipTypeMap.js` | 5076 | Resource relationship map |
| `js/deferred-datatable.js` | 77 | jQuery deferred table plugin |

### Pagination Patterns in sdkcall (datatables.js:336-564)

The sdkcall function handles ~15 different pagination token patterns:

| Token Pattern | Services | Lines |
|---------------|----------|-------|
| `NextToken` / `nextToken` | Generic, most services | 338-355 |
| `DistributionList.NextMarker` | CloudFront distributions | 356-368 |
| `NextMarker` | WAF, WAFRegional, WAFV2, generic | 369-385 |
| `NextPageMarker` | Route53Domains | 386-394 |
| `Marker` | Generic (excludes WAF, Route53, EFS, ELB, KMS, Lambda) | 395-418 |
| `NextPageToken` / `nextPageToken` | CostExplorer, SWF, Lightsail | 419-471 |
| `marker` (lowercase) | DataPipeline | 472-480 |
| `position` | APIGateway | 481-489 |
| `NextContinuationToken` | S3 | 432-440 |
| `PaginationToken` | ResourceGroupsTaggingAPI | 441-449 |
| `nextMarker` (lowercase) | IoT | 450-458 |
| CloudFront nested NextMarker | CloudFront generic | 490-498 |
| Pinpoint nested NextToken | Pinpoint | 499-507 |
| DynamoDB `LastEvaluatedGlobalTableName` | DynamoDB listGlobalTables | 508-516 |
| DynamoDB `LastEvaluatedTableName` | DynamoDB listTables | 517-525 |
| DynamoDBStreams `LastEvaluatedStreamArn` | DynamoDBStreams | 526-534 |
| Firehose `DeliveryStreamNames` last | Firehose listDeliveryStreams | 535-543 |
| Kinesis `StreamNames` last | Kinesis listStreams | 544-552 |
| KinesisAnalytics `ApplicationSummaries` last | KinesisAnalytics | 553-561 |

**Note:** This pagination logic is duplicated between `js/datatables.js` (browser v2 sdkcall) and `cli/sdk-v3-shim.js` (CLI v3 sdkcall). Both need to handle the same patterns. Extracting it allows both to share.

## Detailed Tasks

### 3.1 Extract Formatters → `shared/formatters.js`

Extract from `js/datatables.js` lines 7-211:

```js
// shared/formatters.js
function textFormatter(data) { return data; }
function primaryFieldFormatter(data, row) { ... }
function dateFormatter(data) { ... }
function tickFormatter(data) { ... }
function byteSizeFormatter(data) { ... }
function timeAgoFormatter(data) { ... }

module.exports = {
    textFormatter,
    primaryFieldFormatter,
    dateFormatter,
    tickFormatter,
    byteSizeFormatter,
    timeAgoFormatter,
};
```

**Excluded** (browser-only, not shared):
- `primaryTextFormatter` — references `output_objects` global, depends on UI state
- `detailFormatter` / `recursivePrettyPrintMap` — generates HTML for row expansion

**Issue:** `primaryFieldFormatter` and `textFormatter` are referenced in every service file's column definitions (e.g. `formatter: primaryFieldFormatter`). These are only used by the browser for rendering. The CLI never renders tables. Two options:
1. Service files reference formatters by string name, browser resolves them → big change
2. Service files import formatters → each file needs an import line added
3. **Recommended:** Keep formatters as globals in browser context, make them available via the shared module for converted service files. Service column definitions can reference them directly.

### 3.2 Extract Pagination → `shared/pagination.js`

Extract the pagination logic from `js/datatables.js:336-564` into a reusable function:

```js
// shared/pagination.js

/**
 * Given an sdkcall response, determine if there's a next page.
 * Returns { hasMore, nextParams } where nextParams contains the
 * pagination parameter to add to the next request.
 */
function getPaginationParams(svc, method, data, currentParams) {
    if (svc == "CloudWatchLogs" && method == "describeLogStreams") {
        return { hasMore: false };
    }

    if (data.NextToken) {
        return { hasMore: true, nextParams: { NextToken: data.NextToken } };
    }
    if (data.nextToken) {
        return { hasMore: true, nextParams: { nextToken: data.nextToken } };
    }
    // ... all 15+ patterns
}

/**
 * Recursive paginating wrapper around a raw SDK call.
 * Both browser sdkcall and CLI sdkcall can use this.
 */
async function paginatedCall(rawCall, svc, method, params, deepmerge) {
    const data = await rawCall(svc, method, params);
    const pagination = getPaginationParams(svc, method, data, params);

    if (pagination.hasMore) {
        const nextData = await paginatedCall(
            rawCall, svc, method,
            { ...params, ...pagination.nextParams },
            deepmerge
        );
        return deepmerge.all([data, nextData]);
    }

    return data;
}

module.exports = { getPaginationParams, paginatedCall };
```

**Benefit:** Eliminates the duplicated pagination logic between `js/datatables.js` and `cli/sdk-v3-shim.js`.

### 3.3 Extract Deepmerge → `shared/deepmerge.js`

The project has two deepmerge sources:
- `js/deepmerge.js` (105 lines) — standalone implementation loaded by browser `<script>` tag
- `deepmerge` npm package — used by CLI via `require('deepmerge')`

**Action:** Use the npm `deepmerge` package everywhere. Create `shared/deepmerge.js` as a thin re-export:

```js
// shared/deepmerge.js
module.exports = require('deepmerge');
```

For browser: the bundler (Stage 7) will resolve this. Until then, browser continues using `js/deepmerge.js` via `<script>` tag.

### 3.4 Extract Relationships → `shared/relationships.js`

Move `js/RelationshipTypeMap.js` (5076 lines):

```js
// shared/relationships.js
const RelationshipTypeMap = { /* ... 5076 lines of mappings ... */ };
module.exports = RelationshipTypeMap;
```

**Note:** This file is large but is a pure data structure with no dependencies. Straightforward extraction.

### 3.5 Update Originals to Delegate

After extraction, update the original files to delegate to the shared modules. This keeps browser `<script>` tag loading working.

**`js/datatables.js` changes:**
- Keep formatters defined inline (they're referenced as bare globals by service files' column definitions)
- Keep sdkcall defined inline (it has browser-specific logic like LocalStack support, `$.notify` for errors)
- OR: have `datatables.js` check for module availability and delegate

**Recommended approach:** Don't modify `datatables.js` yet. The shared modules are created independently and consumed by converted code. The originals remain for unconverted browser code. Stage 4 will address decomposing `datatables.js` itself.

## Files to Create

```
shared/
  formatters.js       # Formatter functions (textFormatter, dateFormatter, etc.)
  pagination.js       # Pagination token detection and recursive pagination
  deepmerge.js        # Re-export of npm deepmerge package
  relationships.js    # RelationshipTypeMap data (moved from js/)
```

## Files to Modify

None in this stage — originals remain untouched for backward compatibility.

## Validation Criteria

- `shared/formatters.js` exports match the functions used in service file column definitions
- `shared/pagination.js` handles all 15+ pagination patterns from `datatables.js:336-564`
- `shared/pagination.js` pagination logic matches `cli/sdk-v3-shim.js` pagination logic
- All modules can be `require()`'d without errors
- Existing CLI and browser paths are unaffected (no changes to originals)

## Dependencies

- Stage 1 (type definitions)
- Independent of Stage 2 (can be done in parallel)

## Estimated Scope

- 4 new files under `shared/`
- `formatters.js`: ~80 lines
- `pagination.js`: ~120 lines
- `deepmerge.js`: ~3 lines (re-export)
- `relationships.js`: ~5080 lines (data move)
- No changes to existing files
