#!/usr/bin/env node

var proxy = require('proxy-agent');
const fs = require('fs');
const util = require('util');
const path = require('path');
const process = require('process');
const vm = require('vm');
const deepmerge = require('deepmerge');
const { program: cliargs } = require('commander');
const cliprogress = require('cli-progress');
const logplease = require('logplease');
const _colors = require('colors');
const pjson = require('../package.json');
const { openStdin } = require("process");
const { nav, applySearchFilter, applyRegexFilter, applyServiceFilter } = require("./utils");
const { createSdkcallV3, configureV3 } = require("./sdk-v3-shim");
const { loadAllServices } = require("../shared/services/loader");
const { fromIni } = require("@aws-sdk/credential-providers");
const { loadSharedConfigFiles } = require("@smithy/shared-ini-file-loader");
const CLI = true;

logplease.setLogLevel('NONE');

var cli_resources = [];
var check_objects = [];

function blockUI() { }
function unblockUI() { }
async function getResourceTags(arn) {
    if (!arn) {
        return null;
    }

    if (arn.split(":").length < 7 && !arn.split(":")[5].includes("/")) {
        return null;
    }

    var service = arn.split(":")[2];
    var type = arn.split(":")[5].split("/")[0];

    if (!resource_tag_cache[ service/*+ "." + type*/ ]) {
        resource_tag_cache[service] = "PENDING";

        await context.sdkcall("ResourceGroupsTaggingAPI", "getResources", {
            ResourceTypeFilters: [ service/* + "." + type*/ ]
        }, false).then((data) => {
            resource_tag_cache[ service/* + "." + type*/ ] = data.ResourceTagMappingList;
        }).catch(() => { });
        setTimeout((k) => {
            delete resource_tag_cache[k];
        }, 20000, service/* + "." + type*/); // 20s cache
    }

    while (resource_tag_cache[service] == "PENDING") {
        await new Promise(r => setTimeout(r, 2000));
    }

    for (var res of resource_tag_cache[ service/* + "." + type*/ ]) {
        var resarnparts = res['ResourceARN'].split(":");
        resarnparts[3] = "";
        resarnparts[4] = "";
        var arnparts = arn.split(":");
        arnparts[3] = "";
        arnparts[4] = "";

        if (resarnparts.join(":") == arnparts.join(":")) {
            return res['Tags'].filter(tag => !tag['Key'].startsWith("aws:"));
        }
    }

    return null;
}

function stripAWSTags(tags) {
    if (tags) {
        if (Array.isArray(tags)) {
            tags = tags.filter(function (value, index, array) {
                return (!value['Key'].startsWith("aws:"));
            });
        } else {
            var i = Object.keys(tags).length;
            while (i--) {
                var k = Object.keys(tags)[i];
                if (k.startsWith("aws:")) {
                    delete tags[k];
                }
            }
        }
    }

    return tags;
}

var resource_tag_cache = {};
var iaclangselect = "typescript";

function $(selector) { return new $obj(selector) }
$obj = function (selector) { };
$obj.prototype.bootstrapTable = function (action, data) {
    if (action == "append") {
        cli_resources = [...cli_resources, ...data];
    }
}
$obj.prototype.deferredBootstrapTable = function (action, data) {
    if (action == "append") {
        cli_resources = [...cli_resources, ...data];
    }
}
$.notify = function () { }

// Region is initially set from env vars; config file region is loaded async in main()
var region = process.env.AWS_DEFAULT_REGION || process.env.AWS_REGION || 'us-east-1';

var stack_parameters = [];

// Build sandbox context with all globals the browser scripts depend on
var context = vm.createContext({
    // Globals defined by main.js that scripts read
    CLI: CLI,
    cli_resources: cli_resources,
    check_objects: check_objects,
    blockUI: blockUI,
    unblockUI: unblockUI,
    nav: nav,
    getResourceTags: getResourceTags,
    stripAWSTags: stripAWSTags,
    resource_tag_cache: resource_tag_cache,
    iaclangselect: iaclangselect,
    $: $,
    region: region,
    stack_parameters: stack_parameters,
    window: undefined,

    // Node.js builtins the scripts may reference
    console: console,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    Promise: Promise,
    Buffer: Buffer,

    // npm modules used inside browser scripts
    AWS: {},
    _AWS: {},
    deepmerge: deepmerge,
});

