const section = {
    'category': 'Internet of Things',
    'service': 'TwinMaker',
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
        'Scenes': {
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
                        field: 'workspaceid',
                        title: 'Workspace ID',
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
        },
        'Entities': {
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
                        field: 'workspaceid',
                        title: 'Workspace ID',
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
        },
        'Component Types': {
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
                        field: 'workspaceid',
                        title: 'Workspace ID',
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
    await context.sdkcall("IoTTwinMaker", "listWorkspaces", {
        // no params
    }, false).then(async (data) => {
        await Promise.all(data.workspaceSummaries.map(async (workspace) => {
            await context.sdkcall("IoTTwinMaker", "getWorkspace", {
                workspaceId: workspace.workspaceId
            }, true).then(async (data) => {
                resources.push({
                    f2id: data.arn,
                    f2type: 'iottwinmaker.workspace',
                    f2data: data,
                    f2region: context.region,
                    id: data.workspaceId,
                    description: data.description
                });
            });

            await context.sdkcall("IoTTwinMaker", "listScenes", {
                workspaceId: workspace.workspaceId
            }, false).then(async (data) => {
                await Promise.all(data.sceneSummaries.map(async (scene) => {
                    return context.sdkcall("IoTTwinMaker", "getScene", {
                        sceneId: scene.sceneId,
                        workspaceId: workspace.workspaceId
                    }, true).then(async (data) => {
                        resources.push({
                            f2id: data.arn,
                            f2type: 'iottwinmaker.scene',
                            f2data: data,
                            f2region: context.region,
                            id: data.sceneId,
                            workspaceid: data.workspaceId,
                            description: data.description
                        });
                    });
                }));
            }).catch(err => { });

            await context.sdkcall("IoTTwinMaker", "listEntities", {
                workspaceId: workspace.workspaceId
            }, false).then(async (data) => {
                await Promise.all(data.entitySummaries.map(async (entity) => {
                    return context.sdkcall("IoTTwinMaker", "getEntity", {
                        entityId: entity.entityId,
                        workspaceId: workspace.workspaceId
                    }, true).then(async (data) => {
                        resources.push({
                            f2id: data.arn,
                            f2type: 'iottwinmaker.entity',
                            f2data: data,
                            f2region: context.region,
                            id: data.entityId,
                            workspaceid: data.workspaceId,
                            description: data.description
                        });
                    });
                }));
            }).catch(err => { });

            return context.sdkcall("IoTTwinMaker", "listComponentTypes", {
                workspaceId: workspace.workspaceId
            }, false).then(async (data) => {
                await Promise.all(data.componentTypeSummaries.map(async (componenttype) => {
                    return context.sdkcall("IoTTwinMaker", "getComponentType", {
                        componentTypeId: componenttype.componentTypeId,
                        workspaceId: workspace.workspaceId
                    }, true).then(async (data) => {
                        resources.push({
                            f2id: data.arn,
                            f2type: 'iottwinmaker.componenttype',
                            f2data: data,
                            f2region: context.region,
                            id: data.componentTypeId,
                            workspaceid: data.workspaceId,
                            description: data.description
                        });
                    });
                }));
            }).catch(err => { });
        }));
    }).catch(err => { });

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "iottwinmaker.workspace") {
        reqParams.cfn['WorkspaceId'] = obj.data.workspaceId;
        reqParams.cfn['Description'] = obj.data.description;
        reqParams.cfn['Role'] = obj.data.role;
        reqParams.cfn['S3Location'] = obj.data.s3Location;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('iottwinmaker', obj.id, 'AWS::IoTTwinMaker::Workspace'),
            'region': obj.region,
            'service': 'iottwinmaker',
            'type': 'AWS::IoTTwinMaker::Workspace',
            'options': reqParams,
            'returnValues': {
                'Ref': obj.data.workspaceId,
                'GetAtt': {
                    'Arn': obj.data.arn
                }
            }
        });
    } else if (obj.type == "iottwinmaker.scene") {
        reqParams.cfn['SceneId'] = obj.data.sceneId;
        reqParams.cfn['WorkspaceId'] = obj.data.workspaceId;
        reqParams.cfn['Description'] = obj.data.description;
        reqParams.cfn['Capabilities'] = obj.data.capabilities;
        reqParams.cfn['ContentLocation'] = obj.data.contentLocation;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('iottwinmaker', obj.id, 'AWS::IoTTwinMaker::Scene'),
            'region': obj.region,
            'service': 'iottwinmaker',
            'type': 'AWS::IoTTwinMaker::Scene',
            'options': reqParams,
            'returnValues': {
                'Ref': obj.data.sceneId,
                'GetAtt': {
                    'Arn': obj.data.arn
                }
            }
        });
    } else if (obj.type == "iottwinmaker.entity") {
        reqParams.cfn['EntityId'] = obj.data.entityId;
        reqParams.cfn['WorkspaceId'] = obj.data.workspaceId;
        reqParams.cfn['Description'] = obj.data.description;
        reqParams.cfn['EntityName'] = obj.data.entityName;
        reqParams.cfn['ParentEntityId'] = obj.data.parentEntityId;
        reqParams.cfn['Components'] = obj.data.components;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('iottwinmaker', obj.id, 'AWS::IoTTwinMaker::Entity'),
            'region': obj.region,
            'service': 'iottwinmaker',
            'type': 'AWS::IoTTwinMaker::Entity',
            'options': reqParams,
            'returnValues': {
                'Ref': obj.data.entityId,
                'GetAtt': {
                    'Arn': obj.data.arn
                }
            }
        });
    } else if (obj.type == "iottwinmaker.componenttype") {
        reqParams.cfn['ComponentTypeId'] = obj.data.componentTypeId;
        reqParams.cfn['WorkspaceId'] = obj.data.workspaceId;
        reqParams.cfn['Description'] = obj.data.description;
        reqParams.cfn['ExtendsFrom'] = obj.data.extendsFrom;
        reqParams.cfn['Functions'] = obj.data.functions;
        reqParams.cfn['IsSingleton'] = obj.data.isSingleton;
        reqParams.cfn['PropertyDefinitions'] = obj.data.propertyDefinitions;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('iottwinmaker', obj.id, 'AWS::IoTTwinMaker::ComponentType'),
            'region': obj.region,
            'service': 'iottwinmaker',
            'type': 'AWS::IoTTwinMaker::ComponentType',
            'options': reqParams,
            'returnValues': {
                'Ref': obj.data.componentTypeId,
                'GetAtt': {
                    'Arn': obj.data.arn
                }
            }
        });
    } else {
        return false;
    }

    return true;
}

module.exports = { section, updateDatatable, mapResources };
