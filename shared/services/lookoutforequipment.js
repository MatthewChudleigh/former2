const section = {
    'category': 'Machine Learning',
    'service': 'Lookout For Equipment',
    'resourcetypes': {
        'Inference Schedulers': {
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
                        field: 'modelname',
                        title: 'Model Name',
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
    await context.sdkcall("LookoutEquipment", "listInferenceSchedulers", {
        // no params
    }, false).then(async (data) => {
        await Promise.all(data.InferenceSchedulerSummaries.map(inferencescheduler => {
            return context.sdkcall("LookoutEquipment", "describeInferenceScheduler", {
                InferenceSchedulerName: inferencescheduler.InferenceSchedulerName
            }, true).then(async (data) => {
                resources.push({
                    f2id: data.InferenceSchedulerArn,
                    f2type: 'lookoutforequipment.inferencescheduler',
                    f2data: data,
                    f2region: context.region,
                    name: data.InferenceSchedulerName,
                    modelname: data.ModelName
                });
            });
        }));
    }).catch(() => { });

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "lookoutforequipment.inferencescheduler") {
        reqParams.cfn['InferenceSchedulerName'] = obj.data.InferenceSchedulerName;
        reqParams.cfn['ModelName'] = obj.data.ModelName;
        reqParams.cfn['DataDelayOffsetInMinutes'] = obj.data.DataDelayOffsetInMinutes;
        reqParams.cfn['DataUploadFrequency'] = obj.data.DataUploadFrequency;
        reqParams.cfn['DataInputConfiguration'] = obj.data.DataInputConfiguration;
        reqParams.cfn['DataOutputConfiguration'] = obj.data.DataOutputConfiguration;
        reqParams.cfn['RoleArn'] = obj.data.RoleArn;
        reqParams.cfn['ServerSideKmsKeyId'] = obj.data.ServerSideKmsKeyId;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('lookoutforequipment', obj.id, 'AWS::LookoutEquipment::InferenceScheduler'),
            'region': obj.region,
            'service': 'lookoutforequipment',
            'type': 'AWS::LookoutEquipment::InferenceScheduler',
            'options': reqParams,
            'returnValues': {
                'GetAtt': {
                    'Arn': obj.data.InferenceSchedulerArn
                }
            }
        });
    } else {
        return false;
    }

    return true;
}

module.exports = { section, updateDatatable, mapResources };
