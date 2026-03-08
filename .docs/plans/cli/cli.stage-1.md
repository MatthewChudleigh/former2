# Stage 1: Enable Stubbed Output Formats ✅ COMPLETED

## 1. Goal and Context

The Former2 CLI (`cli/main.js`) currently supports only three output modes: CloudFormation (`--output-cloudformation`), Terraform (`--output-terraform`), and raw JSON (`--output-raw-data`). However, the underlying mapping engine in `js/mappings.js` already compiles five additional formats: CDK v1, CDK v2, Troposphere, Pulumi, and CDKTF. These are stubbed to no-ops in the CLI via `outputMapCdk = function(){};` etc. on lines 208-212 of `cli/main.js`.

This stage wires those existing formats into the CLI by:
- Adding new `--output-*` flags for each format
- Adding `--iac-language` to control language selection (currently hardcoded)
- Updating `parseOpts()` to conditionally stub formats (not unconditionally)
- Updating `saveOutput()` to write the new format files
- Updating the output-type validation guard

**Files modified:** `cli/main.js` only (364 lines)

---

## 2. Every Code Change (with before/after and line numbers)

### Change 1: Make `iaclangselect` reassignable (line 98)

The variable is declared `const`, preventing reassignment from `parseOpts()`.

**Before (line 98):**
```javascript
const iaclangselect = "typescript";
```

**After (line 98):**
```javascript
var iaclangselect = "typescript";
```

---

### Change 2: Update `parseOpts()` output-type validation (lines 189-220)

#### 2a: Expand the "must specify an output type" guard (line 190)

**Before (line 190):**
```javascript
    if (!opts.outputRawData && !opts.outputCloudformation && !opts.outputTerraform) {
        throw new Error('You must specify an output type');
    }
```

**After (line 190):**
```javascript
    if (!opts.outputRawData && !opts.outputCloudformation && !opts.outputTerraform &&
        !opts.outputCdk && !opts.outputCdkV2 && !opts.outputTroposphere &&
        !opts.outputPulumi && !opts.outputCdktf) {
        throw new Error('You must specify an output type');
    }
```

Note: Commander auto-camelCases `--output-cdk-v2` to `opts.outputCdkV2` (capital V due to the `v2` segment).

#### 2b: Handle `--iac-language` (insert after the `cfnDeletionPolicy` check, before line 208)

**Insert after line 206 (after the closing brace of the cfnDeletionPolicy check):**
```javascript
    if (opts.iacLanguage) {
        var validLanguages = ["typescript", "python", "java", "dotnet"];
        if (!validLanguages.includes(opts.iacLanguage)) {
            throw new Error('You must specify --iac-language value in [typescript, python, java, dotnet]');
        }
        iaclangselect = opts.iacLanguage;
    }
```

#### 2c: Replace unconditional stubs with conditional stubs (lines 208-214)

**Before (lines 208-214):**
```javascript
    outputMapCdk = function(){};
    outputMapCdkv2 = function(){};
    outputMapTroposphere = function(){};
    outputMapPulumi = function(){};
    outputMapCdktf = function(){};
    if (!opts.outputCloudformation) { outputMapCfn = function(){}; }
    if (!opts.outputTerraform) { outputMapTf = function(){}; }
```

**After:**
```javascript
    if (!opts.outputCdk) { outputMapCdk = function(){}; }
    if (!opts.outputCdkV2) { outputMapCdkv2 = function(){}; }
    if (!opts.outputTroposphere) { outputMapTroposphere = function(){}; }
    if (!opts.outputPulumi) { outputMapPulumi = function(){}; }
    if (!opts.outputCdktf) { outputMapCdktf = function(){}; }
    if (!opts.outputCloudformation) { outputMapCfn = function(){}; }
    if (!opts.outputTerraform) { outputMapTf = function(){}; }
```

This ensures that when a user requests e.g. `--output-cdk-v2`, the `outputMapCdkv2` function is NOT stubbed, allowing `compileOutputs()` to actually populate the `'cdkv2'` key.

