'use strict';

const { estimateCosts } = require('./estimator');
const { renderTable } = require('./renderers/table');
const { renderCsv } = require('./renderers/csv');
const { renderJson } = require('./renderers/json');

const RENDERERS = {
    table: renderTable,
    csv: renderCsv,
    json: renderJson,
};

/**
 * Estimate costs for resources and render in the specified format.
 * @param {object[]} resources - Array of resource objects
 * @param {object} [options]
 * @param {string} [options.format='table'] - Output format: table, csv, json
 * @param {string} [options.region] - Pricing region override
 * @returns {Promise<string>} Rendered output
 */
async function generateCostReport(resources, options = {}) {
    // TODO: implement pipeline
    throw new Error('Not implemented');
}

module.exports = {
    generateCostReport,
    estimateCosts,
    RENDERERS,
};
