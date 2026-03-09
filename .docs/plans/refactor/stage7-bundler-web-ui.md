# Stage 7: Add Bundler and Update Web UI

## Objective

Introduce a bundler for the web UI and refactor the browser-side orchestrator to consume shared modules. Replace 139+ `<script>` tags with a single bundled script.

## Current Web UI Architecture

### `index.html`

Loads scripts via `<script>` tags in order:
1. Third-party libraries (jQuery, Bootstrap, AWS SDK v2 minified)
2. `js/deepmerge.js`
3. `js/RelationshipTypeMap.js` (5076 lines)
4. `js/mappings.js` (4971 lines)
5. `js/datatables.js` (570 lines)
6. `js/deferred-datatable.js` (77 lines — jQuery plugin)
7. `js/services/*.js` — all 139 service files
8. `js/app.js` (6503 lines — orchestrator)
9. `js/ui-app.js`, `js/ui-plugins.js` — UI utilities

### `js/app.js` (6503 lines)

The browser orchestrator. Key responsibilities:
- Builds navigation tabs from `sections[]` array
- Wires click handlers to call `updateDatatable*()` functions
- Manages output generation (calls `performF2Mappings`, `compileOutputs`)
- Handles AWS credential configuration
- Manages `output_objects[]` (selected resources)
- Handles search, filtering, and display

### `js/deferred-datatable.js` (77 lines)

jQuery plugin that extends `$.fn.bootstrapTable` with deferred loading. Only used in the browser.

### Browser-specific `sdkcall` (`js/datatables.js:231-568`)

Uses AWS SDK v2 (`new AWS[svc](options)`) with:
- LocalStack endpoint support (`window.localStorage.getItem('uselocalstackendpoint')`)
- Browser-specific error handling (`$.notify`)
- Pagination (same logic as CLI v3 shim)

## Detailed Tasks

### 7.1 Choose and Configure Bundler

**Recommendation: Webpack**

Reasons:
- Former2 is a traditional web app (not a modern SPA framework)
- Webpack handles CommonJS `require()` (what shared modules use)
- No need for ESM-only features
- Mature, well-documented

Create `webpack.config.js`:

```js
const path = require('path');

module.exports = {
    entry: './web/app.js',
    output: {
        filename: 'former2-bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    mode: 'production',
    target: 'web',
    resolve: {
        fallback: {
            // Node.js modules not available in browser
            "fs": false,
            "path": false,
        }
    },
};
```

Add build scripts to `package.json`:
```json
{
    "scripts": {
        "build:web": "webpack --config webpack.config.js",
        "dev:web": "webpack --watch --config webpack.config.js"
    }
}
```

### 7.2 Create Browser-Side sdkcall (`web/sdkcall-browser.js`)

Extract and adapt the sdkcall from `js/datatables.js` for module usage:

```js
// web/sdkcall-browser.js

const { getPaginationParams } = require('../shared/pagination');
const deepmerge = require('deepmerge');

/**
 * Browser-side sdkcall using AWS SDK v2.
 * Loaded globally via <script src="aws-sdk-2.x.min.js">
 */
function createBrowserSdkcall(options = {}) {
    const { region, onError, onLog, onDebug } = options;

    return function sdkcall(svc, method, params, alertOnErrors, backoff) {
        onDebug && onDebug(`${svc}.${method} - ${JSON.stringify(params)}`);

        return new Promise(function(resolve, reject) {
            const serviceoptions = { region, customUserAgent: 'former2/latest' };

            // Service-specific overrides
            if (svc === "GlobalAccelerator") serviceoptions.region = 'us-west-2';
            else if (svc === "CostExplorer") serviceoptions.region = 'us-east-1';
            else if (svc === "DynamoDB") serviceoptions.dynamoDbCrc32 = false;

            // LocalStack support
            if (window.localStorage.getItem('uselocalstackendpoint') === "true") {
                serviceoptions.accessKeyId = 'test';
                serviceoptions.secretAccessKey = 'test';
                serviceoptions.sessionToken = null;
                serviceoptions.endpoint = 'http://localhost:4566';
            }

            const service = new AWS[svc](serviceoptions);
            service[method].call(service, params, async function(err, data) {
                if (err) {
                    // ... throttle/retry logic ...
                    // ... error handling with onError callback instead of $.notify ...
                    reject(data);
                } else {
                    // Pagination handling using shared pagination module
                    const pagination = getPaginationParams(svc, method, data, params);
                    if (pagination.hasMore) {
                        Object.assign(params, pagination.nextParams);
                        sdkcall(svc, method, params, alertOnErrors).then(
                            newdata => resolve(deepmerge.all([data, newdata])),
                            data => reject(data)
                        );
                    } else {
                        resolve(data);
                    }
                }
            });
        });
    };
}

module.exports = { createBrowserSdkcall };
```

### 7.3 Create Browser Orchestrator (`web/app.js`)

This is the most significant piece. The current `js/app.js` (6503 lines) needs to be refactored to:

1. Import services from `shared/services`
2. Import mappings from `shared/mappings`
3. Create a context with the browser sdkcall
4. Handle the new return-value-based service interface (render returned resources into the DOM)

**Approach: Incremental refactoring of `js/app.js`**

Rather than rewriting from scratch, modify `js/app.js` to import from shared modules:

