'use strict';

const { registerEstimator } = require('../estimator');

/**
 * Cost estimator for S3 resources (buckets).
 * @param {object} resource
 * @returns {Promise<import('../estimator').CostEstimate>}
 */
async function estimateS3(resource) {
    // TODO: implement S3 cost estimation
    // Note: actual storage size is not in the resource data from the API,
    // so this may need CloudWatch metrics or a size flag
    throw new Error('Not implemented');
}

registerEstimator('s3', estimateS3);

module.exports = { estimateS3 };
