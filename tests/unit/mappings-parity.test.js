/**
 * Tests for shared/mappings/ modules.
 *
 * Previously this was a parity test comparing shared/mappings output against
 * the original js/mappings.js loaded via VM. Now that js/mappings.js has been
 * removed (Stage 8), these are standalone tests of the shared module.
 */

var sharedMappings = require('../../shared/mappings/index');
var { MD5: sharedMD5 } = require('../../shared/mappings/helpers');

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

describe('shared/mappings module tests', function () {

    describe('MD5', function () {
        test('produces consistent hashes', function () {
            var inputs = [
                '',
                'hello',
                'arn:aws:s3:::my-bucket',
                'AWS::Lambda::Function',
                'a'.repeat(1000)
            ];
            inputs.forEach(function (input) {
                var hash1 = sharedMD5(input);
                var hash2 = sharedMD5(input);
                expect(hash1).toBe(hash2);
                expect(typeof hash1).toBe('string');
                expect(hash1.length).toBe(32); // MD5 hex string
            });
        });
    });

    describe('getResourceName', function () {
        beforeEach(function () {
            sharedMappings.setState({ global_used_refs: {}, check_objects: [] });
        });

        test('produces logical IDs for default strategy', function () {
            var result = sharedMappings.getResourceName('s3', 'arn:aws:s3:::my-bucket', 'AWS::S3::Bucket');
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
        });

        test('handles duplicate resource names with index suffix', function () {
            var shared1 = sharedMappings.getResourceName('s3', 'bucket-1', 'AWS::S3::Bucket');
            var shared2 = sharedMappings.getResourceName('s3', 'bucket-2', 'AWS::S3::Bucket');

            expect(typeof shared1).toBe('string');
            expect(typeof shared2).toBe('string');
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

    describe('compileOutputs', function () {
        function runCompileOutputs(trackedRes, deletionPolicy) {
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

        test('returns all expected output format keys', function () {
            var result = runCompileOutputs(makeTrackedResources());

            var expectedKeys = ['boto3', 'go', 'cfn', 'tf', 'pulumi', 'cdktf', 'cli', 'js', 'cdk', 'cdkv2', 'iam', 'troposphere'];
            expectedKeys.forEach(function (key) {
                expect(result).toHaveProperty(key);
            });
        });

        test('CFN output contains resource types', function () {
            var result = runCompileOutputs(makeTrackedResources());

            expect(result['cfn']).toContain('AWS::S3::Bucket');
            expect(result['cfn']).toContain('AWS::Lambda::Function');
            expect(result['cfn']).toContain('BucketName: "my-test-bucket"');
        });

        test('Terraform output contains resource types', function () {
            var result = runCompileOutputs(makeTrackedResources());

            expect(result['tf']).toContain('aws_s3_bucket');
            expect(result['tf']).toContain('aws_lambda_function');
            expect(result['tf']).toContain('bucket = "my-test-bucket"');
        });

        test('CFN deletion policy works', function () {
            var result = runCompileOutputs(makeTrackedResources(), 'Retain');
            expect(result['cfn']).toContain('DeletionPolicy: "Retain"');
        });

        test('empty resources produce valid output', function () {
            var result = runCompileOutputs([]);

            expect(result['cfn']).toContain('No resources generated');
            expect(result['tf']).toContain('No resources generated');
        });
    });
});
