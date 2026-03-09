'use strict';

const { registerEstimator } = require('../estimator');

/**
 * Cost estimator for RDS resources (DB instances, clusters, etc.)
 * @param {object} resource
 * @returns {Promise<import('../estimator').CostEstimate>}
 */
async function estimateRds(resource) {
    // TODO: implement RDS cost estimation
    // Handle: instance class, engine, multi-AZ, storage, etc.
    throw new Error('Not implemented');
}

registerEstimator('rds', estimateRds);

module.exports = { estimateRds };
