const section = {
    'category': 'Other',
    'service': 'Resource Groups',
    'resourcetypes': {
        'Groups': {
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
    await context.sdkcall("ResourceGroups", "listGroups", {
        // no params
    }, true).then(async (data) => {
        data.Groups.forEach(async (group) => {
            await context.sdkcall("ResourceGroups", "getGroupQuery", {
                GroupName: group.Name
            }, true).then(async (querydata) => {
                group['ResourceQuery'] = querydata.GroupQuery.ResourceQuery;
            }).catch(() => { });

            resources.push({
                f2id: group.GroupArn,
                f2type: 'resourcegroups.group',
                f2data: group,
                f2region: context.region,
                name: group.Name,
                description: group.Description
            });
        });
    }).catch(() => { });

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "resourcegroups.group") {
        reqParams.cfn['Name'] = obj.data.Name;
        reqParams.tf['name'] = obj.data.Name;
        reqParams.cfn['Description'] = obj.data.Description;
        reqParams.tf['description'] = obj.data.Description;
        reqParams.cfn['ResourceQuery'] = {
            'Type': obj.data.ResourceQuery.Type,
            'Query': JSON.parse(obj.data.ResourceQuery.Query)
        };
        reqParams.tf['resource_query'] = {
            'type': obj.data.ResourceQuery.Type,
            'query': obj.data.ResourceQuery.Query
        };

        /*
        TODO:
        Tags
        */

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('resourcegroups', obj.id, 'AWS::ResourceGroups::Group'),
            'region': obj.region,
            'service': 'resourcegroups',
            'type': 'AWS::ResourceGroups::Group',
            'terraformType': 'aws_resourcegroups_group',
            'options': reqParams,
            'returnValues': {
                'Ref': obj.data.Name,
                'GetAtt': {
                    'Arn': obj.data.GroupArn
                },
                'Import': {
                    'Name': obj.data.Name
                }
            }
        });
    } else {
        return false;
    }

    return true;
}

module.exports = { section, updateDatatable, mapResources };
