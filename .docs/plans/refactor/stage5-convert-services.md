# Stage 5: Convert Service Files Incrementally ✓ COMPLETE

## Objective

Migrate all 139 service files from global-based browser scripts to module-based exports. This is the largest stage by file count but highly mechanical — the files follow a consistent pattern that a codemod can handle.

## Completion Summary

All 139 service files converted. The codemod handled 100% of files without manual intervention (including the largest files: vpc.js at 6748 lines, ec2.js at 4192 lines, apigateway.js at 3126 lines). All 74 tests pass across 6 test suites.

### Files Created
- `scripts/codemod-service.js` — automated conversion script (~230 lines)
- `shared/services/index.js` — re-exports all 139 service modules
- 138 new files in `shared/services/` (simpledb.js already existed from Stage 2)

### Files Deleted
- All 138 files from `js/services/` (simpledb.js was already removed in Stage 2)

### Files Modified
- `shared/services/loader.js` — simplified to module-only loading, added `stripAWSTags` global bridging

## Current Pattern (All 139 Files)

Every service file previously followed this exact structure:

```js
// 1. Section definition (pushed to global sections[])
sections.push({
    'category': 'CategoryName',
    'service': 'ServiceName',
    'resourcetypes': {
        'ResourceType1': { 'columns': [[...], [...]] },
        'ResourceType2': { 'columns': [[...], [...]] },
    }
});

// 2. Update datatable function (registered as a global)
async function updateDatatableCategoryNameServiceName() {
    blockUI('#section-categoryname-servicename-resourcetype1-datatable');

    await sdkcall("ServiceName", "listThings", {}, true).then(async (data) => {
        $('#section-categoryname-servicename-resourcetype1-datatable').deferredBootstrapTable('removeAll');

        data.Things.forEach(thing => {
            $('#section-categoryname-servicename-resourcetype1-datatable').deferredBootstrapTable('append', [{
                f2id: thing.Id,
                f2type: 'servicename.thing',
                f2data: thing,
                f2region: region,
                name: thing.Name,
            }]);
        });
    }).catch(() => { });

    unblockUI('#section-categoryname-servicename-resourcetype1-datatable');
}

// 3. Mapping function (pushed to global service_mapping_functions[])
service_mapping_functions.push(function(reqParams, obj, tracked_resources) {
    if (obj.type == "servicename.thing") {
        reqParams.cfn['Name'] = obj.data.Name;
        reqParams.tf['name'] = obj.data.Name;
        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('servicename', obj.id, 'AWS::Service::Thing'),
            'region': obj.region,
            'service': 'servicename',
            'type': 'AWS::Service::Thing',
            'terraformType': 'aws_service_thing',
            'options': reqParams
        });
    } else {
        return false;
    }
    return true;
});
```

## Target Pattern (After Conversion)

```js
// shared/services/servicename.js

const section = {
    'category': 'CategoryName',
    'service': 'ServiceName',
    'resourcetypes': {
        'ResourceType1': { 'columns': [[...], [...]] },
    }
};

async function updateDatatable(context) {
    const resources = [];

    await context.sdkcall("ServiceName", "listThings", {}, true).then(async (data) => {
        data.Things.forEach(thing => {
            resources.push({
                f2id: thing.Id,
                f2type: 'servicename.thing',
                f2data: thing,
                f2region: context.region,
                name: thing.Name,
            });
        });
    }).catch(() => { });

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "servicename.thing") {
        reqParams.cfn['Name'] = obj.data.Name;
        reqParams.tf['name'] = obj.data.Name;
        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('servicename', obj.id, 'AWS::Service::Thing'),
            'region': obj.region,
            'service': 'servicename',
            'type': 'AWS::Service::Thing',
            'terraformType': 'aws_service_thing',
            'options': reqParams
        });
    } else {
        return false;
    }
    return true;
}

module.exports = { section, updateDatatable, mapResources };
```

## Codemod Transformations (Implemented)

The codemod (`scripts/codemod-service.js`) applies these transformations in order:

### Transform 1: Comment Header Removal
Removes the leading `/* === */` comment block present in all legacy files.

### Transform 2: Section Definition
```
Before:  sections.push({...});
After:   const section = {...};
```
Uses brace/paren depth counting to find the matching close of `sections.push(...)`.

### Transform 3: Formatter References → Strings
```
Before:  formatter: primaryFieldFormatter
After:   formatter: 'primaryFieldFormatter'
```
Converts bare formatter references (`primaryFieldFormatter`, `textFormatter`, `dateFormatter`, `tickFormatter`, `byteSizeFormatter`, `timeAgoFormatter`, `lambdaRuntimeFormatter`) to string references within the section definition. This is necessary because converted modules don't have access to the formatter globals.

