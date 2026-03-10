const section = {
    'category': 'AWS Cost Management',
    'service': 'Cost Explorer',
    'resourcetypes': {
        'Cost Categories': {
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
                        field: 'ruleversion',
                        title: 'Rule Version',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    }
                ]
            ]
        },
        'Anomaly Monitors': {
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
                        field: 'type',
                        title: 'Type',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    }
                ]
            ]
        },
        'Anomaly Subscriptions': {
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
                        field: 'threshold',
                        title: 'Threshold',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    },
                    {
                        field: 'frequency',
                        title: 'Frequency',
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
    await context.sdkcall("CostExplorer", "listCostCategoryDefinitions", {
        // no params
    }, true).then(async (data) => {
        await Promise.all(data.CostCategoryReferences.map(ccr => {
            return context.sdkcall("CostExplorer", "describeCostCategoryDefinition", {
                CostCategoryArn: ccr.CostCategoryArn
            }, true).then(async (data) => {
                resources.push({
                    f2id: data.CostCategory.CostCategoryArn,
                    f2type: 'costexplorer.costcategory',
                    f2data: data.CostCategory,
                    f2region: context.region,
                    name: data.CostCategory.Name,
                    ruleversion: data.CostCategory.RuleVersion
                });
            });
        }));
    }).catch(() => { });

    await context.sdkcall("CostExplorer", "getAnomalyMonitors", {
        // no params
    }, true).then(async (data) => {
        data.AnomalyMonitors.forEach(anomalymonitor => {
            resources.push({
                f2id: anomalymonitor.MonitorArn,
                f2type: 'costexplorer.anomalymonitor',
                f2data: anomalymonitor,
                f2region: context.region,
                name: anomalymonitor.MonitorName,
                type: anomalymonitor.MonitorType
            });
        });
    }).catch(() => { });

    await context.sdkcall("CostExplorer", "getAnomalySubscriptions", {
        // no params
    }, true).then(async (data) => {
        data.AnomalySubscriptions.forEach(anomalysubscription => {
            resources.push({
                f2id: anomalysubscription.SubscriptionArn,
                f2type: 'costexplorer.anomalysubscription',
                f2data: anomalysubscription,
                f2region: context.region,
                name: anomalysubscription.SubscriptionName,
                threshold: anomalysubscription.Threshold,
                frequency: anomalysubscription.Frequency
            });
        });
    }).catch(() => { });

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "costexplorer.costcategory") {
        reqParams.cfn['Name'] = obj.data.Name;
        reqParams.cfn['Rules'] = obj.data.Rules;
        reqParams.cfn['RuleVersion'] = obj.data.RuleVersion;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('costexplorer', obj.id, 'AWS::CE::CostCategory'),
            'region': obj.region,
            'service': 'costexplorer',
            'type': 'AWS::CE::CostCategory',
            'options': reqParams,
            'returnValues': {
                'Ref': obj.data.CostCategoryArn,
                'Import': {
                    'Arn': obj.data.CostCategoryArn
                }
            }
        });
    } else if (obj.type == "costexplorer.anomalymonitor") {
        reqParams.cfn['MonitorName'] = obj.data.MonitorName;
        reqParams.cfn['MonitorType'] = obj.data.MonitorType;
        reqParams.cfn['MonitorDimension'] = obj.data.MonitorDimension;
        reqParams.cfn['MonitorSpecification'] = JSON.stringify(obj.data.MonitorSpecification);

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('costexplorer', obj.id, 'AWS::CE::AnomalyMonitor'),
            'region': obj.region,
            'service': 'costexplorer',
            'type': 'AWS::CE::AnomalyMonitor',
            'options': reqParams,
            'returnValues': {
                'Ref': obj.data.MonitorArn
            }
        });
    } else if (obj.type == "costexplorer.anomalysubscription") {
        reqParams.cfn['SubscriptionName'] = obj.data.SubscriptionName;
        reqParams.cfn['Threshold'] = obj.data.Threshold;
        reqParams.cfn['Frequency'] = obj.data.Frequency;
        reqParams.cfn['MonitorArnList'] = obj.data.MonitorArnList;
        reqParams.cfn['Subscribers'] = obj.data.Subscribers;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('costexplorer', obj.id, 'AWS::CE::AnomalySubscription'),
            'region': obj.region,
            'service': 'costexplorer',
            'type': 'AWS::CE::AnomalySubscription',
            'options': reqParams,
            'returnValues': {
                'Ref': obj.data.SubscriptionArn
            }
        });
    } else {
        return false;
    }

    return true;
}

module.exports = { section, updateDatatable, mapResources };
