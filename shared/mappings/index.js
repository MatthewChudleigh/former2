// shared/mappings/index.js
//
// Core mapping functions extracted from js/mappings.js.
// Contains performF2Mappings, compileOutputs, getResourceName, MD5,
// and module-level state management.
//
// The original js/mappings.js remains untouched for backward compatibility.
// This module is consumed by converted code (CLI after Stage 6, browser after Stage 7).

var { outputMapCfn } = require('./cfn');
var { outputMapTf } = require('./terraform');
var { outputMapCdk, outputMapCdkv2 } = require('./cdk');
var { outputMapTroposphere } = require('./troposphere');
var { outputMapPulumi } = require('./pulumi');
var { outputMapCdktf } = require('./cdktf');
var { outputMapBoto3 } = require('./boto3');
var { outputMapGo } = require('./go');
var { outputMapJs } = require('./js-sdk');
var { outputMapCli } = require('./cli');
var { outputMapIam, compileMapIam } = require('./iam');

/* ========================================================================== */
// Module-level state
// These mirror the globals in js/mappings.js. They are reset at the start
// of performF2Mappings/compileOutputs as in the original.
/* ========================================================================== */

var outputs = [];
var tracked_resources = [];
var global_used_refs = {};
var cfnspacing = "    ";
var logicalidstrategy = "longtypeprefixoptionalindexsuffix";
var service_mapping_functions = [];
var tracked_relationships = {};
var include_default_resources = false;

// These are set externally by the CLI or browser before calling compileOutputs
var iaclangselect = "typescript";
var stack_parameters = [];
var check_objects = [];

// Logging — can be overridden by consumers
var f2log = function (msg) { console.log(msg); };
var f2trace = function (msg) { console.trace(msg); };
var f2debug = function (arg) { /* for overriding only */ };

/* ========================================================================== */
// MD5 hash function (internal, used by getResourceName)
/* ========================================================================== */

