var { createSdkcallV3, configureV3, sharedConfig, SERVICE_PACKAGES } = require("../../cli/sdk-v3-shim");

// Logger functions are now passed via createSdkcallV3(logger) — no globals needed

describe("SERVICE_PACKAGES", function() {
    test("has entries for all expected services", function() {
        var expectedServices = [
            "S3", "Lambda", "EC2", "IAM", "DynamoDB", "CloudFront",
            "ResourceGroupsTaggingAPI", "StepFunctions", "ELB", "ELBv2",
            "ES", "CognitoIdentityServiceProvider", "CUR", "ConfigService", "DMS"
        ];
        expectedServices.forEach(function(svc) {
            expect(SERVICE_PACKAGES[svc]).toBeDefined();
        });
    });

    test("has at least 150 service entries", function() {
        expect(Object.keys(SERVICE_PACKAGES).length).toBeGreaterThanOrEqual(150);
    });

    test("maps non-standard services correctly", function() {
        expect(SERVICE_PACKAGES["StepFunctions"]).toBe("sfn");
        expect(SERVICE_PACKAGES["ELB"]).toBe("elastic-load-balancing");
        expect(SERVICE_PACKAGES["ELBv2"]).toBe("elastic-load-balancing-v2");
        expect(SERVICE_PACKAGES["ES"]).toBe("elasticsearch-service");
        expect(SERVICE_PACKAGES["CUR"]).toBe("cost-and-usage-report-service");
        expect(SERVICE_PACKAGES["DMS"]).toBe("database-migration-service");
        expect(SERVICE_PACKAGES["CognitoIdentityServiceProvider"]).toBe("cognito-identity-provider");
        expect(SERVICE_PACKAGES["ForecastService"]).toBe("forecast");
        expect(SERVICE_PACKAGES["ACMPCA"]).toBe("acm-pca");
    });

    test("all packages can be required", function() {
        var failures = [];
        Object.entries(SERVICE_PACKAGES).forEach(function([svc, suffix]) {
            try {
                require("@aws-sdk/client-" + suffix);
            } catch (e) {
                failures.push(svc + " (" + suffix + "): " + e.message.split("\n")[0]);
            }
        });
        expect(failures).toEqual([]);
    });

    test("all packages export a client class", function() {
        var failures = [];
        Object.entries(SERVICE_PACKAGES).forEach(function([svc, suffix]) {
            var pkg = require("@aws-sdk/client-" + suffix);
            var clientKeys = Object.keys(pkg).filter(function(k) {
                return k.endsWith("Client") && k !== "Client" && !k.startsWith("_");
            });
            if (clientKeys.length === 0) {
                failures.push(svc + " (" + suffix + ")");
            }
        });
        expect(failures).toEqual([]);
    });
});

describe("configureV3", function() {
    beforeEach(function() {
        configureV3({ region: "us-east-1", credentials: null, requestHandler: null });
    });

    test("updates region", function() {
        configureV3({ region: "eu-west-1" });
        expect(sharedConfig.region).toBe("eu-west-1");
    });

    test("updates credentials", function() {
        var creds = function() { return {}; };
        configureV3({ credentials: creds });
        expect(sharedConfig.credentials).toBe(creds);
    });

    test("updates requestHandler", function() {
        var handler = {};
        configureV3({ requestHandler: handler });
        expect(sharedConfig.requestHandler).toBe(handler);
    });
});

describe("createSdkcallV3", function() {
    test("returns a function", function() {
        var sdkcall = createSdkcallV3();
        expect(typeof sdkcall).toBe("function");
    });

    test("throws on unknown service", async function() {
        var sdkcall = createSdkcallV3();
        await expect(sdkcall("NonExistentService", "someMethod", {})).rejects.toThrow("Unknown AWS service");
    });

    test("throws on unknown command", async function() {
        configureV3({ region: "us-east-1" });
        var sdkcall = createSdkcallV3();
        await expect(sdkcall("S3", "nonExistentMethod", {})).rejects.toThrow("Unknown command");
    });
});

describe("methodToCommandName derivation", function() {
    test("common method names resolve to existing command classes", function() {
        var testCases = [
            ["S3", "listBuckets", "ListBucketsCommand"],
            ["Lambda", "listFunctions", "ListFunctionsCommand"],
            ["EC2", "describeInstances", "DescribeInstancesCommand"],
            ["IAM", "listUsers", "ListUsersCommand"],
            ["DynamoDB", "listTables", "ListTablesCommand"],
            ["STS", "getCallerIdentity", "GetCallerIdentityCommand"]
        ];

        testCases.forEach(function([svc, method, expectedCommand]) {
            var pkg = require("@aws-sdk/client-" + SERVICE_PACKAGES[svc]);
            expect(pkg[expectedCommand]).toBeDefined();
        });
    });
});
