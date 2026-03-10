const section = {
    'category': 'Media Services',
    'service': 'MediaPackage',
    'resourcetypes': {
        'Channels': {
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
                        title: 'ID',
                        field: 'id',
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
                        field: 'description',
                        title: 'Description',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    }
                ]
            ]
        },
        'Origin Endpoints': {
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
                        title: 'ID',
                        field: 'id',
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
                        field: 'channelid',
                        title: 'Channel ID',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    }
                ]
            ]
        }
    }
};

async function updateDatatable(context) {
    const resources = [];
    await context.sdkcall("MediaPackage", "listChannels", {
        // no params
    }, true).then(async (data) => {
        await Promise.all(data.Channels.map(channel => {
            return context.sdkcall("MediaPackage", "describeChannel", {
                Id: channel.Id
            }, true).then((data) => {
                resources.push({
                    f2id: data.Arn,
                    f2type: 'mediapackage.channel',
                    f2data: data,
                    f2region: context.region,
                    id: data.Id,
                    description: data.Description
                });
            });
        }));
    });

    await context.sdkcall("MediaPackage", "listOriginEndpoints", {
        // no params
    }, true).then(async (data) => {
        await Promise.all(data.OriginEndpoints.map(originendpoint => {
            return context.sdkcall("MediaPackage", "describeOriginEndpoint", {
                Id: originendpoint.Id
            }, true).then((data) => {
                resources.push({
                    f2id: data.Arn,
                    f2type: 'mediapackage.originendpoint',
                    f2data: data,
                    f2region: context.region,
                    id: data.Id,
                    channelid: data.ChannelIdChannelId
                });
            });
        }));
    });

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "mediapackage.channel") {
        reqParams.cfn['Id'] = obj.data.Id;
        reqParams.tf['channel_id'] = obj.data.Id;
        reqParams.cfn['Description'] = obj.data.Description;
        reqParams.tf['description'] = obj.data.Description;
        if (obj.data.Tags) {
            reqParams.cfn['Tags'] = [];
            reqParams.tf['tags'] = obj.data.Tags;
            for (var key of Object.keys(obj.data.Tags)) {
                if (!key.startsWith("aws:")) {
                    reqParams.cfn['Tags'].push({
                        'Key': key,
                        'Value': obj.data.Tags[key]
                    });
                }
            }
        }

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('mediapackage', obj.id, 'AWS::MediaPackage::Channel'),
            'region': obj.region,
            'service': 'mediapackage',
            'type': 'AWS::MediaPackage::Channel',
            'terraformType': 'aws_media_package_channel',
            'options': reqParams
        });
    } else if (obj.type == "mediapackage.originendpoint") {
        reqParams.cfn['Id'] = obj.data.Id;
        reqParams.cfn['Description'] = obj.data.Description;
        reqParams.cfn['ChannelId'] = obj.data.ChannelId;
        reqParams.cfn['Authorization'] = obj.data.Authorization;
        reqParams.cfn['CmafPackage'] = obj.data.CmafPackage;
        if (obj.data.DashPackage) {
            reqParams.cfn['DashPackage'] = {
                'AdsOnDeliveryRestrictions': obj.data.DashPackage.AdsOnDeliveryRestrictions,
                'AdTriggers': obj.data.DashPackage.AdTriggers,
                'Encryption': obj.data.DashPackage.Encryption,
                'ManifestLayout': obj.data.DashPackage.ManifestLayout,
                'ManifestWindowSeconds': obj.data.DashPackage.ManifestWindowSeconds,
                'MinBufferTimeSeconds': obj.data.DashPackage.MinBufferTimeSeconds,
                'MinUpdatePeriodSeconds': obj.data.DashPackage.MinUpdatePeriodSeconds,
                'PeriodTriggers': obj.data.DashPackage.PeriodTriggers,
                'Profile': obj.data.DashPackage.Profile,
                'SegmentDurationSeconds': obj.data.DashPackage.SegmentDurationSeconds,
                'SegmentTemplateFormat': obj.data.DashPackage.SegmentTemplateFormat,
                'StreamSelection': obj.data.DashPackage.StreamSelection,
                'SuggestedPresentationDelaySeconds': obj.data.DashPackage.SuggestedPresentationDelaySeconds
            };
        }
        reqParams.cfn['HlsPackage'] = obj.data.HlsPackage;
        reqParams.cfn['ManifestName'] = obj.data.ManifestName;
        reqParams.cfn['MssPackage'] = obj.data.MssPackage;
        reqParams.cfn['Origination'] = obj.data.Origination;
        reqParams.cfn['StartoverWindowSeconds'] = obj.data.StartoverWindowSeconds;
        reqParams.cfn['TimeDelaySeconds'] = obj.data.TimeDelaySeconds;
        reqParams.cfn['Whitelist'] = obj.data.Whitelist;
        if (obj.data.Tags) {
            reqParams.cfn['Tags'] = [];
            for (var key of Object.keys(obj.data.Tags)) {
                if (!key.startsWith("aws:")) {
                    reqParams.cfn['Tags'].push({
                        'Key': key,
                        'Value': obj.data.Tags[key]
                    });
                }
            }
        }

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('mediapackage', obj.id, 'AWS::MediaPackage::OriginEndpoint'),
            'region': obj.region,
            'service': 'mediapackage',
            'type': 'AWS::MediaPackage::OriginEndpoint',
            'options': reqParams
        });
    } else {
        return false;
    }

    return true;
}

module.exports = { section, updateDatatable, mapResources };
