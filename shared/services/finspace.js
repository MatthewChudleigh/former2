const section = {
    'category': 'Analytics',
    'service': 'FinSpace',
    'resourcetypes': {
        'Environments': {
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
    await context.sdkcall("Finspace", "listEnvironments", {
        // no params
    }, false).then(async (data) => {
        await Promise.all(data.environments.map(environment => {
            return context.sdkcall("Finspace", "getEnvironment", {
                environmentId: environment.environmentId
            }, true).then(async (data) => {
                resources.push({
                    f2id: data.environment.environmentArn,
                    f2type: 'finspace.environment',
                    f2data: data.environment,
                    f2region: context.region,
                    name: data.environment.name,
                    description: data.environment.description
                });
            });
        }));
    }).catch(() => { });

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "finspace.environment") {
        reqParams.cfn['Name'] = obj.data.name;
        reqParams.cfn['Description'] = obj.data.description;
        reqParams.cfn['KmsKeyId'] = obj.data.kmsKeyId;
        reqParams.cfn['FederationMode'] = obj.data.federationMode;
        if (obj.data.federationParameters) {
            reqParams.cfn['FederationParameters'] = {
                'FederationProviderName': obj.data.federationParameters.federationProviderName,
                'SamlMetadataDocument': obj.data.federationParameters.samlMetadataDocument,
                'SamlMetadataURL': obj.data.federationParameters.samlMetadataURL
            };
        }

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('finspace', obj.id, 'AWS::FinSpace::Environment'),
            'region': obj.region,
            'service': 'finspace',
            'type': 'AWS::FinSpace::Environment',
            'options': reqParams,
            'returnValues': {
                'Ref': obj.data.name,
                'GetAtt': {
                    'EnvironmentArn': obj.data.environmentArn,
                    'EnvironmentUrl': obj.data.environmentUrl
                }
            }
        });
    } else {
        return false;
    }

    return true;
}

module.exports = { section, updateDatatable, mapResources };
