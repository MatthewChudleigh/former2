#!/usr/bin/env node

/**
 * Generate f2type → resourcetype mapping for browser datatable routing.
 *
 * Scans all shared/services/*.js files, extracts f2type values from
 * updateDatatable functions, and matches them to section resourcetype
 * names using name-based heuristics.
 *
 * Output: web/f2type-map.js
 */

const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, '..', 'shared', 'services');
const INFRA_FILES = new Set(['registry.js', 'loader.js', 'index.js']);

function navlower(str) {
    return str.toLowerCase().replace(/\s/g, '').replace(/,/g, '').replace(/-/g, '').replace(/&amp;/g, 'and');
}

/**
 * Score how well a f2type part matches a resourcetype navlower name.
 * Higher is better, 0 = no match.
 */
function matchScore(f2part, rtLower) {
    if (f2part === rtLower) return 100;
    if (f2part + 's' === rtLower) return 95;
    if (f2part + 'es' === rtLower) return 94;
    if (f2part.replace(/y$/, 'ies') === rtLower) return 93;

    // rtLower starts with f2part (e.g., 'bucket' matches 'bucketpolicies')
    // but prefer shorter matches (more specific)
    if (rtLower === f2part + 's' || rtLower === f2part + 'es') return 95;
    if (rtLower.startsWith(f2part) && rtLower.length - f2part.length <= 2) return 80;

    // f2part starts with rtLower
    if (f2part.startsWith(rtLower) && f2part.length - rtLower.length <= 2) return 70;

    return 0;
}

/**
 * Try to match f2type to a resourcetype name from the section.
 * Returns the best matching rtName or null.
 */
function findBestMatch(f2type, rtNames, servicePrefixes) {
    // Extract the part after the dot: 's3.bucket' -> 'bucket'
    const dotIdx = f2type.indexOf('.');
    if (dotIdx === -1) return null;
    const f2part = f2type.substring(dotIdx + 1);

    let bestScore = 0;
    let bestRt = null;

    for (const rtName of rtNames) {
        const rtLower = navlower(rtName);
        const score = matchScore(f2part, rtLower);
        if (score > bestScore) {
            bestScore = score;
            bestRt = rtName;
        }
    }

    return bestScore >= 70 ? bestRt : null;
}

