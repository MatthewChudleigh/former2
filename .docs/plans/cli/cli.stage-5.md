# Stage 5: Dependency Updates

## 1. Goal and Context

Update all CLI dependencies to current versions, modernize the Dockerfile, and set a minimum Node.js engine requirement. This stage focuses purely on dependency and runtime updates — the AWS SDK v2-to-v3 migration is deferred to Stage 6.

### Current dependency versions

| Package        | Current        | Target         |
|----------------|----------------|----------------|
| aws-sdk        | ^2.773.0       | *unchanged*    |
| cli-progress   | ^3.5.0         | ^3.12.0        |
| colors         | ^1.4.0         | 1.4.0 (pinned) |
| commander      | ^4.1.0         | ^12.1.0        |
| deepmerge       | ^4.2.2         | ^4.3.1         |
| former2        | ^0.2.48        | ^0.2.48        |
| logplease      | ^1.2.15        | ^1.2.15        |
| proxy-agent    | ^6.3.1         | ^6.5.0         |

### Files modified

- `package.json` — version bumps, engine requirement
- `cli/Dockerfile` — Node runtime upgrade
- `cli/main.js` — commander API migration, parseAsync

---

## 2. Commander Migration (v4 -> v12)

Commander is the most significant update. The v4-to-v12 jump spans several major versions with accumulated breaking changes.

### 2.1 Import — no change required

The current code uses `const cliargs = require('commander');` which returns the global `program` singleton. This still works in v12. **Keep the `cliargs` variable name** to minimize diff noise — renaming to `program` is cosmetic and can be done separately if desired.

### 2.2 `.version()`, `.command()`, `.description()`, `.option()` — no change required

These APIs are stable across v4 through v12. The existing chained calls on the `generate` and `filter` subcommands work identically.

### 2.3 `.help()` — no change required

`cliargs.help()` prints help text and exits in both v4 and v12.

### 2.4 `.parse()` -> `.parseAsync()` — CRITICAL CHANGE

**Problem:** The `generate` command's action handler is `async`. In commander v4, `.parse()` fires the action but does not await it. The current code happens to work because:
- `validation = true` is set synchronously at the top of the action handler
- The actual async work (`await main(opts)`) runs inside the action
- The `if (!validation) { cliargs.help(); }` check on line 361-363 runs after parse returns, but `validation` was already set synchronously

In commander v12, `.parse()` still does not await async actions, so the existing behavior is preserved. However, this means unhandled promise rejections from the async action would be silently lost.

**Solution:** Switch to `.parseAsync()` and wrap the top-level call in an async IIFE or use `.then()`:

```javascript
// Before (line 360-363):
cliargs.parse(process.argv);
if (!validation) {
    cliargs.help();
}

// After:
cliargs.parseAsync(process.argv).then(() => {
    if (!validation) {
        cliargs.help();
    }
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
```

This ensures:
1. Async action handlers are properly awaited
2. Errors from async actions are caught and reported
3. The `validation` check runs after the async action completes (not before)
4. The `filter` command (synchronous) is unaffected

### 2.5 Unknown options — no concern

Commander v12 is stricter about unknown options by default, but since all options are explicitly defined on the subcommands, this does not affect us.

### 2.6 Summary of commander changes in cli/main.js

Only one code change is needed: replace the `parse()` + validation block (lines 360-363) with the `parseAsync()` pattern above.

---

## 3. Dependency-by-Dependency Details

### 3.1 commander (^4.1.0 -> ^12.1.0)

- **Rationale:** v4 is 4+ years old; v12 includes proper async support, better TypeScript types, improved error handling.
- **API changes:** See Section 2 above. Only `.parseAsync()` migration is required.
- **Risk:** Low. The API surface used (`version`, `command`, `description`, `option`, `action`, `help`) is stable.

### 3.2 cli-progress (^3.5.0 -> ^3.12.0)

- **Rationale:** Bug fixes, performance improvements.
- **API changes:** None. The `SingleBar` constructor and `start`/`update`/`stop` methods are unchanged.
- **Risk:** None.

### 3.3 colors (^1.4.0 -> pinned 1.4.0)

