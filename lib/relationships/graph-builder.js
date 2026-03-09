'use strict';

const { getRelationshipRules } = require('./relationship-rules');

/**
 * @typedef {object} GraphNode
 * @property {string} id - Resource f2id
 * @property {string} type - Resource f2type
 * @property {string} region - Resource f2region
 * @property {string} [label] - Display label
 */

/**
 * @typedef {object} GraphEdge
 * @property {string} source - Source node id
 * @property {string} target - Target node id
 * @property {string} relationship - Relationship type (e.g. "IsAssociatedWith")
 */

/**
 * @typedef {object} Graph
 * @property {GraphNode[]} nodes
 * @property {GraphEdge[]} edges
 */

/**
 * Build an adjacency graph from an array of resources.
 * Uses relationship rules to determine edges between resources.
 * @param {object[]} resources - Array of resource objects
 * @returns {Graph}
 */
function buildGraph(resources) {
    // TODO: implement graph construction
    // 1. Create a node for each resource
    // 2. Index resources by f2id and f2type for lookups
    // 3. Apply relationship rules to discover edges
    throw new Error('Not implemented');
}

module.exports = {
    buildGraph,
};
