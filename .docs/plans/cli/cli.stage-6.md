# Stage 6: AWS SDK v2 to v3 Migration — Detailed Implementation Plan

## 1. Goal and Context

Replace the monolithic `aws-sdk` v2 package with modular `@aws-sdk/client-*` v3 packages in the Former2 CLI. The browser UI continues to use the bundled `js/aws-sdk-2.1519.0.min.js` and must remain untouched. The migration is CLI-only.

The v2 SDK is in maintenance mode (no new service support) and emits deprecation warnings. The v3 SDK is modular, tree-shakeable, uses middleware for configuration, and has built-in retry strategies.

**Prerequisite:** Stage 5 (Dependency Updates) must be completed first so we are on a modern Node.js runtime (>=18) that v3 requires.

---

## 2. Files Modified

| File | Action |
|------|--------|
| `cli/main.js` | Replace v2 credential/region/proxy setup with v3 equivalents; override `sdkcall` after eval |
| `cli/sdk-v3-shim.js` | **New file** — v3-backed `sdkcall` implementation and service name mapping |
| `package.json` | Remove `aws-sdk`, add `@aws-sdk/client-*` packages and `@aws-sdk/credential-providers` |

No changes to `js/datatables.js`, `js/services/*.js`, or any browser files.

---

## 3. Strategy: CLI-Only Shim Overriding sdkcall After eval

The 148 service files and `datatables.js` all call a global `sdkcall(svc, method, params, alert_on_errors)` function. In the browser, `sdkcall` is defined in `js/datatables.js` and uses the v2 SDK loaded via `<script>` tag. In the CLI, `datatables.js` is loaded via `eval()`, which also defines `sdkcall` as a global.

**Approach:** After the `eval()` block in `cli/main.js` (line 132), reassign `sdkcall` to a v3-backed implementation imported from `cli/sdk-v3-shim.js`. The original v2 `sdkcall` from `datatables.js` is overwritten and never executes. The browser path is completely unaffected.

```javascript
// cli/main.js — after eval block (after line 132)
var { createSdkcallV3, configureV3 } = require('./sdk-v3-shim');
sdkcall = createSdkcallV3();
```

Similarly, override `sdkcallwaiter` if it is used by any service files (currently it is not called from service files, only defined in datatables.js — verify before migrating).

---

## 4. Shim Implementation (`cli/sdk-v3-shim.js`)

### 4.1 Service Name to v3 Package Mapping

The v2 `sdkcall` dynamically creates clients via `new AWS[svc](options)`. In v3, each service lives in its own package with its own client class. A static map translates the v2 service name string to the v3 package name and client class.

**How to build the map:** Iterate over the 178 unique service name strings extracted from `sdkcall()` calls across all service files (see Section 7.1 for the full list) and match each to its `@aws-sdk/client-*` package. Most follow a predictable pattern:

- v2 name `"S3"` -> package `@aws-sdk/client-s3`, client `S3Client`
- v2 name `"Lambda"` -> package `@aws-sdk/client-lambda`, client `LambdaClient`
- v2 name `"EC2"` -> package `@aws-sdk/client-ec2`, client `EC2Client`

**Key non-standard mappings** (partial list — see Section 7.1 for exhaustive list):