- **Decision: Pin to exact `1.4.0`, do NOT replace with chalk/picocolors.**
- **Rationale:**
  - `colors@1.4.44` was the malicious version that added an infinite loop (Jan 2022). The npm registry has since unpublished the compromised versions, but pinning prevents any accidental resolution to a compromised version.
  - The current usage is minimal: `_colors.cyan('{bar}')` and `_colors.yellow(...)` — direct method calls, not String prototype extensions. This is the safe API.
  - Replacing with `chalk` or `picocolors` would require changing the import and method calls for marginal benefit. Not worth the diff in this stage.
- **Change in package.json:** `"colors": "^1.4.0"` -> `"colors": "1.4.0"` (remove caret).
- **Risk:** None. Pinning is strictly safer than the current range.

### 3.4 deepmerge (^4.2.2 -> ^4.3.1)

- **Rationale:** Minor patch with bug fixes.
- **API changes:** None.
- **Note:** `deepmerge` is listed in package.json dependencies but the CLI code at line 9 (`const deepmerge = require('deepmerge')`) imports the npm package. The `js/deepmerge.js` file loaded via `eval()` in the `former2` package is a separate bundled copy and is unrelated to this dependency.
- **Risk:** None.

### 3.5 proxy-agent (^6.3.1 -> ^6.5.0)

- **Rationale:** Bug fixes, updated upstream proxy implementations.
- **API changes:** None within the v6.x range. The `ProxyAgent` constructor API is stable.
- **Note:** `proxy-agent` v6 requires Node.js >= 14. Our Dockerfile update to Node 20+ satisfies this.
- **Risk:** Low. Same major version.

### 3.6 logplease (^1.2.15 -> ^1.2.15)

- **No change.** Already at latest. logplease has not had a release since 2020.
- **Risk:** None.

### 3.7 aws-sdk (^2.773.0 -> unchanged)

- **Explicitly deferred to Stage 6.** The AWS SDK v2-to-v3 migration is a large change that warrants its own stage.
- **No change in this stage.**

### 3.8 former2 (^0.2.48 -> ^0.2.48)

- **No change.** This is the core former2 library. Version updates to this package are outside the scope of CLI dependency modernization.

---

## 4. Dockerfile Update

### Current state

```dockerfile
FROM node:14.8.0-buster-slim
```

Node 14 reached EOL in April 2023. Buster (Debian 10) reached EOL in June 2024.

### Target

```dockerfile
FROM node:20-bookworm-slim
```

**Rationale:**
- Node 20 is the current LTS (Active LTS until October 2026).
- Node 22 is available but enters LTS in October 2024 — using Node 20 is more conservative.
- `bookworm-slim` is Debian 12, the current stable release.
- Using the major version tag (`node:20-bookworm-slim`) rather than a pinned patch allows automatic security updates on rebuild while staying on the same major.

### Full updated Dockerfile

```dockerfile
FROM node:20-bookworm-slim
WORKDIR /former2
RUN apt-get update && \
    npm -g install former2
ENTRYPOINT ["former2"]
```

No other changes are needed. The `apt-get update` and `npm -g install` commands work identically.

---

## 5. Node Engine Requirement

Add an `engines` field to `package.json`:

```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**Rationale:**
- `proxy-agent@6` requires Node >= 14
- Commander v12 requires Node >= 16
- Node 18 is the minimum currently-supported LTS (maintenance until April 2025, but still widely deployed)
- Setting `>=18.0.0` provides headroom without being overly restrictive
- Matches the Dockerfile target (Node 20) while allowing Node 18 for local development

---

## 6. Complete Change Summary

### package.json changes

```diff
 {
+  "engines": {
+    "node": ">=18.0.0"
+  },
   "dependencies": {
     "aws-sdk": "^2.773.0",
-    "cli-progress": "^3.5.0",
-    "colors": "^1.4.0",
-    "commander": "^4.1.0",
-    "deepmerge": "^4.2.2",
+    "cli-progress": "^3.12.0",
+    "colors": "1.4.0",
+    "commander": "^12.1.0",
+    "deepmerge": "^4.3.1",
     "former2": "^0.2.48",
     "logplease": "^1.2.15",
-    "proxy-agent": "^6.3.1"
+    "proxy-agent": "^6.5.0"
   }
 }
