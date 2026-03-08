// cli/sdk-v3-shim.js
//
// AWS SDK v3 shim for Former2 CLI.
// Provides a drop-in replacement for the v2 sdkcall() global by translating
// v2-style service/method calls into v3 client.send(Command) calls.
// Replicates the exact pagination and retry logic from js/datatables.js.

var deepmerge = require("deepmerge");

// Maps v2 constructor name -> v3 package suffix (after "@aws-sdk/client-")
var SERVICE_PACKAGES = {
    "ACM": "acm",
    "ACMPCA": "acm-pca",
    "APIGateway": "api-gateway",
    "AccessAnalyzer": "accessanalyzer",
    "Amp": "amp",
    "Amplify": "amplify",
    "AmplifyUIBuilder": "amplifyuibuilder",
    "ApiGatewayV2": "apigatewayv2",
    "AppConfig": "appconfig",
    "AppIntegrations": "appintegrations",
    "AppMesh": "app-mesh",
    "AppRunner": "apprunner",
    "AppStream": "appstream",
    "AppSync": "appsync",
    "Appflow": "appflow",
    "ApplicationAutoScaling": "application-auto-scaling",
    "ApplicationInsights": "application-insights",
    "Athena": "athena",
    "AuditManager": "auditmanager",
    "AutoScaling": "auto-scaling",
    "AutoScalingPlans": "auto-scaling-plans",
    "Backup": "backup",
    "Batch": "batch",
    "Billingconductor": "billingconductor",
    "Budgets": "budgets",
    "CUR": "cost-and-usage-report-service",
    "Cloud9": "cloud9",
    "CloudFront": "cloudfront",
    "CloudHSMV2": "cloudhsm-v2",
    "CloudTrail": "cloudtrail",
    "CloudWatch": "cloudwatch",
    "CloudWatchLogs": "cloudwatch-logs",
    "CodeArtifact": "codeartifact",
    "CodeBuild": "codebuild",
    "CodeCommit": "codecommit",
    "CodeDeploy": "codedeploy",
    "CodeGuruProfiler": "codeguruprofiler",
    "CodeGuruReviewer": "codeguru-reviewer",
    "CodePipeline": "codepipeline",
    "CodeStarNotifications": "codestar-notifications",
    "CodeStarconnections": "codestar-connections",
    "CognitoIdentity": "cognito-identity",
    "CognitoIdentityServiceProvider": "cognito-identity-provider",
    "ConfigService": "config-service",
    "Connect": "connect",
    "CostExplorer": "cost-explorer",
    "CustomerProfiles": "customer-profiles",
    "DAX": "dax",
    "DLM": "dlm",
    "DMS": "database-migration-service",
    "DataBrew": "databrew",
    "DataPipeline": "data-pipeline",
    "DataSync": "datasync",
    "Detective": "detective",
    "DevOpsGuru": "devops-guru",
    "DeviceFarm": "device-farm",
    "DirectConnect": "direct-connect",
    "DirectoryService": "directory-service",
    "DocDB": "docdb",
    "DynamoDB": "dynamodb",
    "DynamoDBStreams": "dynamodb-streams",
    "EC2": "ec2",
    "ECR": "ecr",
    "ECRPUBLIC": "ecr-public",
    "ECS": "ecs",
    "EFS": "efs",
    "EKS": "eks",
    "ELB": "elastic-load-balancing",
    "ELBv2": "elastic-load-balancing-v2",
    "EMR": "emr",
    "EMRServerless": "emr-serverless",
    "EMRcontainers": "emr-containers",
    "ES": "elasticsearch-service",
    "ElastiCache": "elasticache",
    "ElasticBeanstalk": "elastic-beanstalk",
    "EventBridge": "eventbridge",
    "FMS": "fms",
    "FSx": "fsx",
    "Finspace": "finspace",
    "Firehose": "firehose",
    "Fis": "fis",
    "ForecastService": "forecast",
    "FraudDetector": "frauddetector",
    "GameLift": "gamelift",
    "Glacier": "glacier",
    "GlobalAccelerator": "global-accelerator",
    "Glue": "glue",
    "Greengrass": "greengrass",
    "GreengrassV2": "greengrassv2",
    "GroundStation": "groundstation",
    "GuardDuty": "guardduty",
    "HealthLake": "healthlake",
    "IAM": "iam",
    "IVS": "ivs",
    "Imagebuilder": "imagebuilder",
    "Inspector": "inspector",
    "Inspector2": "inspector2",
    "IoTEvents": "iot-events",
    "IoTSiteWise": "iotsitewise",
    "IoTThingsGraph": "iotthingsgraph",
    "IoTTwinMaker": "iottwinmaker",
    "IoTWireless": "iot-wireless",
    "Iot": "iot",
    "IotDeviceAdvisor": "iotdeviceadvisor",
    "KMS": "kms",
    "Kafka": "kafka",
    "KafkaConnect": "kafkaconnect",
    "Kendra": "kendra",
    "Kinesis": "kinesis",
    "KinesisAnalytics": "kinesis-analytics",
    "KinesisAnalyticsV2": "kinesis-analytics-v2",
    "KinesisVideo": "kinesis-video",
    "LakeFormation": "lakeformation",
    "Lambda": "lambda",
    "LexModelBuildingService": "lex-model-building-service",
    "LexModelsV2": "lex-models-v2",
    "LicenseManager": "license-manager",
    "Lightsail": "lightsail",
    "Location": "location",
    "LookoutEquipment": "lookoutequipment",
    "MQ": "mq",
    "MWAA": "mwaa",
    "Macie": "macie2",
    "Macie2": "macie2",
    "ManagedBlockchain": "managedblockchain",
    "MediaConnect": "mediaconnect",
    "MediaConvert": "mediaconvert",
    "MediaLive": "medialive",
    "MediaPackage": "mediapackage",
    "MediaStore": "mediastore",
    "MemoryDB": "memorydb",
    "MigrationHubRefactorSpaces": "migration-hub-refactor-spaces",
    "Neptune": "neptune",
    "NetworkFirewall": "network-firewall",
    "NetworkManager": "networkmanager",
    "Organizations": "organizations",
    "Panorama": "panorama",
    "Personalize": "personalize",
    "Pinpoint": "pinpoint",
    "PinpointEmail": "pinpoint-email",
    "Pipes": "pipes",
    "QuickSight": "quicksight",
    "RAM": "ram",
    "RDS": "rds",
    "RUM": "rum",
    "Redshift": "redshift",
    "RedshiftServerless": "redshift-serverless",
    "Rekognition": "rekognition",
    "Resiliencehub": "resiliencehub",
    "ResourceGroups": "resource-groups",
    "ResourceGroupsTaggingAPI": "resource-groups-tagging-api",
    "Route53": "route-53",
    // SimpleDB has no v3 package; calls to this service will fail gracefully at runtime
    "Route53RecoveryControlConfig": "route53-recovery-control-config",
    "Route53RecoveryReadiness": "route53-recovery-readiness",
    "Route53Resolver": "route53resolver",
    "S3": "s3",
    "S3Control": "s3-control",
    "S3Outposts": "s3outposts",
    "SES": "ses",
    "SESV2": "sesv2",
    "SNS": "sns",
    "SQS": "sqs",
    "SSM": "ssm",
    "SSMContacts": "ssm-contacts",
    "SSMIncidents": "ssm-incidents",
    "SSOAdmin": "sso-admin",
    "STS": "sts",
    "SWF": "swf",
    "SageMaker": "sagemaker",
    "Scheduler": "scheduler",
    "Schemas": "schemas",
    "SecretsManager": "secrets-manager",
    "SecurityHub": "securityhub",
    "ServiceCatalog": "service-catalog",
    "ServiceCatalogAppRegistry": "service-catalog-appregistry",
    "ServiceDiscovery": "servicediscovery",
    "ServiceQuotas": "service-quotas",
    "Signer": "signer",
    "StepFunctions": "sfn",
    "StorageGateway": "storage-gateway",
    "Synthetics": "synthetics",
    "TimestreamQuery": "timestream-query",
    "TimestreamWrite": "timestream-write",
    "Transfer": "transfer",
    "VoiceID": "voice-id",
    "WAF": "waf",
    "WAFRegional": "waf-regional",
    "WAFV2": "wafv2",
    "Wisdom": "wisdom",
    "WorkSpaces": "workspaces",
    "XRay": "xray"
};

