'use strict';

/**
 * Relationship rules define how resources reference each other.
 *
 * These rules will be derived from the existing RelationshipTypeMap.js
 * which maps CloudFormation types to their relationships. That file uses
 * CFN type names (e.g. "AWS::EC2::Instance") while resources use f2type
 * (e.g. "ec2.instance"), so a mapping layer is needed.
 *
 * Each rule describes:
 *   - sourceType: f2type of the source resource
 *   - targetType: f2type of the target resource
 *   - relationship: relationship label (e.g. "IsAssociatedWith", "IsContainedIn")
 *   - resolve: function(sourceData, targetResources) => matched target f2ids
 */

/**
 * Get all relationship rules.
 * @returns {object[]} Array of rule objects
 */
function getRelationshipRules() {
    // TODO: build rules from RelationshipTypeMap.js data
    // Will need a CFN-type-to-f2type mapping
    throw new Error('Not implemented');
}

module.exports = {
    getRelationshipRules,
};