function MD5(e) {
    function h(a, b) {
        var c, d, e, f, g;
        e = a & 2147483648;
        f = b & 2147483648;
        c = a & 1073741824;
        d = b & 1073741824;
        g = (a & 1073741823) + (b & 1073741823);
        return c & d ? g ^ 2147483648 ^ e ^ f : c | d ? g & 1073741824 ? g ^ 3221225472 ^ e ^ f : g ^ 1073741824 ^ e ^ f : g ^ e ^ f
    }

    function k(a, b, c, d, e, f, g) {
        a = h(a, h(h(b & c | ~b & d, e), g));
        return h(a << f | a >>> 32 - f, b)
    }

    function l(a, b, c, d, e, f, g) {
        a = h(a, h(h(b & d | c & ~d, e), g));
        return h(a << f | a >>> 32 - f, b)
    }

    function m(a, b, d, c, e, f, g) {
        a = h(a, h(h(b ^ d ^ c, e), g));
        return h(a << f | a >>> 32 - f, b)
    }

    function n(a, b, d, c, e, f, g) {
        a = h(a, h(h(d ^ (b | ~c), e), g));
        return h(a << f | a >>> 32 - f, b)
    }

    function p(a) {
        var b = "",
            d = "",
            c;
        for (c = 0; 3 >= c; c++) d = a >>> 8 * c & 255, d = "0" + d.toString(16), b += d.substr(d.length - 2, 2);
        return b
    }
    var f = [],
        q, r, s, t, a, b, c, d;
    e = function (a) {
        a = a.replace(/\r\n/g, "\n");
        for (var b = "", d = 0; d < a.length; d++) {
            var c = a.charCodeAt(d);
            128 > c ? b += String.fromCharCode(c) : (127 < c && 2048 > c ? b += String.fromCharCode(c >> 6 | 192) : (b += String.fromCharCode(c >> 12 | 224), b += String.fromCharCode(c >> 6 & 63 | 128)), b += String.fromCharCode(c & 63 | 128))
        }
        return b
    }(e);
    f = function (b) {
        var a, c = b.length;
        a = c + 8;
        for (var d = 16 * ((a - a % 64) / 64 + 1), e = Array(d - 1), f = 0, g = 0; g < c;) a = (g - g % 4) / 4, f = g % 4 * 8, e[a] |= b.charCodeAt(g) << f, g++;
        a = (g - g % 4) / 4;
        e[a] |= 128 << g % 4 * 8;
        e[d - 2] = c << 3;
        e[d - 1] = c >>> 29;
        return e
    }(e);
    a = 1732584193;
    b = 4023233417;
    c = 2562383102;
    d = 271733878;
    for (e = 0; e < f.length; e += 16) q = a, r = b, s = c, t = d, a = k(a, b, c, d, f[e + 0], 7, 3614090360), d = k(d, a, b, c, f[e + 1], 12, 3905402710), c = k(c, d, a, b, f[e + 2], 17, 606105819), b = k(b, c, d, a, f[e + 3], 22, 3250441966), a = k(a, b, c, d, f[e + 4], 7, 4118548399), d = k(d, a, b, c, f[e + 5], 12, 1200080426), c = k(c, d, a, b, f[e + 6], 17, 2821735955), b = k(b, c, d, a, f[e + 7], 22, 4249261313), a = k(a, b, c, d, f[e + 8], 7, 1770035416), d = k(d, a, b, c, f[e + 9], 12, 2336552879), c = k(c, d, a, b, f[e + 10], 17, 4294925233), b = k(b, c, d, a, f[e + 11], 22, 2304563134), a = k(a, b, c, d, f[e + 12], 7, 1804603682), d = k(d, a, b, c, f[e + 13], 12, 4254626195), c = k(c, d, a, b, f[e + 14], 17, 2792965006), b = k(b, c, d, a, f[e + 15], 22, 1236535329), a = l(a, b, c, d, f[e + 1], 5, 4129170786), d = l(d, a, b, c, f[e + 6], 9, 3225465664), c = l(c, d, a, b, f[e + 11], 14, 643717713), b = l(b, c, d, a, f[e + 0], 20, 3921069994), a = l(a, b, c, d, f[e + 5], 5, 3593408605), d = l(d, a, b, c, f[e + 10], 9, 38016083), c = l(c, d, a, b, f[e + 15], 14, 3634488961), b = l(b, c, d, a, f[e + 4], 20, 3889429448), a = l(a, b, c, d, f[e + 9], 5, 568446438), d = l(d, a, b, c, f[e + 14], 9, 3275163606), c = l(c, d, a, b, f[e + 3], 14, 4107603335), b = l(b, c, d, a, f[e + 8], 20, 1163531501), a = l(a, b, c, d, f[e + 13], 5, 2850285829), d = l(d, a, b, c, f[e + 2], 9, 4243563512), c = l(c, d, a, b, f[e + 7], 14, 1735328473), b = l(b, c, d, a, f[e + 12], 20, 2368359562), a = m(a, b, c, d, f[e + 5], 4, 4294588738), d = m(d, a, b, c, f[e + 8], 11, 2272392833), c = m(c, d, a, b, f[e + 11], 16, 1839030562), b = m(b, c, d, a, f[e + 14], 23, 4259657740), a = m(a, b, c, d, f[e + 1], 4, 2763975236), d = m(d, a, b, c, f[e + 4], 11, 1272893353), c = m(c, d, a, b, f[e + 7], 16, 4139469664), b = m(b, c, d, a, f[e + 10], 23, 3200236656), a = m(a, b, c, d, f[e + 13], 4, 681279174), d = m(d, a, b, c, f[e + 0], 11, 3936430074), c = m(c, d, a, b, f[e + 3], 16, 3572445317), b = m(b, c, d, a, f[e + 6], 23, 76029189), a = m(a, b, c, d, f[e + 9], 4, 3654602809), d = m(d, a, b, c, f[e + 12], 11, 3873151461), c = m(c, d, a, b, f[e + 15], 16, 530742520), b = m(b, c, d, a, f[e + 2], 23, 3299628645), a = n(a, b, c, d, f[e + 0], 6, 4096336452), d = n(d, a, b, c, f[e + 7], 10, 1126891415), c = n(c, d, a, b, f[e + 14], 15, 2878612391), b = n(b, c, d, a, f[e + 5], 21, 4237533241), a = n(a, b, c, d, f[e + 12], 6, 1700485571), d = n(d, a, b, c, f[e + 3], 10, 2399980690), c = n(c, d, a, b, f[e + 10], 15, 4293915773), b = n(b, c, d, a, f[e + 1], 21, 2240044497), a = n(a, b, c, d, f[e + 8], 6, 1873313359), d = n(d, a, b, c, f[e + 15], 10, 4264355552), c = n(c, d, a, b, f[e + 6], 15, 2734768916), b = n(b, c, d, a, f[e + 13], 21, 1309151649), a = n(a, b, c, d, f[e + 4], 6, 4149444226), d = n(d, a, b, c, f[e + 11], 10, 3174756917), c = n(c, d, a, b, f[e + 2], 15, 718787259), b = n(b, c, d, a, f[e + 9], 21, 3951481745), a = h(a, q), b = h(b, r), c = h(c, s), d = h(d, t);
    return (p(a) + p(b) + p(c) + p(d)).toLowerCase()
}

