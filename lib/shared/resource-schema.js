'use strict';

/**
 * Canonical resource schema as produced by Former2 scanning.
 *
 * Every resource object has:
 *   f2id     - Unique identifier (usually ARN)
 *   f2type   - Service.ResourceType in lowercase (e.g. "s3.bucket")
 *   f2data   - Raw AWS API response data
 *   f2region - AWS region
 *   f2link   - (optional) AWS console URL
 */

const REQUIRED_FIELDS = ['f2id', 'f2type', 'f2data', 'f2region'];

/**
 * Validate a single resource object against the schema.
 * @param {object} resource
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateResource(resource) {
    // TODO: implement validation
    throw new Error('Not implemented');
}

/**
 * Validate an array of resources. Returns a summary with per-resource errors.
 * @param {object[]} resources
 * @returns {{ valid: boolean, errors: { index: number, errors: string[] }[] }}
 */
function validateResources(resources) {
    // TODO: implement batch validation
    throw new Error('Not implemented');
}

module.exports = {
    REQUIRED_FIELDS,
    validateResource,
    validateResources,
};
