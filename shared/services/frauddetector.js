const section = {
    'category': 'Machine Learning',
    'service': 'Fraud Detector',
    'resourcetypes': {
        'Detectors': {
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
        },
        'Entity Types': {
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
        'Event Types': {
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
        'Labels': {
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
        'Outcomes': {
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
        'Variables': {
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
    await context.sdkcall("FraudDetector", "getDetectors", {
        // no params
    }, false).then(async (data) => {
        await Promise.all(data.detectors.map(async (detector) => {
            return context.sdkcall("FraudDetector", "describeDetector", {
                detectorId: detector.detectorId
            }, true).then(async (data) => {
                await Promise.all(data.detectorVersionSummaries.map(async (detectorVersionSummary) => {
                    return context.sdkcall("FraudDetector", "getDetectorVersion", {
                        detectorId: detector.detectorId,
                        detectorVersionId: detectorVersionSummary.detectorVersionId
                    }, true).then(async (data) => {
                        if (data.status != "INACTIVE") {
                            resources.push({
                                f2id: data.detectorId + " " + data.detectorVersionId,
                                f2type: 'frauddetector.detector',
                                f2data: data,
                                f2region: context.region,
                                id: data.detectorId,
                                description: data.description
                            });
                        }
                    });
                }));
            });
        }));
    }).catch(() => { });

    await context.sdkcall("FraudDetector", "getEntityTypes", {
        // no params
    }, false).then(async (data) => {
        data.entityTypes.forEach(entityType => {
            resources.push({
                f2id: entityType.arn,
                f2type: 'frauddetector.entitytype',
                f2data: entityType,
                f2region: context.region,
                name: entityType.name,
                description: entityType.description
            });
        });
    }).catch(() => { });

    await context.sdkcall("FraudDetector", "getEventTypes", {
        // no params
    }, false).then(async (data) => {
        data.eventTypes.forEach(eventType => {
            resources.push({
                f2id: eventType.arn,
                f2type: 'frauddetector.eventtype',
                f2data: eventType,
                f2region: context.region,
                name: eventType.name,
                description: eventType.description
            });
        });
    }).catch(() => { });

    await context.sdkcall("FraudDetector", "getLabels", {
        // no params
    }, false).then(async (data) => {
        data.labels.forEach(label => {
            resources.push({
                f2id: label.arn,
                f2type: 'frauddetector.label',
                f2data: label,
                f2region: context.region,
                name: label.name,
                description: label.description
            });
        });
    }).catch(() => { });

    await context.sdkcall("FraudDetector", "getOutcomes", {
        // no params
    }, false).then(async (data) => {
        data.outcomes.forEach(outcome => {
            resources.push({
                f2id: outcome.arn,
                f2type: 'frauddetector.outcome',
                f2data: outcome,
                f2region: context.region,
                name: outcome.name,
                description: outcome.description
            });
        });
    }).catch(() => { });

    await context.sdkcall("FraudDetector", "getVariables", {
        // no params
    }, false).then(async (data) => {
        data.variables.forEach(variable => {
            resources.push({
                f2id: variable.arn,
                f2type: 'frauddetector.variable',
                f2data: variable,
                f2region: context.region,
                name: variable.name,
                description: variable.description
            });
        });
    }).catch(() => { });

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "frauddetector.detector") {
        reqParams.cfn['DetectorId'] = obj.data.detectorId;
        reqParams.cfn['Description'] = obj.data.description
        reqParams.cfn['DetectorVersionStatus'] = obj.data.status;
        reqParams.cfn['RuleExecutionMode'] = obj.data.ruleExecutionMode;
        if (obj.data.rules) {
            reqParams.cfn['Rules'] = [];
            obj.data.rules.forEach(rule => {
                reqParams.cfn['Rules'].push({
                    'RuleId': rule.ruleId,
                    'RuleVersion': rule.ruleVersion
                });
            });
        }
        reqParams.cfn['DetectorVersionStatus'] = obj.data.status;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('frauddetector', obj.id, 'AWS::FraudDetector::Detector'),
            'region': obj.region,
            'service': 'frauddetector',
            'type': 'AWS::FraudDetector::Detector',
            'options': reqParams,
            'returnValues': {
                'GetAtt': {
                    'Arn': obj.data.arn
                }
            }
        });
    } else if (obj.type == "frauddetector.entitytype") {
        reqParams.cfn['Name'] = obj.data.name;
        reqParams.cfn['Description'] = obj.data.description;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('frauddetector', obj.id, 'AWS::FraudDetector::EntityType'),
            'region': obj.region,
            'service': 'frauddetector',
            'type': 'AWS::FraudDetector::EntityType',
            'options': reqParams
        });
    } else if (obj.type == "frauddetector.eventtype") {
        reqParams.cfn['Name'] = obj.data.name;
        reqParams.cfn['Description'] = obj.data.description;
        reqParams.cfn['EventVariables'] = obj.data.EventVariables;
        reqParams.cfn['Labels'] = obj.data.Labels;
        reqParams.cfn['EntityTypes'] = obj.data.EntityTypes;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('frauddetector', obj.id, 'AWS::FraudDetector::EventType'),
            'region': obj.region,
            'service': 'frauddetector',
            'type': 'AWS::FraudDetector::EventType',
            'options': reqParams
        });
    } else if (obj.type == "frauddetector.label") {
        reqParams.cfn['Name'] = obj.data.name;
        reqParams.cfn['Description'] = obj.data.description;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('frauddetector', obj.id, 'AWS::FraudDetector::Label'),
            'region': obj.region,
            'service': 'frauddetector',
            'type': 'AWS::FraudDetector::Label',
            'options': reqParams
        });
    } else if (obj.type == "frauddetector.outcome") {
        reqParams.cfn['Name'] = obj.data.name;
        reqParams.cfn['Description'] = obj.data.description;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('frauddetector', obj.id, 'AWS::FraudDetector::Outcome'),
            'region': obj.region,
            'service': 'frauddetector',
            'type': 'AWS::FraudDetector::Outcome',
            'options': reqParams
        });
    } else if (obj.type == "frauddetector.variable") {
        reqParams.cfn['Name'] = obj.data.name;
        reqParams.cfn['Description'] = obj.data.description;
        reqParams.cfn['DataSource'] = obj.data.dataSource;
        reqParams.cfn['DataType'] = obj.data.dataType;
        reqParams.cfn['DefaultValue'] = obj.data.defaultValue;
        reqParams.cfn['VariableType'] = obj.data.variableType;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('frauddetector', obj.id, 'AWS::FraudDetector::Variable'),
            'region': obj.region,
            'service': 'frauddetector',
            'type': 'AWS::FraudDetector::Variable',
            'options': reqParams
        });
    } else {
        return false;
    }

    return true;
}

module.exports = { section, updateDatatable, mapResources };