```javascript
const SERVICE_MAP = {
    // Standard pattern: most services follow kebab-case of the name
    "S3":                          { pkg: "@aws-sdk/client-s3",                            client: "S3Client" },
    "Lambda":                      { pkg: "@aws-sdk/client-lambda",                        client: "LambdaClient" },
    "EC2":                         { pkg: "@aws-sdk/client-ec2",                           client: "EC2Client" },

    // Non-standard package names
    "ResourceGroupsTaggingAPI":    { pkg: "@aws-sdk/client-resource-groups-tagging-api",   client: "ResourceGroupsTaggingAPIClient" },
    "CognitoIdentityServiceProvider": { pkg: "@aws-sdk/client-cognito-identity-provider",  client: "CognitoIdentityProviderClient" },
    "IoT1ClickDevicesService":     { pkg: "@aws-sdk/client-iot-1click-devices-service",    client: "IoT1ClickDevicesServiceClient" },
    "IoT1ClickProjects":           { pkg: "@aws-sdk/client-iot-1click-projects",           client: "IoT1ClickProjectsClient" },
    "LexModelBuildingService":     { pkg: "@aws-sdk/client-lex-model-building-service",    client: "LexModelBuildingServiceClient" },
    "ELB":                         { pkg: "@aws-sdk/client-elastic-load-balancing",        client: "ElasticLoadBalancingClient" },
    "ELBv2":                       { pkg: "@aws-sdk/client-elastic-load-balancing-v2",     client: "ElasticLoadBalancingV2Client" },
    "ES":                          { pkg: "@aws-sdk/client-elasticsearch-service",         client: "ElasticsearchServiceClient" },
    "CUR":                         { pkg: "@aws-sdk/client-cost-and-usage-report-service", client: "CostAndUsageReportServiceClient" },
    "ConfigService":               { pkg: "@aws-sdk/client-config-service",                client: "ConfigServiceClient" },
    "DMS":                         { pkg: "@aws-sdk/client-database-migration-service",    client: "DatabaseMigrationServiceClient" },
    "StepFunctions":               { pkg: "@aws-sdk/client-sfn",                           client: "SFNClient" },
    "Iot":                         { pkg: "@aws-sdk/client-iot",                           client: "IoTClient" },
    "ForecastService":             { pkg: "@aws-sdk/client-forecast",                      client: "ForecastClient" },
    "SimpleDB":                    { pkg: "@aws-sdk/client-simpledb",                      client: "SimpleDBClient" },
    "SWF":                         { pkg: "@aws-sdk/client-swf",                           client: "SWFClient" },
    "CodeStarconnections":         { pkg: "@aws-sdk/client-codestar-connections",          client: "CodeStarConnectionsClient" },
    "EMRcontainers":               { pkg: "@aws-sdk/client-emr-containers",                client: "EMRContainersClient" },
    "EMRServerless":               { pkg: "@aws-sdk/client-emr-serverless",                client: "EMRServerlessClient" },
    "ECRPUBLIC":                   { pkg: "@aws-sdk/client-ecr-public",                    client: "ECRPUBLICClient" },
    "ACMPCA":                      { pkg: "@aws-sdk/client-acm-pca",                      client: "ACMPCAClient" },
    "WAFRegional":                 { pkg: "@aws-sdk/client-waf-regional",                  client: "WAFRegionalClient" },
    "Wisdom":                      { pkg: "@aws-sdk/client-wisdom",                        client: "WisdomClient" },
    "DocDB":                       { pkg: "@aws-sdk/client-docdb",                         client: "DocDBClient" },
    "QLDB":                        { pkg: "@aws-sdk/client-qldb",                          client: "QLDBClient" },
    "Billingconductor":            { pkg: "@aws-sdk/client-billingconductor",              client: "BillingconductorClient" },
    "Resiliencehub":               { pkg: "@aws-sdk/client-resiliencehub",                 client: "ResiliencehubClient" },
    "SSMContacts":                 { pkg: "@aws-sdk/client-ssm-contacts",                  client: "SSMContactsClient" },
    "SSMIncidents":                { pkg: "@aws-sdk/client-ssm-incidents",                 client: "SSMIncidentsClient" },
    "SSOAdmin":                    { pkg: "@aws-sdk/client-sso-admin",                     client: "SSOAdminClient" },
    "Imagebuilder":                { pkg: "@aws-sdk/client-imagebuilder",                  client: "ImagebuilderClient" },
    "Route53RecoveryControlConfig": { pkg: "@aws-sdk/client-route53-recovery-control-config", client: "Route53RecoveryControlConfigClient" },
    "Route53RecoveryReadiness":    { pkg: "@aws-sdk/client-route53-recovery-readiness",    client: "Route53RecoveryReadinessClient" },
    "MigrationHubRefactorSpaces":  { pkg: "@aws-sdk/client-migration-hub-refactor-spaces", client: "MigrationHubRefactorSpacesClient" },
    "Fis":                         { pkg: "@aws-sdk/client-fis",                           client: "FisClient" },
    "Finspace":                    { pkg: "@aws-sdk/client-finspace",                      client: "FinspaceClient" },
    "Pipes":                       { pkg: "@aws-sdk/client-pipes",                         client: "PipesClient" },
    "Scheduler":                   { pkg: "@aws-sdk/client-scheduler",                     client: "SchedulerClient" },
    "TimestreamQuery":             { pkg: "@aws-sdk/client-timestream-query",              client: "TimestreamQueryClient" },
    "TimestreamWrite":             { pkg: "@aws-sdk/client-timestream-write",              client: "TimestreamWriteClient" },
    // ... remaining ~130 services following standard pattern
};
```

