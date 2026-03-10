const section = {
    'category': 'Machine Learning',
    'service': 'DevOps Guru',
    'resourcetypes': {
        'Resource Collections': {
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
                        title: 'Stack Names',
                        field: 'stacknames',
                        rowspan: 2,
                        align: 'center',
                        valign: 'middle',
                        sortable: true,
                        formatter: 'primaryFieldFormatter',
                        footerFormatter: 'textFormatter'
                    }
                ],
                [
                    // none
                ]
            ]
        },
        'Notification Channels': {
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
                        field: 'topicarn',
                        title: 'Topic ARN',
                        sortable: true,
                        editable: true,
                        formatter: 'dateFormatter',
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
    await context.sdkcall("DevOpsGuru", "getResourceCollection", {
        ResourceCollectionType: "AWS_CLOUD_FORMATION"
    }, false).then(async (data) => {
        resources.push({
            f2id: data.ResourceCollection.CloudFormation.StackNames.join(", ") + " (Resource Collection)",
            f2type: 'devopsguru.resourcecollection',
            f2data: data,
            f2region: context.region,
            stacknames: data.ResourceCollection.CloudFormation.StackNames.join(", ")
        });
    }).catch(() => { });

    await context.sdkcall("DevOpsGuru", "listNotificationChannels", {
        // no params
    }, false).then(async (data) => {
        data.Channels.forEach(channel => {
            resources.push({
                f2id: channel.Id,
                f2type: 'devopsguru.notificationchannel',
                f2data: channel,
                f2region: context.region,
                name: channel.Id,
                topicarn: channel.Config.Sns.TopicArn
            });
        });
        
    }).catch(() => { });

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "devopsguru.resourcecollection") {
        reqParams.cfn['ResourceCollectionFilter'] = obj.data.ResourceCollection;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('devopsguru', obj.id, 'AWS::DevOpsGuru::ResourceCollection'),
            'region': obj.region,
            'service': 'devopsguru',
            'type': 'AWS::DevOpsGuru::ResourceCollection',
            'options': reqParams
        });
    } else if (obj.type == "devopsguru.notificationchannel") {
        reqParams.cfn['Config'] = obj.data.Config;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('devopsguru', obj.id, 'AWS::DevOpsGuru::NotificationChannel'),
            'region': obj.region,
            'service': 'devopsguru',
            'type': 'AWS::DevOpsGuru::NotificationChannel',
            'options': reqParams,
            'returnValues': {
                'GetAtt': {
                    'Id': obj.data.Id
                }
            }
        });
    } else {
        return false;
    }

    return true;
}

module.exports = { section, updateDatatable, mapResources };
