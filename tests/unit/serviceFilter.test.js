const { applyServiceFilter } = require("../../cli/utils");

const sections = [
    { category: "Compute", service: "Lambda" },
    { category: "Storage", service: "Amazon S3" },
    { category: "Compute", service: "EC2" },
    { category: "Database", service: "DynamoDB" }
];

describe("applyServiceFilter", () => {
    describe("--services (include)", () => {
        it("includes only specified services", () => {
            var result = applyServiceFilter(sections, { services: "Lambda" });
            expect(result).toHaveLength(1);
            expect(result[0].service).toBe("Lambda");
        });

        it("includes multiple comma-separated services", () => {
            var result = applyServiceFilter(sections, { services: "Lambda,EC2" });
            expect(result).toHaveLength(2);
            expect(result[0].service).toBe("Lambda");
            expect(result[1].service).toBe("EC2");
        });

        it("treats ALL as no filter", () => {
            var result = applyServiceFilter(sections, { services: "ALL" });
            expect(result).toEqual(sections);
        });

        it("is case-insensitive", () => {
            var result = applyServiceFilter(sections, { services: "lambda" });
            expect(result).toHaveLength(1);
            expect(result[0].service).toBe("Lambda");
        });

        it("uses nav() to normalize service names", () => {
            var result = applyServiceFilter(sections, { services: "AmazonS3" });
            expect(result).toHaveLength(1);
            expect(result[0].service).toBe("Amazon S3");
        });
    });

    describe("--exclude-services", () => {
        it("excludes specified services", () => {
            var result = applyServiceFilter(sections, { excludeServices: "Lambda" });
            expect(result).toHaveLength(3);
            expect(result.find(s => s.service === "Lambda")).toBeUndefined();
        });

        it("excludes multiple comma-separated services", () => {
            var result = applyServiceFilter(sections, { excludeServices: "Lambda,EC2" });
            expect(result).toHaveLength(2);
            expect(result[0].service).toBe("Amazon S3");
            expect(result[1].service).toBe("DynamoDB");
        });

        it("is case-insensitive", () => {
            var result = applyServiceFilter(sections, { excludeServices: "lambda" });
            expect(result).toHaveLength(3);
            expect(result.find(s => s.service === "Lambda")).toBeUndefined();
        });
    });

    describe("error cases", () => {
        it("throws when both --services and --exclude-services are provided", () => {
            expect(() => {
                applyServiceFilter(sections, { services: "Lambda", excludeServices: "EC2" });
            }).toThrow("Please do not use --exclude-services and --services simultaneously");
        });

        it("returns all sections when neither option is provided", () => {
            expect(applyServiceFilter(sections, {})).toEqual(sections);
        });
    });

    describe("edge cases", () => {
        it("returns empty array when no services match include filter", () => {
            var result = applyServiceFilter(sections, { services: "Nonexistent" });
            expect(result).toEqual([]);
        });

        it("handles empty sections array", () => {
            var result = applyServiceFilter([], { services: "Lambda" });
            expect(result).toEqual([]);
        });

        it("does not mutate the opts object", () => {
            var opts = { services: "ALL" };
            applyServiceFilter(sections, opts);
            expect(opts.services).toBe("ALL");
        });
    });
});