**Auto-generation strategy:** Write a one-time script that:
1. Iterates over the 178 unique service names
2. Attempts `require("@aws-sdk/client-<kebab-case-name>")` for each
3. Verifies the client class exists in the module
4. Produces the final `SERVICE_MAP` constant
5. Flags any service names that don't resolve automatically for manual mapping

### 4.2 Method Name to Command Class Conversion

v3 uses Command classes instead of method calls. The convention is: capitalize first letter + append `"Command"`.

```javascript
function methodToCommandName(method) {
    return method.charAt(0).toUpperCase() + method.slice(1) + "Command";
}

// "listFunctions"  -> "ListFunctionsCommand"
// "describeInstances" -> "DescribeInstancesCommand"
// "getResources" -> "GetResourcesCommand"
```

The Command class is imported from the same package as the client:

```javascript
var pkg = require(SERVICE_MAP[svc].pkg);
var CommandClass = pkg[methodToCommandName(method)];
var command = new CommandClass(params);
var data = await client.send(command);
```

### 4.3 Client Caching

Creating a new client for every `sdkcall` invocation is expensive. Cache clients by service name + region:

```javascript
var clientCache = {};

function getClient(svc, serviceOptions) {
    var cacheKey = svc + ":" + (serviceOptions.region || "default");
    if (!clientCache[cacheKey]) {
        var mapping = SERVICE_MAP[svc];
        if (!mapping) {
            throw new Error("Unknown AWS service: " + svc);
        }
        var pkg = require(mapping.pkg);
        var ClientClass = pkg[mapping.client];
        clientCache[cacheKey] = new ClientClass(serviceOptions);
    }
    return clientCache[cacheKey];
}
```

### 4.4 Region/Credential/Proxy Configuration Passthrough

The shim's `createSdkcallV3()` factory accepts a shared config object set up by `main.js`:

```javascript
var sharedConfig = {
    region: null,
    credentials: null,
    requestHandler: null   // for proxy support
};

function createSdkcallV3() {
    return function sdkcall(svc, method, params, alert_on_errors, backoff) {
        // Build service options from sharedConfig
        var serviceOptions = {
            region: sharedConfig.region,
            customUserAgent: [["former2", "latest"]]
        };
        if (sharedConfig.credentials) {
            serviceOptions.credentials = sharedConfig.credentials;
        }
        if (sharedConfig.requestHandler) {
            serviceOptions.requestHandler = sharedConfig.requestHandler;
        }

        // Service-specific region overrides (preserved from v2)
        if (svc === "GlobalAccelerator") {
            serviceOptions.region = "us-west-2";
        } else if (svc === "CostExplorer") {
            serviceOptions.region = "us-east-1";
        }

        // ... rest of implementation
    };
}
```

### 4.5 Retry/Throttle Handling

**Option A (recommended): Use v3 built-in retry strategy.**

v3 includes `@aws-sdk/middleware-retry` with configurable `StandardRetryStrategy` that handles `TooManyRequestsException`, `ThrottlingException`, `RequestLimitExceeded`, and `TimeoutError` automatically with exponential backoff.

```javascript
var { StandardRetryStrategy } = require("@aws-sdk/middleware-retry");

serviceOptions.retryStrategy = new StandardRetryStrategy(async () => 5, {
    retryDecider: /* default handles throttling */,
    delayDecider: /* exponential backoff */,
});
```

