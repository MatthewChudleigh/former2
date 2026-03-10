/**
 * Stage 4 validation test: verify that the shared/mappings/ modules produce
 * identical output to the original js/mappings.js.
 *
 * Strategy:
 *   1. Load js/mappings.js into a VM context (as the CLI does)
 *   2. Prepare identical tracked_resources + state in both
 *   3. Run compileOutputs on both paths
 *   4. Compare all output formats
 */

var vm = require('vm');
var fs = require('fs');
var path = require('path');

var sharedMappings = require('../../shared/mappings/index');
var { MD5: sharedMD5 } = require('../../shared/mappings/helpers');

// ---------------------------------------------------------------------------
// Helper: set up a VM context that mirrors what cli/main.js creates, but
// minimal — just enough for mappings.js to evaluate and run compileOutputs.
// ---------------------------------------------------------------------------
function createOriginalContext() {
    var ctx = vm.createContext({
        CLI: true,
        console: console,
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        setInterval: setInterval,
        clearInterval: clearInterval,
        Promise: Promise,
        Buffer: Buffer,
        $: (function () {
            function $(sel) { return new $obj(sel); }
            function $obj() { }
            $obj.prototype.bootstrapTable = function () { };
            $obj.prototype.deferredBootstrapTable = function () { };
            $.notify = function () { };
            return $;
        })(),
        window: undefined,
        AWS: {},
        _AWS: {},
        deepmerge: require('deepmerge'),
    });

    // Load mappings.js into the context
    vm.runInContext(
        fs.readFileSync(path.join(__dirname, '../../js/mappings.js'), 'utf8'),
        ctx,
        { filename: 'js/mappings.js' }
    );

    return ctx;
}

// ---------------------------------------------------------------------------
// Fixtures: realistic tracked_resources as produced by service mapping functions
// ---------------------------------------------------------------------------

