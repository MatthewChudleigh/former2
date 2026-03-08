const { applySearchFilter, applyRegexFilter } = require("../../cli/utils");

const resources = [
    {
        "f2id": "arn:aws:s3:::my-bucket",
        "f2type": "S3.Bucket",
        "f2data": { "BucketName": "my-bucket" },
        "f2region": "us-east-1"
    },
    {
        "f2id": "arn:aws:lambda:us-west-2:123456789012:function:my-function",
        "f2type": "Lambda.Function",
        "f2data": { "FunctionName": "my-function" },
        "f2region": "us-west-2"
    },
    {
        "f2id": "arn:aws:ec2:us-east-1:123456789012:instance/i-0abcdef1234567890",
        "f2type": "EC2.Instance",
        "f2data": { "InstanceId": "i-0abcdef1234567890" },
        "f2region": "us-east-1"
    }
];

describe("applySearchFilter", () => {
    it("returns all resources when searchFilter is null", () => {
        expect(applySearchFilter(resources, null)).toEqual(resources);
    });

    it("returns all resources when searchFilter is undefined", () => {
        expect(applySearchFilter(resources, undefined)).toEqual(resources);
    });

    it("filters by simple string match", () => {
        var result = applySearchFilter(resources, "my-bucket");
        expect(result).toHaveLength(1);
        expect(result[0].f2type).toBe("S3.Bucket");
    });

    it("filters with comma-separated OR logic", () => {
        var result = applySearchFilter(resources, "my-bucket,my-function");
        expect(result).toHaveLength(2);
        expect(result[0].f2type).toBe("S3.Bucket");
        expect(result[1].f2type).toBe("Lambda.Function");
    });

    it("filters with ampersand-separated AND logic", () => {
        var result = applySearchFilter(resources, "s3&my-bucket");
        expect(result).toHaveLength(1);
        expect(result[0].f2type).toBe("S3.Bucket");
    });

    it("returns empty array when nothing matches", () => {
        expect(applySearchFilter(resources, "nonexistent")).toEqual([]);
    });

    it("matches against any field", () => {
        var result = applySearchFilter(resources, "us-east-1");
        expect(result).toHaveLength(2);
        expect(result[0].f2type).toBe("S3.Bucket");
        expect(result[1].f2type).toBe("EC2.Instance");
    });
});

describe("applyRegexFilter", () => {
    it("returns all resources when regexFilter is null", () => {
        expect(applyRegexFilter(resources, null)).toEqual(resources);
    });

    it("returns all resources when regexFilter is undefined", () => {
        expect(applyRegexFilter(resources, undefined)).toEqual(resources);
    });

    it("filters by regex pattern", () => {
        var result = applyRegexFilter(resources, /my-bucket/);
        expect(result).toHaveLength(1);
        expect(result[0].f2type).toBe("S3.Bucket");
    });

    it("supports case-insensitive regex", () => {
        var result = applyRegexFilter(resources, /MY-BUCKET/i);
        expect(result).toHaveLength(1);
        expect(result[0].f2type).toBe("S3.Bucket");
    });

    it("supports complex regex patterns", () => {
        var result = applyRegexFilter(resources, /S3\.Bucket|Lambda\.Function/);
        expect(result).toHaveLength(2);
    });

    it("returns empty array when nothing matches", () => {
        expect(applyRegexFilter(resources, /^$/)).toEqual([]);
    });
});