This replaces the custom retry loop in the v2 `sdkcall` (lines 261-278 of datatables.js).

**Option B: Preserve custom retry logic.** Wrap the `client.send()` call in the same retry loop from the v2 `sdkcall`. This ensures identical retry behavior but duplicates logic that v3 handles natively. Use this only if v3's built-in retry produces different behavior in testing.

**Recommended approach:** Start with Option A (v3 built-in retry). Configure `maxAttempts: 5` and set `retryMode: "adaptive"` for rate-limiting awareness. In verification testing (Section 9), compare retry behavior against v2. Fall back to Option B only if discrepancies are found.

### 4.6 Full sdkcall v3 Implementation

```javascript
// cli/sdk-v3-shim.js

var SERVICE_MAP = { /* ... full map ... */ };
var clientCache = {};
var sharedConfig = { region: "us-east-1", credentials: null, requestHandler: null };

function methodToCommandName(method) {
    return method.charAt(0).toUpperCase() + method.slice(1) + "Command";
}

function getClient(svc, regionOverride) {
    var effectiveRegion = regionOverride || sharedConfig.region;
    var cacheKey = svc + ":" + effectiveRegion;
    if (!clientCache[cacheKey]) {
        var mapping = SERVICE_MAP[svc];
        if (!mapping) {
            throw new Error("Unknown AWS service in v3 shim: " + svc);
        }
        var pkg = require(mapping.pkg);
        var ClientClass = pkg[mapping.client];
        var opts = {
            region: effectiveRegion,
            customUserAgent: [["former2", "latest"]],
            maxAttempts: 5
        };
        if (sharedConfig.credentials) {
            opts.credentials = sharedConfig.credentials;
        }
        if (sharedConfig.requestHandler) {
            opts.requestHandler = sharedConfig.requestHandler;
        }
        clientCache[cacheKey] = new ClientClass(opts);
    }
    return clientCache[cacheKey];
}

function createSdkcallV3() {
    return async function sdkcall(svc, method, params, alert_on_errors, backoff) {
        f2debug(String(svc) + "." + String(method) + " - " + JSON.stringify(params));

        var regionOverride = null;
        if (svc === "GlobalAccelerator") {
            regionOverride = "us-west-2";
        } else if (svc === "CostExplorer") {
            regionOverride = "us-east-1";
        }

        var mapping = SERVICE_MAP[svc];
        if (!mapping) {
            throw new Error("Unknown AWS service in v3 shim: " + svc);
        }

        var client = getClient(svc, regionOverride);
        var pkg = require(mapping.pkg);
        var commandName = methodToCommandName(method);
        var CommandClass = pkg[commandName];

        if (!CommandClass) {
            throw new Error("Unknown command " + commandName + " for service " + svc);
        }

        try {
            var command = new CommandClass(params);
            var data = await client.send(command);
            // Remove $metadata from response to match v2 behavior
            delete data.$metadata;
            return data;
        } catch (err) {
            // Normalize v3 error shape to match v2 expectations
            // v3 errors use err.name instead of err.code
            if (!err.code && err.name) {
                err.code = err.name;
            }

            if (err.code === "NetworkingError" || err.$metadata?.httpStatusCode === 0) {
                f2log("Skipping " + svc + "." + method + " NetworkingError");
            } else if (err.code === "AccessDeniedException" || err.code === "AccessDenied") {
                f2log("Skipping " + svc + "." + method + " AccessDeniedException");
            } else if (err.code === "UnknownError" && svc === "MediaStore") {
                f2log("Skipping " + svc + "." + method + " UnknownError");
            } else if (err.code === "ForbiddenException" && svc === "RoboMaker") {
                f2log("Skipping " + svc + "." + method + " ForbiddenException");
            } else if (alert_on_errors) {
                f2log("Error calling " + svc + "." + method + ". " + (err.message || JSON.stringify(err)));
                f2trace(err);
            }

            throw err;
        }
    };
}

function configureV3(opts) {
    if (opts.region) {
        sharedConfig.region = opts.region;
    }
    if (opts.credentials) {
        sharedConfig.credentials = opts.credentials;
    }
    if (opts.requestHandler) {
        sharedConfig.requestHandler = opts.requestHandler;
    }
    // Clear cache when config changes so new clients pick up new settings
    clientCache = {};
}

module.exports = { createSdkcallV3, configureV3, sharedConfig };
```