var clientCache = {};
var sharedConfig = { region: "us-east-1", credentials: null, requestHandler: null };

function methodToCommandName(method) {
    return method.charAt(0).toUpperCase() + method.slice(1) + "Command";
}

function getClient(svc, regionOverride) {
    var effectiveRegion = regionOverride || sharedConfig.region;
    var cacheKey = svc + ":" + effectiveRegion;
    if (!clientCache[cacheKey]) {
        var pkgSuffix = SERVICE_PACKAGES[svc];
        if (!pkgSuffix) {
            throw new Error("Unknown AWS service in v3 shim: " + svc);
        }
        var pkgName = "@aws-sdk/client-" + pkgSuffix;
        var pkg;
        try {
            pkg = require(pkgName);
        } catch (e) {
            throw new Error("Could not load v3 package " + pkgName + " for service " + svc + ": " + e.message);
        }
        // Find the client class (ends with "Client", skip internal/base classes)
        var clientKeys = Object.keys(pkg).filter(function(k) {
            return k.endsWith("Client") && k !== "Client" && !k.startsWith("_");
        });
        if (clientKeys.length === 0) {
            throw new Error("Could not find client class in " + pkgName);
        }
        var ClientClass = pkg[clientKeys[0]];
        var opts = {
            region: effectiveRegion,
            customUserAgent: [["former2", "latest"]],
            maxAttempts: 1 // Disable built-in retry; we replicate v2 retry logic ourselves
        };
        if (sharedConfig.credentials) {
            opts.credentials = sharedConfig.credentials;
        }
        if (sharedConfig.requestHandler) {
            opts.requestHandler = sharedConfig.requestHandler;
        }
        clientCache[cacheKey] = { client: new ClientClass(opts), pkg: pkg };
    }
    return clientCache[cacheKey];
}