---

### Change 3: Update `saveOutput()` (lines 137-187)

#### 3a: Expand the guard condition (line 142)

**Before (line 142):**
```javascript
    if (opts.outputCloudformation || opts.outputTerraform) {
```

**After (line 142):**
```javascript
    if (opts.outputCloudformation || opts.outputTerraform ||
        opts.outputCdk || opts.outputCdkV2 || opts.outputTroposphere ||
        opts.outputPulumi || opts.outputCdktf) {
```

#### 3b: Add file-write blocks for the new formats (insert after line 185, before the closing brace on line 186)

**Insert after the Terraform write block (after line 185):**
```javascript
        if (opts.outputCdk) {
            fs.writeFileSync(opts.outputCdk, mapped_outputs['cdk']);
        }

        if (opts.outputCdkV2) {
            fs.writeFileSync(opts.outputCdkV2, mapped_outputs['cdkv2']);
        }

        if (opts.outputTroposphere) {
            fs.writeFileSync(opts.outputTroposphere, mapped_outputs['troposphere']);
        }

        if (opts.outputPulumi) {
            fs.writeFileSync(opts.outputPulumi, mapped_outputs['pulumi']);
        }

        if (opts.outputCdktf) {
            fs.writeFileSync(opts.outputCdktf, mapped_outputs['cdktf']);
        }
```

---

### Change 4: Add CLI options to the `generate` command (lines 308-338)

**Insert after line 311 (`--output-terraform`) and before line 312 (`--output-raw-data`):**

```javascript
    .option('--output-cdk <filename>', 'filename for CDK v1 output')
    .option('--output-cdk-v2 <filename>', 'filename for CDK v2 output')
    .option('--output-troposphere <filename>', 'filename for Troposphere output')
    .option('--output-pulumi <filename>', 'filename for Pulumi output')
    .option('--output-cdktf <filename>', 'filename for CDKTF output')
```

**Insert after line 314 (`--cfn-deletion-policy`) and before line 315 (`--search-filter`):**

```javascript
    .option('--iac-language <typescript|python|java|dotnet>', 'language for CDK/Pulumi/CDKTF output (default: typescript)')
```

---

### Change 5: Add CLI options to the `filter` command (lines 340-358)

**Insert after line 345 (`--output-terraform`) and before line 346 (`--output-logical-id-mapping`):**

```javascript
    .option('--output-cdk <filename>', 'filename for CDK v1 output')
    .option('--output-cdk-v2 <filename>', 'filename for CDK v2 output')
    .option('--output-troposphere <filename>', 'filename for Troposphere output')
    .option('--output-pulumi <filename>', 'filename for Pulumi output')
    .option('--output-cdktf <filename>', 'filename for CDKTF output')
```

**Insert after line 348 (`--cfn-deletion-policy`) and before line 349 (`--search-filter`):**

```javascript
    .option('--iac-language <typescript|python|java|dotnet>', 'language for CDK/Pulumi/CDKTF output (default: typescript)')
```

---

## 3. Complete Diff Summary

| Location | What changes | Lines affected |
|---|---|---|
| Line 98 | `const` to `var` for `iaclangselect` | 1 line |
| Lines 190-192 | Expand output-type validation guard | 3 lines -> 5 lines |
| After line 206 | Add `--iac-language` validation + assignment | +6 lines (new) |
| Lines 208-214 | Conditional stubs instead of unconditional | 7 lines -> 7 lines |
| Line 142 | Expand `saveOutput` guard condition | 1 line -> 3 lines |
| After line 185 | Add `fs.writeFileSync` for 5 new formats | +15 lines (new) |
| Generate command (after line 311) | Add 5 output options + 1 language option | +6 lines (new) |
| Filter command (after line 345) | Add 5 output options + 1 language option | +6 lines (new) |

**Net change:** ~34 lines added, ~4 lines modified. No lines deleted.

---

## 4. Edge Cases

### 4a: Language compatibility warnings