---

## 5. main.js Credential/Region Changes

Replace all v2 credential/region/proxy setup in `main.js` with v3 equivalents.

### 5.1 Remove v2 Imports and Config (top of file)

```javascript
// REMOVE:
var AWS = require("aws-sdk");
process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE = '1';
AWS.config.logger = awslog;

// REPLACE WITH:
var { fromIni, fromNodeProviderChain } = require("@aws-sdk/credential-providers");
var { loadSharedConfigFiles } = require("@smithy/shared-ini-file-loader");
var { createSdkcallV3, configureV3, sharedConfig } = require('./sdk-v3-shim');
```

### 5.2 Region Loading (currently lines 114-120)

```javascript
// REMOVE:
var region = process.env.AWS_DEFAULT_REGION || process.env.AWS_REGION || null;
try {
    region = new AWS.IniLoader().loadFrom({isConfig: true})['default']['region'];
} catch(err) {}
if (!region) { region = 'us-east-1'; }

// REPLACE WITH:
var region = process.env.AWS_DEFAULT_REGION || process.env.AWS_REGION || null;
try {
    var configFiles = await loadSharedConfigFiles();
    region = configFiles.configFile?.default?.region || region;
} catch (err) {}
if (!region) { region = "us-east-1"; }
```

Note: `loadSharedConfigFiles` is async. Since this runs at the module top level, either:
- Wrap in an async IIFE, or
- Move region detection into `main()` where async is already available (preferred, since `main()` already does region setup on lines 232-239)

### 5.3 Credential Loading in main() (currently lines 224-230)

```javascript
// REMOVE:
if (opts.profile) {
    AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: opts.profile});
    if (!opts.region) {
        var profiles = AWS.util.getProfilesFromSharedConfig(AWS.util.iniLoader, "");
        if (profiles[opts.profile]) opts.region = profiles[opts.profile].region;
    }
}

// REPLACE WITH:
if (opts.profile) {
    configureV3({ credentials: fromIni({ profile: opts.profile }) });
    if (!opts.region) {
        var configFiles = await loadSharedConfigFiles();
        var profileConfig = configFiles.configFile?.[opts.profile];
        if (profileConfig) opts.region = profileConfig.region;
    }
}
```

### 5.4 Region Config (currently lines 232-239)

```javascript
// REMOVE:
if (AWS.config.region) { region = AWS.config.region; }
if (opts.region) {
    AWS.config.update({region: opts.region});
    region = opts.region;
}

// REPLACE WITH:
if (opts.region) {
    region = opts.region;
}
configureV3({ region: region });
```

### 5.5 Proxy Setup (currently lines 241-243)

```javascript
// REMOVE:
if (opts.proxy) {
    AWS.config.update({httpOptions: {agent: proxy(opts.proxy)}});
}

// REPLACE WITH:
if (opts.proxy) {
    var { NodeHttpHandler } = require("@smithy/node-http-handler");
    var proxyAgent = proxy(opts.proxy);
    configureV3({
        requestHandler: new NodeHttpHandler({
            httpAgent: proxyAgent,
            httpsAgent: proxyAgent
        })
    });
}
```

### 5.6 Override sdkcall After eval Block

```javascript
// After line 132 (after eval block), add:
sdkcall = createSdkcallV3();
```

### 5.7 Provide Dummy AWS Global for eval'd Code

The eval'd `datatables.js` references `AWS[svc]` in the original `sdkcall` definition. Since that function is overridden and never called, the reference to `AWS` at parse time should not error — it is only inside a function body. However, to be safe and to handle any other top-level `AWS` references in eval'd code:

```javascript
// Before eval block:
var AWS = {};  // Dummy object; v3 shim replaces all SDK usage
var _AWS = {}; // Used by sdkcallwaiter in datatables.js
```

---

## 6. package.json Changes

### 6.1 Remove aws-sdk

