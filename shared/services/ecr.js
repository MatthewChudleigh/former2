const section = {
    'category': 'Containers',
    'service': 'ECR',
    'resourcetypes': {
        'Repositories': {
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
                        field: 'uri',
                        title: 'Repository URI',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    },
                    {
                        field: 'createdat',
                        title: 'Created At',
                        sortable: true,
                        editable: true,
                        formatter: 'dateFormatter',
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    }
                ]
            ]
        },
        'Public Repositories': {
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
                        field: 'uri',
                        title: 'Repository URI',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    },
                    {
                        field: 'createdat',
                        title: 'Created At',
                        sortable: true,
                        editable: true,
                        formatter: 'dateFormatter',
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    }
                ]
            ]
        },
        'Replication Configuration': {
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
                        title: 'Registry ID',
                        field: 'registryid',
                        rowspan: 2,
                        align: 'center',
                        valign: 'middle',
                        sortable: true,
                        formatter: 'primaryFieldFormatter',
                        footerFormatter: 'textFormatter'
                    }
                ],
                [
                    // nothing
                ]
            ]
        },
        'Registry Policy': {
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
                        title: 'Registry',
                        field: 'registry',
                        rowspan: 2,
                        align: 'center',
                        valign: 'middle',
                        sortable: true,
                        formatter: 'primaryFieldFormatter',
                        footerFormatter: 'textFormatter'
                    }
                ],
                [
                    // nothing
                ]
            ]
        }
    }
};

