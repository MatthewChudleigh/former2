// web/sdkcall-browser.js
//
// Browser-side sdkcall implementation using AWS SDK v2 (loaded globally).
// Uses shared pagination module for consistent pagination handling.

var { getPaginationParams } = require('../shared/pagination');
var deepmerge = require('deepmerge');
var { SERVICE_REGION_OVERRIDES, SERVICE_OPTIONS, THROTTLE_CODES, THROTTLE_MESSAGES } = require('../shared/sdkcall');

/**
 * Create a browser-side sdkcall function.
 *
 * @param {Object} options
 * @param {Function} options.getRegion    - Returns the current region
 * @param {Function} options.getAWS       - Returns the AWS SDK object (may be proxied by extension)
 * @param {Function} [options.onLog]      - Log callback
 * @param {Function} [options.onDebug]    - Debug callback
 * @param {Function} [options.onTrace]    - Trace callback
 * @param {Function} [options.onError]    - Error notification callback (title, message)
 * @returns {Function} sdkcall(svc, method, params, alertOnErrors, backoff)
 */
function createBrowserSdkcall(options) {
    var getRegion = options.getRegion;
    var getAWS = options.getAWS;
    var onLog = options.onLog || function() {};
    var onDebug = options.onDebug || function() {};
    var onTrace = options.onTrace || function() {};
    var onError = options.onError || function() {};

    function sdkcall(svc, method, params, alertOnErrors, backoff) {
        onDebug(String(svc) + "." + String(method) + " - " + JSON.stringify(params));

        return new Promise(function(resolve, reject) {
            var region = getRegion();
            var serviceoptions = { region: region, customUserAgent: 'former2/latest' };

            // Service-specific overrides
            if (SERVICE_REGION_OVERRIDES[svc]) {
                serviceoptions.region = SERVICE_REGION_OVERRIDES[svc];
            }
            if (SERVICE_OPTIONS[svc]) {
                Object.assign(serviceoptions, SERVICE_OPTIONS[svc]);
            }

            // LocalStack support
            if (window.localStorage.getItem('uselocalstackendpoint') === 'true') {
                serviceoptions.accessKeyId = 'test';
                serviceoptions.secretAccessKey = 'test';
                serviceoptions.sessionToken = null;
                serviceoptions.endpoint = 'http://localhost:4566';

                if (svc === 'STS' && method === 'GetCallerIdentity') {
                    resolve({
                        Account: '000000000000',
                        Arn: 'arn:aws:iam::000000000000:user/localstackuser',
                        UserId: 'AKIAI44QH8DHBEXAMPLE'
                    });
                    return;
                }
            }

            var AWS = getAWS();
            var service = new AWS[svc](serviceoptions);

            service[method].call(service, params, async function(err, data) {
                if (err) {
                    // Throttle/retry logic
                    var isThrottle = THROTTLE_CODES.includes(err.code) ||
                        THROTTLE_MESSAGES.some(function(m) { return err.message === m; });

                    if (isThrottle) {
                        if (backoff) {
                            onLog("Too many requests for " + svc + "." + method + ", sleeping for " + backoff + "ms");
                            await new Promise(function(r) { setTimeout(r, backoff); });
                            backoff *= 2;
                            if (backoff > 120000) {
                                reject(data);
                                return;
                            }
                        } else {
                            onLog("Too many requests for " + svc + "." + method + ", sleeping for 500ms");
                            await new Promise(function(r) { setTimeout(r, 500); });
                            backoff = 500 + Math.floor(Math.random() * 500);
                        }
                        sdkcall(svc, method, params, alertOnErrors, backoff).then(
                            function(newdata) { resolve(newdata); },
                            function(data) { reject(data); }
                        );
                    } else {
                        // Error classification
                        if (err.code === 'NetworkingError') {
                            onLog("Skipping " + svc + "." + method + " NetworkingError");
                        } else if (err.code === 'AccessDeniedException') {
                            onLog("Skipping " + svc + "." + method + " AccessDeniedException");
                        } else if (err.code === 'UnknownError' && svc === 'MediaStore') {
                            onLog("Skipping " + svc + "." + method + " UnknownError");
                        } else if (err.code === 'ForbiddenException' && svc === 'RoboMaker') {
                            onLog("Skipping " + svc + "." + method + " ForbiddenException");
                        } else if (err.code === 'AccessDeniedException' && svc === 'FSx') {
                            onLog("Skipping " + svc + "." + method + " AccessDeniedException");
                        } else if (err.code === 'UnknownError' && window.localStorage.getItem('uselocalstackendpoint') === 'true') {
                            onLog("Skipping " + svc + "." + method + " UnknownError when in LocalStack mode");
                        } else if (err.code === 'InternalFailure' && window.localStorage.getItem('uselocalstackendpoint') === 'true') {
                            onLog("Skipping " + svc + "." + method + " InternalFailure when in LocalStack mode");
                        } else if (alertOnErrors) {
                            onLog("Error calling " + svc + "." + method + ". " + (err.message || JSON.stringify(err)));
                            onTrace(err);

                            if (err.message) {
                                onError('Error calling ' + svc + '.' + method, err.message);
                            } else if (err.retryDelay) {
                                if (window.localStorage.getItem('uselocalstackendpoint') !== 'true') {
                                    onError('Error calling ' + svc + '.' + method, 'Credentials may not be correctly configured');
                                }
                            } else {
                                onError('Error calling ' + svc + '.' + method, JSON.stringify(err));
                            }
                        }

                        reject(data);
                    }
                } else {
                    if (!data || Object.keys(data).length === 0) {
                        reject(data);
                        return;
                    }

                    // Pagination handling using shared module
                    var pagination = getPaginationParams(svc, method, data, params);
                    if (pagination.hasMore) {
                        Object.assign(params, pagination.nextParams);
                        sdkcall(svc, method, params, alertOnErrors).then(
                            function(newdata) { resolve(deepmerge.all([data, newdata])); },
                            function(data) { reject(data); }
                        );
                    } else {
                        resolve(data);
                    }
                }
            });
        });
    }

    return sdkcall;
}

/**
 * Browser-side sdkcall waiter for CloudFormation operations.
 */
function createBrowserSdkcallWaiter(options) {
    var getRegion = options.getRegion;
    var getAWS = options.getAWS;

    return function sdkcallwaiter(svc, method, params1, params2) {
        return new Promise(function(resolve) {
            var serviceoptions = { region: getRegion() };
            if (window.localStorage.getItem('uselocalstackendpoint') === 'true') {
                serviceoptions.accessKeyId = 'test';
                serviceoptions.secretAccessKey = 'test';
                serviceoptions.sessionToken = null;
                serviceoptions.endpoint = 'http://localhost:4566';
            }
            var AWS = getAWS();
            var service = new AWS[svc](serviceoptions);
            service[method].call(service, params1, params2, async function() {
                resolve();
            });
        });
    };
}

module.exports = { createBrowserSdkcall, createBrowserSdkcallWaiter };
