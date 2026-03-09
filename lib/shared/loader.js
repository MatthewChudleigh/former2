'use strict';

const { validateResources } = require('./resource-schema');

/**
 * Load resources from a raw JSON file (as produced by --output-raw-data).
 * @param {string} filePath - Path to the JSON file
 * @returns {object[]} Array of validated resource objects
 */
function loadFromFile(filePath) {
    // TODO: read file, parse JSON, validate, return resources
    throw new Error('Not implemented');
}

/**
 * Load resources from an in-memory array (for web UI or programmatic use).
 * @param {object[]} resources - Array of resource objects
 * @returns {object[]} Array of validated resource objects
 */
function loadFromArray(resources) {
    // TODO: validate and return resources
    throw new Error('Not implemented');
}

module.exports = {
    loadFromFile,
    loadFromArray,
};
