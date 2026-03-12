// web/app.js
//
// Browser entry point for Former2. Bundled by webpack.
//
// This module:
// 1. Imports shared modules (services, mappings, formatters)
// 2. Sets up browser-specific sdkcall
// 3. Creates updateDatatable* wrapper functions
// 4. Routes returned resources to the correct datatables
// 5. Exposes everything as window globals for the UI code

var allServices = require('../shared/services');
var mappings = require('../shared/mappings');
var formatters = require('../shared/formatters');
var RELATIONSHIP_TYPE_MAP = require('../shared/relationships');
var { createBrowserSdkcall, createBrowserSdkcallWaiter } = require('./sdkcall-browser');
var f2typeMap = require('./f2type-map');
var deepmerge = require('deepmerge');

/* ========================================================================== */
// Utility functions
/* ========================================================================== */

function nav(str) {
    return str.replace(/\s/g, '').replace(/,/g, '').replace(/-/g, '').replace(/&amp;/g, 'And');
}

function navlower(str) {
    return str.toLowerCase().replace(/\s/g, '').replace(/,/g, '').replace(/-/g, '').replace(/&amp;/g, 'and');
}

/* ========================================================================== */
// Build services array and sections
/* ========================================================================== */

var services = Object.values(allServices);
var sections = services.map(function(s) { return s.section; });

// Expose sections globally (used by UI code in js/app.js)
window.sections = sections;

/* ========================================================================== */
// Formatter functions — exposed globally for Bootstrap Table string references
/* ========================================================================== */

window.textFormatter = formatters.textFormatter;
window.primaryFieldFormatter = formatters.primaryFieldFormatter;
window.dateFormatter = formatters.dateFormatter;
window.tickFormatter = formatters.tickFormatter;
window.byteSizeFormatter = formatters.byteSizeFormatter;
window.timeAgoFormatter = formatters.timeAgoFormatter;
window.lambdaRuntimeFormatter = formatters.lambdaRuntimeFormatter;

// Browser-only formatters (defined in js/datatables-browser.js)
// primaryTextFormatter, detailFormatter, recursivePrettyPrintMap

/* ========================================================================== */
// Mapping functions — exposed globally
/* ========================================================================== */

window.performF2Mappings = function(objects) {
    var mappingFunctions = services.map(function(s) { return s.mapResources; });
    return mappings.performF2Mappings(objects, mappingFunctions);
};
window.compileOutputs = mappings.compileOutputs;
window.getResourceName = mappings.getResourceName;
window.getLogicalToPhysicalIdMap = mappings.getLogicalToPhysicalIdMap;

// Also set as global for mapResources bare references
window.getResourceName = mappings.getResourceName;

// Expose deepmerge globally (used by js/app.js)
window.deepmerge = deepmerge;

// Expose relationship type map globally (used by js/app.js for diagram relationships)
window.RELATIONSHIP_TYPE_MAP = RELATIONSHIP_TYPE_MAP;

/* ========================================================================== */
// Logging functions
/* ========================================================================== */

window.f2debug = function() {};
window.f2log = function(msg) { console.log(msg); };
window.f2trace = function(msg) { console.trace(msg); };

// Wire up logging to shared mappings module
mappings.setLogFunctions(window.f2log, window.f2trace, window.f2debug);

/* ========================================================================== */
// Mapping state management
/* ========================================================================== */

// include_default_resources — controlled by settings UI
window.include_default_resources = false;

// service_mapping_functions — collected from all services (used by js/app.js)
window.service_mapping_functions = services.map(function(s) { return s.mapResources; });

/* ========================================================================== */
// Browser sdkcall
/* ========================================================================== */

// The sdkcall is created with getters so it uses the current region/AWS values
// (these change as the user configures credentials and selects regions)
var browserSdkcall = createBrowserSdkcall({
    getRegion: function() { return window.region || 'us-east-1'; },
    getAWS: function() { return window.AWS; },
    onLog: function(msg) { window.f2log(msg); },
    onDebug: function(msg) { window.f2debug(msg); },
    onTrace: function(err) { window.f2trace(err); },
    onError: function(title, message) {
        if (window.$ && window.$.notify) {
            window.$.notify({
                icon: 'font-icon font-icon-warning',
                title: '<strong>' + title + '</strong>',
                message: message
            }, {
                type: 'danger'
            });
        }
    }
});

// Expose sdkcall globally (used by updateIdentity, getResourceTags, etc.)
window.sdkcall = browserSdkcall;

// Create sdkcall waiter for CloudFormation
window.sdkcallwaiter = createBrowserSdkcallWaiter({
    getRegion: function() { return window.region || 'us-east-1'; },
    getAWS: function() {
        // Use _AWS (original SDK reference, not extension proxy)
        return window._AWS || window.AWS;
    }
});

/* ========================================================================== */
// Tag helpers
/* ========================================================================== */

var resource_tag_cache = {};

window.getResourceTags = async function getResourceTags(arn) {
    if (!arn) {
        return null;
    }

    if (arn.split(':').length < 7 && !arn.split(':')[5].includes('/')) {
        return null;
    }

    var service = arn.split(':')[2];

    if (!resource_tag_cache[service]) {
        resource_tag_cache[service] = 'PENDING';

        await window.sdkcall('ResourceGroupsTaggingAPI', 'getResources', {
            ResourceTypeFilters: [service]
        }, false).then(function(data) {
            resource_tag_cache[service] = data.ResourceTagMappingList;
        }).catch(function() { });
        setTimeout(function(k) {
            delete resource_tag_cache[k];
        }, 20000, service); // 20s cache
    }

    while (resource_tag_cache[service] === 'PENDING') {
        await new Promise(function(r) { setTimeout(r, 2000); });
    }

    for (var res of resource_tag_cache[service]) {
        var resarnparts = res.ResourceARN.split(':');
        resarnparts[3] = '';
        resarnparts[4] = '';
        var arnparts = arn.split(':');
        arnparts[3] = '';
        arnparts[4] = '';

        if (resarnparts.join(':') === arnparts.join(':')) {
            return res.Tags.filter(function(tag) { return !tag.Key.startsWith('aws:'); });
        }
    }

    return null;
};

