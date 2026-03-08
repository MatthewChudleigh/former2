# Former2 CLI Completion Plan

## Context

The Former2 CLI (`cli/main.js`) is an experimental tool that wraps the browser-based Former2 web UI for command-line use. It currently supports only CloudFormation, Terraform, and raw JSON output, while 5 additional output formats (Troposphere, CDK v1, CDK v2, CDKTF, Pulumi) are stubbed as no-ops despite the mapping code existing in `js/mappings.js`. The CLI also has no tests, swallows errors silently, uses outdated dependencies, and loads browser JS via `eval()`.

This plan organises the work into parallel-friendly stages, ordered from lowest risk/effort to highest.

---

## Stage 1: Enable Stubbed Output Formats ✅ COMPLETED

**Files:** `cli/main.js`
**Risk:** Low — mapping functions already exist and work in the web UI
**Status:** Completed — all 5 new output flags, `--iac-language`, conditional stubs, and `saveOutput()` writes implemented

### Work

1. Add new CLI flags to both `generate` and `filter` commands:
   - `--output-troposphere <filename>`
   - `--output-cdk <filename>` (CDK v1 TypeScript)
   - `--output-cdk-v2 <filename>` (CDK v2 TypeScript)
   - `--output-pulumi <filename>`
   - `--output-cdktf <filename>`

2. Update `parseOpts()` (line 189):
   - Expand the "must specify an output type" check (line 190) to include the new formats
   - Conditionally stub each format only when its flag is absent (matching the existing CFN/TF pattern on lines 213-214), instead of unconditionally stubbing (lines 208-212)

3. Update `saveOutput()` (line 137):
   - Expand the guard on line 142 to trigger output generation when any IaC format is requested (not just CFN/TF)
   - Add `fs.writeFileSync` blocks for each new format, reading from `mapped_outputs['troposphere']`, `mapped_outputs['cdk']`, `mapped_outputs['cdkv2']`, `mapped_outputs['pulumi']`, `mapped_outputs['cdktf']`

4. Add a `--iac-language <typescript|python|java|dotnet>` option to control CDK/Pulumi language selection (currently hardcoded as `const iaclangselect = "typescript"` on line 98). Pulumi and CDKTF only work with `typescript`; Troposphere is Python-only; CDK v1/v2 support all four.

### Verification
```sh
former2 generate --output-troposphere tropo.py --services S3 --region us-east-1
former2 generate --output-pulumi pulumi.ts --services S3 --region us-east-1
former2 generate --output-cdktf cdktf.ts --services S3 --region us-east-1
former2 generate --output-cdk cdk.ts --services S3 --region us-east-1
former2 generate --output-cdk-v2 cdkv2.ts --services S3 --region us-east-1
# Verify each file contains valid output for discovered S3 resources
```

---

## Stage 2: Filter Command Parity ✅ COMPLETED

**Files:** `cli/main.js` (filter command block, lines 340-358)
**Risk:** Low — adding options that already work in `generate`
**Status:** Completed — `applyServiceFilter()` extracted, `--services`/`--exclude-services`/`--region` added to filter command

### Work

1. Add `--services` and `--exclude-services` options to the `filter` command definition (lines 340-358)
2. Add `--region` option to the `filter` command (needed to correctly map resources to a region)
3. In the `filter` action handler, apply the same service/exclude filtering logic from `main()` (lines 245-263) before calling `saveOutput()`. Extract this into a shared `filterSections(opts)` function to avoid duplication.

### Verification
```sh
former2 generate --output-raw-data all.json --region us-east-1
former2 filter --input-file all.json --services S3 --output-cloudformation s3.yml
former2 filter --input-file all.json --exclude-services S3 --output-cloudformation no-s3.yml
# Verify s3.yml has only S3 resources, no-s3.yml has none
```

---

## Stage 3: Error Logging & Propagation ✅ COMPLETED

**Files:** `cli/main.js`
**Risk:** Low — observability improvement, no behavioural change
**Status:** Completed — merged `.map()` calls, `scanErrors` collection, yellow summary on stderr, full debug output with `--debug`, `logplease` set to DEBUG in debug mode

### Work

1. Fix the TODO at line 285: surface service scan failures to the user. After the progress bar completes, print a summary of failed services (count + names) to stderr.
   - Collect failures in an array during the `Promise.all` loop
   - After `b1.stop()`, print: `"WARNING: N service(s) failed to scan: ServiceA, ServiceB"`

2. Make `--debug` output the full error details for each failed service (stack trace)

3. Set `logplease` log level to `WARN` by default (currently `NONE` on line 20) so AWS SDK warnings are visible. Keep `--debug` for full verbosity.

### Verification
```sh
# Use an IAM role with restricted permissions to trigger failures
former2 generate --output-raw-data out.json --region us-east-1
# Verify failure summary appears after progress bar
former2 generate --output-raw-data out.json --region us-east-1 --debug
# Verify detailed errors appear
```

---

## Stage 4: Test Infrastructure ✅ COMPLETED

**Files:** `cli/utils.js` (new), `tests/` (new), `jest.config.js` (new), `package.json`, `cli/main.js`
**Risk:** Low — additive, minimal existing code changes
**Status:** Completed — 4 pure functions extracted into `cli/utils.js`, 43 tests (31 unit + 10 integration + 2 edge cases) passing, 100% coverage on `cli/utils.js`

### Work

