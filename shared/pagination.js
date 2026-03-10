// shared/pagination.js
//
// Pagination logic extracted from js/datatables.js (lines 336-564) and
// cli/sdk-v3-shim.js (lines 346-454). Both sources implement the same
// pagination token patterns; this module provides a single shared copy.
//
// Reference: https://github.com/iann0036/aws-pagination-rules

/**
 * Given an SDK response, determine if there are more pages to fetch.
 *
 * Returns { hasMore: false } when pagination is complete, or
 * { hasMore: true, nextParams: { ... } } with the parameter(s) to merge
 * into the next request.
 *
 * @param {string} svc     - AWS service name (e.g. 'S3', 'EC2')
 * @param {string} method  - API method name (e.g. 'listBuckets')
 * @param {Object} data    - The response from the current page
 * @param {Object} params  - The parameters used for the current request
 * @returns {{ hasMore: boolean, nextParams?: Object }}
 */
function getPaginationParams(svc, method, data, params) {
    // CloudWatchLogs describeLogStreams — never paginate
    if (svc === "CloudWatchLogs" && method === "describeLogStreams") {
        return { hasMore: false };
    }

    // NextToken (most common, PascalCase)
    if (data.NextToken) {
        return { hasMore: true, nextParams: { NextToken: data.NextToken } };
    }

    // nextToken (camelCase variant)
    if (data.nextToken) {
        return { hasMore: true, nextParams: { nextToken: data.nextToken } };
    }

    // CloudFront DistributionList.NextMarker
    if (data.DistributionList && data.DistributionList.NextMarker) {
        if (params && params.Marker === data.DistributionList.NextMarker) {
            return { hasMore: false };
        }
        return { hasMore: true, nextParams: { Marker: data.DistributionList.NextMarker } };
    }

    // NextMarker — WAF services use NextMarker param, others use Marker param
    if (data.NextMarker) {
        if (params && params.Marker && data.NextMarker && params.Marker === data.NextMarker) {
            return { hasMore: false };
        }
        if (["WAF", "WAFRegional", "WAFV2"].includes(svc)) {
            return { hasMore: true, nextParams: { NextMarker: data.NextMarker } };
        }
        return { hasMore: true, nextParams: { Marker: data.NextMarker } };
    }

    // NextPageMarker — Route53Domains
    if (data.NextPageMarker) {
        return { hasMore: true, nextParams: { Marker: data.NextPageMarker } };
    }

    // Marker — generic, but excluded for services that use Marker for other purposes
    if (data.Marker && !["WAF", "WAFRegional", "WAFV2", "Route53", "EFS", "ELB", "ELBv2", "KMS", "Lambda"].includes(svc)) {
        if (svc === "Glacier") {
            return { hasMore: true, nextParams: { marker: data.Marker } };
        }
        return { hasMore: true, nextParams: { Marker: data.Marker } };
    }

    // NextPageToken — CostExplorer uses NextPageToken param, others use PageToken
    if (data.NextPageToken) {
        if (svc === "CostExplorer") {
            return { hasMore: true, nextParams: { NextPageToken: data.NextPageToken } };
        }
        return { hasMore: true, nextParams: { PageToken: data.NextPageToken } };
    }

    // NextContinuationToken — S3
    if (data.NextContinuationToken) {
        return { hasMore: true, nextParams: { ContinuationToken: data.NextContinuationToken } };
    }

    // PaginationToken — ResourceGroupsTaggingAPI
    if (data.PaginationToken) {
        return { hasMore: true, nextParams: { PaginationToken: data.PaginationToken } };
    }

    // nextMarker (camelCase) — IoT
    if (data.nextMarker) {
        return { hasMore: true, nextParams: { marker: data.nextMarker } };
    }

    // nextPageToken (camelCase) — SWF uses nextPageToken param, Lightsail uses pageToken
    if (data.nextPageToken) {
        if (svc === "SWF") {
            return { hasMore: true, nextParams: { nextPageToken: data.nextPageToken } };
        }
        return { hasMore: true, nextParams: { pageToken: data.nextPageToken } };
    }

    // marker (camelCase) — DataPipeline
    if (data.marker) {
        return { hasMore: true, nextParams: { marker: data.marker } };
    }

    // position — APIGateway
    if (data.position && svc === "APIGateway") {
        return { hasMore: true, nextParams: { position: data.position } };
    }

    // CloudFront generic nested NextMarker (non-DistributionList)
    if (svc === "CloudFront" && typeof data === "object" && Object.keys(data).length &&
        data[Object.keys(data)[0]] && data[Object.keys(data)[0]].NextMarker) {
        return { hasMore: true, nextParams: { Marker: data[Object.keys(data)[0]].NextMarker } };
    }

    // Pinpoint nested NextToken
    if (svc === "Pinpoint" && typeof data === "object" && Object.keys(data).length &&
        data[Object.keys(data)[0]] && data[Object.keys(data)[0]].NextToken) {
        return { hasMore: true, nextParams: { Token: data[Object.keys(data)[0]].NextToken } };
    }

    // DynamoDB listGlobalTables
    if (svc === "DynamoDB" && method === "listGlobalTables" && data.LastEvaluatedGlobalTableName) {
        return { hasMore: true, nextParams: { ExclusiveStartGlobalTableName: data.LastEvaluatedGlobalTableName } };
    }

    // DynamoDB listTables
    if (svc === "DynamoDB" && method === "listTables" && data.LastEvaluatedTableName) {
        return { hasMore: true, nextParams: { ExclusiveStartTableName: data.LastEvaluatedTableName } };
    }

    // DynamoDBStreams listStreams
    if (svc === "DynamoDBStreams" && method === "listStreams" && data.LastEvaluatedStreamArn) {
        return { hasMore: true, nextParams: { ExclusiveStartStreamArn: data.LastEvaluatedStreamArn } };
    }

    // Firehose listDeliveryStreams
    if (svc === "Firehose" && method === "listDeliveryStreams" && data.DeliveryStreamNames && data.DeliveryStreamNames.length) {
        return { hasMore: true, nextParams: { ExclusiveStartDeliveryStreamName: data.DeliveryStreamNames[data.DeliveryStreamNames.length - 1] } };
    }

    // Kinesis listStreams
    if (svc === "Kinesis" && method === "listStreams" && data.StreamNames && data.StreamNames.length) {
        return { hasMore: true, nextParams: { ExclusiveStartStreamName: data.StreamNames[data.StreamNames.length - 1] } };
    }

    // KinesisAnalytics listApplications
    if (svc === "KinesisAnalytics" && method === "listApplications" && data.ApplicationSummaries && data.ApplicationSummaries.length) {
        return { hasMore: true, nextParams: { ExclusiveStartApplicationName: data.ApplicationSummaries[data.ApplicationSummaries.length - 1].ApplicationName } };
    }

    // No pagination token found
    return { hasMore: false };
}

/**
 * Recursive paginating wrapper around a raw SDK call.
 *
 * Calls rawCall repeatedly until getPaginationParams reports no more pages,
 * merging results with deepmerge.all(). Both the browser sdkcall (v2) and
 * CLI sdkcall (v3) can delegate their pagination logic to this function.
 *
 * @param {Function} rawCall   - Single-page SDK call: (svc, method, params) => Promise<data>
 * @param {string} svc         - AWS service name
 * @param {string} method      - API method name
 * @param {Object} params      - Request parameters (mutated with pagination tokens)
 * @param {Object} deepmerge   - The deepmerge module (must have .all())
 * @returns {Promise<Object>}  Fully-merged response across all pages
 */
async function paginatedCall(rawCall, svc, method, params, deepmerge) {
    var data = await rawCall(svc, method, params);
    var pagination = getPaginationParams(svc, method, data, params);

    if (pagination.hasMore) {
        Object.assign(params, pagination.nextParams);
        var nextData = await paginatedCall(rawCall, svc, method, params, deepmerge);
        return deepmerge.all([data, nextData]);
    }

    return data;
}

module.exports = { getPaginationParams, paginatedCall };
