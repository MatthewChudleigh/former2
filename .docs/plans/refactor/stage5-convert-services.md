# Stage 5: Convert Service Files Incrementally

## Objective

Migrate all 139 service files from global-based browser scripts to module-based exports. This is the largest stage by file count but highly mechanical — the files follow a consistent pattern that a codemod can handle.

## Current Pattern (All 139 Files)

Every service file follows this exact structure:

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

## Codemod Transformations

### Transform 1: Section Definition
```
Before:  sections.push({...});
After:   const section = {...};
         // + add to module.exports
```

### Transform 2: UpdateDatatable Function
```
Before:  async function updateDatatableCategoryService() {
After:   async function updateDatatable(context) {
             const resources = [];
```

### Transform 3: DOM Manipulation → Array Push
```
Before:  $('#section-...-datatable').deferredBootstrapTable('append', [{...}]);
After:   resources.push({...});

Before:  $('#section-...-datatable').deferredBootstrapTable('removeAll');
After:   (remove line entirely)
```

### Transform 4: BlockUI/UnblockUI → Remove
```
Before:  blockUI('#section-...');
After:   (remove line entirely)

Before:  unblockUI('#section-...');
After:   (remove line entirely)
```

### Transform 5: Global References → Context
```
Before:  sdkcall("S3", ...)
After:   context.sdkcall("S3", ...)

Before:  f2region: region,
After:   f2region: context.region,

Before:  await getResourceTags(arn)
After:   await context.getResourceTags(arn)

Before:  stripAWSTags(tags)
After:   context.stripAWSTags(tags)
         // OR: const { stripAWSTags } = require('../utils');
```

### Transform 6: Mapping Function
```
Before:  service_mapping_functions.push(function(reqParams, obj, tracked_resources){...});
After:   function mapResources(reqParams, obj, tracked_resources){...}
         // + add to module.exports
```

### Transform 7: Add Return and Exports
```
After updateDatatable body:  return resources;
At end of file:              module.exports = { section, updateDatatable, mapResources };
```

## Codemod Script Design

Create `scripts/codemod-service.js`:

```js
#!/usr/bin/env node
/**
 * Converts a Former2 service file from global-based to module-based.
 *
 * Usage: node scripts/codemod-service.js js/services/s3.js shared/services/s3.js
 */

const fs = require('fs');
const source = fs.readFileSync(process.argv[2], 'utf8');
let output = source;

// 1. sections.push({...}) → const section = {...};
output = output.replace(/^sections\.push\((\{[\s\S]*?\})\);/m, 'const section = $1;');

// 2. Function rename: updateDatatable<Category><Service>() → updateDatatable(context)
output = output.replace(
    /async function updateDatatable\w+\(\)/,
    'async function updateDatatable(context) {\n    const resources = [];'
);

// 3. Remove blockUI/unblockUI lines
output = output.replace(/^\s*blockUI\([^)]*\);\s*$/gm, '');
output = output.replace(/^\s*unblockUI\([^)]*\);\s*$/gm, '');

// 4. Replace DOM manipulation
output = output.replace(
    /\$\('[^']*'\)\.deferredBootstrapTable\('append',\s*(\[[\s\S]*?\]\]);/g,
    'resources.push(...$1;'
);
output = output.replace(/\$\('[^']*'\)\.deferredBootstrapTable\('removeAll'\);/g, '');

// 5. Replace globals with context references
output = output.replace(/(?<!\.)sdkcall\(/g, 'context.sdkcall(');
output = output.replace(/f2region:\s*region/g, 'f2region: context.region');
output = output.replace(/(?<!\.)getResourceTags\(/g, 'context.getResourceTags(');
output = output.replace(/(?<!\.)stripAWSTags\(/g, 'context.stripAWSTags(');

// 6. Convert mapping function
output = output.replace(
    /service_mapping_functions\.push\(function\s*\((.*?)\)\s*\{/,
    'function mapResources($1) {'
);
// Remove trailing });  that closed the push(
// (This needs careful handling of brace matching)

// 7. Add return statement before function end
// 8. Add module.exports at end
output += '\n\nmodule.exports = { section, updateDatatable, mapResources };\n';

fs.writeFileSync(process.argv[3], output);
```