function isThrottleError(err) {
    return err.code === "TooManyRequestsException" ||
        err.message === "Too Many Requests" ||
        err.code === "ThrottlingException" ||
        err.message === "Rate exceeded" ||
        err.code === "TimeoutError" ||
        err.code === "RequestLimitExceeded";
}

function createSdkcallV3(logger, report) {
    var log = logger || {};
    var _f2debug = log.f2debug || function(){};
    var _f2log = log.f2log || function(){};
    var _f2trace = log.f2trace || function(){};
    var _report = report || null;

    async function sdkcallV3(svc, method, params, alert_on_errors, backoff) {
        _f2debug(String(svc) + "." + String(method) + " - " + JSON.stringify(params));

        var regionOverride = null;
        if (svc === "GlobalAccelerator") {
            regionOverride = "us-west-2";
        } else if (svc === "CostExplorer") {
            regionOverride = "us-east-1";
        }

        var cached = getClient(svc, regionOverride);
        var client = cached.client;
        var pkg = cached.pkg;

        var commandName = methodToCommandName(method);
        var CommandClass = pkg[commandName];
        if (!CommandClass) {
            throw new Error("Unknown command " + commandName + " for service " + svc);
        }

        var data;
        try {
            var command = new CommandClass(params);
            data = await client.send(command);
            // Strip v3 metadata to match v2 response shape
            delete data.$metadata;
        } catch (err) {
            // Normalize v3 error shape: v3 uses err.name, v2 uses err.code
            if (!err.code && err.name) {
                err.code = err.name;
            }

            // Throttle retry (replicates v2 sdkcall retry logic from datatables.js)
            if (isThrottleError(err)) {
                if (backoff) {
                    _f2log("Too many requests for " + svc + "." + method + ", sleeping for " + backoff + "ms");
                    await new Promise(function(r) { setTimeout(r, backoff); });
                    backoff *= 2;
                    if (backoff > 120000) {
                        throw err;
                    }
                } else {
                    _f2log("Too many requests for " + svc + "." + method + ", sleeping for 500ms");
                    await new Promise(function(r) { setTimeout(r, 500); });
                    backoff = 500 + Math.floor(Math.random() * 500);
                }
                return await sdkcallV3(svc, method, params, alert_on_errors, backoff);
            }

            // Non-throttle error handling (replicates v2 logic, minus browser-specific $.notify)
            if (err.code === "NetworkingError") {
                _f2log("Skipping " + svc + "." + method + " NetworkingError");
                if (_report) { _report.networkErrors.push({ service: svc, method: method }); }
            } else if (err.code === "AccessDeniedException" || err.code === "AccessDenied") {
                _f2log("Skipping " + svc + "." + method + " AccessDeniedException");
                if (_report) { _report.accessDenied.push({ service: svc, method: method }); }
            } else if (err.code === "UnknownError" && svc === "MediaStore") {
                _f2log("Skipping " + svc + "." + method + " UnknownError");
                if (_report) { _report.networkErrors.push({ service: svc, method: method, code: "UnknownError" }); }
            } else if (err.code === "AccessDeniedException" && svc === "FSx") {
                _f2log("Skipping " + svc + "." + method + " AccessDeniedException");
                if (_report) { _report.accessDenied.push({ service: svc, method: method }); }
            } else if (alert_on_errors) {
                _f2log("Error calling " + svc + "." + method + ". " + (err.message || JSON.stringify(err)));
                _f2trace(err);
                if (_report) { _report.errors.push({ service: svc, method: method, message: err.message || String(err), code: err.code }); }
            }

            throw err;
        }

        // Empty response check (matches v2 behavior)
        if (!data || Object.keys(data).length === 0) {
            throw data;
        }

        // Pagination logic — replicated exactly from v2 sdkcall (datatables.js lines 336-564)
        // https://github.com/iann0036/aws-pagination-rules
        if (svc === "CloudWatchLogs" && method === "describeLogStreams") {
            return data;
        } else if (data.NextToken) {
            params["NextToken"] = data.NextToken;
            var newdata = await sdkcallV3(svc, method, params, alert_on_errors);
            return deepmerge.all([data, newdata]);
        } else if (data.nextToken) {
            params["nextToken"] = data.nextToken;
            var newdata = await sdkcallV3(svc, method, params, alert_on_errors);
            return deepmerge.all([data, newdata]);
        } else if (data.DistributionList && data.DistributionList.NextMarker) {
            if (params && params["Marker"] === data.DistributionList.NextMarker) {
                return data;
            }
            params["Marker"] = data.DistributionList.NextMarker;
            var newdata = await sdkcallV3(svc, method, params, alert_on_errors);
            return deepmerge.all([data, newdata]);
        } else if (data.NextMarker) {
            if (params && params["Marker"] && data && data.NextMarker && params["Marker"] === data.NextMarker) {
                return data;
            }
            if (["WAF", "WAFRegional", "WAFV2"].includes(svc)) {
                params["NextMarker"] = data.NextMarker;
            } else {
                params["Marker"] = data.NextMarker;
            }
            var newdata = await sdkcallV3(svc, method, params, alert_on_errors);
            return deepmerge.all([data, newdata]);
        } else if (data.NextPageMarker) { // Route53Domains
            params["Marker"] = data.NextPageMarker;
            var newdata = await sdkcallV3(svc, method, params, alert_on_errors);
            return deepmerge.all([data, newdata]);
        } else if (data.Marker && !["WAF", "WAFRegional", "WAFV2", "Route53", "EFS", "ELB", "ELBv2", "KMS", "Lambda"].includes(svc)) {
            if (svc === "Glacier") {
                params["marker"] = data.Marker;
            } else {
                params["Marker"] = data.Marker;
            }
            var newdata = await sdkcallV3(svc, method, params, alert_on_errors);
            return deepmerge.all([data, newdata]);
        } else if (data.NextPageToken) {
            if (svc === "CostExplorer") {
                params["NextPageToken"] = data.NextPageToken;
            } else {
                params["PageToken"] = data.NextPageToken;
            }
            var newdata = await sdkcallV3(svc, method, params, alert_on_errors);
            return deepmerge.all([data, newdata]);
        } else if (data.NextContinuationToken) { // S3
            params["ContinuationToken"] = data.NextContinuationToken;
            var newdata = await sdkcallV3(svc, method, params, alert_on_errors);
            return deepmerge.all([data, newdata]);
        } else if (data.PaginationToken) { // ResourceGroupsTaggingAPI
            params["PaginationToken"] = data.PaginationToken;
            var newdata = await sdkcallV3(svc, method, params, alert_on_errors);
            return deepmerge.all([data, newdata]);
        } else if (data.nextMarker) { // Iot
            params["marker"] = data.nextMarker;
            var newdata = await sdkcallV3(svc, method, params, alert_on_errors);
            return deepmerge.all([data, newdata]);
        } else if (data.nextPageToken) {
            if (svc === "SWF") {
                params["nextPageToken"] = data.nextPageToken;
            } else {
                params["pageToken"] = data.nextPageToken; // Lightsail
            }
            var newdata = await sdkcallV3(svc, method, params, alert_on_errors);
            return deepmerge.all([data, newdata]);
        } else if (data.marker) { // DataPipeline
            params["marker"] = data.marker;
            var newdata = await sdkcallV3(svc, method, params, alert_on_errors);
            return deepmerge.all([data, newdata]);
        } else if (data.position && svc === "APIGateway") {
            params["position"] = data.position;
            var newdata = await sdkcallV3(svc, method, params, alert_on_errors);
            return deepmerge.all([data, newdata]);
        } else if (svc === "CloudFront" && typeof data === "object" && Object.keys(data).length && data[Object.keys(data)[0]] && data[Object.keys(data)[0]]["NextMarker"]) {
            params["Marker"] = data[Object.keys(data)[0]]["NextMarker"];
            var newdata = await sdkcallV3(svc, method, params, alert_on_errors);
            return deepmerge.all([data, newdata]);
        } else if (svc === "Pinpoint" && typeof data === "object" && Object.keys(data).length && data[Object.keys(data)[0]] && data[Object.keys(data)[0]]["NextToken"]) {
            params["Token"] = data[Object.keys(data)[0]]["NextToken"];
            var newdata = await sdkcallV3(svc, method, params, alert_on_errors);
            return deepmerge.all([data, newdata]);
        } else if (svc === "DynamoDB" && method === "listGlobalTables" && data.LastEvaluatedGlobalTableName) {
            params["ExclusiveStartGlobalTableName"] = data.LastEvaluatedGlobalTableName;
            var newdata = await sdkcallV3(svc, method, params, alert_on_errors);
            return deepmerge.all([data, newdata]);
        } else if (svc === "DynamoDB" && method === "listTables" && data.LastEvaluatedTableName) {
            params["ExclusiveStartTableName"] = data.LastEvaluatedTableName;
            var newdata = await sdkcallV3(svc, method, params, alert_on_errors);
            return deepmerge.all([data, newdata]);
        } else if (svc === "DynamoDBStreams" && method === "listStreams" && data.LastEvaluatedStreamArn) {
            params["ExclusiveStartStreamArn"] = data.LastEvaluatedStreamArn;
            var newdata = await sdkcallV3(svc, method, params, alert_on_errors);
            return deepmerge.all([data, newdata]);
        } else if (svc === "Firehose" && method === "listDeliveryStreams" && data.DeliveryStreamNames && data.DeliveryStreamNames.length) {
            params["ExclusiveStartDeliveryStreamName"] = data.DeliveryStreamNames[data.DeliveryStreamNames.length - 1];
            var newdata = await sdkcallV3(svc, method, params, alert_on_errors);
            return deepmerge.all([data, newdata]);
        } else if (svc === "Kinesis" && method === "listStreams" && data.StreamNames && data.StreamNames.length) {
            params["ExclusiveStartStreamName"] = data.StreamNames[data.StreamNames.length - 1];
            var newdata = await sdkcallV3(svc, method, params, alert_on_errors);
            return deepmerge.all([data, newdata]);
        } else if (svc === "KinesisAnalytics" && method === "listApplications" && data.ApplicationSummaries && data.ApplicationSummaries.length) {
            params["ExclusiveStartApplicationName"] = data.ApplicationSummaries[data.ApplicationSummaries.length - 1].ApplicationName;
            var newdata = await sdkcallV3(svc, method, params, alert_on_errors);
            return deepmerge.all([data, newdata]);
        }

        return data;
    }

    return sdkcallV3;
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
    // Clear cache so new clients pick up new settings
    clientCache = {};
}

module.exports = { createSdkcallV3: createSdkcallV3, configureV3: configureV3, sharedConfig: sharedConfig, SERVICE_PACKAGES: SERVICE_PACKAGES };