The `compileOutputs()` function in `js/mappings.js` already handles unsupported language/format combinations by returning the string `'// Selected programming language not supported for this output'`. Specifically:

- **Pulumi**: Only compiles when `iaclangselect === "typescript"` (line 4492). All other languages produce `'// Selected programming language not supported for this output'`.
- **CDKTF**: Only compiles when `iaclangselect === "typescript"` (line 4492). Same fallback.
- **CDK v1 / CDK v2**: Compile when `iaclangselect` is in `['typescript', 'python', 'java', 'dotnet']` (line 4483). All four are supported.
- **Troposphere**: Always compiles (Python-only by nature, line 4487). No language guard.

**Decision:** We do NOT add additional warnings at the CLI level. The output file will contain the `'// Selected programming language not supported for this output'` comment, which is self-explanatory. Users requesting `--output-pulumi` with `--iac-language python` will get a file with that comment. This matches the web UI behavior. A future enhancement could add a stderr warning, but that is out of scope for Stage 1.

### 4b: Empty output (no resources matched)

When no resources are discovered (or all are filtered out), `compileOutputs()` returns format-specific "no resources" comments (e.g., `'# No resources generated'` for CFN/Troposphere, `'// No resources generated'` for CDK/Pulumi/CDKTF). These are written to the output files as-is. This is correct behavior -- the file is created with a comment, not left empty or omitted.

### 4c: Multiple formats at once

Users can specify multiple `--output-*` flags simultaneously, e.g.:
```sh
former2 generate --output-cloudformation cfn.yml --output-cdk-v2 cdk.ts --output-pulumi pulumi.ts
```

This works because:
1. `parseOpts()` only stubs the `outputMap*` functions for formats NOT requested. Multiple formats can be active.
2. `compileOutputs()` always builds all format keys in its return object, using the `outputMap*` functions. Active formats get real output; stubbed formats get empty strings appended to their headers.
3. `saveOutput()` checks each flag independently and writes each requested file.

No conflicts arise because the formats are compiled independently within `compileOutputs()`.

### 4d: `--output-raw-data` combined with IaC formats

`--output-raw-data` writes the raw `cli_resources` array before `saveOutput()` is called (line 297-299 in `main()`). It is independent of the IaC compilation path. Combining it with any `--output-*` IaC flag works correctly.

### 4e: `--iac-language` without a language-dependent format

If a user specifies `--iac-language python --output-cloudformation cfn.yml`, the language setting is accepted and `iaclangselect` is set, but it has no effect on CloudFormation output. This is harmless. No error or warning is needed.

### 4f: `--iac-language` without being specified (default)

When `--iac-language` is omitted, `iaclangselect` remains `"typescript"` (the default from line 98). This preserves backward compatibility and means Pulumi/CDKTF work out of the box.

---

## 5. Code Style Notes

All changes must follow the existing code style in `cli/main.js`:

- **Indentation:** 4 spaces (no tabs)
- **Quotes:** Double quotes for strings in most places; single quotes for object keys in `output_objects.push()` block
- **Semicolons:** Present at end of statements
- **Variable declarations:** Use `var` for variables that need reassignment (matching existing pattern); `const` is used only for immutable module imports
- **Conditionals:** Single-line form `if (!opts.x) { outputMapX = function(){}; }` for stubs (matching lines 213-214)
- **No trailing commas** in function argument lists
- **No JSDoc or TypeScript**
- **Commander options:** Use `<value>` for required option arguments, lowercase kebab-case for flag names
- **Error messages:** Follow the pattern `'You must specify ...'` (see lines 191, 205)

---

## 6. Verification Steps

### 6a: Smoke test -- new flags appear in help

```sh
node cli/main.js generate --help
# Verify --output-cdk, --output-cdk-v2, --output-troposphere, --output-pulumi,
# --output-cdktf, and --iac-language appear in the help output

node cli/main.js filter --help
# Same verification
```

### 6b: Validation -- no output type specified

```sh
node cli/main.js generate --region us-east-1
# Should throw: 'You must specify an output type'
```

### 6c: Validation -- invalid language