// Load browser scripts into the sandbox context (skip deepmerge.js — npm package is used)
vm.runInContext(
    fs.readFileSync(path.join(__dirname, '../js/mappings.js'), 'utf8'),
    context,
    { filename: 'js/mappings.js' }
);
vm.runInContext(
    fs.readFileSync(path.join(__dirname, '../js/datatables.js'), 'utf8'),
    context,
    { filename: 'js/datatables.js' }
);
// Load services via dual-loader: converted modules use require(),
// legacy files use VM sandbox. Both paths bridge into the VM context.
var moduleContext = {
    sdkcall: null,  // set after v3 shim override below
    region: region,
    getResourceTags: getResourceTags,
    stripAWSTags: stripAWSTags,
    deepmerge: deepmerge,
    blockUI: blockUI,
    unblockUI: unblockUI,
    include_default_resources: false,
};
loadAllServices(context, moduleContext, nav);

// Report collector for scan summary
var scanReport = {
    accessDenied: [],
    networkErrors: [],
    errors: []
};

// Override the v2 sdkcall (from datatables.js) with v3-backed implementation
// Pass logger that delegates to context so --debug reassignments take effect
context.sdkcall = createSdkcallV3({
    f2debug: function(msg) { return context.f2debug ? context.f2debug(msg) : undefined; },
    f2log: function(msg) { return context.f2log(msg); },
    f2trace: function(err) { return context.f2trace(err); }
}, scanReport);

// Share the v3 sdkcall with converted modules (loaded via require, not VM)
moduleContext.sdkcall = context.sdkcall;

context.f2log = function(msg){};
context.f2trace = function(err){};

function saveOutput(opts) {
    if (opts.sortOutput) {
        cli_resources = cli_resources.sort((a, b) => (a.f2id > b.f2id) ? 1 : -1);
    }

    if (opts.outputCloudformation || opts.outputTerraform ||
        opts.outputCdk || opts.outputCdkV2 || opts.outputTroposphere ||
        opts.outputPulumi || opts.outputCdktf) {
        var filtered = applySearchFilter(cli_resources, opts.searchFilter);
        filtered = applyRegexFilter(filtered, opts.regexFilter);

        var output_objects = filtered.map(function(resource) {
            return {
                'id': resource.f2id,
                'type': resource.f2type,
                'data': resource.f2data,
                'region': resource.f2region
            };
        });

        var tracked_resources = context.performF2Mappings(output_objects);
        var mapped_outputs = context.compileOutputs(tracked_resources, opts.cfnDeletionPolicy);

        if (opts.outputLogicalIdMapping) {
            fs.writeFileSync(opts.outputLogicalIdMapping, JSON.stringify(context.getLogicalToPhysicalIdMap()))
        }

        if (opts.outputCloudformation) {
            fs.writeFileSync(opts.outputCloudformation, mapped_outputs['cfn']);
        }

        if (opts.outputTerraform) {
            fs.writeFileSync(opts.outputTerraform, mapped_outputs['tf']);
        }

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
    }
}

function parseOpts(opts) {
    if (!opts.outputRawData && !opts.outputCloudformation && !opts.outputTerraform &&
        !opts.outputCdk && !opts.outputCdkV2 && !opts.outputTroposphere &&
        !opts.outputPulumi && !opts.outputCdktf) {
        throw new Error('You must specify an output type');
    }

    if (opts.debug) {
        logplease.setLogLevel('DEBUG');
        context.f2log = function(msg){ console.log(msg); };
        context.f2trace = function(err){ console.trace(err); };
        context.f2debug = function(msg){ console.log(Date.now().toString() + ": " + msg); };
    }

    if (opts.regexFilter) {
        opts.regexFilter = new RegExp(opts.regexFilter);
    }

    if (opts.cfnDeletionPolicy && opts.cfnDeletionPolicy != "Delete" && opts.cfnDeletionPolicy != "Retain") {
        throw new Error('You must specify --cfn-deletion-policy value in [Delete, Retain]');
    }

    if (opts.iacLanguage) {
        var validLanguages = ["typescript", "python", "java", "dotnet"];
        if (!validLanguages.includes(opts.iacLanguage)) {
            throw new Error('You must specify --iac-language value in [typescript, python, java, dotnet]');
        }
        context.iaclangselect = opts.iacLanguage;
    }

    if (!opts.outputCdk) { context.outputMapCdk = function(){}; }
    if (!opts.outputCdkV2) { context.outputMapCdkv2 = function(){}; }
    if (!opts.outputTroposphere) { context.outputMapTroposphere = function(){}; }
    if (!opts.outputPulumi) { context.outputMapPulumi = function(){}; }
    if (!opts.outputCdktf) { context.outputMapCdktf = function(){}; }
    if (!opts.outputCloudformation) { context.outputMapCfn = function(){}; }
    if (!opts.outputTerraform) { context.outputMapTf = function(){}; }

    if (opts.includeDefaultResources) {
        context.include_default_resources = true;
        moduleContext.include_default_resources = true;
    }

}