/* ========================================================================== */
// getResourceName — logical ID generation
/* ========================================================================== */

function getLogicalToPhysicalIdMap() {
    return global_used_refs;
}

function getResourceName(service, requestId, cfntype) {
    if (!requestId) {
        f2trace("No request ID found for " + service);
        requestId = "";
    }

    var i = 2; // on purpose, 2 means second usage
    var proposed = "";

    if (logicalidstrategy == "shorttypeprefixhashsuffix") {
        shorttype = cfntype.split("::").pop();

        proposed = shorttype + MD5(requestId).substring(0, 7);

        while (proposed in global_used_refs && check_objects.length == 0) {
            proposed = shorttype + MD5(requestId + i).substring(0, 7);
            i += 1;
        }
    } else if (logicalidstrategy == "longtypeprefixhashsuffix") {
        longtype = cfntype.split("::")[1] + cfntype.split("::").pop();

        proposed = longtype + MD5(requestId).substring(0, 7);

        while (proposed in global_used_refs && check_objects.length == 0) {
            proposed = longtype + MD5(requestId + i).substring(0, 7);
            i += 1;
        }
    } else if (logicalidstrategy == "shorttypeprefixoptionalindexsuffix") {
        shorttype = cfntype.split("::").pop();

        proposed = shorttype;

        while (proposed in global_used_refs && check_objects.length == 0) {
            proposed = shorttype + i;
            i += 1;
        }
    } else if (logicalidstrategy == "longtypeprefixoptionalindexsuffix" || !logicalidstrategy) {
        longtype = cfntype.split("::")[1] + cfntype.split("::").pop();

        proposed = longtype;

        while (proposed in global_used_refs && check_objects.length == 0) {
            proposed = longtype + i;
            i += 1;
        }
    } else if (logicalidstrategy == "serviceprefixhashsuffix") {
        proposed = service.replace(/\-/g, "") + MD5(requestId).substring(0, 7);

        while (proposed in global_used_refs && check_objects.length == 0) {
            proposed = service.replace(/\-/g, "") + MD5(requestId + i).substring(0, 7);
            i += 1;
        }
    }

    global_used_refs[proposed] = requestId;

    return proposed;
}

/* ========================================================================== */
// performF2Mappings
/* ========================================================================== */

/**
 * Iterate over collected resource objects and run all mapping functions.
 *
 * Key refactoring change from the original: accepts mappingFunctions as a
 * parameter instead of reading from the module-level service_mapping_functions.
 * When mappingFunctions is not provided, falls back to the module-level array
 * for backward compatibility.
 *
 * @param {Array} objects - Resource objects to map (with .type, .id, .data, .region)
 * @param {Array} [mappingFunctions] - Array of mapping functions. If omitted, uses module-level service_mapping_functions.
 * @returns {Array} tracked_resources array
 */
