const section = {
    'category': 'Developer Tools',
    'service': 'Cloud9',
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
                        field: 'id',
                        title: 'ID',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    },
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
    await context.sdkcall("Cloud9", "listEnvironments", {
        // no params
    }, true).then(async (data) => {
        await Promise.all(data.environmentIds.map(environmentId => {
            return context.sdkcall("Cloud9", "describeEnvironments", {
                environmentIds: [environmentId]
            }, true).then((data) => {
                data.environments.forEach(environment => {
                    resources.push({
                        f2id: environment.arn,
                        f2type: 'cloud9.environment',
                        f2data: environment,
                        f2region: context.region,
                        f2link: 'https://console.aws.amazon.com/cloud9/home/environments/' + environment.id,
                        name: environment.name,
                        id: environment.id,
                        description: environment.description
                    });
                });
            });
        }));
    }).catch(() => { });

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "cloud9.environment") {
        if (obj.data.type == "ec2") {
            reqParams.cfn['Name'] = obj.data.name;
            reqParams.tf['name'] = obj.data.name;
            reqParams.cfn['Description'] = obj.data.description;
            reqParams.tf['description'] = obj.data.description;
            reqParams.cfn['OwnerArn'] = obj.data.ownerArn;
            reqParams.tf['owner_arn'] = obj.data.ownerArn;
            reqParams.cfn['InstanceType'] = 'REPLACEME';
            reqParams.tf['instance_type'] = 'REPLACEME';
            reqParams.cfn['SubnetId'] = 'REPLACEME';
            reqParams.tf['subnet_id'] = 'REPLACEME';

            /*
            TODO:
            Repositories: 
                - Repository
            AutomaticStopTimeMinutes: Integer
            */

            tracked_resources.push({
                'obj': obj,
                'logicalId': getResourceName('cloud9', obj.id, 'AWS::Cloud9::EnvironmentEC2'),
                'region': obj.region,
                'service': 'cloud9',
                'type': 'AWS::Cloud9::EnvironmentEC2',
                'terraformType': 'aws_cloud9_environment_ec2',
                'options': reqParams,
                'returnValues': {
                    'Ref': obj.data.id,
                    'GetAtt': {
                        'Arn': obj.data.arn,
                        'Name': obj.data.name
                    }
                }
            });
        }
    } else {
        return false;
    }

    return true;
}

module.exports = { section, updateDatatable, mapResources };
