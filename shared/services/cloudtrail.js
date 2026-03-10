const section = {
    'category': 'Management &amp; Governance',
    'service': 'CloudTrail',
    'resourcetypes': {
        'Trails': {
            'columns': [
                [
                    {
                        field: 'state',
                        checkbox: true,
                        rowspan: 2,
                        align: 'center',
                        valign: 'middle'
                    },
                    {
                        title: 'Name',
                        field: 'name',
                        rowspan: 2,
                        align: 'center',
                        valign: 'middle',
                        sortable: true,
                        formatter: 'primaryFieldFormatter',
                        footerFormatter: 'textFormatter'
                    },
                    {
                        title: 'Properties',
                        colspan: 4,
                        align: 'center'
                    }
                ],
                [
                    {
                        field: 'homeregion',
                        title: 'Home Region',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    },
                    {
                        field: 'multiregion',
                        title: 'Multi Region',
                        sortable: true,
                        editable: true,
                        formatter: 'tickFormatter',
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    },
                    {
                        field: 'organization',
                        title: 'Organization',
                        sortable: true,
                        editable: true,
                        formatter: 'tickFormatter',
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    },
                    {
                        field: 'bucketname',
                        title: 'Bucket Name',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    }
                ]
            ]
        },
        'Event Data Stores': {
            'columns': [
                [
                    {
                        field: 'state',
                        checkbox: true,
                        rowspan: 2,
                        align: 'center',
                        valign: 'middle'
                    },
                    {
                        title: 'Name',
                        field: 'name',
                        rowspan: 2,
                        align: 'center',
                        valign: 'middle',
                        sortable: true,
                        formatter: 'primaryFieldFormatter',
                        footerFormatter: 'textFormatter'
                    }
                ],
                [
                    // no params
                ]
            ]
        }
    }
};

async function updateDatatable(context) {
    const resources = [];
    await context.sdkcall("CloudTrail", "describeTrails", {
        // no params
    }, true).then(async (data) => {
        await Promise.all(data.trailList.map(async (trail) => {
            return context.sdkcall("CloudTrail", "getTrailStatus", {
                Name: trail.TrailARN
            }, true).then(async (trailstatus) => {
                trail['IsLogging'] = trailstatus.IsLogging;
                trail['Tags'] = await context.getResourceTags(trail.TrailARN);

                resources.push({
                    f2id: trail.TrailARN,
                    f2type: 'cloudtrail.trail',
                    f2data: trail,
                    f2region: context.region,
                    name: trail.Name,
                    multiregion: trail.IsMultiRegionTrail,
                    organization: trail.IsOrganizationTrail,
                    homeregion: trail.HomeRegion,
                    bucketname: trail.S3BucketName
                });
            });
        }));
    });

    await context.sdkcall("CloudTrail", "listEventDataStores", {
        // no params
    }, true).then(async (data) => {
        await Promise.all(data.EventDataStores.map(async (eventdatastore) => {
            return context.sdkcall("CloudTrail", "getEventDataStore", {
                EventDataStore: eventdatastore.EventDataStoreArn
            }, true).then(async (data) => {
                trail['Tags'] = await context.getResourceTags(data.EventDataStoreArn);

                resources.push({
                    f2id: data.EventDataStoreArn,
                    f2type: 'cloudtrail.eventdatastore',
                    f2data: data,
                    f2region: context.region,
                    name: data.Name
                });
            });
        }));
    }).catch(() => {});

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "cloudtrail.trail") {
        reqParams.cfn['TrailName'] = obj.data.Name;
        reqParams.tf['name'] = obj.data.Name;
        reqParams.cfn['S3BucketName'] = obj.data.S3BucketName;
        reqParams.tf['s3_bucket_name'] = obj.data.S3BucketName;
        reqParams.cfn['S3KeyPrefix'] = obj.data.S3KeyPrefix;
        reqParams.tf['s3_key_prefix'] = obj.data.S3KeyPrefix;
        if (obj.data.SnsTopicARN) {
            reqParams.cfn['SnsTopicName'] = obj.data.SnsTopicARN.split(":").pop();
            reqParams.tf['sns_topic_name'] = obj.data.SnsTopicARN.split(":").pop();
        }
        reqParams.cfn['IncludeGlobalServiceEvents'] = obj.data.IncludeGlobalServiceEvents;
        reqParams.tf['include_global_service_events'] = obj.data.IncludeGlobalServiceEvents;
        reqParams.cfn['IsMultiRegionTrail'] = obj.data.IsMultiRegionTrail;
        reqParams.tf['is_multi_region_trail'] = obj.data.IsMultiRegionTrail;
        reqParams.cfn['EnableLogFileValidation'] = obj.data.LogFileValidationEnabled;
        reqParams.tf['enable_log_file_validation'] = obj.data.LogFileValidationEnabled;
        reqParams.cfn['CloudWatchLogsLogGroupArn'] = obj.data.CloudWatchLogsLogGroupArn;
        reqParams.tf['cloud_watch_logs_group_arn'] = obj.data.CloudWatchLogsLogGroupArn;
        reqParams.cfn['CloudWatchLogsRoleArn'] = obj.data.CloudWatchLogsRoleArn;
        reqParams.tf['cloud_watch_logs_role_arn'] = obj.data.CloudWatchLogsRoleArn;
        reqParams.cfn['KMSKeyId'] = obj.data.KmsKeyId;
        reqParams.tf['kms_key_id'] = obj.data.KmsKeyId;
        reqParams.cfn['IsLogging'] = obj.data.IsLogging;
        reqParams.tf['enable_logging'] = obj.data.IsLogging;
        reqParams.cfn['Tags'] = stripAWSTags(obj.data.Tags);
        
        /*
        TODO:
        EventSelectors:
            - EventSelector
        */

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('cloudtrail', obj.id, 'AWS::CloudTrail::Trail'),
            'region': obj.region,
            'service': 'cloudtrail',
            'type': 'AWS::CloudTrail::Trail',
            'terraformType': 'aws_cloudtrail',
            'options': reqParams,
            'returnValues': {
                'Ref': obj.data.Name,
                'GetAtt': {
                    'Arn': obj.data.TrailARN,
                    'SnsTopicArn': obj.data.SnsTopicARN
                },
                'Import': {
                    'TrailName': obj.data.Name
                }
            }
        });
    } else if (obj.type == "cloudtrail.eventdatastore") {
        reqParams.cfn['Name'] = obj.data.Name;
        reqParams.cfn['AdvancedEventSelectors'] = obj.data.AdvancedEventSelectors;
        reqParams.cfn['MultiRegionEnabled'] = obj.data.MultiRegionEnabled;
        reqParams.cfn['OrganizationEnabled'] = obj.data.OrganizationEnabled;
        reqParams.cfn['RetentionPeriod'] = obj.data.RetentionPeriod;
        reqParams.cfn['TerminationProtectionEnabled'] = obj.data.TerminationProtectionEnabled;
        reqParams.cfn['Tags'] = stripAWSTags(obj.data.Tags);

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('cloudtrail', obj.id, 'AWS::CloudTrail::EventDataStore'),
            'region': obj.region,
            'service': 'cloudtrail',
            'type': 'AWS::CloudTrail::EventDataStore',
            'options': reqParams,
            'returnValues': {
                'Ref': obj.data.Name
            }
        });
    } else {
        return false;
    }

    return true;
}

module.exports = { section, updateDatatable, mapResources };