### Transform 4: UpdateDatatable Function
```
Before:  async function updateDatatableCategoryService() {
After:   async function updateDatatable(context) {
             const resources = [];
```

### Transform 5: BlockUI/UnblockUI → Remove
```
Before:  blockUI('#section-...');
After:   (line removed)

Before:  unblockUI('#section-...');
After:   (line removed)
```

### Transform 6: DOM Manipulation → Array Push
```
Before:  $('#section-...-datatable').deferredBootstrapTable('append', [{...}]);
After:   resources.push({...});

Before:  $('#section-...-datatable').deferredBootstrapTable('removeAll');
After:   (line removed)
```
Uses bracket depth counting to handle multi-line append calls with nested objects. Handles up to 1000 append calls per file (vpc.js has 76).

### Transform 7: Global References → Context
```
Before:  sdkcall("S3", ...)          →  context.sdkcall("S3", ...)
Before:  f2region: region,           →  f2region: context.region,
Before:  getResourceTags(arn)        →  context.getResourceTags(arn)
Before:  include_default_resources   →  context.include_default_resources
```

Note: `stripAWSTags` is NOT converted to `context.stripAWSTags` because it's used in both `updateDatatable` (where `context` is in scope) and `mapResources` (where it isn't). Instead, it stays as a bare reference and is bridged as a Node global by the loader.

### Transform 8: Mapping Function
```
Before:  service_mapping_functions.push(function(reqParams, obj, tracked_resources){...});
After:   function mapResources(reqParams, obj, tracked_resources){...}

Before:  service_mapping_functions.push(async function(reqParams, obj, tracked_resources){...});
After:   async function mapResources(reqParams, obj, tracked_resources){...}
```
Uses brace depth counting to find the matching `});` that closes the `.push(`. Handles both sync and async mapping functions (only cloudfront.js uses async).

### Transform 9: Return Statement and Exports
```
After updateDatatable body:  return resources;
At end of file:              module.exports = { section, updateDatatable, mapResources };
```

## Codemod Usage

```bash
# Convert a single file
node scripts/codemod-service.js js/services/s3.js shared/services/s3.js

# Convert all unconverted files
node scripts/codemod-service.js --all

# Preview what would be converted
node scripts/codemod-service.js --dry-run
```

## Loader Changes

`shared/services/loader.js` was simplified since all services are now modules:
- Removed VM sandbox fallback path (no more `vm.runInContext` for services)
- Removed legacy directory scanning
- Added `stripAWSTags` to the Node global bridge (alongside existing `getResourceName`)
- Both globals are set before calling `mapResources` and restored after (to avoid polluting Node global scope)

## Edge Cases Handled

1. **`include_default_resources`** (ec2.js, vpc.js) — converted to `context.include_default_resources`, works because these references are inside `updateDatatable` where `context` is in scope
2. **`stripAWSTags`** (46 files) — kept as bare reference, bridged as Node global by loader since it's used in both `updateDatatable` and `mapResources`
3. **`async function mapResources`** (cloudfront.js) — codemod detects `async` keyword and preserves it
4. **Complex nesting** — vpc.js (76 append calls), iotcore.js (33), ec2.js (32), apigateway.js (31) — all handled by depth-counting parser
5. **Formatter references** — all 6 formatter types converted from bare globals to string references
6. **No `deepmerge` usage** in service files (confirmed by grep)
7. **No `$.notify` usage** in service files (confirmed by grep)
8. **No `window` references** in service files (confirmed by grep)

## Validation Results

- [x] All 139 services load and execute via the module path
- [x] No remaining `deferredBootstrapTable` in `shared/services/` (0 matches)
- [x] No remaining `blockUI`/`unblockUI` in `shared/services/` (0 matches)
- [x] No remaining `sections.push` in service files (0 matches, only in loader/registry infra)
- [x] No remaining `service_mapping_functions.push` in service files (0 matches, only in loader)
- [x] All 139 files have `const section`, `updateDatatable(context)`, `function mapResources`, `module.exports`
- [x] No bare `sdkcall(` (all are `context.sdkcall(`)
- [x] No bare `region` as value (all are `context.region` or `obj.region`)
- [x] Dual-loader only uses module path (no VM sandbox for services)
- [x] All 74 tests pass (6 test suites)

## Risks That Did NOT Materialize

- **Codemod edge cases**: The brace-depth-counting approach handled all files including the largest (vpc.js, ec2.js, apigateway.js) without manual intervention
- **Large files needing manual work**: Not needed — the codemod handled 100% automatically
- **Formatter resolution**: Solved by converting bare references to strings in section definitions
- **Batched conversion**: Not needed — all 138 files were converted in a single `--all` run