async function updateDatatable(context) {
    const resources = [];
    await context.sdkcall("ECR", "describeRepositories", {
        // no params
    }, true).then(async (data) => {
        await Promise.all(data.repositories.map(async (repository) => {
            await context.sdkcall("ECR", "getLifecyclePolicy", {
                repositoryName: repository.repositoryName
            }, false).then(async (data) => {
                repository['lifecyclePolicyText'] = data.lifecyclePolicyText;
                repository['registryId'] = data.registryId;
                await context.sdkcall("ECR", "getRepositoryPolicy", {
                    repositoryName: repository.repositoryName
                }, true).then((data) => {
                    repository['policy'] = data.policyText;

                }).catch(() => { });
            }).catch(() => { });

            repository['Tags'] = await context.getResourceTags(repository.repositoryArn);

            resources.push({
                f2id: repository.repositoryArn,
                f2type: 'ecr.repository',
                f2data: repository,
                f2region: context.region,
                f2link: 'https://console.aws.amazon.com/ecr/repositories/' + repository.repositoryName + '/',
                name: repository.repositoryName,
                uri: repository.repositoryUri,
                createdat: repository.createdAt
            });
            return Promise.resolve();
        }));
    }).catch(() => { });

    if (context.region == "us-east-1") {
        await context.sdkcall("ECRPUBLIC", "describeRepositories", {
            // no params
        }, true).then(async (data) => {
            await Promise.all(data.repositories.map(async (repository) => {
                await context.sdkcall("ECRPUBLIC", "getRepositoryPolicy", {
                    repositoryName: repository.repositoryName
                }, false).then((data) => {
                    repository['policy'] = data.policyText;
                }).catch(() => { });

                await context.sdkcall("ECRPUBLIC", "getRepositoryCatalogData", {
                    repositoryName: repository.repositoryName
                }, false).then((data) => {
                    repository['catalogData'] = data.catalogData;
                }).catch(() => { });

                resources.push({
                    f2id: repository.repositoryArn,
                    f2type: 'ecr.publicrepository',
                    f2data: repository,
                    f2region: context.region,
                    name: repository.repositoryName,
                    uri: repository.repositoryUri,
                    createdat: repository.createdAt
                });
                return Promise.resolve();
            }));
        }).catch(() => { });
    }

    await context.sdkcall("ECR", "describeRegistry", {
        // no params
    }, true).then(async (data) => {
        if (data.replicationConfiguration && data.replicationConfiguration.rules && data.replicationConfiguration.rules.length > 0) {
            data.replicationConfiguration['registryId'] = data.registryId;

            resources.push({
                f2id: data.registryId + " Replication Configuration",
                f2type: 'ecr.replicationconfiguration',
                f2data: data.replicationConfiguration,
                f2region: context.region,
                registryid: data.registryId
            });
        }
    }).catch(() => { });

    await context.sdkcall("ECR", "getRegistryPolicy", {
        // no params
    }, false).then(async (data) => {
        if (data.policyText) {
            resources.push({
                f2id: "Registry Policy",
                f2type: 'ecr.registrypolicy',
                f2data: data,
                f2region: context.region,
                registry: "(current account)"
            });
        }
    }).catch(() => { });

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "ecr.repository") {
        reqParams.cfn['RepositoryName'] = obj.data.repositoryName;
        reqParams.tf['name'] = obj.data.repositoryName;
        reqParams.cfn['LifecyclePolicy'] = {
            'LifecyclePolicyText': obj.data.lifecyclePolicyText,
            'RegistryId': obj.data.registryId
        };
        reqParams.cfn['RepositoryPolicyText'] = obj.data.policy;
        reqParams.cfn['Tags'] = stripAWSTags(obj.data.Tags);

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('ecr', obj.id, 'AWS::ECR::Repository'),
            'region': obj.region,
            'service': 'ecr',
            'type': 'AWS::ECR::Repository',
            'terraformType': 'aws_ecr_repository',
            'options': reqParams
        });

        if (obj.data.policy) {
            reqParams = {
                'boto3': {},
                'go': {},
                'cfn': {},
                'cli': {},
                'tf': {},
                'iam': {}
            };

            reqParams.tf['repository'] = obj.data.repositoryName;
            reqParams.tf['policy'] = obj.data.policy;

            tracked_resources.push({
                'obj': obj,
                'logicalId': getResourceName('ecr', obj.id, 'AWS::ECR::RepositoryPolicy'), // not real resource type
                'region': obj.region,
                'service': 'ecr',
                'terraformType': 'aws_ecr_repository_policy',
                'options': reqParams
            });
        }

        if (obj.data.lifecyclePolicyText) {
            reqParams = {
                'boto3': {},
                'go': {},
                'cfn': {},
                'cli': {},
                'tf': {},
                'iam': {}
            };

            reqParams.tf['repository'] = obj.data.repositoryName;
            reqParams.tf['policy'] = obj.data.lifecyclePolicyText;

            tracked_resources.push({
                'obj': obj,
                'logicalId': getResourceName('ecr', obj.id, 'AWS::ECR::LifecyclePolicy'), // not real resource type
                'region': obj.region,
                'service': 'ecr',
                'terraformType': 'aws_ecr_lifecycle_policy',
                'options': reqParams
            });
        }
    } else if (obj.type == "ecr.publicrepository") {
        reqParams.cfn['RepositoryName'] = obj.data.repositoryName;
        reqParams.cfn['RepositoryPolicyText'] = obj.data.policy;
        if (obj.data.catalogData) {
            reqParams.cfn['RepositoryCatalogData'] = {
                'UsageText': obj.data.catalogData.usageText,
                'AboutText': obj.data.catalogData.aboutText,
                'OperatingSystems': obj.data.catalogData.operatingSystems,
                'Architectures': obj.data.catalogData.architectures,
                'RepositoryDescription': obj.data.catalogData.repositoryDescription
            };
        }

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('ecr', obj.id, 'AWS::ECR::PublicRepository'),
            'region': obj.region,
            'service': 'ecr',
            'type': 'AWS::ECR::PublicRepository',
            'options': reqParams
        });
    } else if (obj.type == "ecr.replicationconfiguration") {
        var rules = [];

        obj.data.rules.forEach(rule => {
            var destinations = [];

            rule.destinations.forEach(destination => {
                destinations.push({
                    'Region': destination.region,
                    'RegistryId': destination.registryId
                });
            });

            rules.push({
                'Destinations': destinations
            });
        });

        reqParams.cfn['ReplicationConfiguration'] = {
            'Rules': rules
        };

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('ecr', obj.id, 'AWS::ECR::ReplicationConfiguration'),
            'region': obj.region,
            'service': 'ecr',
            'type': 'AWS::ECR::ReplicationConfiguration',
            'options': reqParams,
            'returnValues': {
                'Import': {
                    'RegistryId': obj.data.registryId
                }
            }
        });
    } else if (obj.type == "ecr.registrypolicy") {
        reqParams.cfn['PolicyText'] = obj.data.policyText;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('ecr', obj.id, 'AWS::ECR::RegistryPolicy'),
            'region': obj.region,
            'service': 'ecr',
            'type': 'AWS::ECR::RegistryPolicy',
            'options': reqParams
        });
    } else {
        return false;
    }

    return true;
}

module.exports = { section, updateDatatable, mapResources };
