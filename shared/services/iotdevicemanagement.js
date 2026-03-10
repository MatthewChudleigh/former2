const section = {
    'category': 'Internet of Things',
    'service': 'Device Management',
    'resourcetypes': {
        'Fleet Hub Applications': {
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
                        field: 'description',
                        title: 'Description',
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
    await context.sdkcall("IoTFleetHub", "listApplications", {
        // no params
    }, false).then(async (data) => {
        await Promise.all(data.applicationSummaries.map(async (app) => {
            return context.sdkcall("IoTFleetHub", "describeApplication", {
                applicationId: app.applicationId
            }, true).then(async (data) => {
                resources.push({
                    f2id: data.applicationArn,
                    f2type: 'iotdevicemanagement.fleethubapplication',
                    f2data: data,
                    f2region: context.region,
                    name: data.applicationName,
                    description: data.applicationDescription
                });
            });
        }));
    }).catch(err => { });

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "iotdevicemanagement.fleethubapplication") {
        reqParams.cfn['ApplicationName'] = obj.data.applicationName;
        reqParams.cfn['ApplicationDescription'] = obj.data.applicationDescription;
        reqParams.cfn['RoleArn'] = obj.data.roleArn;
        if (obj.data.tags) {
            reqParams.cfn['Tags'] = [];
            Object.keys(obj.data.tags).forEach(tagKey => {
                if (!tagKey.startsWith("aws:")) {
                    reqParams.cfn['Tags'].push({
                        'Key': tagKey,
                        'Value': obj.data.tags[tagKey]
                    });
                }
            });
        }

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('iot', obj.id, 'AWS::IoTFleetHub::Application'),
            'region': obj.region,
            'service': 'iot',
            'type': 'AWS::IoTFleetHub::Application',
            'options': reqParams
        });
    } else {
        return false;
    }

    return true;
}

module.exports = { section, updateDatatable, mapResources };
