/**
 * Service registry that collects sections and mapping functions
 * from both converted modules and legacy VM-loaded globals.
 *
 * The dual-loader populates this registry so that cli/main.js can
 * consume a unified view regardless of how each service was loaded.
 */

const registry = {
    sections: [],
    mappingFunctions: [],
    updateFunctions: {},  // keyed by nav(category) + nav(service)
};

/**
 * Register a converted service module into the registry.
 *
 * @param {import('../types').ServiceModule} serviceModule
 * @param {Function} nav - The nav() helper for building function name keys
 */
function registerService(serviceModule, nav) {
    registry.sections.push(serviceModule.section);
    if (serviceModule.mapResources) {
        registry.mappingFunctions.push(serviceModule.mapResources);
    }

    const key = nav(serviceModule.section.category) + nav(serviceModule.section.service);
    registry.updateFunctions[key] = serviceModule.updateDatatable;
}

module.exports = { registry, registerService };