1. Add test framework: install `jest` as a devDependency, configure `package.json` scripts
2. Create test structure:
   ```
   tests/
   ├── unit/
   │   ├── parseOpts.test.js       # Validates option parsing, error cases
   │   ├── saveOutput.test.js      # Validates filtering, file writing
   │   ├── nav.test.js             # Tests the nav() string normalizer
   │   └── serviceFiltering.test.js # Tests --services/--exclude-services logic
   └── integration/
       └── cli.test.js             # End-to-end: runs CLI with fixture data
   ```
3. Create a fixture file `tests/fixtures/sample-resources.json` with a small set of representative resources for integration tests
4. Unit tests should import/require functions directly where possible; for globals loaded via eval, tests can replicate the eval loading pattern

### Verification
```sh
npm test
# All tests pass
```

---

## Stage 5: Dependency Updates ✅ COMPLETED

**Files:** `package.json`, `cli/Dockerfile`, `cli/main.js` (if commander API changes)
**Risk:** Medium — commander v4 to v12+ has breaking API changes
**Status:** Completed — all dependencies updated, Dockerfile upgraded to Node 20, commander migrated to v12 with `parseAsync()`, `engines` field added, all 43 tests pass

### Work

1. **Dockerfile:** Update `FROM node:14.8.0-buster-slim` to `FROM node:20-slim` (or Node 22 LTS)
2. **Commander:** Update from v4 to latest v12+
   - Review breaking changes in commander changelog
   - Main concern: `.command()` API, `.version()` placement, and option parsing may differ
   - Update `cli/main.js` command definitions accordingly
3. **Other dependencies:** Update `colors`, `cli-progress`, `logplease`, `deepmerge` to latest
4. **Do NOT update `aws-sdk` here** — that's Stage 6

### Verification
```sh
docker build -t former2-cli -f cli/Dockerfile .
docker run --rm former2-cli --version
# Verify version outputs correctly
former2 generate --output-raw-data out.json --services S3 --region us-east-1
# Verify basic functionality works with updated deps
npm test  # (if Stage 4 is merged)
```

---

## Stage 6: AWS SDK v2 to v3 Migration ✅ COMPLETED

**Files:** `cli/main.js`, `cli/sdk-v3-shim.js` (new), `package.json`
**Risk:** High — but contained to CLI-only shim; no service file changes needed
**Status:** Completed — v3 shim overrides sdkcall after eval, 206 services mapped, 55 tests pass

### Work

1. Replace `aws-sdk` (v2 monolith) with modular `@aws-sdk/client-*` packages
2. Create `cli/sdk-v3-shim.js` — v3-backed `sdkcall` implementation with SERVICE_PACKAGES map
3. Override eval'd `sdkcall` after eval block with v3 shim
4. Update credential loading with `@aws-sdk/credential-providers` (`fromIni`)
5. Update region loading with `@smithy/shared-ini-file-loader` (`loadSharedConfigFiles`)
6. Update proxy setup with `@smithy/node-http-handler` (`NodeHttpHandler`)
7. Remove `process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE`
8. Provide dummy `AWS = {}` global for eval'd code compatibility

### Verification
```sh
former2 generate --output-raw-data out.json --services "S3,Lambda,EC2" --region us-east-1
# Compare output with v2 output to verify no regression
```

---

## Stage 7: Replace eval() Architecture ✅ COMPLETED

**Files:** `cli/main.js`
**Risk:** High — architectural refactor, but contained to CLI only
**Status:** Completed — `vm.createContext`/`vm.runInContext` replaced all `eval()` calls, deepmerge.js eval removed (npm package used), all context globals properly referenced via `context.` prefix, no browser JS files modified

### Work (as implemented)

1. Added `const vm = require('vm')` to `cli/main.js`
2. Built explicit sandbox context with `vm.createContext()` containing all globals browser scripts depend on
3. Replaced all `eval()` calls with `vm.runInContext()` with `{ filename }` for better stack traces
4. Removed redundant `deepmerge.js` eval (npm package already available)
5. Updated all global references in main.js to use `context.` prefix (f2log, f2trace, outputMap*, sections, etc.)
6. Replaced `eval(dtname)` dynamic lookup with `context[dtname]` property access
7. No changes to any browser JS files — web UI unaffected

### Verification
```sh
former2 generate --output-raw-data out.json --services S3 --region us-east-1
# Verify identical output to pre-refactor
npm test
```

---

## Stage Dependency Graph

```
Stage 1 (output formats) ──┐
Stage 2 (filter parity)  ──┤── ✅ ALL COMPLETED
Stage 3 (error logging)  ──┘

Stage 4 (tests)           ──── ✅ COMPLETED

Stage 5 (dep updates)     ──── ✅ COMPLETED

Stage 6 (SDK v3)          ──── ✅ COMPLETED

Stage 7 (eval removal)    ──── ✅ COMPLETED
```

**Progress:**
- **Batch A:** Stages 1 + 2 + 3 ✅ COMPLETED
- **Stage 4:** Tests ✅ COMPLETED — 43 tests, 100% coverage on utils.js
- **Stage 5:** Dependency Updates ✅ COMPLETED — commander v12, Node 20 Dockerfile, parseAsync, all deps updated
- **Stage 6:** SDK v3 Migration ✅ COMPLETED — v3 shim with 206 services, 55 tests pass, no service file changes
- **Stage 7:** Replace eval() ✅ COMPLETED — vm.createContext sandbox, no browser JS changes, deepmerge.js eval removed

**All 7 stages complete.**
