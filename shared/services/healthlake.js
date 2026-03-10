const section = {
    'category': 'Machine Learning',
    'service': 'HealthLake',
    'resourcetypes': {
        'FHIR Data Stores': {
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
                        field: 'id',
                        title: 'ID',
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
    await context.sdkcall("HealthLake", "listFHIRDatastores", {
        // no params
    }, false).then(async (data) => {
        await Promise.all(data.DatastorePropertiesList.map(datastore => {
            return context.sdkcall("HealthLake", "describeFHIRDatastore", {
                DatastoreId: datastore.DatastoreId
            }, true).then(async (data) => {
                resources.push({
                    f2id: data.DatastoreProperties.DatastoreArn,
                    f2type: 'healthlake.fhirdatastore',
                    f2data: data.DatastoreProperties,
                    f2region: context.region,
                    name: data.DatastoreProperties.DatastoreName,
                    id: data.DatastoreProperties.DatastoreId
                });
            });
        }));
    }).catch(() => { });

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "healthlake.fhirdatastore") {
        reqParams.cfn['DatastoreName'] = obj.data.DatastoreName;
        reqParams.cfn['DatastoreTypeVersion'] = obj.data.DatastoreTypeVersion;
        reqParams.cfn['SseConfiguration'] = obj.data.SseConfiguration;
        reqParams.cfn['PreloadDataConfig'] = obj.data.PreloadDataConfig;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('healthlake', obj.id, 'AWS::HealthLake::FHIRDatastore'),
            'region': obj.region,
            'service': 'healthlake',
            'type': 'AWS::HealthLake::FHIRDatastore',
            'options': reqParams,
            'returnValues': {
                'GetAtt': {
                    'DatastoreArn': obj.data.DatastoreArn,
                    'DatastoreId': obj.data.DatastoreId,
                    'DatastoreEndpoint': obj.data.DatastoreEndpoint
                }
            }
        });
    } else {
        return false;
    }

    return true;
}

module.exports = { section, updateDatatable, mapResources };
