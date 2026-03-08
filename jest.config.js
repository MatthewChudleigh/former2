module.exports = {
    testEnvironment: "node",
    roots: ["<rootDir>/tests"],
    testMatch: ["**/*.test.js"],
    collectCoverageFrom: [
        "cli/utils.js"
    ],
    coverageDirectory: "coverage",
    coverageReporters: ["text", "lcov"],
    testTimeout: 15000
};