// Manual overrides for f2types that can't be matched by heuristics.
// These cover: multi-prefix services, non-standard naming, order mismatches.
const MANUAL_OVERRIDES = {
    // directoryservice: both types go to "Directories"
    'directoryservice.simplead': 'Directories',
    'directoryservice.microsoftad': 'Directories',

    // apigateway: v1 and v2 share section, need explicit mapping
    'apigateway.account': 'Account',
    'apigateway.clientcertificate': 'Client Certificates',
    'apigateway.apikey': 'API Keys',
    'apigateway.vpclink': 'VPC Links',
    'apigatewayv2.vpclink': 'VPC Links',
    'apigateway.usageplan': 'Usage Plans',
    'apigateway.usageplankey': 'Usage Plan Keys',
    'apigateway.domainname': 'Domain Names',
    'apigateway.basepathmapping': 'Base Path Mappings',
    'apigateway.requestvalidator': 'Request Validators',
    'apigateway.documentationpart': 'Documentation Parts',
    'apigateway.documentationversion': 'Documentation Versions',
    'apigateway.gatewayresponse': 'Gateway Responses',
    'apigateway.stage': 'Stages',
    'apigateway.deployment': 'Deployments',
    'apigateway.method': 'Methods',
    'apigateway.resource': 'Resources',
    'apigateway.model': 'Models',
    'apigateway.authorizer': 'Authorizers',
    'apigateway.restapi': 'REST APIs',
    'apigatewayv2.api': 'V2 APIs',
    'apigatewayv2.stage': 'Stages',
    'apigatewayv2.deployment': 'Deployments',
    'apigatewayv2.model': 'Models',
    'apigatewayv2.authorizer': 'Authorizers',
    'apigatewayv2.route': 'Routes',
    'apigatewayv2.routeresponse': 'Route Responses',
    'apigatewayv2.integration': 'Integrations',
    'apigatewayv2.integrationresponse': 'Integration Responses',
    'apigatewayv2.domainname': 'Domain Names',
    'apigatewayv2.apimapping': 'API Mappings',

    // cloudfront: order mismatch in source
    'cloudfront.distribution': 'Distributions',
    'cloudfront.streamingdistribution': 'Streaming Distributions',
    'cloudfront.originaccessidentity': 'Origin Access Identities',
    'cloudfront.originaccesscontrol': 'Origin Access Controls',
    'cloudfront.continuousdeploymentpolicy': 'Continuous Deployment Policies',
    'cloudfront.cachepolicy': 'Cache Policies',
    'cloudfront.originrequestpolicy': 'Origin Request Policies',
    'cloudfront.realtimelogconfig': 'Realtime Log Configs',
    'cloudfront.keygroup': 'Key Groups',
    'cloudfront.function': 'Functions',
    'cloudfront.responseheaderspolicy': 'Response Headers Policies',

    // route53: order mismatch in source
    'route53.hostedzone': 'Hosted Zones',
    'route53.record': 'Records',
    'route53.healthcheck': 'Health Checks',
    'route53.resolverendpoint': 'Resolver Endpoints',
    'route53.resolverrule': 'Resolver Rules',
    'route53.resolverruleassociation': 'Resolver Rule Associations',
    'route53.resolverqueryloggingconfig': 'Resolver Query Logging Configs',
    'route53.resolverqueryloggingconfigassociation': 'Resolver Query Logging Config Associations',
    'route53.keysigningkey': 'Key Signing Keys',
    'route53.dnssec': 'DNSSEC',
    'route53.resolverdnssecconfig': 'Resolver DNSSEC Config',
    'route53.resolverconfig': 'Resolver Config',
    'route53.resolverfirewalldomainlist': 'Resolver Firewall Domain Lists',
    'route53.resolverfirewallrulegroup': 'Resolver Firewall Rule Groups',
    'route53.resolverfirewallrulegroupassociation': 'Resolver Firewall Rule Group Associations',
    'route53.recoverycontrolcluster': 'Recovery Control Clusters',
    'route53.recoverycontrolcontrolpanel': 'Recovery Control Control Panels',
    'route53.recoverycontrolroutingcontrol': 'Recovery Control Routing Controls',
    'route53.recoveryreadinessrecoverygroup': 'Recovery Readiness Recovery Groups',
    'route53.recoveryreadinesscell': 'Recovery Readiness Cells',
    'route53.recoveryreadinessresourceset': 'Recovery Readiness Resource Sets',
    'route53.recoveryreadinesscheck': 'Recovery Readiness Checks',
    'route53.cidrcollection': 'CIDR Collections',

    // glue: order mismatch
    'glue.database': 'Databases',
    'glue.table': 'Tables',
    'glue.partition': 'Partitions',
    'glue.crawler': 'Crawlers',
    'glue.classifier': 'Classifiers',
    'glue.job': 'Jobs',
    'glue.trigger': 'Triggers',
    'glue.connection': 'Connections',
    'glue.mltransform': 'ML Transforms',
    'glue.devendpoint': 'Dev Endpoints',
    'glue.workflow': 'Workflows',
    'glue.securityconfiguration': 'Security Configuration',
    'glue.datacatalogencryptionsettings': 'Data Catalog Encryption Settings',
    'glue.registry': 'Registries',
    'glue.schema': 'Schemas',
    'glue.schemaversion': 'Schema Versions',

    // Application Auto Scaling: used in multiple services with long prefix
    'applicationautoscaling.scalabletarget': 'Application Auto Scaling Scalable Targets',
    'applicationautoscaling.scalingpolicy': 'Application Auto Scaling Scaling Policies',

    // Application Insights (in cloudwatch.js)
    'applicationinsights.application': 'Application Insights Applications',

    // Auto Scaling: non-standard naming
    'autoscaling.lifecyclehook': 'Auto Scaling Lifecycle Hooks',
    'autoscaling.policy': 'Auto Scaling Policies',
    'autoscaling.scheduledaction': 'Auto Scaling Scheduled Actions',

    // DataSync: location types have reversed naming (e.g., locationefs → EFS Locations)
    'datasync.locationefs': 'EFS Locations',
    'datasync.locationnfs': 'NFS Locations',
    'datasync.locations3': 'S3 Locations',
    'datasync.locationfsxwindows': 'FSx Windows Locations',
    'datasync.locationfsxlustre': 'FSx Lustre Locations',
    'datasync.locationsmb': 'SMB Locations',
    'datasync.locationobjectstorage': 'Object Storage Locations',
    'datasync.locationhdfs': 'HDFS Locations',
    'datasync.locationfsxopenzfs': 'FSx OpenZFS Locations',
    'datasync.locationfsxontap': 'FSx ONTAP Locations',

    // Direct Connect
    'directconnect.hostedprivatevirtualinterface': 'Hosted Private VIFs',
    'directconnect.hostedpublicvirtualinterface': 'Hosted Public VIFs',

    // EC2 / VPC
    'ec2.networkinsightsanalysis': 'Network Insights Analyses',
    'ec2.networkinsightsaccessscopeanalysis': 'Network Insights Access Scope Analyses',
    'ec2.virtualprivategatewayroutepropagation': 'Virtual Private Gateway Route Propogations',
    'ec2.vpngateway': 'Virtual Private Gateways',

    // ELBv2
    'elbv2.loadbalancerlistener': 'V2 Load Balancer Listeners',
    'elbv2.loadbalancerlistenercertificate': 'V2 Load Balancer Listener Certificates',
    'elbv2.loadbalancerlistenerrule': 'V2 Load Balancer Listener Rules',
    'elbv2.targetgroup': 'V2 Target Groups',

    // Firewall Manager (in wafandshield.js)
    'fms.notificationchannel': 'Firewall Manager Notification Channel',
    'fms.policy': 'Firewall Manager Policies',

    // WAF Regional (in wafandshield.js)
    'wafregional.geomatchset': 'Regional Geo Match Sets',
    'wafregional.ratebasedrule': 'Regional Rate Based Rules',
    'wafregional.regexpatternset': 'Regional Regex Pattern Sets',
    'wafregional.webaclassociation': 'Regional Web ACL Associations',

    // IoT
    'iot.accountauditconfiguration': 'Audit Account Configuration',
    'iot.wirelessmultitaskgroup': 'Wireless Multicast Groups',

    // Kendra
    'kendra.index': 'Indices',

    // Lake Formation
    'lakeformation.tagassocation': 'Tag Associations',

    // Location Service
    'locationservice.placeindex': 'Place Indices',

    // QuickSight
    'quicksight.analysis': 'Analyses',

    // Single Sign-On
    'singlesignon.iacac': 'Instance Access Control Attribute Configurations',
};

