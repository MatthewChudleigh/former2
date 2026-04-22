"use strict";

/**
 * Normalize a string for navigation matching by removing whitespace,
 * commas, hyphens, and replacing &amp; with And.
 */
function nav(str) {
    return str.replace(/\s/g, "").replace(/\,/g, "").replace(/\-/g, "").replace(/\&amp\;/g, "And");
}

/**
 * Filter resources by search string. Supports comma-separated (OR)
 * and ampersand-separated (AND) filters.
 * Returns a new array of matching resources.
 */
function applySearchFilter(resources, searchFilter) {
    if (!searchFilter) return resources;

    return resources.filter(function(resource) {
        var jsonres = JSON.stringify(resource);
        if (searchFilter.includes(",")) {
            return searchFilter.split(",").some(function(el) { return jsonres.includes(el); });
        } else if (searchFilter.includes("&")) {
            return searchFilter.split("&").every(function(el) { return jsonres.includes(el); });
        } else {
            return jsonres.includes(searchFilter);
        }
    });
}

/**
 * Filter resources by regular expression.
 * Returns a new array of matching resources.
 */
function applyRegexFilter(resources, regexFilter) {
    if (!regexFilter) return resources;

    return resources.filter(function(resource) {
        var jsonres = JSON.stringify(resource);
        return regexFilter.test(jsonres);
    });
}

/**
 * Services excluded by default because they commonly fail (access denied on
 * accounts without the specialised service enabled, deprecated APIs, or niche
 * services most users don't care about). Pass --full to include them.
 * Names are matched via nav().toLowerCase() against section.service.
 */
var DEFAULT_EXCLUDED_SERVICES = [
    "auditmanager",
    "billingconductor",
    "costexplorer",
    "finspace",
    "twinmaker",
    "interactivevideoservice",
    "lex",
    "licensemanager",
    "locationservice",
    "macie",
    "organizations",
    "pinpoint",
    "quicksight",
    "rekognition"
];

/**
 * Filter sections array based on --services (include) or --exclude-services (exclude).
 * Unless opts.full is set, also drops services in DEFAULT_EXCLUDED_SERVICES
 * (except when the user explicitly lists them in --services).
 * Returns a new filtered array.
 */
function applyServiceFilter(sections, opts) {
    var services = opts.services;
    if (services && services.toUpperCase() === "ALL") {
        services = null;
    }

    if (opts.excludeServices && services) {
        throw new Error("Please do not use --exclude-services and --services simultaneously");
    }

    var includeExcludeServices = null;
    var includeExclude = opts.excludeServices || services;
    if (includeExclude) {
        includeExcludeServices = includeExclude.split(",").map(function(x) { return nav(x).toLowerCase(); });
    }

    return sections.filter(function(section) {
        var normalized = nav(section.service).toLowerCase();

        if (services) {
            return includeExcludeServices.includes(normalized);
        }

        if (opts.excludeServices && includeExcludeServices.includes(normalized)) {
            return false;
        }

        if (!opts.full && DEFAULT_EXCLUDED_SERVICES.includes(normalized)) {
            return false;
        }

        return true;
    });
}

module.exports = {
    nav: nav,
    applySearchFilter: applySearchFilter,
    applyRegexFilter: applyRegexFilter,
    applyServiceFilter: applyServiceFilter,
    DEFAULT_EXCLUDED_SERVICES: DEFAULT_EXCLUDED_SERVICES
};
