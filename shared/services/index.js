/**
 * Re-exports all converted service modules.
 *
 * As services are migrated from js/services/ to shared/services/,
 * add them here. The dual-loader uses filesystem detection, but this
 * index provides a clean import path for direct consumers.
 */

module.exports = {
    simpledb: require('./simpledb'),
};
