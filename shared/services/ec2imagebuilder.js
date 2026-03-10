const section = {
    'category': 'Compute',
    'service': 'EC2 Image Builder',
    'resourcetypes': {
        'Image Pipelines': {
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
                    },
                    {
                        field: 'platform',
                        title: 'Platform',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    }
                ]
            ]
        },
        'Image Recipes': {
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
                    },
                    {
                        field: 'platform',
                        title: 'Platform',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    },
                    {
                        field: 'version',
                        title: 'Version',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    }
                ]
            ]
        },
        'Images': {
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
                        field: 'platform',
                        title: 'Platform',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    },
                    {
                        field: 'version',
                        title: 'Version',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    }
                ]
            ]
        },
        'Components': {
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
                        field: 'version',
                        title: 'Version',
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
                    },
                    {
                        field: 'changedescription',
                        title: 'Change Description',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    },
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
        'Distribution Configurations': {
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
        'Infrastructure Configurations': {
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
        'Container Recipes': {
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
    await context.sdkcall("Imagebuilder", "listImagePipelines", {
        // no params
    }, true).then(async (data) => {
        await Promise.all(data.imagePipelineList.map(async (imagePipeline) => {
            return context.sdkcall("Imagebuilder", "getImagePipeline", {
                imagePipelineArn: imagePipeline.arn
            }, true).then(async (data) => {
                resources.push({
                    f2id: data.imagePipeline.arn,
                    f2type: 'ec2imagebuilder.imagepipeline',
                    f2data: data.imagePipeline,
                    f2region: context.region,
                    name: data.imagePipeline.name,
                    description: data.imagePipeline.description,
                    platform: data.imagePipeline.platform
                });
            });
        }));
    }).catch(() => { });

    await context.sdkcall("Imagebuilder", "listImageRecipes", {
        owner: 'Self'
    }, true).then(async (data) => {
        await Promise.all(data.imageRecipeSummaryList.map(async (imageRecipe) => {
            return context.sdkcall("Imagebuilder", "getImageRecipe", {
                imageRecipeArn: imageRecipe.arn
            }, true).then(async (data) => {
                resources.push({
                    f2id: data.imageRecipe.arn,
                    f2type: 'ec2imagebuilder.imagerecipe',
                    f2data: data.imageRecipe,
                    f2region: context.region,
                    name: data.imageRecipe.name,
                    description: data.imageRecipe.description,
                    platform: data.imageRecipe.platform,
                    version: data.imageRecipe.version
                });
            });
        }));
    }).catch(() => { });

    await context.sdkcall("Imagebuilder", "listImages", {
        owner: 'Self'
    }, true).then(async (data) => {
        await Promise.all(data.imageVersionList.map(async (imageVersion) => {
            return context.sdkcall("Imagebuilder", "listImageBuildVersions", {
                imageVersionArn: imageVersion.arn
            }, true).then(async (data) => {
                await Promise.all(data.imageSummaryList.map(async (imageSummary) => {
                    return context.sdkcall("Imagebuilder", "getImage", {
                        imageBuildVersionArn: imageSummary.arn
                    }, true).then(async (data) => {
                        resources.push({
                            f2id: data.image.arn,
                            f2type: 'ec2imagebuilder.image',
                            f2data: data.image,
                            f2region: context.region,
                            name: data.image.name,
                            platform: data.image.platform,
                            version: data.image.version
                        });
                    });
                }));
            });
        }));
    }).catch(() => { });

    await context.sdkcall("Imagebuilder", "listComponents", {
        owner: 'Self'
    }, true).then(async (data) => {
        await Promise.all(data.componentVersionList.map(async (componentVersion) => {
            return context.sdkcall("Imagebuilder", "listComponentBuildVersions", {
                componentVersionArn: componentVersion.arn
            }, true).then(async (data) => {
                await Promise.all(data.componentSummaryList.map(async (componentBuildVersion) => {
                    return context.sdkcall("Imagebuilder", "getComponent", {
                        componentBuildVersionArn: componentBuildVersion.arn
                    }, true).then(async (data) => {
                        resources.push({
                            f2id: data.component.arn,
                            f2type: 'ec2imagebuilder.component',
                            f2data: data.component,
                            f2region: context.region,
                            name: data.component.name,
                            version: data.component.version,
                            description: data.component.description,
                            changedescription: data.component.changeDescription,
                            type: data.component.type
                        });
                    });
                }));
            });
        }));
    }).catch(() => { });

    await context.sdkcall("Imagebuilder", "listDistributionConfigurations", {
        // no params
    }, true).then(async (data) => {
        await Promise.all(data.distributionConfigurationSummaryList.map(async (distributionConfiguration) => {
            return context.sdkcall("Imagebuilder", "getDistributionConfiguration", {
                distributionConfigurationArn: distributionConfiguration.arn
            }, true).then(async (data) => {
                resources.push({
                    f2id: data.distributionConfiguration.arn,
                    f2type: 'ec2imagebuilder.distributionconfiguration',
                    f2data: data.distributionConfiguration,
                    f2region: context.region,
                    name: data.distributionConfiguration.name,
                    description: data.distributionConfiguration.description
                });
            });
        }));
    }).catch(() => { });

    await context.sdkcall("Imagebuilder", "listInfrastructureConfigurations", {
        // no params
    }, true).then(async (data) => {
        await Promise.all(data.infrastructureConfigurationSummaryList.map(async (infrastructureConfiguration) => {
            return context.sdkcall("Imagebuilder", "getInfrastructureConfiguration", {
                infrastructureConfigurationArn: infrastructureConfiguration.arn
            }, true).then(async (data) => {
                resources.push({
                    f2id: data.infrastructureConfiguration.arn,
                    f2type: 'ec2imagebuilder.infrastructureconfiguration',
                    f2data: data.infrastructureConfiguration,
                    f2region: context.region,
                    name: data.infrastructureConfiguration.name,
                    description: data.infrastructureConfiguration.description
                });
            });
        }));
    }).catch(() => { });

    await context.sdkcall("Imagebuilder", "listContainerRecipes", {
        // no params
    }, true).then(async (data) => {
        await Promise.all(data.containerRecipeSummaryList.map(async (containerRecipe) => {
            return context.sdkcall("Imagebuilder", "getContainerRecipe", {
                containerRecipeArn: containerRecipe.arn
            }, true).then(async (data) => {
                resources.push({
                    f2id: data.containerRecipe.arn,
                    f2type: 'ec2imagebuilder.containerrecipe',
                    f2data: data.containerRecipe,
                    f2region: context.region,
                    name: data.containerRecipe.name,
                    description: data.containerRecipe.description
                });
            });
        }));
    }).catch(() => { });

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "ec2imagebuilder.imagepipeline") {
        reqParams.cfn['Name'] = obj.data.name;
        reqParams.cfn['Description'] = obj.data.description;
        reqParams.cfn['ImageRecipeArn'] = obj.data.imageRecipeArn;
        reqParams.cfn['InfrastructureConfigurationArn'] = obj.data.infrastructureConfigurationArn;
        reqParams.cfn['DistributionConfigurationArn'] = obj.data.distributionConfigurationArn;
        if (obj.data.imageTestsConfiguration) {
            reqParams.cfn['ImageTestsConfiguration'] = {
                'ImageTestsEnabled': obj.data.imageTestsConfiguration.imageTestsEnabled,
                'TimeoutMinutes': obj.data.imageTestsConfiguration.timeoutMinutes
            };
        }
        if (obj.data.schedule) {
            reqParams.cfn['Schedule'] = {
                'ScheduleExpression': obj.data.schedule.scheduleExpression,
                'PipelineExecutionStartCondition': obj.data.schedule.pipelineExecutionStartCondition
            };
        }
        reqParams.cfn['Status'] = obj.data.status;
        reqParams.cfn['Tags'] = context.stripAWSTags(obj.data.tags);

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('ec2imagebuilder', obj.id, 'AWS::ImageBuilder::ImagePipeline'),
            'region': obj.region,
            'service': 'ec2imagebuilder',
            'type': 'AWS::ImageBuilder::ImagePipeline',
            'options': reqParams,
            'returnValues': {
                'Import': {
                    'Arn': obj.data.arn
                }
            }
        });
    } else if (obj.type == "ec2imagebuilder.imagerecipe") {
        reqParams.cfn['Name'] = obj.data.name;
        reqParams.cfn['Description'] = obj.data.description;
        reqParams.cfn['Version'] = obj.data.version;
        if (obj.data.components) {
            reqParams.cfn['Components'] = [];
            obj.data.components.forEach(component => {
                reqParams.cfn['Components'].push({
                    'ComponentArn': component.componentArn
                });
            });
        }
        reqParams.cfn['ParentImage'] = obj.data.parentImage;
        if (obj.data.blockDeviceMappings) {
            reqParams.cfn['BlockDeviceMappings'] = [];
            obj.data.blockDeviceMappings.forEach(blockDeviceMapping => {
                var ebs = null;
                if (blockDeviceMapping.ebs) {
                    ebs = {
                        'DeleteOnTermination': blockDeviceMapping.ebs.deleteOnTermination,
                        'Encrypted': blockDeviceMapping.ebs.encrypted,
                        'Iops': blockDeviceMapping.ebs.iops,
                        'KmsKeyId': blockDeviceMapping.ebs.kmsKeyId,
                        'SnapshotId': blockDeviceMapping.ebs.snapshotId,
                        'VolumeSize': blockDeviceMapping.ebs.volumeSize,
                        'VolumeType': blockDeviceMapping.ebs.volumeType
                    };
                }
                reqParams.cfn['BlockDeviceMappings'].push({
                    'DeviceName': blockDeviceMapping.deviceName,
                    'Ebs': ebs,
                    'VirtualName': blockDeviceMapping.virtualName,
                    'NoDevice': blockDeviceMapping.noDevice
                });
            });
        }
        reqParams.cfn['Tags'] = context.stripAWSTags(obj.data.tags);

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('ec2imagebuilder', obj.id, 'AWS::ImageBuilder::ImageRecipe'),
            'region': obj.region,
            'service': 'ec2imagebuilder',
            'type': 'AWS::ImageBuilder::ImageRecipe',
            'options': reqParams,
            'returnValues': {
                'Import': {
                    'Arn': obj.data.arn
                }
            }
        });
    } else if (obj.type == "ec2imagebuilder.component") {
        reqParams.cfn['Name'] = obj.data.name;
        reqParams.cfn['Description'] = obj.data.description;
        reqParams.cfn['Version'] = obj.data.version;
        reqParams.cfn['ChangeDescription'] = obj.data.changeDescription;
        reqParams.cfn['Platform'] = obj.data.platform;
        reqParams.cfn['KmsKeyId'] = obj.data.kmsKeyId;
        reqParams.cfn['SupportedOsVersions'] = obj.data.supportedOsVersions;
        reqParams.cfn['Data'] = obj.data.data;
        reqParams.cfn['Tags'] = context.stripAWSTags(obj.data.tags);
        
        /*
        SKIPPED:
        Uri
        */

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('ec2imagebuilder', obj.id, 'AWS::ImageBuilder::Component'),
            'region': obj.region,
            'service': 'ec2imagebuilder',
            'type': 'AWS::ImageBuilder::Component',
            'options': reqParams,
            'returnValues': {
                'Import': {
                    'Arn': obj.data.arn
                }
            }
        });
    } else if (obj.type == "ec2imagebuilder.distributionconfiguration") {
        reqParams.cfn['Name'] = obj.data.name;
        reqParams.cfn['Description'] = obj.data.description;
        if (obj.data.distributions) {
            reqParams.cfn['Distributions'] = [];
            obj.data.distributions.forEach(distribution => {
                reqParams.cfn['Distributions'].push({
                    'Region': distribution.region,
                    'AmiDistributionConfiguration': distribution.amiDistributionConfiguration,
                    'LicenseConfigurationArns': distribution.licenseConfigurationArns
                });
            });
        }
        reqParams.cfn['Tags'] = context.stripAWSTags(obj.data.tags);

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('ec2imagebuilder', obj.id, 'AWS::ImageBuilder::DistributionConfiguration'),
            'region': obj.region,
            'service': 'ec2imagebuilder',
            'type': 'AWS::ImageBuilder::DistributionConfiguration',
            'options': reqParams,
            'returnValues': {
                'Import': {
                    'Arn': obj.data.arn
                }
            }
        });
    } else if (obj.type == "ec2imagebuilder.infrastructureconfiguration") {
        reqParams.cfn['Name'] = obj.data.name;
        reqParams.cfn['Description'] = obj.data.description;
        reqParams.cfn['InstanceTypes'] = obj.data.instanceTypes;
        reqParams.cfn['InstanceProfileName'] = obj.data.instanceProfileName;
        reqParams.cfn['SecurityGroupIds'] = obj.data.securityGroupIds;
        reqParams.cfn['SubnetId'] = obj.data.subnetId;
        if (obj.data.logging) {
            var s3Logs = null;
            if (obj.data.logging.s3Logs) {
                s3Logs = {
                    'S3BucketName': obj.data.logging.s3Logs.s3BucketName,
                    'S3KeyPrefix': obj.data.logging.s3Logs.s3KeyPrefix
                };
            }
            reqParams.cfn['Logging'] = {
                'S3Logs': s3Logs
            };
        }
        reqParams.cfn['KeyPair'] = obj.data.keyPair;
        reqParams.cfn['TerminateInstanceOnFailure'] = obj.data.terminateInstanceOnFailure;
        reqParams.cfn['SnsTopicArn'] = obj.data.snsTopicArn;
        reqParams.cfn['Tags'] = context.stripAWSTags(obj.data.tags);

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('ec2imagebuilder', obj.id, 'AWS::ImageBuilder::InfrastructureConfiguration'),
            'region': obj.region,
            'service': 'ec2imagebuilder',
            'type': 'AWS::ImageBuilder::InfrastructureConfiguration',
            'options': reqParams,
            'returnValues': {
                'Import': {
                    'Arn': obj.data.arn
                }
            }
        });
    } else if (obj.type == "ec2imagebuilder.image") {
        if (obj.data.distributionConfiguration) {
            reqParams.cfn['DistributionConfigurationArn'] = obj.data.distributionConfiguration.arn;
        }
        if (obj.data.infrastructureConfiguration) {
            reqParams.cfn['InfrastructureConfigurationArn'] = obj.data.infrastructureConfiguration.arn;
        }
        if (obj.data.imageRecipe) {
            reqParams.cfn['ImageRecipeArn'] = obj.data.imageRecipe.arn;
        }
        if (obj.data.imageTestsConfiguration) {
            reqParams.cfn['ImageTestsConfiguration'] = {
                'ImageTestsEnabled': obj.data.imageTestsConfiguration.imageTestsEnabled,
                'TimeoutMinutes': obj.data.imageTestsConfiguration.timeoutMinutes
            };
        }
        reqParams.cfn['Tags'] = context.stripAWSTags(obj.data.tags);

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('ec2imagebuilder', obj.id, 'AWS::ImageBuilder::Image'),
            'region': obj.region,
            'service': 'ec2imagebuilder',
            'type': 'AWS::ImageBuilder::Image',
            'options': reqParams,
            'returnValues': {
                'Import': {
                    'Arn': obj.data.arn
                }
            }
        });
    } else if (obj.type == "ec2imagebuilder.containerrecipe") {
        reqParams.cfn['Name'] = obj.data.name;
        reqParams.cfn['Description'] = obj.data.description;
        reqParams.cfn['ContainerType'] = obj.data.containerType;
        reqParams.cfn['PlatformOverride'] = obj.data.platform;
        reqParams.cfn['Version'] = obj.data.version;
        if (obj.data.components) {
            reqParams.cfn['Components'] = [];
            obj.data.components.forEach(component => {
                reqParams.cfn['Components'].push({
                    'ComponentArn': component.componentArn
                });
            });
        }
        reqParams.cfn['DockerfileTemplateData'] = obj.data.dockerfileTemplateData;
        reqParams.cfn['KmsKeyId'] = obj.data.kmsKeyId;
        reqParams.cfn['ParentImage'] = obj.data.parentImage;
        reqParams.cfn['WorkingDirectory'] = obj.data.workingDirectory;
        if (obj.data.targetRepository) {
            reqParams.cfn['TargetRepository'] = {
                'Service': obj.data.targetRepository.service,
                'RepositoryName': obj.data.targetRepository.repositoryName
            };
        }
        reqParams.cfn['Tags'] = context.stripAWSTags(obj.data.tags);

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('ec2imagebuilder', obj.id, 'AWS::ImageBuilder::ContainerRecipe'),
            'region': obj.region,
            'service': 'ec2imagebuilder',
            'type': 'AWS::ImageBuilder::ContainerRecipe',
            'options': reqParams,
            'returnValues': {
                'GetAtt': {
                    'Arn': obj.data.arn
                },
                'Import': {
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