function printScanReport(scanErrors, scanReport, opts, totalServices) {
    var hasIssues = scanErrors.length > 0 || scanReport.accessDenied.length > 0 ||
                    scanReport.networkErrors.length > 0 || scanReport.errors.length > 0;
    var successCount = totalServices - scanErrors.length;

    if (!hasIssues) {
        console.log(_colors.green("\nScan completed: " + totalServices + "/" + totalServices + " services successful, no errors."));
        return;
    }

    console.error(_colors.yellow("\n\u2500\u2500\u2500 Scan Report \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"));
    console.error(_colors.green("\n\u2714 " + successCount + "/" + totalServices + " service(s) scanned successfully"));

    // Service-level failures (entire updateDatatable threw)
    if (scanErrors.length > 0) {
        console.error(_colors.red("\n\u2716 " + scanErrors.length + " service(s) failed:"));
        scanErrors.forEach(function(e) {
            var errType = e.error && e.error.code ? e.error.code : (e.error && e.error.name ? e.error.name : "Error");
            var errMsg = e.error && e.error.message ? e.error.message :
                (typeof e.error === 'object' && e.error !== null ? JSON.stringify(e.error) : String(e.error || "Unknown error"));
            // Truncate long messages
            if (errMsg.length > 120) { errMsg = errMsg.substring(0, 117) + "..."; }
            console.error("  " + _colors.red(e.category + "/" + e.service) + " - " + errType + ": " + errMsg);
        });
        if (opts.debug) {
            console.error(_colors.dim("\nFull stack traces:"));
            scanErrors.forEach(function(e) {
                console.error(_colors.red("\n  [" + e.category + "/" + e.service + "]"));
                console.error(e.error);
            });
        }
    }

    // Access denied (permissions issues)
    if (scanReport.accessDenied.length > 0) {
        // Group by service
        var adByService = {};
        scanReport.accessDenied.forEach(function(item) {
            if (!adByService[item.service]) { adByService[item.service] = []; }
            adByService[item.service].push(item.method);
        });
        var serviceCount = Object.keys(adByService).length;
        console.error(_colors.yellow("\n\u26A0 Access denied: " + scanReport.accessDenied.length + " call(s) across " + serviceCount + " service(s)"));
        Object.keys(adByService).sort().forEach(function(svc) {
            console.error("  " + _colors.yellow(svc) + ": " + adByService[svc].join(", "));
        });
    }

    // SDK call errors (non-access-denied, non-network)
    if (scanReport.errors.length > 0) {
        console.error(_colors.red("\n\u2716 " + scanReport.errors.length + " SDK call error(s):"));
        scanReport.errors.forEach(function(item) {
            var msg = item.message || "Unknown error";
            if (msg.length > 120) { msg = msg.substring(0, 117) + "..."; }
            console.error("  " + _colors.red(item.service + "." + item.method) + " - " + (item.code || "Error") + ": " + msg);
        });
    }

    // Network errors
    if (scanReport.networkErrors.length > 0) {
        console.error(_colors.yellow("\n\u26A0 " + scanReport.networkErrors.length + " network error(s):"));
        scanReport.networkErrors.forEach(function(item) {
            console.error("  " + item.service + "." + item.method + (item.code ? " (" + item.code + ")" : ""));
        });
    }

    console.error(_colors.yellow("\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"));
}

