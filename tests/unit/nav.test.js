const { nav } = require("../../cli/utils");

describe("nav", () => {
    it("removes whitespace", () => {
        expect(nav("Amazon S3")).toBe("AmazonS3");
    });

    it("removes commas", () => {
        expect(nav("A,B,C")).toBe("ABC");
    });

    it("removes hyphens", () => {
        expect(nav("my-service")).toBe("myservice");
    });

    it("replaces &amp; with And", () => {
        expect(nav("IoT &amp; Analytics")).toBe("IoTAndAnalytics");
    });

    it("handles combined transformations", () => {
        expect(nav("AWS IoT &amp; Things - Core, V2")).toBe("AWSIoTAndThingsCoreV2");
    });

    it("returns empty string for empty input", () => {
        expect(nav("")).toBe("");
    });

    it("returns unchanged string when no special chars", () => {
        expect(nav("Lambda")).toBe("Lambda");
    });
});
