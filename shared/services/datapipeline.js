const section = {
    'category': 'Analytics',
    'service': 'Data Pipeline',
    'resourcetypes': {
        'Pipelines': {
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
    await context.sdkcall("DataPipeline", "listPipelines", {
        // no params
    }, true).then(async (data) => {
        await Promise.all(data.pipelineIdList.map(pipeline => {
            return context.sdkcall("DataPipeline", "describePipelines", {
                pipelineIds: [pipeline.id]
            }, true).then((data) => {
                resources.push({
                    f2id: data.pipelineDescriptionList[0].pipelineId,
                    f2type: 'datapipeline.pipeline',
                    f2data: data.pipelineDescriptionList[0],
                    f2region: context.region,
                    name: data.pipelineDescriptionList[0].name,
                    id: data.pipelineDescriptionList[0].pipelineId,
                    description: data.pipelineDescriptionList[0].description
                });
            });
        }));
    });

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "datapipeline.pipeline") {
        reqParams.cfn['Name'] = obj.data.name;
        reqParams.cfn['Description'] = obj.data.description;
        if (obj.data.tags) {
            reqParams.cfn['PipelineTags'] = [];
            obj.data.tags.forEach(tag => {
                if (!tag.key.startsWith("aws:")) {
                    reqParams.cfn['PipelineTags'].push({
                        'Key': tag.key,
                        'Value': tag.value
                    });
                }
            });
        }

        /*
        TODO:
        Activate: Boolean
        ParameterObjects:
            - Parameter object
        ParameterValues:
            - Parameter value
        PipelineObjects:
            - Pipeline object
        */

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('datapipeline', obj.id, 'AWS::DataPipeline::Pipeline'),
            'region': obj.region,
            'service': 'datapipeline',
            'type': 'AWS::DataPipeline::Pipeline',
            'options': reqParams
        });
    } else {
        return false;
    }

    return true;
}

module.exports = { section, updateDatatable, mapResources };