async function main(opts) {

    // Load region from config file (async v3 equivalent of v2 AWS.IniLoader)
    if (!opts.region) {
        try {
            var configFiles = await loadSharedConfigFiles();
            var profileName = opts.profile || "default";
            var profileConfig = configFiles.configFile && configFiles.configFile[profileName];
            if (profileConfig && profileConfig.region) {
                region = profileConfig.region;
                context.region = region;
                moduleContext.region = region;
            }
        } catch (err) {}
    }

    if (opts.profile) {
        configureV3({ credentials: fromIni({ profile: opts.profile }) });
    }

    if (opts.region) {
        region = opts.region;
        context.region = region;
        moduleContext.region = region;
    }

    configureV3({ region: region });

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

    context.sections = applyServiceFilter(context.sections, opts);

    const b1 = new cliprogress.SingleBar({
        format: _colors.cyan('{bar}') + '  {percentage}% ({value}/{total} services completed)',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: false
    });

    b1.start(context.sections.length, 0);

    var scanErrors = [];

    await Promise.all(
        context.sections.map(section => {
            let dtname = 'updateDatatable' + nav(section.category) + nav(section.service);
            let work = context[dtname];
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

    b1.stop();

    // Print scan summary report
    printScanReport(scanErrors, scanReport, opts, context.sections.length);

    if (opts.outputRawData) {
        fs.writeFileSync(opts.outputRawData, JSON.stringify(cli_resources, null, 4));
    }

    saveOutput(opts);

}

let validation = false;
cliargs
    .version(pjson.version)
    .command('generate')
    .description('generates outputs and writes them to the specified file')
    .option('--output-cloudformation <filename>', 'filename for CloudFormation output')
    .option('--output-terraform <filename>', 'filename for Terraform output')
    .option('--output-cdk <filename>', 'filename for CDK v1 output')
    .option('--output-cdk-v2 <filename>', 'filename for CDK v2 output')
    .option('--output-troposphere <filename>', 'filename for Troposphere output')
    .option('--output-pulumi <filename>', 'filename for Pulumi output')
    .option('--output-cdktf <filename>', 'filename for CDKTF output')
    .option('--output-raw-data <filename>', 'filename for debug output (full)')
    .option('--output-logical-id-mapping <filename>', 'filename for logical to physical id mapping')
    .option('--cfn-deletion-policy <Delete|Retain>', 'add DeletionPolicy in CloudFormation output')
    .option('--iac-language <typescript|python|java|dotnet>', 'language for CDK/Pulumi/CDKTF output (default: typescript)')
    .option('--search-filter <value>', 'search filter for discovered resources (can be comma separated)')
    .option('--regex-filter <regex>', 'search filter as a RegExp for discovered resources')
    .option('--services <value>', 'list of services to include (can be comma separated (default: ALL))')
    .option('--exclude-services <value>', 'list of services to exclude (can be comma separated)')
    .option('--sort-output', 'sort resources by their ID before outputting')
    .option('--include-default-resources', 'include default resources such as default VPCs and their subnets')
    .option('--region <regionname>', 'overrides the default AWS region to scan')
    .option('--profile <profilename>', 'uses the profile specified from the shared credentials file')
    .option('--proxy <protocol://host:port>', 'use proxy')
    .option('--debug', 'log debugging messages')
    .action(async (opts) => {
        parseOpts(opts);
        // The followings are here to silence Node runtime complaining about event emitter listeners
        // due to the number of TLS requests that suddenly go out to AWS APIs. This is harmless here
        require('events').EventEmitter.defaultMaxListeners = 1000;
        process.setMaxListeners(0);
        validation = true;
        try {
            await main(opts);
        } catch(err) {
            console.log("\nERROR: " + err.message + "\n")
            cliargs.help();
        }
    });

cliargs
    .command('filter')
    .description('load resources from file and writes them to the specified file')
    .requiredOption('--input-file <filename>', 'filename with raw data from the generate command')
    .option('--output-cloudformation <filename>', 'filename for CloudFormation output')
    .option('--output-terraform <filename>', 'filename for Terraform output')
    .option('--output-cdk <filename>', 'filename for CDK v1 output')
    .option('--output-cdk-v2 <filename>', 'filename for CDK v2 output')
    .option('--output-troposphere <filename>', 'filename for Troposphere output')
    .option('--output-pulumi <filename>', 'filename for Pulumi output')
    .option('--output-cdktf <filename>', 'filename for CDKTF output')
    .option('--output-logical-id-mapping <filename>', 'filename for logical to physical id mapping')
    .option('--cfn-deletion-policy <Delete|Retain>', 'add DeletionPolicy in CloudFormation output')
    .option('--iac-language <typescript|python|java|dotnet>', 'language for CDK/Pulumi/CDKTF output (default: typescript)')
    .option('--search-filter <value>', 'search filter for discovered resources (can be comma separated)')
    .option('--regex-filter <regex>', 'search filter as a RegExp for discovered resources')
    .option('--sort-output', 'sort resources by their ID before outputting')
    .option('--include-default-resources', 'include default resources such as default VPCs and their subnets')
    .option('--services <value>', 'list of services to include (can be comma separated (default: ALL))')
    .option('--exclude-services <value>', 'list of services to exclude (can be comma separated)')
    .option('--region <regionname>', 'overrides the region used in output templates')
    .option('--debug', 'log debugging messages')
    .action((opts) => {
        parseOpts(opts);
        validation = true;
        cli_resources = JSON.parse(fs.readFileSync(opts.inputFile).toString());

        context.sections = applyServiceFilter(context.sections, opts);

        if (opts.region) {
            region = opts.region;
            context.region = region;
            moduleContext.region = region;
        }

        saveOutput(opts);
    });

cliargs.parseAsync(process.argv).then(() => {
    if (!validation) {
        cliargs.help();
    }
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
