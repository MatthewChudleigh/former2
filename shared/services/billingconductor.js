const section = {
    'category': 'AWS Cost Management',
    'service': 'Billing Conductor',
    'resourcetypes': {
        'Billing Groups': {
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
        },
        'Custom Line Items': {
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
        },
        'Pricing Plans': {
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
        },
        'Pricing Rules': {
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
    await context.sdkcall("Billingconductor", "listBillingGroups", {
        // no params
    }, true).then(async (data) => {
        data.BillingGroups.forEach(billinggroup => {
            resources.push({
                f2id: billinggroup.Arn,
                f2type: 'billingconductor.billinggroup',
                f2data: billinggroup,
                f2region: context.region,
                name: billinggroup.Name,
                description: billinggroup.Description
            });
        });
    }).catch(() => { });

    await context.sdkcall("Billingconductor", "listCustomLineItems", {
        // no params
    }, true).then(async (data) => {
        data.CustomLineItems.forEach(customlineitem => {
            resources.push({
                f2id: customlineitem.Arn,
                f2type: 'billingconductor.customlineitem',
                f2data: customlineitem,
                f2region: context.region,
                name: customlineitem.Name,
                description: customlineitem.Description
            });
        });
    }).catch(() => { });

    await context.sdkcall("Billingconductor", "listPricingPlans", {
        // no params
    }, true).then(async (data) => {
        data.PricingPlans.forEach(async (pricingplan) => {
            await context.sdkcall("Billingconductor", "listPricingRulesAssociatedToPricingPlan", {
                PricingPlanArn: pricingplan.Arn
            }, true).then(async (associations) => {
                pricingplan['PricingRuleArns'] = associations.PricingRuleArns;
            });

            resources.push({
                f2id: pricingplan.Arn,
                f2type: 'billingconductor.pricingplan',
                f2data: pricingplan,
                f2region: context.region,
                name: pricingplan.Name,
                description: pricingplan.Description
            });
        });
    }).catch(() => { });

    await context.sdkcall("Billingconductor", "listPricingRules", {
        // no params
    }, true).then(async (data) => {
        data.PricingRules.forEach(pricingrule => {
            resources.push({
                f2id: pricingrule.Arn,
                f2type: 'billingconductor.pricingrule',
                f2data: pricingrule,
                f2region: context.region,
                name: pricingrule.Name,
                description: pricingrule.Description
            });
        });
    }).catch(() => { });

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "billingconductor.billinggroup") {
        reqParams.cfn['Name'] = obj.data.Name;
        reqParams.cfn['Description'] = obj.data.Description;
        reqParams.cfn['PrimaryAccountId'] = obj.data.PrimaryAccountId;
        reqParams.cfn['ComputationPreference'] = obj.data.ComputationPreference;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('billingconductor', obj.id, 'AWS::BillingConductor::BillingGroup'),
            'region': obj.region,
            'service': 'billingconductor',
            'type': 'AWS::BillingConductor::BillingGroup',
            'options': reqParams,
            'returnValues': {
                'GetAtt': {
                    'Arn': obj.data.Arn
                }
            }
        });
    } else if (obj.type == "billingconductor.customlineitem") {
        reqParams.cfn['Name'] = obj.data.Name;
        reqParams.cfn['Description'] = obj.data.Description;
        reqParams.cfn['BillingGroupArn'] = obj.data.BillingGroupArn;
        reqParams.cfn['CustomLineItemChargeDetails'] = obj.data.ChargeDetails;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('billingconductor', obj.id, 'AWS::BillingConductor::CustomLineItem'),
            'region': obj.region,
            'service': 'billingconductor',
            'type': 'AWS::BillingConductor::CustomLineItem',
            'options': reqParams,
            'returnValues': {
                'GetAtt': {
                    'Arn': obj.data.Arn
                }
            }
        });
    } else if (obj.type == "billingconductor.pricingplan") {
        reqParams.cfn['Name'] = obj.data.Name;
        reqParams.cfn['Description'] = obj.data.Description;
        reqParams.cfn['PricingRuleArns'] = obj.data.PricingRuleArns;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('billingconductor', obj.id, 'AWS::BillingConductor::PricingPlan'),
            'region': obj.region,
            'service': 'billingconductor',
            'type': 'AWS::BillingConductor::PricingPlan',
            'options': reqParams,
            'returnValues': {
                'GetAtt': {
                    'Arn': obj.data.Arn
                }
            }
        });
    } else if (obj.type == "billingconductor.pricingrule") {
        reqParams.cfn['Name'] = obj.data.Name;
        reqParams.cfn['Description'] = obj.data.Description;
        reqParams.cfn['Type'] = obj.data.Type;
        reqParams.cfn['Service'] = obj.data.Service;
        reqParams.cfn['Scope'] = obj.data.Scope;
        reqParams.cfn['ModifierPercentage'] = obj.data.ModifierPercentage;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('billingconductor', obj.id, 'AWS::BillingConductor::PricingRule'),
            'region': obj.region,
            'service': 'billingconductor',
            'type': 'AWS::BillingConductor::PricingRule',
            'options': reqParams,
            'returnValues': {
                'GetAtt': {
                    'Arn': obj.data.Arn
                }
            }
        });
    } else {
        return false;
    }

    return true;
}

module.exports = { section, updateDatatable, mapResources };