```js
// web/app.js (refactored entry point)

const services = require('../shared/services');
const { performF2Mappings, compileOutputs } = require('../shared/mappings');
const { createBrowserSdkcall } = require('./sdkcall-browser');
const formatters = require('../shared/formatters');

// Create context
const context = {
    sdkcall: createBrowserSdkcall({
        region: region,
        onError: (title, message) => $.notify({ ... }),
        onDebug: (msg) => f2debug(msg),
    }),
    region: region,
    getResourceTags: getResourceTags,
    stripAWSTags: stripAWSTags,
    deepmerge: require('deepmerge'),
};

// Build sections from service modules
const sections = services.map(s => s.section);

// For each section, wire up the tab and click handler
sections.forEach(section => {
    // ... existing tab-building logic from app.js ...

    // When user clicks a service tab:
    const serviceModule = services.find(s => s.section === section);
    async function onTabClick() {
        blockUI();
        const resources = await serviceModule.updateDatatable(context);
        // Render resources into the DOM
        resources.forEach(resource => {
            const datatableId = getDatatableId(section, resource.f2type);
            $(datatableId).bootstrapTable('append', [resource]);
        });
        unblockUI();
    }
});
```

**Key challenge:** The current `app.js` builds datatable IDs from section/resource type names using a naming convention:
```
#section-{category}-{service}-{resourcetype}-datatable
```
This convention needs to be maintained so resources are rendered into the correct tables.

**Resource-to-table routing:** After conversion, services return flat arrays of resources with `f2type` values. The browser needs to route each resource to the correct datatable based on its `f2type`. This mapping is implicit in the current code (each `deferredBootstrapTable('append', ...)` call targets a specific table).

Options:
1. Maintain a `f2type → datatableId` mapping in each section's `resourcetypes` definition
2. Derive the datatable ID from section metadata + resource type
3. Have services return resources grouped by resource type

**Recommended:** Option 1 — add a `f2type` field to each resource type definition in the section:

```js
const section = {
    category: 'Storage',
    service: 'S3',
    resourcetypes: {
        'Buckets': {
            f2type: 's3.bucket',  // NEW: links resource type to datatable
            columns: [...]
        },
        'Bucket Policies': {
            f2type: 's3.bucketpolicy',
            columns: [...]
        },
    }
};
```

### 7.4 Update `index.html`

Replace 139+ `<script>` tags with:

```html
<!-- Third-party (keep as-is) -->
<script src="js/aws-sdk-2.x.min.js"></script>
<script src="vendor/jquery.min.js"></script>
<script src="vendor/bootstrap.min.js"></script>
<!-- ... other third-party ... -->

<!-- Former2 bundle (replaces all individual script tags) -->
<script src="dist/former2-bundle.js"></script>
```

**Note:** AWS SDK v2 browser bundle must remain as a separate `<script>` tag because:
- It's 1.5MB+ minified and rarely changes
- Bundling it would bloat the build
- It defines `AWS` as a global that `sdkcall-browser.js` references

### 7.5 Handle Browser-Only Code

Some code is browser-only and should NOT be in shared modules:

- `js/deferred-datatable.js` — jQuery plugin, stays in web/
- `js/ui-app.js`, `js/ui-plugins.js` — UI utilities, stays in web/
- Credential configuration UI — stays in web/app.js
- Tab building and navigation — stays in web/app.js
- `primaryTextFormatter`, `detailFormatter` — browser-only formatters, stay in web/

### 7.6 Build Pipeline

Add build steps:

```bash
# Development (watch mode)
npm run dev:web

# Production build
npm run build:web

# The dist/ directory is gitignored and built in CI
```

## Files to Create

```
web/
  app.js                    # Refactored browser orchestrator
  sdkcall-browser.js        # Browser-side sdkcall implementation
webpack.config.js           # Webpack configuration
```

## Files to Modify

```
index.html                  # Replace 139+ <script> tags with bundle
package.json                # Add webpack dependency and build scripts
js/app.js                   # Refactored (major changes, or replaced by web/app.js)
```

## Files to Keep (Browser-Only)

```
js/deferred-datatable.js    # jQuery plugin (bundle or keep as <script>)
js/ui-app.js                # UI utilities
js/ui-plugins.js            # UI plugins
js/aws-sdk-2.x.min.js       # AWS SDK v2 (separate <script>)
```

## Validation Criteria

- `npm run build:web` produces a working bundle
- Web UI loads and displays service tabs correctly
- Clicking a service tab scans resources and displays them in tables
- Resource selection and IaC output generation works
- LocalStack mode works
- AWS credential configuration works
- All 139 services are accessible in the UI
- Bundle size is reasonable (< 5MB, ideally < 2MB excluding AWS SDK)

## Dependencies

- Stage 5 (all services converted to modules)
- Stage 4 (mappings decomposed into shared modules)
- Stage 3 (utilities extracted)

## Risks

- `js/app.js` at 6503 lines is the most complex refactoring target
- Resource-to-datatable routing needs careful implementation
- Webpack configuration for mixed CommonJS/global code may need tweaking
- AWS SDK v2 as a global + bundled code interaction
- Browser testing is harder to automate than CLI testing

## Estimated Scope

- 3 new files (`web/app.js`, `web/sdkcall-browser.js`, `webpack.config.js`)
- Major modifications to `index.html` and `js/app.js`
- `web/sdkcall-browser.js`: ~150 lines
- `webpack.config.js`: ~30 lines
- `web/app.js` refactoring: ~6000 lines (mostly restructuring existing code)
- This is the second largest stage after Stage 5