window.stripAWSTags = function stripAWSTags(tags) {
    if (tags) {
        if (Array.isArray(tags)) {
            tags = tags.filter(function(value) {
                return (!value.Key.startsWith('aws:'));
            });
        } else {
            var i = Object.keys(tags).length;
            while (i--) {
                var k = Object.keys(tags)[i];
                if (k.startsWith('aws:')) {
                    delete tags[k];
                }
            }
        }
    }
    return tags;
};

/* ========================================================================== */
// Resource-to-datatable routing
/* ========================================================================== */

/**
 * Route resources returned by updateDatatable to the correct browser datatables.
 *
 * @param {Object} section - The service's section definition
 * @param {Array} resources - Flat array of resources from updateDatatable
 */
function routeResourcesToDatatables(section, resources) {
    if (!resources || !resources.length) return;

    var cat = navlower(section.category);
    var svc = navlower(section.service);

    resources.forEach(function(resource) {
        var rtName = f2typeMap[resource.f2type];
        if (!rtName) {
            // Fallback: try first resourcetype
            var rtNames = Object.keys(section.resourcetypes);
            if (rtNames.length === 1) {
                rtName = rtNames[0];
            } else {
                window.f2log('No datatable mapping for f2type: ' + resource.f2type);
                return;
            }
        }

        var dtId = '#section-' + cat + '-' + svc + '-' + navlower(rtName) + '-datatable';
        var $dt = window.$(dtId);
        if ($dt.length) {
            $dt.deferredBootstrapTable('append', [resource]);
        }
    });
}

/* ========================================================================== */
// Create updateDatatable* wrapper functions for each service
/* ========================================================================== */

services.forEach(function(svc) {
    var key = nav(svc.section.category) + nav(svc.section.service);

    window['updateDatatable' + key] = async function() {
        var context = {
            sdkcall: window.sdkcall,
            region: window.region || 'us-east-1',
            getResourceTags: window.getResourceTags,
            stripAWSTags: window.stripAWSTags,
            deepmerge: deepmerge,
            include_default_resources: window.include_default_resources,
        };

        try {
            var resources = await svc.updateDatatable(context);
            routeResourcesToDatatables(svc.section, resources);
        } catch (e) {
            // Silently handle — individual SDK errors are already logged
        }
    };
});

/* ========================================================================== */
// Mapping state sync — keep shared module state in sync with browser globals
/* ========================================================================== */

// Override performF2Mappings to sync state before each call
var _origPerformF2Mappings = window.performF2Mappings;
window.performF2Mappings = function(objects) {
    // Sync settings from browser globals to shared module state
    mappings.setState({
        cfnspacing: window.cfnspacing || '    ',
        logicalidstrategy: window.logicalidstrategy || 'longtypeprefixoptionalindexsuffix',
        include_default_resources: window.include_default_resources || false,
        iaclangselect: window.iaclangselect || 'typescript',
        stack_parameters: window.stack_parameters || [],
        check_objects: window.check_objects || [],
    });
    return _origPerformF2Mappings(objects);
};

/* ========================================================================== */
// BlockUI helpers
/* ========================================================================== */

window.blockUI = function blockUI(selector) {
    if (selector.startsWith(window.location.hash)) {
        window.$(selector).block({
            message: '<div class="blockui-default-message"><i class="fa fa-circle-o-notch fa-spin"></i><h6>Loading...</h6></div>',
            overlayCSS: {
                background: 'rgba(142, 159, 167, 0.8)',
                opacity: 1,
                cursor: 'wait'
            },
            css: {
                width: '50%'
            },
            blockMsgClass: 'block-msg-default'
        });
    }
};

window.unblockUI = function unblockUI(selector) {
    setTimeout(function() {
        window.$(selector).unblock();
    }, 200);
};

/* ========================================================================== */
// Nav helpers — exposed globally for use by js/app.js
/* ========================================================================== */

window.f2Nav = nav;
window.f2Navlower = navlower;

/* ========================================================================== */
// Diagram helpers (browser-only)
/* ========================================================================== */

window.clearDiagram = function clearDiagram() {
    var xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<mxfile modified="' + new Date().toISOString() + '" agent="Former2/1.0" etag="rS7_16A_GMVNg1aOA2n0" version="13.1.9">\n' +
        '    <diagram id="diagram1" name="AWS Infrastructure">\n' +
        '    <mxGraphModel dx="0" dy="0" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1000" pageHeight="1000" math="0" shadow="0">\n' +
        '        <root>\n' +
        '        <mxCell id="0" />\n' +
        '        <mxCell id="1" parent="0" />\n' +
        '        </root>\n' +
        '    </mxGraphModel>\n' +
        '    </diagram>\n' +
        '</mxfile>';

    var iframe = document.getElementById('diagramframe');
    var message = JSON.stringify({
        action: 'load',
        xml: xml
    });
    iframe.contentWindow.postMessage(message, '*');
};
