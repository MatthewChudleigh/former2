// shared/relationships.js
//
// Resource relationship type map, extracted from js/RelationshipTypeMap.js.
// The original file defines RELATIONSHIP_TYPE_MAP as a global and merges
// RELATIONSHIP_TYPE_MAP_OVERRIDES using deepmerge. This module does the
// same but exports the merged result as a proper module.
//
// The data is loaded from the original file to avoid duplicating 5000+ lines.
// Once js/RelationshipTypeMap.js is removed (Stage 8), the data will live here directly.

var deepmerge = require('./deepmerge');
var vm = require('vm');
var fs = require('fs');
var path = require('path');

// Execute the original file in a sandbox to extract the data.
// The file expects `deepmerge` as a global (used on the last line for merging overrides).
var sandbox = { deepmerge: deepmerge };
vm.createContext(sandbox);
vm.runInContext(
    fs.readFileSync(path.join(__dirname, '..', 'js', 'RelationshipTypeMap.js'), 'utf8'),
    sandbox,
    { filename: 'js/RelationshipTypeMap.js' }
);

module.exports = sandbox.RELATIONSHIP_TYPE_MAP;