const mapping = {};
let unmatched = 0;

const files = fs.readdirSync(servicesDir)
    .filter(f => f.endsWith('.js') && !INFRA_FILES.has(f))
    .sort();

for (const file of files) {
    const filePath = path.join(servicesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    let svc;
    try {
        svc = require(filePath);
    } catch (e) {
        console.warn(`Could not require ${file}: ${e.message}`);
        continue;
    }

    if (!svc.section || !svc.section.resourcetypes) continue;

    const rtNames = Object.keys(svc.section.resourcetypes);

    // Extract f2type values from updateDatatable function
    const updateStart = content.indexOf('async function updateDatatable');
    const mapStart = content.indexOf('function mapResources');
    if (updateStart === -1) continue;

    const updateBody = mapStart !== -1
        ? content.substring(updateStart, mapStart)
        : content.substring(updateStart);

    const f2typeRegex = /f2type:\s*'([^']+)'/g;
    const seenTypes = new Set();
    let match;
    while ((match = f2typeRegex.exec(updateBody)) !== null) {
        seenTypes.add(match[1]);
    }

    for (const f2type of seenTypes) {
        // Check manual override first
        if (MANUAL_OVERRIDES[f2type]) {
            mapping[f2type] = MANUAL_OVERRIDES[f2type];
            continue;
        }

        // Try name-based matching
        const bestMatch = findBestMatch(f2type, rtNames);
        if (bestMatch) {
            mapping[f2type] = bestMatch;
        } else {
            unmatched++;
            console.warn(`No match for f2type '${f2type}' in ${file} (rtNames: ${JSON.stringify(rtNames)})`);
        }
    }
}

// Validate: every mapped resourcetype must exist in its service's section
// (We trust the manual overrides and heuristic matches at this point)

// Write mapping file
const output = `// Auto-generated by scripts/generate-f2type-map.js
// Maps f2type values to section resourcetype names for browser datatable routing.
// Do not edit manually — regenerate with: node scripts/generate-f2type-map.js
module.exports = ${JSON.stringify(mapping, null, 2)};
`;

const outPath = path.join(__dirname, '..', 'web', 'f2type-map.js');
fs.writeFileSync(outPath, output);

console.log(`Generated mapping for ${Object.keys(mapping).length} f2types from ${files.length} services`);
if (unmatched > 0) {
    console.warn(`${unmatched} f2types could not be matched — add them to MANUAL_OVERRIDES`);
}
