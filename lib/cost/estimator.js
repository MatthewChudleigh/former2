'use strict';

const SERVICE_ESTIMATORS = {};

/**
 * @typedef {object} CostEstimate
 * @property {string} resourceId - Resource f2id
 * @property {string} resourceType - Resource f2type
 * @property {string} region - Resource f2region
 * @property {string} [label] - Human-readable resource name
 * @property {number} monthlyCost - Estimated monthly cost in USD
 * @property {object[]} dimensions - Cost breakdown dimensions
 * @property {string} dimensions[].name - Dimension name (e.g. "Compute", "Storage")
 * @property {number} dimensions[].monthlyCost - Cost for this dimension
 * @property {string} dimensions[].unit - Unit (e.g. "hours", "GB-months")
 * @property {number} dimensions[].quantity - Quantity consumed
 */

/**
 * Register a service estimator.
 * @param {string} f2typePrefix - The f2type prefix this estimator handles (e.g. "ec2", "s3")
 * @param {function} estimatorFn - function(resource) => Promise<CostEstimate>
 */
function registerEstimator(f2typePrefix, estimatorFn) {
    SERVICE_ESTIMATORS[f2typePrefix] = estimatorFn;
}

/**
 * Estimate costs for an array of resources.
 * @param {object[]} resources - Array of resource objects
 * @param {object} [options]
 * @param {string} [options.region] - Region override for pricing lookups
 * @returns {Promise<CostEstimate[]>}
 */
async function estimateCosts(resources, options = {}) {
    // TODO: implement
    // 1. Group resources by service prefix
    // 2. Delegate to registered service estimators
    // 3. Return unsupported resources with monthlyCost: null
    throw new Error('Not implemented');
}

module.exports = {
    estimateCosts,
    registerEstimator,
    SERVICE_ESTIMATORS,
};