function performF2Mappings(objects, mappingFunctions) {
    var _tracked_resources = [];
    global_used_refs = {};

    var _mapping_fns = mappingFunctions || service_mapping_functions;

    objects.forEach(function(obj) {
        try {
            var reqParams = {
                'boto3': {},
                'go': {},
                'cfn': {},
                'cli': {},
                'tf': {},
                'pulumi': {},
                'cdktf': {},
                'iam': {}
            };

            var service_mapping_success = false;
            _mapping_fns.forEach(function(service_mapping_function) {
                try {
                    if (service_mapping_function(reqParams, obj, _tracked_resources)) {
                        service_mapping_success = true;
                    }
                } catch (err) {
                    f2log("Error in mapping function: " + err.toString());
                    f2trace(err);
                }
            });

            if (!service_mapping_success) {
                f2log("No mapping available for type: " + obj.type);
            }
        } catch (err) {
            f2log("Error processing object: " + err.toString());
            f2trace(err);
        }
    });

    return _tracked_resources;
}

/* ========================================================================== */
// compileOutputs
/* ========================================================================== */

function compileOutputs(_tracked_resources, cfn_deletion_policy) {
    // Use provided tracked_resources or fall back to module state
    if (!_tracked_resources) {
        _tracked_resources = tracked_resources;
    }

    var state = {
        cfnspacing: cfnspacing,
        iaclangselect: iaclangselect,
        tracked_relationships: null, // set below
        tracked_resources: _tracked_resources,
        declared_services: null, // set below
        go_first_output: true,
        stack_parameters: stack_parameters
    };

    var services = {
        'go': [],
        'cdk': [],
        'cdkv2': [],
        'cdktf': [],
        'troposphere': []
    };
    tracked_relationships = {
        'cfn': [],
        'tf': []
    };
    state.tracked_relationships = tracked_relationships;

    for (var i = 0; i < outputs.length; i++) {
        if (!services['go'].includes(outputs[i].service)) {
            services['go'].push(outputs[i].service);
        }
    }
    for (var i = 0; i < _tracked_resources.length; i++) {
        if (_tracked_resources[i].type && !services['cdk'].includes(_tracked_resources[i].type.split("::")[1].toLowerCase())) {
            var troposervice = _tracked_resources[i].type.split("::")[1].toLowerCase();

            if (troposervice == "kinesisanalytics") {
                troposervice = "analytics";
            } else if (troposervice == "lambda") {
                troposervice = "awslambda";
            } else if (troposervice == "kinesisfirehose") {
                troposervice = "firehose";
            }

            services['cdk'].push(_tracked_resources[i].type.split("::")[1].toLowerCase());
            services['cdkv2'].push(_tracked_resources[i].type.split("::")[1].toLowerCase());
            services['troposphere'].push(troposervice);
        }
        if (_tracked_resources[i].terraformType) {
            var typesplit = _tracked_resources[i].terraformType.split("_");
            typesplit.shift(); // throw away "aws_"
            services['cdktf'].push(typesplit.map(function(x) { return x[0].toUpperCase() + x.substr(1); }).join(''));
        }
    }
    services['go'] = [...new Set(services['go'])]; // dedup
    services['cdk'] = [...new Set(services['cdk'])]; // dedup
    services['cdkv2'] = [...new Set(services['cdkv2'])]; // dedup
    services['cdktf'] = [...new Set(services['cdktf'])]; // dedup
    services['troposphere'] = [...new Set(services['troposphere'])]; // dedup

    var has_cfn = false;
    var has_tf = false;
    for (var i = 0; i < _tracked_resources.length; i++) {
        if (_tracked_resources[i].type) {
            has_cfn = true;
        }
        if (_tracked_resources[i].terraformType) {
            has_tf = true;
        }
    }

    var region = 'us-east-1';
    if (outputs[0]) {
        region = outputs[0].region;
    } else if (_tracked_resources[0]) {
        region = _tracked_resources[0].region;
    }

    var compiled = {
        'boto3': null,
        'go': null,

        'cfn': (!has_cfn ? '# No resources generated' : 'AWSTemplateFormatVersion: "2010-09-09"\nMetadata:\n' +
            cfnspacing + 'Generator: "former2"\nDescription: ""\n'),

        'tf': (!has_tf ? '# No resources generated' : 'terraform {\n    required_providers {\n        aws = {\n            source = "hashicorp/aws"\n            version = "~> 3.0"\n        }\n    }\n}\n\nprovider "aws" {\n    region = "' + _tracked_resources[0].region + '"\n}\n'),

        'pulumi': (iaclangselect == "typescript") ?
            (!has_tf ? '// No resources generated' : 'import * as pulumi from "@pulumi/pulumi";\nimport * as aws from "@pulumi/aws";\n') :
            '// Selected programming language not supported for this output',

        'cdktf': (iaclangselect == "typescript") ?
            (!has_tf ? '// No resources generated' : "import { Construct } from 'constructs';\nimport { App, TerraformStack, TerraformOutput } from 'cdktf';\nimport { " + services.cdktf.map(function(service) { return service; }).join(', ') + ", AwsProvider } from './.gen/providers/aws';\n\nclass MyStack extends TerraformStack {\n    constructor(scope: Construct, name: string) {\n        super(scope, name);\n\n        new AwsProvider(this, 'aws', {\n          region: '" + region + "'\n        });\n\n") :
            '// Selected programming language not supported for this output',

        'cli': null,
        'js': null,

        'cdk': _buildCdkHeader(iaclangselect, has_cfn, services),
        'cdkv2': _buildCdkv2Header(iaclangselect, has_cfn, services),

        'iam': null,

        'troposphere': (!has_cfn ? '# No resources generated' : 'from troposphere import ' + services.troposphere.map(function(service) { return service; }).join(', ') + '\nfrom troposphere import Ref, GetAtt, Template\n\ntemplate = Template()\n\ntemplate.add_version("2010-09-09")\n\n')
    };

    if (has_cfn) {
        if (stack_parameters.length > 2) {
            compiled['cfn'] += 'Parameters:\n';
            stack_parameters.forEach(function(stack_parameter) {
                if (!stack_parameter.name.startsWith("AWS::")) {
                    compiled['cfn'] += cfnspacing + stack_parameter.name + ':\n' +
                        cfnspacing + cfnspacing + 'Type: "' + stack_parameter.type + '"\n' +
                        ((stack_parameter.description && stack_parameter.description != "") ? cfnspacing + cfnspacing + 'Description: "' + stack_parameter.description.toString() + '"\n' : '') +
                        ((stack_parameter.default_value && stack_parameter.default_value != "") ? cfnspacing + cfnspacing + 'Default: "' + stack_parameter.default_value.toString() + '"\n' : '') +
                        ((stack_parameter.constraint_description && stack_parameter.constraint_description != "") ? cfnspacing + cfnspacing + 'ConstraintDescription: "' + stack_parameter.constraint_description.toString() + '"\n' : '') +
                        ((stack_parameter.allowed_pattern && stack_parameter.allowed_pattern != "") ? cfnspacing + cfnspacing + 'AllowedPattern: "' + stack_parameter.allowed_pattern.toString() + '"\n' : '') +
                        ((stack_parameter.minimum_length && stack_parameter.minimum_length != "") ? cfnspacing + cfnspacing + 'MinimumLength: ' + stack_parameter.minimum_length.toString() + '\n' : '') +
                        ((stack_parameter.maximum_length && stack_parameter.maximum_length != "") ? cfnspacing + cfnspacing + 'MaximumLength: ' + stack_parameter.maximum_length.toString() + '\n' : '') +
                        ((stack_parameter.minimum_value && stack_parameter.minimum_value != "") ? cfnspacing + cfnspacing + 'MinimumValue: ' + stack_parameter.minimum_value.toString() + '\n' : '') +
                        ((stack_parameter.maximum_value && stack_parameter.maximum_value != "") ? cfnspacing + cfnspacing + 'MaximumValue: ' + stack_parameter.maximum_value.toString() + '\n' : '') +
                        ((stack_parameter.allowed_values && stack_parameter.allowed_values != "") ? cfnspacing + cfnspacing + 'AllowedValues:\n' + cfnspacing + cfnspacing + '  - "' + stack_parameter.allowed_values.join('"\n' + cfnspacing + cfnspacing + '  - "') + '"\n' : '') +
                        ((stack_parameter.no_echo) ? cfnspacing + cfnspacing + 'NoEcho: true\n' : '') +
                        '\n';
                }
            });
        }
        compiled['cfn'] += 'Resources:\n';
    }

    var declared_services = {
        'boto3': [],
        'go': [],
        'js': []
    };
    state.declared_services = declared_services;
    state.go_first_output = true;

    var compiled_iam_outputs = [];
    for (var i = 0; i < outputs.length; i++) {
        if (outputs[i].method.api) {
            compiled_iam_outputs = compileMapIam(compiled_iam_outputs, outputs[i].service, outputs[i].method.api, outputs[i].options.iam, outputs[i].region, outputs[i].was_blocked);
        }
    }
    compiled['iam'] = outputMapIam(compiled_iam_outputs, state);
    compiled['js'] = (compiled['js'] || '') + '\n';
    compiled['go'] = (compiled['go'] || '') + '\n    if err != nil {\n        panic(err);\n    }\n}\n';

    for (var i = 0; i < _tracked_resources.length; i++) {
        if (_tracked_resources[i].type) {
            f2debug(_tracked_resources[i].type);
            compiled['cfn'] += outputMapCfn(i, _tracked_resources[i].service, _tracked_resources[i].type, _tracked_resources[i].options.cfn, _tracked_resources[i].region, _tracked_resources[i].was_blocked, _tracked_resources[i].logicalId, cfn_deletion_policy, _tracked_resources, state);
            if (['typescript', 'python', 'java', 'dotnet'].includes(iaclangselect)) {
                compiled['cdk'] += outputMapCdk(i, _tracked_resources[i].service, _tracked_resources[i].type, _tracked_resources[i].options.cfn, _tracked_resources[i].region, _tracked_resources[i].was_blocked, _tracked_resources[i].logicalId, _tracked_resources, state);
                compiled['cdkv2'] += outputMapCdkv2(i, _tracked_resources[i].service, _tracked_resources[i].type, _tracked_resources[i].options.cfn, _tracked_resources[i].region, _tracked_resources[i].was_blocked, _tracked_resources[i].logicalId, _tracked_resources, state);
            }
            compiled['troposphere'] += outputMapTroposphere(i, _tracked_resources[i].service, _tracked_resources[i].type, _tracked_resources[i].options.cfn, _tracked_resources[i].region, _tracked_resources[i].was_blocked, _tracked_resources[i].logicalId, _tracked_resources, state);
        }
        if (_tracked_resources[i].terraformType) {
            f2debug(_tracked_resources[i].terraformType);
            compiled['tf'] += outputMapTf(i, _tracked_resources[i].service, _tracked_resources[i].terraformType, _tracked_resources[i].options.tf, _tracked_resources[i].region, _tracked_resources[i].was_blocked, _tracked_resources[i].logicalId, _tracked_resources, state);
            if (['typescript'].includes(iaclangselect)) {
                compiled['pulumi'] += outputMapPulumi(i, _tracked_resources[i].service, _tracked_resources[i].terraformType, _tracked_resources[i].options.tf, _tracked_resources[i].region, _tracked_resources[i].was_blocked, _tracked_resources[i].logicalId, _tracked_resources, state);
                compiled['cdktf'] += outputMapCdktf(i, _tracked_resources[i].service, _tracked_resources[i].terraformType, _tracked_resources[i].options.tf, _tracked_resources[i].region, _tracked_resources[i].was_blocked, _tracked_resources[i].logicalId, _tracked_resources, state);
            }
        }
    }

    if (_tracked_resources.length && compiled['cdk'].split('\n').length > 1) {
        compiled['cdk'] = compiled['cdk'].substring(0, compiled['cdk'].length - 1);
        compiled['cdkv2'] = compiled['cdkv2'].substring(0, compiled['cdkv2'].length - 1);
    }

    if (_tracked_resources.length) {
        compiled['cdk'] = _appendCdkFooter(compiled['cdk'], iaclangselect, _tracked_resources);
        compiled['cdkv2'] = _appendCdkv2Footer(compiled['cdkv2'], iaclangselect, _tracked_resources);

        if (compiled['troposphere'].split('\n').length > 1) {
            compiled['troposphere'] += 'print(template.to_yaml())\n';
        }
        if (compiled['cdktf'].split('\n').length > 1) {
            if (iaclangselect == "typescript") {
                for (var i = 0; i < _tracked_resources.length; i++) {
                    if (_tracked_resources[i].terraformType) {
                        if (['typescript'].includes(iaclangselect)) {
                            compiled['cdktf'] += "        new TerraformOutput(this, '" + _tracked_resources[i].logicalId.toLowerCase() + "', {\n            value: " + _tracked_resources[i].logicalId.toLowerCase() + "\n        });\n\n";
                        }
                    }
                }

                compiled['cdktf'] += "  }\n}\n\nconst app = new App();\nnew MyStack(app, 'my-stack');\napp.synth();\n";
            }
        }
    }

    return compiled;
}

