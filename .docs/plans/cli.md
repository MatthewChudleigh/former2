# Former2 CLI Completion Plan

## Context

The Former2 CLI (`cli/main.js`) is an experimental tool that wraps the browser-based Former2 web UI for command-line use. It currently supports only CloudFormation, Terraform, and raw JSON output, while 5 additional output formats (Troposphere, CDK v1, CDK v2, CDKTF, Pulumi) are stubbed as no-ops despite the mapping code existing in `js/mappings.js`. The CLI also has no tests, swallows errors silently, uses outdated dependencies, and loads browser JS via `eval()`.

This plan organises the work into parallel-friendly stages, ordered from lowest risk/effort to highest.

---

## Stage 1: Enable Stubbed Output Formats

**Files:** `cli/main.js`
**Risk:** Low — mapping functions already exist and work in the web UI

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

## Stage 2: Filter Command Parity

**Files:** `cli/main.js` (filter command block, lines 340-358)
**Risk:** Low — adding options that already work in `generate`

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

## Stage 3: Error Logging & Propagation

**Files:** `cli/main.js`
**Risk:** Low — observability improvement, no behavioural change

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

## Stage 4: Test Infrastructure

**Files:** New files only — `tests/`, `package.json` (scripts + devDependencies)
**Risk:** Low — additive, no existing code changes. Fully parallelisable.

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

## Stage 5: Dependency Updates

**Files:** `package.json`, `cli/Dockerfile`, `cli/main.js` (if commander API changes)
**Risk:** Medium — commander v4 to v12+ has breaking API changes

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

## Stage 6: AWS SDK v2 to v3 Migration

**Files:** `cli/main.js`, `js/services/*.js` (all 148 files), `package.json`
**Risk:** High — touches every service file, largest change by far

### Work

1. Replace `aws-sdk` (v2 monolith) with modular `@aws-sdk/client-*` packages
2. Update `sdkcall()` helper (defined in one of the eval'd files) to use v3 client pattern
3. Update credential loading in `main()` (lines 224-243):
   - Replace `AWS.SharedIniFileCredentials` with `@aws-sdk/credential-providers`
   - Replace `AWS.config.update({region})` with v3 config pattern
   - Replace proxy setup with v3 middleware
4. Update all 148 service files' API calls — these use `sdkcall("ServiceName", "methodName", params)` pattern, so the migration is primarily in the `sdkcall` abstraction layer
5. Remove `process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE` (line 18)

**Note:** If `sdkcall()` fully abstracts SDK usage, the service files may need minimal or no changes. Investigate `sdkcall()` implementation first.

### Verification
```sh
former2 generate --output-raw-data out.json --services "S3,Lambda,EC2" --region us-east-1
# Compare output with v2 output to verify no regression
```

---

## Stage 7: Replace eval() Architecture

**Files:** `cli/main.js`, `js/mappings.js`, `js/datatables.js`, `js/services/*.js`
**Risk:** High — architectural refactor affecting both CLI and potentially web UI

### Work

1. Convert `js/mappings.js`, `js/datatables.js`, and `js/deepmerge.js` to use `module.exports` / CommonJS
2. Convert service files to export their `updateDatatable*` functions and `sections` entries
3. Replace `eval()` calls in `cli/main.js` (lines 126-132) with `require()` calls
4. Stub browser globals (`$`, `blockUI`, `unblockUI`, `navigator`) via a shared `cli/browser-stubs.js` module
5. Ensure the web UI still works — the browser files need to remain loadable via `<script>` tags. Options:
   - Use UMD pattern (works in both browser and Node)
   - Use a build step to generate browser bundles from CommonJS source
   - Keep dual compatibility with `typeof module !== 'undefined'` guards

**This stage should be done last** as it touches the most files and has the highest risk of breaking the web UI.

### Verification
```sh
former2 generate --output-raw-data out.json --services S3 --region us-east-1
# Verify identical output to pre-refactor
# Verify web UI still loads and functions (manual browser test)
npm test
```

---

## Stage Dependency Graph

```
Stage 1 (output formats) ──┐
Stage 2 (filter parity)  ──┤── all touch cli/main.js but different sections
Stage 3 (error logging)  ──┘   (minor merge conflicts expected)

Stage 4 (tests)           ──── fully independent (new files only)

Stage 5 (dep updates)     ──── depends on Stages 1-3 being merged first
                                (commander API changes affect command defs)

Stage 6 (SDK v3)          ──── depends on Stage 5

Stage 7 (eval removal)    ──── depends on Stage 6, do last
```

**Recommended parallel batches:**
- **Batch A:** Stages 1 + 2 + 3 + 4 (all in parallel, merge in order 4→3→2→1)
- **Batch B:** Stage 5 (after Batch A)
- **Batch C:** Stage 6 (after Batch B)
- **Batch D:** Stage 7 (after Batch C)
