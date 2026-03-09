# Stage 8: Remove Compatibility Layer

## Objective

Clean up all legacy code now that both CLI and web UI consume shared modules directly. Remove the dual-loader, original `js/` files, jQuery mock infrastructure, and backward-compatibility wrappers.

## Detailed Tasks

### 8.1 Remove Dual-Loader

Delete or simplify files created in Stage 2:

```
DELETE: shared/services/loader.js       # No longer needed — both CLI and web import directly
DELETE: shared/services/registry.js     # No longer needed — services imported directly
```

### 8.2 Delete Original JS Files

These files have been replaced by shared modules:

```
DELETE: js/datatables.js                # Replaced by shared/formatters.js, shared/pagination.js,
                                        # shared/sdkcall.js, web/sdkcall-browser.js
DELETE: js/mappings.js                  # Replaced by shared/mappings/*
DELETE: js/deepmerge.js                 # Replaced by npm deepmerge package
DELETE: js/RelationshipTypeMap.js       # Moved to shared/relationships.js
DELETE: js/services/                    # All 139 files moved to shared/services/
```

### 8.3 Remove jQuery Mock Infrastructure

Verify no remaining references in the codebase:

```bash
# These should return no results:
grep -r '\$obj' cli/ shared/
grep -r 'deferredBootstrapTable' shared/
grep -r 'blockUI\|unblockUI' shared/
grep -r 'vm\.createContext\|vm\.runInContext' cli/
```

### 8.4 Clean Up Shared Services Index

Update `shared/services/index.js` to be a clean aggregation:

```js
// shared/services/index.js
module.exports = [
    require('./s3'),
    require('./ec2'),
    require('./lambda'),
    // ... all 139 services
];
```

### 8.5 Clean Up Package Dependencies

Review `package.json`:
- Remove `deepmerge` if the browser was the only consumer and now uses the bundled version
- Actually, keep `deepmerge` — it's used by both CLI and shared modules via npm
- Verify no orphaned dependencies from the old architecture

### 8.6 Update .gitignore

Add build artifacts:
```
dist/
```

### 8.7 Update Documentation

Update any documentation referencing the old file structure:
- README.md if it mentions `js/services/` or `js/mappings.js`
- Any contributing guides

## Files to Delete

```
js/datatables.js
js/mappings.js
js/deepmerge.js
js/RelationshipTypeMap.js
js/services/               # Entire directory (139 files)
shared/services/loader.js
shared/services/registry.js
```

## Files to Keep

```
js/app.js                   # IF not fully replaced by web/app.js — otherwise delete
js/deferred-datatable.js    # Browser-only jQuery plugin (bundled into web build)
js/ui-app.js                # Browser-only UI utilities
js/ui-plugins.js            # Browser-only UI plugins
js/aws-sdk-2.x.min.js       # AWS SDK v2 browser bundle
```

## Final Directory Structure

```
shared/
  types.js                  # Interface definitions (Stage 1)
  formatters.js             # Formatter functions (Stage 3)
  pagination.js             # Pagination helpers (Stage 3)
  deepmerge.js              # Re-export of npm deepmerge (Stage 3)
  relationships.js          # RelationshipTypeMap (Stage 3)
  sections.js               # Section registry (Stage 4)
  sdkcall.js                # Sdkcall constants/contract (Stage 4)
  services/
    index.js                # Aggregates all services
    s3.js                   # 139 service modules
    ec2.js
    lambda.js
    ...
  mappings/
    index.js                # performF2Mappings, compileOutputs
    helpers.js              # Mapping helper functions
    cfn.js                  # CloudFormation output
    terraform.js            # Terraform output
    cdk.js                  # CDK v1/v2 output
    troposphere.js          # Troposphere output
    pulumi.js               # Pulumi output
    cdktf.js                # CDKTF output

cli/
  main.js                   # CLI orchestrator (no VM, direct imports)
  sdk-v3-shim.js            # AWS SDK v3 sdkcall implementation
  utils.js                  # CLI filtering utilities

web/
  app.js                    # Browser orchestrator (bundled entry point)
  sdkcall-browser.js        # Browser sdkcall (AWS SDK v2)

dist/
  former2-bundle.js         # Webpack output (gitignored)

js/
  aws-sdk-2.x.min.js        # AWS SDK v2 (loaded via <script>)
  deferred-datatable.js     # jQuery plugin (bundled or <script>)
  ui-app.js                 # Browser UI utilities
  ui-plugins.js             # Browser UI plugins
```

## Validation Criteria

- CLI works identically: `node cli/main.js generate --output-cloudformation out.yaml`
- Web UI works identically: all services scan, resources display, IaC output generates
- No references to `vm.createContext` or `vm.runInContext` anywhere
- No references to `$obj`, `deferredBootstrapTable` outside of `web/` and `js/deferred-datatable.js`
- No references to `blockUI`/`unblockUI` outside of `web/`
- `js/services/` directory no longer exists
- `js/datatables.js` and `js/mappings.js` no longer exist
- All tests pass (if tests exist by this point)
- Bundle builds successfully

## Dependencies

- Stage 6 (CLI updated)
- Stage 7 (web UI updated)

## Estimated Scope

- Delete ~145 files
- Delete ~2 compatibility files
- Minor cleanup to remaining files
- This is the smallest stage by new code — mostly deletion
