#!/usr/bin/env node

var proxy = require('proxy-agent');
const fs = require('fs');
const path = require('path');
const process = require('process');
const deepmerge = require('deepmerge');
const { program: cliargs } = require('commander');
const cliprogress = require('cli-progress');
const logplease = require('logplease');
const _colors = require('colors');
const pjson = require('../package.json');
const { nav, applySearchFilter, applyRegexFilter, applyServiceFilter } = require("./utils");
const { createSdkcallV3, configureV3 } = require("./sdk-v3-shim");
const allServices = require("../shared/services");
const { performF2Mappings, compileOutputs, getResourceName, getLogicalToPhysicalIdMap, setState, setLogFunctions } = require("../shared/mappings");
const { fromIni } = require("@aws-sdk/credential-providers");
const { loadSharedConfigFiles } = require("@smithy/shared-ini-file-loader");

logplease.setLogLevel('NONE');

// Region is initially set from env vars; config file region is loaded async in main()
var region = process.env.AWS_DEFAULT_REGION || process.env.AWS_REGION || 'us-east-1';

// Build services array from the index (each entry has section, updateDatatable, mapResources)
var services = Object.values(allServices);

// Collect all sections from service modules
var sections = services.map(s => s.section);

// Tag cache for getResourceTags
var resource_tag_cache = {};

function stripAWSTags(tags) {
    if (tags) {
        if (Array.isArray(tags)) {
            tags = tags.filter(function (value) {
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

// Expose getResourceName and stripAWSTags as Node globals
// (service mapResources functions reference them as bare globals)
global.getResourceName = getResourceName;
global.stripAWSTags = stripAWSTags;

// Report collector for scan summary
var scanReport = {
    accessDenied: [],
    networkErrors: [],
    errors: []
};

// Create the v3 sdkcall — log functions are set later in parseOpts
var f2log = function(msg){};
var f2trace = function(err){};
var f2debug = function(msg){};

var sdkcall = createSdkcallV3({
    f2debug: function(msg) { return f2debug(msg); },
    f2log: function(msg) { return f2log(msg); },
    f2trace: function(err) { return f2trace(err); }
}, scanReport);

function createGetResourceTags(sdkcall) {
    return async function getResourceTags(arn) {
        if (!arn) {
            return null;
        }

        if (arn.split(":").length < 7 && !arn.split(":")[5].includes("/")) {
            return null;
        }

        var service = arn.split(":")[2];

        if (!resource_tag_cache[ service ]) {
            resource_tag_cache[service] = "PENDING";

            await sdkcall("ResourceGroupsTaggingAPI", "getResources", {
                ResourceTypeFilters: [ service ]
            }, false).then((data) => {
                resource_tag_cache[ service ] = data.ResourceTagMappingList;
            }).catch(() => { });
            setTimeout((k) => {
                delete resource_tag_cache[k];
            }, 20000, service); // 20s cache
        }

        while (resource_tag_cache[service] == "PENDING") {
            await new Promise(r => setTimeout(r, 2000));
        }

        for (var res of resource_tag_cache[ service ]) {
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
    };
}

// The context object injected into service updateDatatable functions
var context = {
    sdkcall: sdkcall,
    region: region,
    getResourceTags: createGetResourceTags(sdkcall),
    stripAWSTags: stripAWSTags,
    deepmerge: deepmerge,
    include_default_resources: false,
};

function saveOutput(opts, resources) {
    if (opts.sortOutput) {
        resources = resources.sort((a, b) => (a.f2id > b.f2id) ? 1 : -1);
    }

    if (opts.outputCloudformation || opts.outputTerraform ||
        opts.outputCdk || opts.outputCdkV2 || opts.outputTroposphere ||
        opts.outputPulumi || opts.outputCdktf) {
        var filtered = applySearchFilter(resources, opts.searchFilter);
        filtered = applyRegexFilter(filtered, opts.regexFilter);

        var output_objects = filtered.map(function(resource) {
            return {
                'id': resource.f2id,
                'type': resource.f2type,
                'data': resource.f2data,
                'region': resource.f2region
            };
        });

        // Collect mapping functions from all services
        var mappingFunctions = services.map(s => s.mapResources);

        var tracked_resources = performF2Mappings(output_objects, mappingFunctions);
        var mapped_outputs = compileOutputs(tracked_resources, opts.cfnDeletionPolicy);

        if (opts.outputLogicalIdMapping) {
            fs.writeFileSync(opts.outputLogicalIdMapping, JSON.stringify(getLogicalToPhysicalIdMap()));
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
        f2log = function(msg){ console.log(msg); };
        f2trace = function(err){ console.trace(err); };
        f2debug = function(msg){ console.log(Date.now().toString() + ": " + msg); };
        setLogFunctions(f2log, f2trace, f2debug);
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
        setState({ iaclangselect: opts.iacLanguage });
    }

    if (opts.includeDefaultResources) {
        context.include_default_resources = true;
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
            }
        } catch (err) {}
    }

    if (opts.profile) {
        configureV3({ credentials: fromIni({ profile: opts.profile }) });
    }

    if (opts.region) {
        region = opts.region;
        context.region = region;
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

    var filteredSections = applyServiceFilter(sections, opts);

    const b1 = new cliprogress.SingleBar({
        format: _colors.cyan('{bar}') + '  {percentage}% ({value}/{total} services completed)',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: false
    });

    b1.start(filteredSections.length, 0);

    var scanErrors = [];
    var allResources = [];

    await Promise.all(
        filteredSections.map(section => {
            // Find the service module that owns this section
            var serviceModule = services.find(s => s.section === section);

            return new Promise(async resolve => {
                try {
                    var resources = await serviceModule.updateDatatable(context);
                    if (resources && resources.length) {
                        allResources.push(...resources);
                    }
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
    printScanReport(scanErrors, scanReport, opts, filteredSections.length);

    if (opts.outputRawData) {
        fs.writeFileSync(opts.outputRawData, JSON.stringify(allResources, null, 4));
    }

    saveOutput(opts, allResources);

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
        var resources = JSON.parse(fs.readFileSync(opts.inputFile).toString());

        if (opts.region) {
            region = opts.region;
            context.region = region;
        }

        saveOutput(opts, resources);
    });

cliargs.parseAsync(process.argv).then(() => {
    if (!validation) {
        cliargs.help();
    }
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
