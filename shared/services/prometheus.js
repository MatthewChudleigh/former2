const section = {
    'category': 'Management &amp; Governance',
    'service': 'Prometheus',
    'resourcetypes': {
        'Workspaces': {
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
                        title: 'Alias',
                        field: 'alias',
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
                        formatter: 'tickFormatter',
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    }
                ]
            ]
        },
        'Rule Groups Namespaces': {
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
                        field: 'workspace',
                        title: 'Workspace',
                        sortable: true,
                        editable: true,
                        formatter: 'tickFormatter',
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
    await context.sdkcall("Amp", "listWorkspaces", {
        // no params
    }, false).then(async (data) => {
        await Promise.all(data.workspaces.map(async (workspace) => {
            await context.sdkcall("Amp", "describeWorkspace", {
                workspaceId: workspace.workspaceId
            }, true).then((data) => {
                resources.push({
                    f2id: data.workspace.arn,
                    f2type: 'prometheus.workspace',
                    f2data: data.workspace,
                    f2region: context.region,
                    alias: data.workspace.alias,
                    id: data.workspace.ProductName
                });
            });

            return context.sdkcall("Amp", "listRuleGroupsNamespaces", {
                workspaceId: workspace.workspaceId
            }, false).then(async (data) => {
                await Promise.all(data.ruleGroupsNamespaces.map(ruleGroupNamespace => {
                    return context.sdkcall("Amp", "describeRuleGroupsNamespace", {
                        workspaceId: workspace.workspaceId,
                        name: ruleGroupNamespace.name
                    }, true).then((data) => {
                        data.ruleGroupsNamespace['workspace'] = workspace.arn;

                        resources.push({
                            f2id: data.ruleGroupsNamespace.arn,
                            f2type: 'prometheus.rulegroupsnamespace',
                            f2data: data.ruleGroupsNamespace,
                            f2region: context.region,
                            name: data.ruleGroupsNamespace.name,
                            workspace: workspace.workspaceId
                        });
                    });
                }));
            }).catch(() => { });
        }));
    }).catch(() => { });

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "prometheus.workspace") {
        reqParams.cfn['Alias'] = obj.data.alias;
        reqParams.tf['alias'] = obj.data.alias;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('prometheus', obj.id, 'AWS::APS::Workspace'),
            'region': obj.region,
            'service': 'prometheus',
            'type': 'AWS::APS::Workspace',
            'terraformType': 'aws_prometheus_workspace',
            'options': reqParams
        });
    } else if (obj.type == "prometheus.rulegroupsnamespace") {
        reqParams.cfn['Name'] = obj.data.name;
        reqParams.cfn['Workspace'] = obj.data.workspace;
        reqParams.cfn['Data'] = obj.data.data;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('prometheus', obj.id, 'AWS::APS::RuleGroupsNamespace'),
            'region': obj.region,
            'service': 'prometheus',
            'type': 'AWS::APS::RuleGroupsNamespace',
            'options': reqParams
        });
    } else {
        return false;
    }

    return true;
}

module.exports = { section, updateDatatable, mapResources };