function makeTrackedResources() {
    return [
        {
            'obj': {
                id: 'arn:aws:s3:::my-test-bucket',
                type: 's3.bucket',
                data: { Name: 'my-test-bucket', CreationDate: '2024-01-01T00:00:00Z' },
                region: 'us-east-1'
            },
            'logicalId': 'S3Bucket',
            'region': 'us-east-1',
            'service': 's3',
            'type': 'AWS::S3::Bucket',
            'terraformType': 'aws_s3_bucket',
            'options': {
                'boto3': {},
                'go': {},
                'cfn': {
                    'BucketName': 'my-test-bucket'
                },
                'cli': {},
                'tf': {
                    'bucket': 'my-test-bucket'
                },
                'pulumi': {},
                'cdktf': {},
                'iam': {}
            },
            'returnValues': {
                'Ref': 'my-test-bucket',
                'Import': { 'BucketName': 'my-test-bucket' },
                'Terraform': {
                    'id': 'my-test-bucket',
                    'arn': 'arn:aws:s3:::my-test-bucket'
                }
            },
            'was_blocked': false
        },
        {
            'obj': {
                id: 'arn:aws:lambda:us-east-1:123456789012:function:my-func',
                type: 'lambda.function',
                data: {
                    Configuration: {
                        FunctionName: 'my-func',
                        Runtime: 'nodejs18.x',
                        Handler: 'index.handler',
                        MemorySize: 128,
                        Timeout: 30,
                        FunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:my-func'
                    }
                },
                region: 'us-east-1'
            },
            'logicalId': 'LambdaFunction',
            'region': 'us-east-1',
            'service': 'lambda',
            'type': 'AWS::Lambda::Function',
            'terraformType': 'aws_lambda_function',
            'options': {
                'boto3': {},
                'go': {},
                'cfn': {
                    'FunctionName': 'my-func',
                    'Runtime': 'nodejs18.x',
                    'Handler': 'index.handler',
                    'MemorySize': 128,
                    'Timeout': 30
                },
                'cli': {},
                'tf': {
                    'function_name': 'my-func',
                    'runtime': 'nodejs18.x',
                    'handler': 'index.handler',
                    'memory_size': 128,
                    'timeout': 30
                },
                'pulumi': {},
                'cdktf': {},
                'iam': {}
            },
            'returnValues': {
                'Ref': 'my-func',
                'Terraform': {
                    'id': 'my-func',
                    'arn': 'arn:aws:lambda:us-east-1:123456789012:function:my-func'
                }
            },
            'was_blocked': false
        }
    ];
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Stage 4 parity: shared/mappings vs js/mappings.js', function () {

    describe('MD5', function () {
        var ctx;

        beforeAll(function () {
            ctx = createOriginalContext();
        });

        test('shared MD5 matches original MD5', function () {
            var inputs = [
                '',
                'hello',
                'arn:aws:s3:::my-bucket',
                'AWS::Lambda::Function',
                'a'.repeat(1000)
            ];
            inputs.forEach(function (input) {
                var original = vm.runInContext('MD5(' + JSON.stringify(input) + ')', ctx);
                var shared = sharedMD5(input);
                expect(shared).toBe(original);
            });
        });
    });

    describe('getResourceName', function () {
        var ctx;

        beforeEach(function () {
            ctx = createOriginalContext();
            // Reset global_used_refs in original
            vm.runInContext('global_used_refs = {}; check_objects = [];', ctx);
            // Reset in shared module
            sharedMappings.setState({ global_used_refs: {}, check_objects: [] });
        });

        test('produces identical logical IDs for default strategy', function () {
            var cases = [
                ['s3', 'arn:aws:s3:::my-bucket', 'AWS::S3::Bucket'],
                ['lambda', 'arn:aws:lambda:us-east-1:123:function:fn', 'AWS::Lambda::Function'],
                ['ec2', 'i-0abcdef', 'AWS::EC2::Instance'],
            ];
            cases.forEach(function (args) {
                var original = vm.runInContext(
                    'getResourceName(' + JSON.stringify(args[0]) + ',' + JSON.stringify(args[1]) + ',' + JSON.stringify(args[2]) + ')',
                    ctx
                );
                var shared = sharedMappings.getResourceName(args[0], args[1], args[2]);
                expect(shared).toBe(original);
            });
        });

        test('handles duplicate resource names with index suffix', function () {
            // Register same type twice — second should get index suffix
            var orig1 = vm.runInContext('getResourceName("s3", "bucket-1", "AWS::S3::Bucket")', ctx);
            var orig2 = vm.runInContext('getResourceName("s3", "bucket-2", "AWS::S3::Bucket")', ctx);

            var shared1 = sharedMappings.getResourceName('s3', 'bucket-1', 'AWS::S3::Bucket');
            var shared2 = sharedMappings.getResourceName('s3', 'bucket-2', 'AWS::S3::Bucket');

            expect(shared1).toBe(orig1);
            expect(shared2).toBe(orig2);
            // Second should have suffix
            expect(shared2).toMatch(/\d$/);
        });
    });

    describe('performF2Mappings', function () {
        test('invokes mapping functions and returns tracked_resources', function () {
            var mapFn = function (reqParams, obj, tracked_resources) {
                if (obj.type === 'test.resource') {
                    tracked_resources.push({
                        'logicalId': 'TestResource',
                        'region': obj.region,
                        'service': 'test',
                        'type': 'AWS::Test::Resource',
                        'options': reqParams
                    });
                    return true;
                }
                return false;
            };

            var objects = [
                { id: 'test-1', type: 'test.resource', data: {}, region: 'us-east-1' }
            ];

            var result = sharedMappings.performF2Mappings(objects, [mapFn]);
            expect(result).toHaveLength(1);
            expect(result[0].logicalId).toBe('TestResource');
            expect(result[0].type).toBe('AWS::Test::Resource');
        });

        test('handles mapping function errors gracefully', function () {
            sharedMappings.setLogFunctions(function () { }, function () { }, null);
            var badFn = function () { throw new Error('boom'); };
            var objects = [{ id: 'x', type: 'x', data: {}, region: 'us-east-1' }];

            // Should not throw
            var result = sharedMappings.performF2Mappings(objects, [badFn]);
            expect(result).toHaveLength(0);
        });

        test('resets global_used_refs between calls', function () {
            sharedMappings.setState({ global_used_refs: { 'stale': 'data' } });
            sharedMappings.performF2Mappings([], []);
            expect(sharedMappings.getLogicalToPhysicalIdMap()).toEqual({});
        });
    });

    describe('compileOutputs parity', function () {
        var ctx;
        var tracked;

        beforeEach(function () {
            ctx = createOriginalContext();
            tracked = makeTrackedResources();
        });

        function runOriginalCompileOutputs(trackedRes, deletionPolicy) {
            // Set up original context state
            vm.runInContext('outputs = []; iaclangselect = "typescript"; stack_parameters = []; check_objects = [];', ctx);
            ctx.tracked_resources_input = trackedRes;
            ctx.cfn_deletion_policy_input = deletionPolicy || null;
            return vm.runInContext(
                'compileOutputs(tracked_resources_input, cfn_deletion_policy_input)',
                ctx
            );
        }

        function runSharedCompileOutputs(trackedRes, deletionPolicy) {
            sharedMappings.setState({
                outputs: [],
                iaclangselect: 'typescript',
                stack_parameters: [],
                check_objects: [],
                global_used_refs: {},
                tracked_resources: [],
                cfnspacing: '    ',
                logicalidstrategy: 'longtypeprefixoptionalindexsuffix'
            });
            sharedMappings.setLogFunctions(function () { }, function () { }, function () { });
            return sharedMappings.compileOutputs(trackedRes, deletionPolicy);
        }

        test('CFN output matches', function () {
            var original = runOriginalCompileOutputs(tracked);
            var shared = runSharedCompileOutputs(tracked);
            expect(shared['cfn']).toBe(original['cfn']);
        });

        test('Terraform output matches', function () {
            var original = runOriginalCompileOutputs(tracked);
            var shared = runSharedCompileOutputs(tracked);
            expect(shared['tf']).toBe(original['tf']);
        });

        test('CDK v1 output matches', function () {
            var original = runOriginalCompileOutputs(tracked);
            var shared = runSharedCompileOutputs(tracked);
            expect(shared['cdk']).toBe(original['cdk']);
        });

        test('CDK v2 output matches', function () {
            var original = runOriginalCompileOutputs(tracked);
            var shared = runSharedCompileOutputs(tracked);
            expect(shared['cdkv2']).toBe(original['cdkv2']);
        });

        test('Troposphere output matches', function () {
            var original = runOriginalCompileOutputs(tracked);
            var shared = runSharedCompileOutputs(tracked);
            expect(shared['troposphere']).toBe(original['troposphere']);
        });

        test('Pulumi output matches', function () {
            var original = runOriginalCompileOutputs(tracked);
            var shared = runSharedCompileOutputs(tracked);
            expect(shared['pulumi']).toBe(original['pulumi']);
        });

        test('CDKTF output matches', function () {
            var original = runOriginalCompileOutputs(tracked);
            var shared = runSharedCompileOutputs(tracked);
            expect(shared['cdktf']).toBe(original['cdktf']);
        });

        test('all output formats match in a single pass', function () {
            var original = runOriginalCompileOutputs(tracked);
            var shared = runSharedCompileOutputs(tracked);

            var formats = ['cfn', 'tf', 'cdk', 'cdkv2', 'troposphere', 'pulumi', 'cdktf', 'iam'];
            formats.forEach(function (fmt) {
                expect(shared[fmt]).toBe(original[fmt]);
            });
        });

        test('CFN deletion policy matches', function () {
            var original = runOriginalCompileOutputs(tracked, 'Retain');
            var shared = runSharedCompileOutputs(tracked, 'Retain');
            expect(shared['cfn']).toBe(original['cfn']);
            expect(shared['cfn']).toContain('DeletionPolicy: "Retain"');
        });

        test('empty resources produce matching output', function () {
            var original = runOriginalCompileOutputs([]);
            var shared = runSharedCompileOutputs([]);

            expect(shared['cfn']).toBe(original['cfn']);
            expect(shared['tf']).toBe(original['tf']);
            expect(shared['cfn']).toContain('No resources generated');
            expect(shared['tf']).toContain('No resources generated');
        });
    });

    describe('compileOutputs structure', function () {
        test('returns all expected output format keys', function () {
            sharedMappings.setState({
                outputs: [],
                iaclangselect: 'typescript',
                stack_parameters: [],
                check_objects: [],
                global_used_refs: {},
                tracked_resources: [],
                cfnspacing: '    '
            });
            sharedMappings.setLogFunctions(function () { }, function () { }, function () { });
            var result = sharedMappings.compileOutputs(makeTrackedResources());

            var expectedKeys = ['boto3', 'go', 'cfn', 'tf', 'pulumi', 'cdktf', 'cli', 'js', 'cdk', 'cdkv2', 'iam', 'troposphere'];
            expectedKeys.forEach(function (key) {
                expect(result).toHaveProperty(key);
            });
        });

        test('CFN output contains resource types', function () {
            sharedMappings.setState({
                outputs: [],
                iaclangselect: 'typescript',
                stack_parameters: [],
                check_objects: [],
                global_used_refs: {},
                cfnspacing: '    '
            });
            sharedMappings.setLogFunctions(function () { }, function () { }, function () { });
            var result = sharedMappings.compileOutputs(makeTrackedResources());

            expect(result['cfn']).toContain('AWS::S3::Bucket');
            expect(result['cfn']).toContain('AWS::Lambda::Function');
            expect(result['cfn']).toContain('BucketName: "my-test-bucket"');
        });

        test('Terraform output contains resource types', function () {
            sharedMappings.setState({
                outputs: [],
                iaclangselect: 'typescript',
                stack_parameters: [],
                check_objects: [],
                global_used_refs: {},
                cfnspacing: '    '
            });
            sharedMappings.setLogFunctions(function () { }, function () { }, function () { });
            var result = sharedMappings.compileOutputs(makeTrackedResources());

            expect(result['tf']).toContain('aws_s3_bucket');
            expect(result['tf']).toContain('aws_lambda_function');
            expect(result['tf']).toContain('bucket = "my-test-bucket"');
        });
    });
});
