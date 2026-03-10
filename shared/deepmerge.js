// shared/deepmerge.js
//
// Re-export the npm deepmerge package for use by shared modules.
// Browser code continues using js/deepmerge.js via <script> tag until Stage 7.
module.exports = require('deepmerge');
