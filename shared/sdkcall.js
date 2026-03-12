// shared/sdkcall.js
//
// Sdkcall interface contract and shared constants.
//
// Two implementations exist:
// - cli/sdk-v3-shim.js: AWS SDK v3 for Node.js CLI
// - web/sdkcall-browser.js: AWS SDK v2 for browser
//
// Both implementations handle:
// - Service-specific region overrides (GlobalAccelerator→us-west-2, CostExplorer→us-east-1)
// - Throttling with exponential backoff
// - Pagination (delegated to shared/pagination.js in CLI, inline in browser)
// - Error classification (AccessDenied, NetworkError, etc.)
//
// @see shared/types.js for SdkcallFn typedef

/**
 * Region overrides for specific services.
 * Shared between CLI and browser sdkcall implementations.
 */
var SERVICE_REGION_OVERRIDES = {
    'GlobalAccelerator': 'us-west-2',
    'CostExplorer': 'us-east-1',
};

/**
 * Service-specific SDK options.
 */
var SERVICE_OPTIONS = {
    'DynamoDB': { dynamoDbCrc32: false },
};

/**
 * Throttling error codes that trigger retry with backoff.
 */
var THROTTLE_CODES = [
    'TooManyRequestsException',
    'ThrottlingException',
    'RequestLimitExceeded',
    'TimeoutError',
];

var THROTTLE_MESSAGES = [
    'Too Many Requests',
    'Rate exceeded',
];

module.exports = {
    SERVICE_REGION_OVERRIDES,
    SERVICE_OPTIONS,
    THROTTLE_CODES,
    THROTTLE_MESSAGES,
};
