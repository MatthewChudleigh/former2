'use strict';

const { buildGraph } = require('./graph-builder');
const { renderDot } = require('./renderers/dot');
const { renderMermaid } = require('./renderers/mermaid');
const { renderJson } = require('./renderers/json');

const RENDERERS = {
    dot: renderDot,
    mermaid: renderMermaid,
    json: renderJson,
};

/**
 * Build a relationship graph from resources and render it in the specified format.
 * @param {object[]} resources - Array of resource objects
 * @param {object} [options]
 * @param {string} [options.format='mermaid'] - Output format: dot, mermaid, json
 * @returns {string} Rendered output
 */
function generateRelationships(resources, options = {}) {
    // TODO: implement pipeline
    throw new Error('Not implemented');
}

module.exports = {
    generateRelationships,
    buildGraph,
    RENDERERS,
};