/* ========================================================================== */
// CDK header/footer helpers (extracted for readability)
/* ========================================================================== */

function _buildCdkHeader(lang, has_cfn, services) {
    if (lang == "typescript") {
        return !has_cfn ? '// No resources generated' : "import * as cdk from '@aws-cdk/core';\n" +
            services.cdk.map(function(service) { return "import * as " + service + " from '@aws-cdk/aws-" + service + "';"; }).join('\n') +
            "\n\nexport class MyStack extends cdk.Stack {\n    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {\n        super(scope, id, props);\n\n";
    } else if (lang == "python") {
        return !has_cfn ? '# No resources generated' : "from aws_cdk import (\n" +
            services.cdk.map(function(service) { return "    aws_" + service + " as " + ((service == "lambda") ? "_lambda" : service) + ","; }).join('\n') +
            "\n    core as cdk\n)\n\nclass MyStack(cdk.Stack):\n    def __init__(self, scope: cdk.Construct, id: str, **kwargs) -> None:\n        super().__init__(scope, id, **kwargs)\n\n";
    } else if (lang == "java") {
        return !has_cfn ? '// No resources generated' : "package com.myorg;\n\nimport software.amazon.awscdk.core.Construct;\nimport software.amazon.awscdk.core.Stack;\nimport software.amazon.awscdk.core.StackProps;\nimport software.amazon.awscdk.core.CfnResource;\n\nimport java.util.Arrays;\nimport java.util.HashMap;\n\npublic class MyStack extends Stack {\n    public MyStack(final Construct scope, final String id) {\n        this(scope, id, null);\n    }\n\n    public MyStack(final Construct scope, final String id, final StackProps props) {\n        super(scope, id, props);\n        \n";
    } else if (lang == "dotnet") {
        return !has_cfn ? '// No resources generated' : "using Amazon.CDK;\nusing System.Collections.Generic;\n\nnamespace My\n{\n    public class MyStack : Stack\n    {\n        public MyStack(Construct scope, string id, IStackProps props = null) : base(scope, id, props)\n        {\n";
    }
    return '// Selected programming language not supported for this output';
}