```

### cli/main.js changes

Only the parse block (lines 360-363) changes:

```diff
-cliargs.parse(process.argv);
-if (!validation) {
-    cliargs.help();
-}
+cliargs.parseAsync(process.argv).then(() => {
+    if (!validation) {
+        cliargs.help();
+    }
+}).catch((err) => {
+    console.error(err);
+    process.exit(1);
+});
```

### cli/Dockerfile changes

```diff
-FROM node:14.8.0-buster-slim
+FROM node:20-bookworm-slim
```

---

## 7. Edge Cases and Risks

### 7.1 Commander async handling

The switch from `parse()` to `parseAsync()` changes the execution order. Previously, `if (!validation)` ran synchronously after `parse()` returned (before the async action completed). With `parseAsync()`, the check runs inside `.then()` after the action completes. This is actually **more correct** — it ensures the validation flag is checked after the action has finished, not in a race condition.

**Edge case:** If `parseAsync()` itself throws (e.g., due to a commander internal error), the `.catch()` block handles it. If the user provides no command, `validation` remains false and `help()` is called — same behavior as before.

### 7.2 colors supply chain

Pinning `colors` to `1.4.0` (no caret) prevents resolution to any future compromised version. The lockfile should also be regenerated after this change to confirm the resolved version is exactly `1.4.0`.

**Verification:** After `npm install`, run `npm ls colors` to confirm the resolved version.

### 7.3 proxy-agent compatibility

`proxy-agent@6.x` has been in use since the current package.json already specifies `^6.3.1`. Updating within the same major version range carries minimal risk. The agent automatically detects proxy settings from environment variables (`HTTP_PROXY`, `HTTPS_PROXY`, `NO_PROXY`).

### 7.4 Dockerfile layer caching

Changing the base image from `node:14.8.0-buster-slim` to `node:20-bookworm-slim` invalidates all Docker layer caches. The first build after this change will be slower. Subsequent builds cache normally.

### 7.5 npm global install in Dockerfile

The `npm -g install former2` command in the Dockerfile installs the published `former2` npm package. This is independent of the local `package.json` changes. The Dockerfile update (Node version) and `package.json` updates are separate concerns that happen to be in the same stage.

---

## 8. Code Style Notes

- **Keep `cliargs` variable name.** Renaming to `program` is a cosmetic change that adds diff noise without functional benefit. If desired, it can be done as a follow-up.
- **4-space indentation** in the new `.then()` / `.catch()` block, consistent with the rest of cli/main.js.
- **Double quotes** for strings, **semicolons** at end of statements.
- **No trailing whitespace.**

---

## 9. Verification Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```
   Confirm no errors. Check `npm ls` output for correct versions.

2. **Verify colors pinning:**
   ```bash
   npm ls colors
   ```
   Must resolve to exactly `1.4.0`.

3. **Run generate command:**
   ```bash
   node cli/main.js generate --output-cloudformation /tmp/test.yml
   ```
   Confirm it runs without import errors or commander API issues.

4. **Run with no arguments (help check):**
   ```bash
   node cli/main.js
   ```
   Confirm help output is displayed (validation check still works with parseAsync).

5. **Run filter command:**
   ```bash
   echo '{}' | node cli/main.js filter --input-file /dev/stdin
   ```
   Confirm the synchronous filter action still works under parseAsync.

6. **Docker build:**
   ```bash
   docker build -f cli/Dockerfile -t former2-test .
   docker run --rm former2-test --help
   ```
   Confirm the image builds on Node 20 and the CLI runs.

7. **Node version check:**
   ```bash
   node -e "const pkg = require('./package.json'); console.log(pkg.engines)"
   ```
   Confirm `{ node: '>=18.0.0' }`.

---

## 10. Rollback Considerations

- **All changes are backward-compatible within the same session.** If an issue is found, reverting `package.json` to the previous versions and running `npm install` restores the prior state.
- **Dockerfile rollback:** Change the base image back to `node:14.8.0-buster-slim`. However, this is not recommended as Node 14 is EOL.
- **Commander rollback:** If `parseAsync()` causes unexpected issues, temporarily revert to `parse()` with the older commander version. The `parseAsync()` change and commander version bump are tightly coupled — do not use `parseAsync()` with commander v4 (method does not exist in v4).
- **colors rollback:** Changing from `"1.4.0"` back to `"^1.4.0"` is safe as long as the lockfile is present. The lockfile prevents resolution drift.

---

## 11. Implementation Order

1. Update `package.json` — version bumps and engines field
2. Update `cli/main.js` — parseAsync migration (lines 360-363 only)
3. Update `cli/Dockerfile` — Node 20 base image
4. Run `npm install` to regenerate lockfile
5. Run verification steps (Section 9)
6. Commit all changes as a single commit
