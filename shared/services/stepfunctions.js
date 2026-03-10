const section = {
    'category': 'Application Integration',
    'service': 'Step Functions',
    'resourcetypes': {
        'State Machines': {
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
        },
        'Activities': {
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
                        field: 'activityarn',
                        title: 'Activity ARN',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    },
                    {
                        field: 'creaiontime',
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
    await context.sdkcall("StepFunctions", "listStateMachines", {
        // no params
    }, true).then(async (data) => {
        await Promise.all(data.stateMachines.map(async (stateMachine) => {
            return context.sdkcall("StepFunctions", "describeStateMachine", {
                stateMachineArn: stateMachine.stateMachineArn
            }, true).then(async (data) => {
                data['Tags'] = await context.getResourceTags(data.stateMachineArn);

                resources.push({
                    f2id: data.stateMachineArn,
                    f2type: 'stepfunctions.statemachine',
                    f2data: data,
                    f2region: context.region,
                    name: data.name,
                    creationtime: data.creationDate
                });
            });
        }));
    });

    await context.sdkcall("StepFunctions", "listActivities", {
        // no params
    }, true).then(async (data) => {
        if (data.activities) {
            await Promise.all(data.activities.map(async (activity) => {
                return context.sdkcall("StepFunctions", "describeActivity", {
                    activityArn: activity.activityArn
                }, true).then(async (data) => {
                    data['Tags'] = await context.getResourceTags(data.activityArn);

                    resources.push({
                        f2id: data.activityArn,
                        f2type: 'stepfunctions.activity',
                        f2data: data,
                        f2region: context.region,
                        name: data.name,
                        activityarn: data.activityArn,
                        creaiontime: data.creationDate
                    });
                });
            }));
        }
    });

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "stepfunctions.statemachine") {
        reqParams.cfn['StateMachineName'] = obj.data.name;
        reqParams.tf['name'] = obj.data.name;
        reqParams.cfn['DefinitionString'] = JSON.stringify(JSON.parse(obj.data.definition), null, 2);
        reqParams.tf['definition'] = JSON.stringify(JSON.parse(obj.data.definition), null, 2);
        reqParams.cfn['RoleArn'] = obj.data.roleArn;
        reqParams.tf['role_arn'] = obj.data.roleArn;
        reqParams.cfn['StateMachineType'] = obj.data.type;
        if (obj.data.loggingConfiguration) {
            var destinations = null;
            
            if (obj.data.loggingConfiguration.destinations) {
                destinations = [];
                obj.data.loggingConfiguration.destinations.forEach(destination => {
                    if (destination.cloudWatchLogsLogGroup) {
                        destinations.push({
                            'CloudWatchLogsLogGroup': {
                                'LogGroupArn': destination.cloudWatchLogsLogGroup.logGroupArn
                            }
                        })
                    }
                });
            }

            reqParams.cfn['LoggingConfiguration'] = {
                'Destinations': destinations,
                'IncludeExecutionData': obj.data.loggingConfiguration.includeExecutionData,
                'Level': obj.data.loggingConfiguration.level
            };
        }
        reqParams.cfn['Tags'] = context.stripAWSTags(obj.data.Tags);

        /*
        SKIPPED: DefinitionS3Location
        SKIPPED: DefinitionSubstitutions
        */

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('stepfunctions', obj.id, 'AWS::StepFunctions::StateMachine'),
            'region': obj.region,
            'service': 'stepfunctions',
            'type': 'AWS::StepFunctions::StateMachine',
            'terraformType': 'aws_sfn_state_machine',
            'options': reqParams,
            'returnValues': {
                'Ref': obj.data.stateMachineArn,
                'GetAtt': {
                    'Name': obj.data.name
                }
            }
        });
    } else if (obj.type == "stepfunctions.activity") {
        reqParams.cfn['Name'] = obj.data.name;
        reqParams.tf['name'] = obj.data.name;
        reqParams.cfn['Tags'] = context.stripAWSTags(obj.data.Tags);

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('stepfunctions', obj.id, 'AWS::StepFunctions::Activity'),
            'region': obj.region,
            'service': 'stepfunctions',
            'type': 'AWS::StepFunctions::Activity',
            'terraformType': 'aws_sfn_activity',
            'options': reqParams,
            'returnValues': {
                'Ref': obj.data.activityArn,
                'GetAtt': {
                    'Name': obj.data.name
                }
            }
        });
    } else {
        return false;
    }

    return true;
}

module.exports = { section, updateDatatable, mapResources };