function _buildCdkv2Header(lang, has_cfn, services) {
    if (lang == "typescript") {
        return !has_cfn ? '// No resources generated' : "import * as cdk from 'aws-cdk-lib';\n" +
            services.cdkv2.map(function(service) { return "import * as " + service + " from 'aws-cdk-lib/aws-" + service + "';"; }).join('\n') +
            "\n\nexport class MyStack extends cdk.Stack {\n    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {\n        super(scope, id, props);\n\n";
    } else if (lang == "python") {
        return !has_cfn ? '# No resources generated' : "from aws_cdk import (\n" +
            services.cdkv2.map(function(service) { return "    aws_" + service + " as " + ((service == "lambda") ? "_lambda" : service) + ","; }).join('\n') +
            "\n    core as cdk\n)\n\nclass MyStack(cdk.Stack):\n    def __init__(self, scope: cdk.Construct, id: str, **kwargs) -> None:\n        super().__init__(scope, id, **kwargs)\n\n";
    } else if (lang == "java") {
        return !has_cfn ? '// No resources generated' : "package com.myorg;\n\nimport software.amazon.awscdk.core.Construct;\nimport software.amazon.awscdk.core.Stack;\nimport software.amazon.awscdk.core.StackProps;\nimport software.amazon.awscdk.core.CfnResource;\n\nimport java.util.Arrays;\nimport java.util.HashMap;\n\npublic class MyStack extends Stack {\n    public MyStack(final Construct scope, final String id) {\n        this(scope, id, null);\n    }\n\n    public MyStack(final Construct scope, final String id, final StackProps props) {\n        super(scope, id, props);\n        \n";
    } else if (lang == "dotnet") {
        return !has_cfn ? '// No resources generated' : "using Amazon.CDK;\nusing System.Collections.Generic;\n\nnamespace My\n{\n    public class MyStack : Stack\n    {\n        public MyStack(Construct scope, string id, IStackProps props = null) : base(scope, id, props)\n        {\n";
    }
    return '// Selected programming language not supported for this output';
}

