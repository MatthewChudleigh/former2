const section = {
    'category': 'Application Integration',
    'service': 'SWF',
    'resourcetypes': {
        'Domains': {
            'terraformonly': true,
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
    await context.sdkcall("SWF", "listDomains", {
        registrationStatus: 'REGISTERED'
    }, true).then(async (data) => {
        await Promise.all(data.domainInfos.map(domain => {
            return context.sdkcall("SWF", "describeDomain", {
                name: domain.name
            }, true).then(async (data) => {
                resources.push({
                    f2id: data.domainInfo.name,
                    f2type: 'swf.domain',
                    f2data: data,
                    f2region: context.region,
                    name: data.domainInfo.name,
                    description: data.domainInfo.description
                });
            });
        }));
    });

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "swf.domain") {
        reqParams.tf['name'] = obj.data.domainInfo.name;
        reqParams.tf['description'] = obj.data.domainInfo.description;
        if (obj.data.configuration) {
            reqParams.tf['workflow_execution_retention_period_in_days'] = obj.data.configuration.workflowExecutionRetentionPeriodInDays;
        }

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('swf', obj.id, 'AWS::SWF::Domain'), // not real resource type
            'region': obj.region,
            'service': 'swf',
            'terraformType': 'aws_swf_domain',
            'options': reqParams
        });
    } else {
        return false;
    }

    return true;
}

module.exports = { section, updateDatatable, mapResources };
