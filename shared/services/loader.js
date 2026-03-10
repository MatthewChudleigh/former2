/**
 * Service loader.
 *
 * All 139 services are now converted modules loaded via require().
 * Modules are bridged into the VM context so cli/main.js sees a
 * unified view through vmContext.sections, updateDatatable*, and
 * service_mapping_functions — no VM sandbox loading needed.
 */

const fs = require('fs');
const path = require('path');
const { registry, registerService } = require('./registry');

const INFRA_FILES = new Set(['registry', 'loader', 'index']);

/**
 * Load all converted service modules and bridge into vmContext.
 *
 * @param {Object} vmContext   - The VM sandbox context (for main.js compatibility)
 * @param {Object} context     - The Former2Context (injected into modules)
 * @param {Function} nav       - The nav() helper for building function name keys
 */
function loadAllServices(vmContext, context, nav) {
    const convertedDir = __dirname;

    const convertedFiles = fs.readdirSync(convertedDir)
        .filter(f => f.endsWith('.js') && !INFRA_FILES.has(path.basename(f, '.js')))
        .sort();

    for (const filename of convertedFiles) {
        const basename = path.basename(filename, '.js');
        const serviceModule = require('./' + basename);

        // Wrap updateDatatable to inject context and bridge resources to cli_resources
        const wrappedUpdate = async () => {
            const resources = await serviceModule.updateDatatable(context);
            if (resources && resources.length) {
                for (const r of resources) {
                    vmContext.cli_resources.push(r);
                }
            }
        };

        // Register in the module-based registry (for future direct consumption)
        registerService({
            section: serviceModule.section,
            mapResources: serviceModule.mapResources,
            updateDatatable: wrappedUpdate,
        }, nav);

        // Bridge into VM context so main.js works without modification
        vmContext.sections.push(serviceModule.section);

        const key = nav(serviceModule.section.category) + nav(serviceModule.section.service);
        vmContext['updateDatatable' + key] = wrappedUpdate;

        // Wrap mapResources to bridge globals from VM context.
        // getResourceName is defined in mappings.js (loaded into vmContext)
        // and uses VM-scoped state (global_used_refs, logicalidstrategy, etc.).
        // stripAWSTags is defined in main.js and used by mapResources.
        // We expose them as Node globals so converted modules can reference them.
        vmContext.service_mapping_functions.push(function(reqParams, obj, tracked_resources) {
            const prevGetResourceName = global.getResourceName;
            const prevStripAWSTags = global.stripAWSTags;
            global.getResourceName = vmContext.getResourceName;
            global.stripAWSTags = vmContext.stripAWSTags;
            try {
                return serviceModule.mapResources(reqParams, obj, tracked_resources);
            } finally {
                global.getResourceName = prevGetResourceName;
                global.stripAWSTags = prevStripAWSTags;
            }
        });
    }
}

module.exports = { loadAllServices };