```json
// REMOVE from dependencies:
"aws-sdk": "^2.773.0",
```

### 6.2 Add v3 Packages

**Strategy for managing 100+ client packages:** Rather than listing all ~178 client packages in `package.json` (which would be unwieldy and slow to install), use **lazy require** with a peer/optional dependency approach:

**Recommended approach: Install all required packages explicitly.**

While 178 packages sounds like a lot, npm handles this efficiently (they share `@smithy/*` peer dependencies). The alternative — dynamic `require` with try/catch — makes dependency tracking opaque and breaks in bundled/Docker scenarios.

Generate the dependency list with a script:

```bash
# One-time script to generate package.json entries
for svc in $(grep -oP 'sdkcall\("\K[^"]+' js/services/*.js js/datatables.js | sort -u); do
    pkg=$(node -e "try{require('@aws-sdk/client-${svc,,}');console.log('@aws-sdk/client-${svc,,}')}catch(e){console.error('MANUAL: '+e.message)}" 2>&1)
    echo "\"${pkg}\": \"^3.0.0\","
done
```

Many will need manual mapping (see Section 7.1). The final list should look like:

```json
{
    "dependencies": {
        "@aws-sdk/client-s3": "^3.700.0",
        "@aws-sdk/client-lambda": "^3.700.0",
        "@aws-sdk/client-ec2": "^3.700.0",
        "@aws-sdk/credential-providers": "^3.700.0",
        "@smithy/node-http-handler": "^3.0.0",
        "@smithy/shared-ini-file-loader": "^3.0.0",
        "cli-progress": "^3.5.0",
        "colors": "^1.4.0",
        "commander": "^4.1.0",
        "deepmerge": "^4.2.2",
        "logplease": "^1.2.15",
        "proxy-agent": "^6.3.1"
    }
}
```

**Tip:** Use a single version constraint like `"^3.700.0"` (a recent baseline) for all `@aws-sdk/client-*` packages to ensure compatible versions. npm's deduplication will share common `@smithy/*` internals.

---

## 7. Edge Cases

### 7.1 Services with Non-Standard Package Names

The following v2 service names do NOT follow a simple kebab-case-of-name convention and require manual mapping in `SERVICE_MAP`. This list was derived from the 178 unique service names found in the codebase:

| v2 Name | v3 Package | Notes |
|---------|-----------|-------|
| `ResourceGroupsTaggingAPI` | `@aws-sdk/client-resource-groups-tagging-api` | Used in `getResourceTags()` in main.js |
| `CognitoIdentityServiceProvider` | `@aws-sdk/client-cognito-identity-provider` | Name shortened in v3 |
| `LexModelBuildingService` | `@aws-sdk/client-lex-model-building-service` | |
| `ELB` | `@aws-sdk/client-elastic-load-balancing` | Expanded name |
| `ELBv2` | `@aws-sdk/client-elastic-load-balancing-v2` | Expanded name |
| `ES` | `@aws-sdk/client-elasticsearch-service` | Expanded name |
| `CUR` | `@aws-sdk/client-cost-and-usage-report-service` | Expanded name |
| `ConfigService` | `@aws-sdk/client-config-service` | |
| `DMS` | `@aws-sdk/client-database-migration-service` | Expanded name |
| `StepFunctions` | `@aws-sdk/client-sfn` | Shortened in v3 |
| `Iot` | `@aws-sdk/client-iot` | Case difference (v2 uses `Iot`, v3 client is `IoTClient`) |
| `ForecastService` | `@aws-sdk/client-forecast` | Shortened |
| `SimpleDB` | `@aws-sdk/client-simpledb` | |
| `SWF` | `@aws-sdk/client-swf` | |
| `CodeStarconnections` | `@aws-sdk/client-codestar-connections` | Casing/hyphenation differs |
| `EMRcontainers` | `@aws-sdk/client-emr-containers` | Casing differs |
| `Macie` | `@aws-sdk/client-macie` | v1 Macie (may be deprecated in v3) |
| `ACM` | `@aws-sdk/client-acm` | |
| `ACMPCA` | `@aws-sdk/client-acm-pca` | Hyphenated in v3 |
| `WAFRegional` | `@aws-sdk/client-waf-regional` | |
| `Wisdom` | `@aws-sdk/client-wisdom` | May have been renamed to `@aws-sdk/client-qconnect` |
| `Nimble` | `@aws-sdk/client-nimble` | May have been renamed or removed |
| `WorkLink` | `@aws-sdk/client-worklink` | Service deprecated by AWS |
| `DocDB` | `@aws-sdk/client-docdb` | |

