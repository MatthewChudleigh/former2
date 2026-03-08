const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const cliPath = path.resolve(__dirname, "../../cli/main.js");
const fixturesDir = path.resolve(__dirname, "../fixtures");
const sampleFile = path.join(fixturesDir, "sample-resources.json");
const emptyFile = path.join(fixturesDir, "empty-resources.json");

function runCli(args, expectFailure) {
    try {
        var stdout = execFileSync("node", [cliPath, ...args], {
            encoding: "utf8",
            timeout: 15000,
            env: { ...process.env, NODE_NO_WARNINGS: "1" }
        });
        return { stdout: stdout, exitCode: 0 };
    } catch (err) {
        if (!expectFailure) throw err;
        return { stdout: err.stdout || "", stderr: err.stderr || "", exitCode: err.status };
    }
}

describe("CLI filter command", () => {
    var tmpDir;

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "former2-test-"));
    });

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it("outputs CloudFormation from fixture file", () => {
        var outFile = path.join(tmpDir, "out.yml");
        runCli(["filter", "--input-file", sampleFile, "--output-cloudformation", outFile]);
        expect(fs.existsSync(outFile)).toBe(true);
        var content = fs.readFileSync(outFile, "utf8");
        expect(content).toContain("AWSTemplateFormatVersion");
    });

    it("outputs Terraform from fixture file", () => {
        var outFile = path.join(tmpDir, "out.tf");
        runCli(["filter", "--input-file", sampleFile, "--output-terraform", outFile]);
        expect(fs.existsSync(outFile)).toBe(true);
        var content = fs.readFileSync(outFile, "utf8");
        expect(content.length).toBeGreaterThan(0);
    });

    it("applies search filter to reduce output", () => {
        var outFile = path.join(tmpDir, "out.yml");
        runCli(["filter", "--input-file", sampleFile, "--output-cloudformation", outFile, "--search-filter", "my-bucket"]);
        expect(fs.existsSync(outFile)).toBe(true);
        var content = fs.readFileSync(outFile, "utf8");
        expect(content).toContain("AWS::S3::Bucket");
        expect(content).not.toContain("AWS::Lambda::Function");
    });

    it("applies regex filter", () => {
        var outFile = path.join(tmpDir, "out.yml");
        runCli(["filter", "--input-file", sampleFile, "--output-cloudformation", outFile, "--regex-filter", "lambda"]);
        expect(fs.existsSync(outFile)).toBe(true);
        var content = fs.readFileSync(outFile, "utf8");
        expect(content).toContain("AWS::Lambda::Function");
        expect(content).not.toContain("AWS::S3::Bucket");
    });

    it("handles empty input file gracefully", () => {
        var outFile = path.join(tmpDir, "out.yml");
        runCli(["filter", "--input-file", emptyFile, "--output-cloudformation", outFile]);
        expect(fs.existsSync(outFile)).toBe(true);
    });

    it("fails when no output type specified", () => {
        var result = runCli(["filter", "--input-file", sampleFile], true);
        expect(result.exitCode).not.toBe(0);
    });

    it("fails when input file does not exist", () => {
        var outFile = path.join(tmpDir, "out.yml");
        var result = runCli(["filter", "--input-file", "nonexistent.json", "--output-cloudformation", outFile], true);
        expect(result.exitCode).not.toBe(0);
    });

    it("applies sort-output flag", () => {
        var outFile = path.join(tmpDir, "out.yml");
        runCli(["filter", "--input-file", sampleFile, "--output-cloudformation", outFile, "--sort-output"]);
        expect(fs.existsSync(outFile)).toBe(true);
        var content = fs.readFileSync(outFile, "utf8");
        expect(content).toContain("AWSTemplateFormatVersion");
    });

    it("applies cfn-deletion-policy Retain", () => {
        var outFile = path.join(tmpDir, "out.yml");
        runCli(["filter", "--input-file", sampleFile, "--output-cloudformation", outFile, "--cfn-deletion-policy", "Retain"]);
        expect(fs.existsSync(outFile)).toBe(true);
        var content = fs.readFileSync(outFile, "utf8");
        expect(content).toContain("DeletionPolicy");
    });

    it("rejects invalid cfn-deletion-policy", () => {
        var outFile = path.join(tmpDir, "out.yml");
        var result = runCli(["filter", "--input-file", sampleFile, "--output-cloudformation", outFile, "--cfn-deletion-policy", "Snapshot"], true);
        expect(result.exitCode).not.toBe(0);
    });
});
