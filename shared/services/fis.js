const section = {
    'category': 'Developer Tools',
    'service': 'FIS',
    'resourcetypes': {
        'Experiment Templates': {
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
    await context.sdkcall("Fis", "listExperimentTemplates", {
        // no params
    }, true).then(async (data) => {
        await Promise.all(data.experimentTemplates.map(async (experimenttemplate) => {
            return context.sdkcall("Fis", "getExperimentTemplate", {
                id: experimenttemplate.id
            }, true).then(async (data) => {
                resources.push({
                    f2id: data.experimentTemplate.id,
                    f2type: 'fis.experimenttemplate',
                    f2data: data.experimentTemplate,
                    f2region: context.region,
                    id: data.experimentTemplate.id,
                    description: data.experimentTemplate.description
                });
            });
        }));
    });

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "fis.experimenttemplate") {
        reqParams.cfn['Description'] = obj.data.description;
        reqParams.cfn['Targets'] = obj.data.targets;
        reqParams.cfn['Actions'] = obj.data.actions;
        reqParams.cfn['StopConditions'] = obj.data.stopConditions;
        reqParams.cfn['RoleArn'] = obj.data.roleArn;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('fis', obj.id, 'AWS::FIS::ExperimentTemplate'),
            'region': obj.region,
            'service': 'fis',
            'type': 'AWS::FIS::ExperimentTemplate',
            'options': reqParams,
            'returnValues': {
                'Ref': obj.data.id
            }
        });
    } else {
        return false;
    }

    return true;
}

module.exports = { section, updateDatatable, mapResources };
