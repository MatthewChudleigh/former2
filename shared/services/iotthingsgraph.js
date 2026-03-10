const section = {
    'category': 'Internet of Things',
    'service': 'Things Graph',
    'resourcetypes': {
        'Flow Templates': {
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
                        field: 'creationtime',
                        title: 'Creation Time',
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
    await context.sdkcall("IoTThingsGraph", "searchFlowTemplates", {
        // no params
    }, false).then(async (data) => {
        await Promise.all(data.summaries.map(flowtemplate => {
            return context.sdkcall("IoTThingsGraph", "getFlowTemplate", {
                id: flowtemplate.id
            }, true).then(async (data) => {
                resources.push({
                    f2id: data.description.summary.arn,
                    f2type: 'iotthingsgraph.flowtemplate',
                    f2data: data.description,
                    f2region: context.region,
                    id: data.description.summary.id,
                    creationtime: data.description.summary.createdAt
                });
            });
        }));
    }).catch(() => { });

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "iotthingsgraph.flowtemplate") {
        if (obj.data.definition) {
            reqParams.cfn['CompatibleNamespaceVersion'] = obj.data.validatedNamespaceVersion;
            reqParams.cfn['Definition'] = {
                'Language': obj.data.definition.language,
                'Text': obj.data.definition.text
            };

            tracked_resources.push({
                'obj': obj,
                'logicalId': getResourceName('iotthingsgraph', obj.id, 'AWS::IoTThingsGraph::FlowTemplate'),
                'region': obj.region,
                'service': 'iotthingsgraph',
                'type': 'AWS::IoTThingsGraph::FlowTemplate',
                'options': reqParams
            });
        }
    } else {
        return false;
    }

    return true;
}

module.exports = { section, updateDatatable, mapResources };
