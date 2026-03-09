'use strict';

const { registerEstimator } = require('../estimator');

/**
 * Cost estimator for EC2 resources (instances, EBS volumes, etc.)
 * @param {object} resource
 * @returns {Promise<import('../estimator').CostEstimate>}
 */
async function estimateEc2(resource) {
    // TODO: implement EC2 cost estimation
    // Handle: instances (by instance type), EBS volumes, elastic IPs, NAT gateways, etc.
    throw new Error('Not implemented');
}

registerEstimator('ec2', estimateEc2);

module.exports = { estimateEc2 };