**Validation step:** Before finalizing `SERVICE_MAP`, run a script that attempts to `require()` each mapped package and instantiate each client to catch mapping errors at build time rather than runtime.

### 7.2 Services with Region Overrides in sdkcall

The v2 `sdkcall` in `datatables.js` has hardcoded region overrides:

```javascript
if (svc == "GlobalAccelerator") {
    serviceoptions['region'] = 'us-west-2';
} else if (svc == "CostExplorer") {
    serviceoptions['region'] = 'us-east-1';
} else if (svc == "DynamoDB") {
    serviceoptions['dynamoDbCrc32'] = false;
}
```

The v3 shim must replicate these overrides. For DynamoDB, the CRC32 check is not a concern in v3 (it doesn't perform CRC32 validation by default).

### 7.3 Throttle Handling Differences Between v2 and v3

| Aspect | v2 (current) | v3 (default) |
|--------|-------------|-------------|
| Retry strategy | Custom: 500ms initial, doubling, max 120s | Built-in: exponential backoff with jitter, default 3 attempts |
| Throttle codes detected | `TooManyRequestsException`, `ThrottlingException`, `TimeoutError`, `RequestLimitExceeded` | All of the above plus `ProvisionedThroughputExceededException`, `TransactionInProgressException`, `EC2ThrottledException` |
| Max attempts | Unlimited (until backoff > 120s) | Default 3, configurable via `maxAttempts` |

**Action:** Set `maxAttempts: 5` on all clients. This provides more retries than default v3 while being less aggressive than the unbounded v2 approach. Monitor in testing — if specific services need more retries, increase per-service.

If v3's built-in retry proves insufficient for Former2's scanning pattern (which fires hundreds of API calls concurrently), fall back to wrapping `client.send()` in the same custom retry loop from v2's `sdkcall`.

### 7.4 Response Format Differences Between v2 and v3

**Critical:** v3 responses include a `$metadata` property containing HTTP status code, request ID, etc. Service files may inadvertently iterate over this if they enumerate response keys.

```javascript
// v2 response:
{ Buckets: [...], Owner: {...} }

// v3 response:
{ Buckets: [...], Owner: {...}, $metadata: { httpStatusCode: 200, requestId: "..." } }
```

**Mitigation:** The shim's `sdkcall` deletes `$metadata` from every response before returning:

```javascript
var data = await client.send(command);
delete data.$metadata;
return data;
```

**Other response differences to watch for:**
- v3 may use `undefined` where v2 used `null` for absent fields
- v3 date fields return `Date` objects; v2 returns strings — service files that do string operations on dates may break
- v3 `Buffer` responses (e.g., from KMS) may differ in encoding
- Some v3 responses capitalize property names differently (rare but possible)

**Mitigation:** The verification step (Section 9) catches these by comparing v2 and v3 output for the same AWS account.

### 7.5 The `$metadata` Property

Handled in Section 7.4. Stripped before returning from shim.

---

## 8. Code Style Notes

All new/modified code must follow the existing style in `cli/main.js`:

- 4-space indentation
- Double quotes for strings (`"us-east-1"`, not `'us-east-1'`)
- Semicolons at end of statements
- `var` for variable declarations (matching existing code; do not introduce `let`/`const` inconsistently)
- camelCase for variables and functions
- UPPER_SNAKE_CASE for the `SERVICE_MAP` constant (following JS convention for constants)
- No trailing commas in object/array literals
- Braces on same line as control structures

---

## 9. Verification Steps

### 9.1 Output Comparison Test

Run both v2 and v3 versions against the same AWS account and compare outputs:

```bash
# On a branch BEFORE the migration:
git stash  # save v3 changes
former2 generate --output-raw-data v2-output.json --services "S3,Lambda,EC2,IAM,DynamoDB,CloudFront" --region us-east-1

# On the migration branch:
git stash pop
former2 generate --output-raw-data v3-output.json --services "S3,Lambda,EC2,IAM,DynamoDB,CloudFront" --region us-east-1

# Compare (ignoring ordering):
jq -S '.' v2-output.json > v2-sorted.json
jq -S '.' v3-output.json > v3-sorted.json
diff v2-sorted.json v3-sorted.json
```

### 9.2 Credential/Profile Tests

```bash
# Default credential chain
former2 generate --output-raw-data out.json --services S3 --region us-east-1

# Named profile
former2 generate --output-raw-data out.json --services S3 --profile my-profile

# Profile with region
former2 generate --output-raw-data out.json --services S3 --profile my-profile-with-region
# Verify it uses the profile's region, not us-east-1

# Environment variable credentials
AWS_ACCESS_KEY_ID=xxx AWS_SECRET_ACCESS_KEY=yyy former2 generate --output-raw-data out.json --services S3 --region us-east-1
```

### 9.3 Proxy Test

```bash
former2 generate --output-raw-data out.json --services S3 --region us-east-1 --proxy http://localhost:8080
# Verify requests go through proxy (check proxy logs)
```

### 9.4 Error Handling Tests

```bash
# Use a restricted IAM role to trigger AccessDeniedException
# Verify errors are logged but scanning continues for other services

# Throttle simulation: scan ALL services simultaneously
former2 generate --output-raw-data out.json --region us-east-1
# Verify retry backoff in debug output
former2 generate --output-raw-data out.json --region us-east-1 --debug 2>&1 | grep "Too many requests"
```

### 9.5 CloudFormation/Terraform Output Test

```bash
former2 generate --output-cloudformation cfn.yml --output-terraform main.tf --services S3 --region us-east-1
# Verify both output files are valid and non-empty
```

### 9.6 Full Service Scan

```bash
# Scan all services (takes a while, but validates no service mapping is missing)
former2 generate --output-raw-data full.json --region us-east-1
# Should complete without "Unknown AWS service" errors
```

### 9.7 Unit Tests (if Stage 4 is complete)

Add tests in `tests/unit/sdk-v3-shim.test.js`:

- `methodToCommandName` converts correctly for various method names
- `SERVICE_MAP` has entries for all 178 service names
- `getClient` caches clients and respects region overrides
- `configureV3` updates shared config and clears cache
- `$metadata` is stripped from responses

---

## 10. Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Missing service in SERVICE_MAP | Medium | High (runtime crash) | Auto-generate map with validation script; full-service scan test (9.6) |
| Response format differences break service file parsing | Medium | Medium | Strip `$metadata`; output comparison test (9.1) |
| v3 retry insufficient for concurrent scanning | Medium | Medium | Configure `maxAttempts: 5`; fall back to custom retry if needed |
| v3 date fields break string operations in service files | Low | Medium | Output comparison catches these; fix on case-by-case basis |
| Package name mapping errors | Medium | High | Validation script that requires + instantiates every mapped package |
| Deprecated AWS services missing from v3 SDK | Low | Low | Catch require errors gracefully; log warning and skip service |
| Browser eval'd code references `AWS` global at parse time | Low | High | Provide dummy `var AWS = {}` before eval block |
| Install size explosion from 178 packages | Low | Low | Shared `@smithy/*` deps are deduped by npm; Docker multi-stage build strips devDeps |
| Custom `proxy-agent` incompatible with v3's `NodeHttpHandler` | Low | Medium | Test proxy path explicitly (9.3); `proxy-agent` returns standard `http.Agent` which `NodeHttpHandler` accepts |

**Rollback plan:** If critical issues are found post-merge, revert the commit. The v2 SDK continues to work (it is in maintenance mode, not EOL). The migration is entirely contained in `cli/main.js`, `cli/sdk-v3-shim.js`, and `package.json` — no service files or browser code are modified.