**Caveats for the codemod:**
- Brace matching for `service_mapping_functions.push(function(...) { ... });` — need to find the matching closing `});`
- Some service files have multiple `deferredBootstrapTable('append', [...])` calls spread across nested `.then()` chains
- Some files reference `deepmerge` directly (not via `context`)
- The `include_default_resources` check in vpc/ec2 services
- `$.notify` calls in some services (should be removed or replaced)
- Formatter references in column definitions (`primaryFieldFormatter`, `textFormatter`, etc.) need to be importable

### Manual Intervention Cases

Some files need manual review after codemod:

1. **Files with `deepmerge` usage** — grep for `deepmerge` in service files
2. **Files with `include_default_resources`** — ec2.js, vpc.js
3. **Files with `$.notify`** — rare, but check
4. **Files with complex nesting** — apigateway.js (31 append calls), iotcore.js (33 append calls)
5. **Files referencing `window`** — should be none, but verify

## Conversion Order

Recommended order (simplest first to validate codemod, complex last):

### Batch 1: Trivial services (test codemod)
1. `simpledb.js` (99 lines, 1 resource type) — already done in Stage 2
2. `securityhub.js` (89 lines)
3. `swf.js` (99 lines)
4. `fis.js` (101 lines)
5. `iotthingsgraph.js` (101 lines)

### Batch 2: Small services (< 200 lines, ~30 files)
- `costandusagereports.js`, `costexplorer.js`, `lookoutforequipment.js`, `nimblestudio.js`, `panorama.js`, `healthlake.js`, `finspace.js`, `resiliencehub.js`, `devopsguru.js`, `billingconductor.js`, etc.

### Batch 3: Medium services (200-500 lines, ~50 files)
- `s3.js`, `lambda.js`, `sqs.js`, `sns.js`, `dynamodb.js`, `rds.js`, etc.

### Batch 4: Large services (500-1000 lines, ~30 files)
- `cloudwatch.js`, `iam.js`, `glue.js`, `sagemaker.js`, etc.

### Batch 5: Very large services (1000+ lines, ~10 files)
- `ec2.js`, `vpc.js`, `ecs.js`, `apigateway.js`, `iotcore.js`

### Batch 6: Services with special patterns
- Any files that need manual conversion due to unusual patterns

## Per-File Conversion Checklist

For each converted file:

- [ ] Run codemod
- [ ] Verify `sections.push()` → `const section = ...`
- [ ] Verify `updateDatatable*()` → `updateDatatable(context)`
- [ ] Verify all `$(...).deferredBootstrapTable('append', [...])` → `resources.push(...)`
- [ ] Verify `blockUI`/`unblockUI` removed
- [ ] Verify `sdkcall(` → `context.sdkcall(`
- [ ] Verify `region` → `context.region` (only bare `region` references, not `obj.region`)
- [ ] Verify `service_mapping_functions.push(function` → `function mapResources`
- [ ] Verify `module.exports` added
- [ ] Remove original from `js/services/`
- [ ] Test via dual-loader (CLI `--services ServiceName`)

## Files to Create

```
shared/services/
  simpledb.js          # (Already done in Stage 2)
  securityhub.js
  swf.js
  fis.js
  ... (139 files total)
  index.js             # Aggregates all service exports

scripts/
  codemod-service.js   # Automated conversion script
```

## Files to Delete (After Conversion)

```
js/services/
  simpledb.js
  securityhub.js
  ... (all 139 files, moved to shared/services/)
```

## Validation Criteria

- CLI `--output-raw-data` produces identical resource lists before and after conversion (per service)
- All 139 services load and execute via the module path
- No remaining references to `$`, `blockUI`, `unblockUI` in `shared/services/`
- No bare `sdkcall(` (must be `context.sdkcall(`) in `shared/services/`
- No bare `region` used as a value (must be `context.region`) in `shared/services/`
- Dual-loader only uses the module path (VM sandbox no longer loads any service files)

## Dependencies

- Stage 1 (type definitions)
- Stage 2 (dual-loader for incremental testing)
- Stage 3 (formatters available as imports for column definitions)
- Stage 4 (`getResourceName` available as import for mapResources)

## Risks

- Codemod may not handle all edge cases (nested `.then()` chains, complex brace matching)
- Large files like `ec2.js` and `apigateway.js` may need significant manual work
- Formatter references in column definitions (`primaryFieldFormatter`) need resolution — either imported or remain globals

## Estimated Scope

- 139 service files converted
- 1 codemod script (~200 lines)
- 1 index file for service aggregation
- Estimated: ~60% automated by codemod, ~40% manual cleanup
- Largest single stage by file count but highly parallelizable
