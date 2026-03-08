# Stage 2: Filter Command Parity ✅ COMPLETED

## 1. Goal and Context

The `filter` command currently accepts a pre-generated JSON file and applies output formatting (CloudFormation, Terraform, etc.), but it lacks three options that the `generate` command supports:

- `--services` -- include only specific AWS services
- `--exclude-services` -- exclude specific AWS services
- `--region` -- override the AWS region used in output templates

This means users who split their workflow into `generate` + `filter` steps lose the ability to narrow results by service or control the region in output templates. Stage 2 brings the `filter` command to parity by adding these three options and extracting the shared filtering logic into a reusable function.

## 2. Files Modified

Only **`cli/main.js`** is modified. No other files are touched.

## 3. New Function: `applyServiceFilter(opts)`

Extract the inline service-filtering logic from `main()` (lines 245-263) into a standalone function defined near the top of the file (after the `nav()` function, around line 32).

```javascript
function applyServiceFilter(opts) {
    if (opts.services && opts.services.toUpperCase() == "ALL") {
        opts.services = null;
    }

    if (opts.excludeServices && opts.services) {
        throw new Error('Please do not use --exclude-services and --services simultaneously');
    }

    var includeExclude = opts.excludeServices || opts.services;
    if (includeExclude) {
        var includeExcludeServices = includeExclude.split(",").map(x => x.toLowerCase());
        for (var i in sections) {
            var includes = includeExcludeServices.includes(nav(sections[i].service).toLowerCase());
            if ((opts.services && !includes) || (opts.excludeServices && includes)) {
                delete sections[i];
            }
        }
        sections = sections.filter(val => val); // reindex
    }
}
```

The function:
- Mutates `opts.services` in place (nulling it when value is "ALL")
- Mutates the global `sections` array (deleting non-matching entries and reindexing)
- Throws if both `--services` and `--exclude-services` are provided
- Matches existing code style exactly (4-space indent, double quotes, `var`, semicolons)

## 4. Add Options to Filter Command Definition

Add three new options to the `filter` command definition, placed immediately after the existing `--include-default-resources` option and before `--debug`:

```javascript
    .option('--services <value>', 'list of services to include (can be comma separated (default: ALL))')
    .option('--exclude-services <value>', 'list of services to exclude (can be comma separated)')
    .option('--region <regionname>', 'overrides the region used in output templates')
```

The `--services` and `--exclude-services` descriptions match the `generate` command exactly. The `--region` description is adjusted to clarify it affects output templates only (not AWS API calls), since `filter` operates on already-fetched data.

## 5. Update Filter Action Handler

The current filter action handler is:

```javascript
    .action((opts) => {
        parseOpts(opts);
        validation = true;
        cli_resources = JSON.parse(fs.readFileSync(opts.inputFile).toString());
        saveOutput(opts);
    });
```

Update it to:

```javascript
    .action((opts) => {
        parseOpts(opts);
        validation = true;
        cli_resources = JSON.parse(fs.readFileSync(opts.inputFile).toString());

        applyServiceFilter(opts);

        if (opts.region) {
            region = opts.region;
        }

        saveOutput(opts);
    });
```

Key points:
- `applyServiceFilter(opts)` is called **after** loading `cli_resources` from file and **before** `saveOutput(opts)`. The `sections` array controls which mapping functions `performF2Mappings()` invokes during output, so filtering sections before save restricts output to the requested services.
- The region override sets the global `region` variable only. It does **not** call `AWS.config.update()` because the filter command does not make AWS API calls. The global `region` is read by `compileOutputs()` in `mappings.js` to populate template headers (Terraform provider block, CDK stack region, etc.).

## 6. Update `main()` to Call `applyServiceFilter`

Replace the inline filtering block in `main()` (lines 245-263) with a single call:

```javascript
    applyServiceFilter(opts);
```

This is a pure refactor with no behavioral change to the `generate` command.

## 7. Edge Cases

### Region only affects output templates, not AWS calls
In the `filter` command, `--region` sets the global `region` variable but does **not** call `AWS.config.update()`. This is intentional: the filter command reads from a file and never contacts AWS. The region value flows into `compileOutputs()` for template headers only.

### Services filter operates on the `sections` array
The `sections` array (from `datatables.js`) maps service names to their resource-type handlers. Filtering sections before `saveOutput()` causes `performF2Mappings()` to skip mapping functions for excluded services. Resources from excluded services that are already in `cli_resources` will not appear in output because their mapping functions are never called.

### Simultaneous `--services` and `--exclude-services`
The existing validation throws an error: `"Please do not use --exclude-services and --services simultaneously"`. This behavior is preserved identically for both commands via the shared `applyServiceFilter()` function.

### `--services ALL`
When `--services` is set to `"ALL"` (case-insensitive), the value is nulled out, resulting in no filtering. This matches the `generate` command behavior.

### Missing or empty `--services` / `--exclude-services`
When neither option is provided, `includeExclude` is undefined/falsy and the filtering block is skipped entirely. No change from current behavior.

## 8. Code Style Notes

All new code must follow the existing style in `cli/main.js`:
- **Indentation**: 4 spaces
- **Quotes**: double quotes (`"..."`)
- **Semicolons**: always
- **Variables**: `var` (matching surrounding code; do not introduce `const`/`let` where the original uses `var`)
- **Naming**: camelCase for variables and functions
- **Comparisons**: loose equality (`==`) where the original uses it (e.g., `opts.services.toUpperCase() == "ALL"`)
- **No trailing whitespace**, **no extra blank lines** beyond what exists

## 9. Verification Steps

1. **Generate baseline**: Run `generate` with `--services EC2,S3` and save raw output. Run `filter` on that file. Confirm output matches.

2. **Filter with `--services`**: Run `generate` without service filtering to get full raw data. Then run `filter --services EC2` on that file. Confirm output contains only EC2 resources.

3. **Filter with `--exclude-services`**: Run `filter --exclude-services EC2` on full raw data. Confirm EC2 resources are absent and others are present.

4. **Filter with `--region`**: Run `filter --region ap-southeast-2` and inspect Terraform/CDK output for correct region in provider/stack blocks.

5. **Mutual exclusion**: Run `filter --services EC2 --exclude-services S3`. Confirm it throws the expected error.

6. **`--services ALL`**: Run `filter --services ALL`. Confirm it produces the same output as running without `--services`.

7. **Generate regression**: Run `generate --services EC2` and confirm behavior is unchanged after the refactor to `applyServiceFilter()`.

8. **No AWS calls from filter**: Run `filter --region eu-west-1` with no AWS credentials configured. Confirm it completes without credential errors (proving no AWS API calls are made).