```sh
node cli/main.js generate --output-cdk-v2 cdk.ts --iac-language ruby --region us-east-1
# Should throw: 'You must specify --iac-language value in [typescript, python, java, dotnet]'
```

### 6d: Validation -- new format alone satisfies the output-type check

```sh
node cli/main.js generate --output-troposphere tropo.py --region us-east-1 --services S3
# Should NOT throw 'You must specify an output type'
# Should run scan and produce tropo.py
```

### 6e: End-to-end with generate (requires AWS credentials)

```sh
# Generate raw data first (for use with filter tests)
node cli/main.js generate --output-raw-data raw.json --services S3 --region us-east-1

# Generate all new formats
node cli/main.js generate \
    --output-troposphere tropo.py \
    --output-cdk cdk-v1.ts \
    --output-cdk-v2 cdk-v2.ts \
    --output-pulumi pulumi.ts \
    --output-cdktf cdktf.ts \
    --services S3 --region us-east-1

# Verify each file exists and contains either resource definitions or
# '# No resources generated' / '// No resources generated'
cat tropo.py    # Should start with 'from troposphere import ...'
cat cdk-v1.ts   # Should start with "import * as cdk from '@aws-cdk/core';"
cat cdk-v2.ts   # Should start with "import * as cdk from 'aws-cdk-lib';"
cat pulumi.ts   # Should start with 'import * as pulumi from "@pulumi/pulumi";'
cat cdktf.ts    # Should start with "import { Construct } from 'constructs';"
```

### 6f: End-to-end with filter

```sh
node cli/main.js filter \
    --input-file raw.json \
    --output-cdk-v2 filtered-cdk.ts \
    --output-troposphere filtered-tropo.py

# Verify files are produced with correct content
```

### 6g: Language selection

```sh
node cli/main.js generate \
    --output-cdk-v2 cdk-py.py \
    --iac-language python \
    --services S3 --region us-east-1

# Verify cdk-py.py contains Python CDK code (from aws_cdk import ...)
```

### 6h: Unsupported language for Pulumi

```sh
node cli/main.js generate \
    --output-pulumi pulumi-py.ts \
    --iac-language python \
    --services S3 --region us-east-1

# Verify pulumi-py.ts contains:
# '// Selected programming language not supported for this output'
```

### 6i: Multiple formats simultaneously

```sh
node cli/main.js generate \
    --output-cloudformation cfn.yml \
    --output-terraform tf.tf \
    --output-cdk-v2 cdk.ts \
    --output-troposphere tropo.py \
    --services S3 --region us-east-1

# Verify all four files are produced correctly
```

### 6j: Existing behavior unchanged

```sh
# Verify existing CloudFormation + Terraform output still works identically
node cli/main.js generate \
    --output-cloudformation cfn.yml \
    --output-terraform main.tf \
    --services S3 --region us-east-1

# Compare with output from pre-change CLI (if available)
```

---

## 7. Rollback Considerations

- **Scope:** All changes are confined to `cli/main.js`. No other files are touched.
- **Backward compatibility:** All existing CLI flags and behavior are preserved. The only behavioral change is that previously, specifying none of the original three output types would error; now, specifying any of the eight output types satisfies the check.
- **Rollback procedure:** `git revert <commit>` is sufficient. No database migrations, config files, or external dependencies change.
- **Risk to web UI:** Zero. The web UI loads `js/mappings.js` via `<script>` tags and does not use `cli/main.js` at all.
- **Risk to existing CLI users:** Zero for existing flag combinations. The `const` to `var` change on line 98 has no observable effect unless `--iac-language` is used, and the default value remains `"typescript"`.
- **Dependency on mappings.js:** This stage assumes `compileOutputs()` in `js/mappings.js` continues to return an object with keys `'cdk'`, `'cdkv2'`, `'troposphere'`, `'pulumi'`, `'cdktf'`. If those keys are renamed or removed upstream, the CLI will write `undefined` to files. This is an existing coupling (same pattern as `'cfn'` and `'tf'`), not a new risk.
