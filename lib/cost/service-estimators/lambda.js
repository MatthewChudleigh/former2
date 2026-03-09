'use strict';

const { registerEstimator } = require('../estimator');

/**
 * Cost estimator for Lambda resources.
 * @param {object} resource
 * @returns {Promise<import('../estimator').CostEstimate>}
 */
async function estimateLambda(resource) {
    // TODO: implement Lambda cost estimation
    // Note: actual invocation count/duration not available from resource data,
    // so this may estimate based on memory size and provisioned concurrency only
    throw new Error('Not implemented');
}

registerEstimator('lambda', estimateLambda);

module.exports = { estimateLambda };
