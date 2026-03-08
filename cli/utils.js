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
 * Filter sections array based on --services (include) or --exclude-services (exclude).
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

    var includeExclude = opts.excludeServices || services;
    if (!includeExclude) return sections;

    var includeExcludeServices = includeExclude.split(",").map(function(x) { return nav(x).toLowerCase(); });

    return sections.filter(function(section) {
        var includes = includeExcludeServices.includes(nav(section.service).toLowerCase());
        if (services && !includes) return false;
        if (opts.excludeServices && includes) return false;
        return true;
    });
}

module.exports = {
    nav: nav,
    applySearchFilter: applySearchFilter,
    applyRegexFilter: applyRegexFilter,
    applyServiceFilter: applyServiceFilter
};
