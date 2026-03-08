# Stage 3: Error Logging & Propagation ✅ COMPLETED

## 1. Goal & Context

The CLI's scan phase (`Promise.all` at lines 265-295 of `cli/main.js`) silently swallows
every error thrown by `updateDatatable*()` functions. The only trace is a `logplease` warn
call — but `logplease` is set to `NONE` at line 20, so nothing ever reaches the user.

The existing TODO at line 285 acknowledges this:

```javascript
// TODO: verify log setup for CLI (errors do not seem to appear when running `former2`)
```

**Objective:** Surface scan failures clearly to the user after the progress bar completes,
without breaking the overall scan (one failing service must not abort the rest). In `--debug`
mode, provide full error details.

## 2. Files Modified

Only **`cli/main.js`** is modified in this stage.

The error-swallowing behaviour inside `sdkcall()` (in `datatables.js`) is intentional — it
handles expected conditions like throttling, `AccessDeniedException`, and `NetworkingError`.
We do not change `sdkcall()`. The catch block in `main.js` fires for *unexpected* errors
from `updateDatatable*()` — typically crashes, malformed responses, or unhandled SDK errors
that escape `sdkcall()`.

## 3. Merge the Two `.map()` Calls

The current code chains two `.map()` calls: the first resolves a function reference via
`eval()`, the second wraps it in a Promise. Because they are separate, the catch block in the
second `.map()` has no access to the `section` that produced the error.

**Before (lines 275-293):**
```javascript
await Promise.all(
    sections
    .map(section => {
        let dtname = 'updateDatatable' + nav(section.category) + nav(section.service);
        return eval(dtname);
    })
    .map(work =>
        new Promise(async resolve => {
            try {
                await work();
            } catch (err) {
                awslog.warn(util.format('updateDatatable failed: %j', err));
            } finally {
                b1.increment();
                resolve();
            }
        })
    )
);
```

**After:**
```javascript
await Promise.all(
    sections.map(section => {
        let dtname = 'updateDatatable' + nav(section.category) + nav(section.service);
        let work = eval(dtname);
        return new Promise(async resolve => {
            try {
                await work();
            } catch (err) {
                scanErrors.push({
                    service: section.service,
                    category: section.category,
                    error: err
                });
            } finally {
                b1.increment();
                resolve();
            }
        });
    })
);
```

This is a single `.map()` that has access to both `section` and `work`. The catch block can
now record which service failed.

## 4. Add `scanErrors` Array

Declare `scanErrors` immediately before the `Promise.all` block (after the progress bar
`b1.start()` call):

```javascript
var scanErrors = [];
```

Each caught error pushes an object with `service`, `category`, and `error` properties (see
merged `.map()` above).

## 5. Print Error Summary After `b1.stop()`

After `b1.stop()` (currently line 295), add an error summary block:

```javascript
b1.stop();

if (scanErrors.length > 0) {
    var failedNames = scanErrors.map(function(e) { return e.service; });
    console.error(
        _colors.yellow("\n" + scanErrors.length + " service(s) failed during scan: ")
        + failedNames.join(", ")
    );
}
```

This prints a single yellow warning line to **stderr** listing the count and service names.
The scan result (HCL/CloudFormation output) is still generated from whichever services
succeeded — partial results are expected and useful.

## 6. Full Error Details in `--debug` Mode

When `--debug` is active, print the full error for each failed service immediately after the
summary line:

```javascript
if (scanErrors.length > 0) {
    var failedNames = scanErrors.map(function(e) { return e.service; });
    console.error(
        _colors.yellow("\n" + scanErrors.length + " service(s) failed during scan: ")
        + failedNames.join(", ")
    );

    if (opts.debug) {
        scanErrors.forEach(function(e) {
            console.error(
                _colors.red("\n[" + e.category + "/" + e.service + "]")
            );
            console.error(e.error);
        });
    }
}
```

`console.error(e.error)` prints the full Error object including stack trace. In non-debug
mode, users see only the count and names — enough to know what went wrong and to re-run
with `--debug` for details.

## 7. `logplease` Level Decision

- **Default (`--debug` off):** Keep `logplease` level at `NONE`. AWS SDK logging is
  extremely verbose and would pollute output. The new `scanErrors` summary replaces its
  role for surfacing failures.
- **`--debug` on:** Set `logplease` level to `DEBUG` so that AWS SDK log output is visible.
  Add this inside the existing `if (opts.debug)` block in `parseOpts` (around line 194):

```javascript
if (opts.debug) {
    logplease.setLogLevel('DEBUG');
    f2log = function(msg){ console.log(msg); };
    f2trace = function(err){ console.trace(err); };
    f2debug = function(msg){ console.log(Date.now().toString() + ": " + msg); };
}
```

This activates the `awslog.warn()` calls already present in the codebase (including any
remaining ones in `sdkcall()`) only when the user explicitly requests debug output.

## 8. Edge Cases

| Scenario | Expected behaviour |
|---|---|
| **All services fail** | Progress bar completes (all increments fire in `finally`). Summary lists every service name. Output file is empty or minimal. |
| **No services fail** | `scanErrors` is empty. No warning printed. Behaviour identical to current code. |
| **Mixed success/failure** | Progress bar completes. Summary lists only failed services. Output contains resources from successful services. |
| **Error in `sdkcall()`** | Most `sdkcall()` errors (throttle, access denied, networking) are caught and handled silently inside `sdkcall()` itself — they never reach our catch block. Only truly unexpected errors (e.g. malformed response parsing) propagate up to `updateDatatable*()` and into `scanErrors`. This is correct behaviour. |
| **Error is not an Error object** | `console.error(e.error)` handles strings, objects, and Error instances. No special handling needed. |
| **Extremely long service list in summary** | Acceptable — the `join(", ")` output may wrap, but this is a diagnostic message, not UI. |

## 9. Code Style Notes

- Use **4-space indentation** consistently with the rest of the file.
- Use **double quotes** for strings.
- Use **`var`** for `scanErrors` to match the existing declaration style in the surrounding
  code (the file mixes `var`/`const`/`let`; `var` is used for mutable arrays).
- Use `_colors.yellow()` for the warning summary, `_colors.red()` for per-service error
  headers in debug mode — consistent with the existing use of `_colors` in the file.
- Use `console.error()` (not `console.log()`) for all error output so it goes to **stderr**
  and does not interfere with piped stdout output.
- Use `function()` syntax (not arrow functions) in the `forEach` and `map` callbacks to
  match the style of the surrounding code in `main.js`.
- Keep semicolons at end of statements.

## 10. Verification Steps

1. **Normal run (no errors expected):** Run `former2 generate` against a valid AWS account.
   Confirm no warning line appears after the progress bar. Output is unchanged.

2. **Permission-denied scenario:** Run with an IAM user/role that lacks most permissions.
   Confirm the progress bar completes, then a yellow summary line appears on stderr listing
   the failed service count and names.

3. **`--debug` mode:** Re-run the permission-denied scenario with `--debug`. Confirm:
   - The yellow summary line still appears.
   - Each failed service has a red header and full error output below it.
   - AWS SDK debug logging (from `logplease`) is visible.

4. **Pipe-safe:** Run `former2 generate > output.tf 2>errors.log`. Confirm that the
   generated output goes to `output.tf` cleanly and all error messages go to `errors.log`.

5. **All-fail:** Use a completely empty/restricted IAM identity. Confirm the progress bar
   still completes (no hang), the summary lists all services, and the output file is
   empty or contains only boilerplate.