function _appendCdkFooter(compiled_cdk, lang, _tracked_resources) {
    if (compiled_cdk.split('\n').length > 1) {
        if (lang == "typescript") {
            compiled_cdk += "\n    }\n}\n\nconst app = new cdk.App();\nnew MyStack(app, 'my-stack-name', { env: { region: '" + _tracked_resources[0].region + "' } });\napp.synth();\n";
        } else if (lang == "python") {
            compiled_cdk += "\n\napp = cdk.App()\nMyStack(app, \"my-stack-name\", env={'region': '" + _tracked_resources[0].region + "'})\napp.synth()\n";
        } else if (lang == "java") {
            compiled_cdk += "    }\n}        \n";
        } else if (lang == "dotnet") {
            compiled_cdk += "\n        }\n    }\n}\n";
        }
    }
    return compiled_cdk;
}

function _appendCdkv2Footer(compiled_cdkv2, lang, _tracked_resources) {
    if (compiled_cdkv2.split('\n').length > 1) {
        if (lang == "typescript") {
            compiled_cdkv2 += "\n    }\n}\n\nconst app = new cdk.App();\nnew MyStack(app, 'my-stack-name', { env: { region: '" + _tracked_resources[0].region + "' } });\napp.synth();\n";
        } else if (lang == "python") {
            compiled_cdkv2 += "\n\napp = cdk.App()\nMyStack(app, \"my-stack-name\", env={'region': '" + _tracked_resources[0].region + "'})\napp.synth()\n";
        } else if (lang == "java") {
            compiled_cdkv2 += "    }\n}        \n";
        } else if (lang == "dotnet") {
            compiled_cdkv2 += "\n        }\n    }\n}\n";
        }
    }
    return compiled_cdkv2;
}

/* ========================================================================== */
// State accessors — allow consumers to configure module state
/* ========================================================================== */

function getState() {
    return {
        outputs: outputs,
        tracked_resources: tracked_resources,
        global_used_refs: global_used_refs,
        cfnspacing: cfnspacing,
        logicalidstrategy: logicalidstrategy,
        service_mapping_functions: service_mapping_functions,
        tracked_relationships: tracked_relationships,
        include_default_resources: include_default_resources,
        iaclangselect: iaclangselect,
        stack_parameters: stack_parameters,
        check_objects: check_objects,
    };
}

function setState(newState) {
    if ('outputs' in newState) outputs = newState.outputs;
    if ('tracked_resources' in newState) tracked_resources = newState.tracked_resources;
    if ('global_used_refs' in newState) global_used_refs = newState.global_used_refs;
    if ('cfnspacing' in newState) cfnspacing = newState.cfnspacing;
    if ('logicalidstrategy' in newState) logicalidstrategy = newState.logicalidstrategy;
    if ('service_mapping_functions' in newState) service_mapping_functions = newState.service_mapping_functions;
    if ('tracked_relationships' in newState) tracked_relationships = newState.tracked_relationships;
    if ('include_default_resources' in newState) include_default_resources = newState.include_default_resources;
    if ('iaclangselect' in newState) iaclangselect = newState.iaclangselect;
    if ('stack_parameters' in newState) stack_parameters = newState.stack_parameters;
    if ('check_objects' in newState) check_objects = newState.check_objects;
}

function setLogFunctions(log, trace, debug) {
    if (log) f2log = log;
    if (trace) f2trace = trace;
    if (debug) f2debug = debug;
}

module.exports = {
    performF2Mappings,
    compileOutputs,
    getResourceName,
    getLogicalToPhysicalIdMap,
    MD5,
    getState,
    setState,
    setLogFunctions,
};
