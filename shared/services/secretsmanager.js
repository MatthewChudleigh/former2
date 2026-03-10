const section = {
    'category': 'Security, Identity, &amp; Compliance',
    'service': 'Secrets Manager',
    'resourcetypes': {
        'Secrets': {
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
                        field: 'kmskeyid',
                        title: 'KMS Key ID',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    }
                ]
            ]
        },
        'Resource Policies': {
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
                    }
                ],
                [
                    // nothing
                ]
            ]
        },
        'Rotation Schedules': {
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
                        title: 'Secret ARN',
                        field: 'secretarn',
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
                        field: 'lambdaarn',
                        title: 'Lambda ARN',
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
    await context.sdkcall("SecretsManager", "listSecrets", {
        // no params
    }, true).then(async (data) => {
        if (data.SecretList) {
            await Promise.all(data.SecretList.map(secret => {
                return Promise.all([
                    context.sdkcall("SecretsManager", "getResourcePolicy", {
                        SecretId: secret.ARN
                    }, true).then((data) => {
                        if (data.ResourcePolicy) {
                            resources.push({
                                f2id: data.ARN,
                                f2type: 'secretsmanager.resourcepolicy',
                                f2data: data,
                                f2region: context.region,
                                name: data.Name
                            });
                        }
                    }),
                    context.sdkcall("SecretsManager", "describeSecret", {
                        SecretId: secret.ARN
                    }, true).then(async (data) => {
                        await context.sdkcall("SecretsManager", "getSecretValue", {
                            SecretId: secret.ARN
                        }, false).then((secretvalue) => {
                            data['SecretString'] = secretvalue.SecretString;
                        }).catch(() => { });

                        resources.push({
                            f2id: data.ARN,
                            f2type: 'secretsmanager.secret',
                            f2data: data,
                            f2region: context.region,
                            name: data.Name,
                            description: data.Description,
                            kmskeyid: data.KmsKeyId
                        });
                        if (data.RotationEnabled) {
                            resources.push({
                                f2id: data.ARN,
                                f2type: 'secretsmanager.rotationschedule',
                                f2data: data,
                                f2region: context.region,
                                secretarn: data.ARN,
                                lambdaarn: data.RotationLambdaARN
                            });
                        }
                    })
                ]);
            }));
        }
    });

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "secretsmanager.secret") {
        reqParams.cfn['Name'] = obj.data.Name;
        reqParams.tf['name'] = obj.data.Name;
        reqParams.cfn['Description'] = obj.data.Description;
        reqParams.tf['description'] = obj.data.Description;
        reqParams.cfn['KmsKeyId'] = obj.data.KmsKeyId;
        reqParams.tf['kms_key_id'] = obj.data.KmsKeyId;
        reqParams.cfn['Tags'] = context.stripAWSTags(obj.data.Tags);
        if (obj.data.Tags) {
            reqParams.tf['tags'] = new Map();
            obj.data.Tags.forEach(tag => {
                if (!tag.Key.startsWith("aws:")) {
                    reqParams.tf['tags'].set(tag['Key'], tag['Value']);
                }
            });
        }
        reqParams.cfn['SecretString'] = obj.data.SecretString || "REPLACEME";

        /*
        SKIPPED: GenerateSecretString
        */

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('secretsmanager', obj.id, 'AWS::SecretsManager::Secret'),
            'region': obj.region,
            'service': 'secretsmanager',
            'type': 'AWS::SecretsManager::Secret',
            'terraformType': 'aws_secretsmanager_secret',
            'options': reqParams,
            'returnValues': {
                'Ref': obj.data.ARN,
                'Terraform': {
                    'id': obj.data.ARN
                }
            }
        });

        reqParams = {
            'boto3': {},
            'go': {},
            'cfn': {},
            'cli': {},
            'tf': {},
            'iam': {}
        };

        reqParams.tf['secret_id'] = obj.data.ARN;
        reqParams.tf['secret_string'] = obj.data.SecretString;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('secretsmanager', obj.id, 'AWS::SecretsManager::SecretVersion'), // not real resource type
            'region': obj.region,
            'service': 'secretsmanager',
            'terraformType': 'aws_secretsmanager_secret_version',
            'options': reqParams
        });
    } else if (obj.type == "secretsmanager.rotationschedule") {
        reqParams.cfn['SecretId'] = obj.data.ARN;
        reqParams.cfn['RotationLambdaARN'] = obj.data.RotationLambdaARN;
        reqParams.cfn['RotationRules'] = obj.data.RotationRules;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('secretsmanager', obj.id, 'AWS::SecretsManager::RotationSchedule'),
            'region': obj.region,
            'service': 'secretsmanager',
            'type': 'AWS::SecretsManager::RotationSchedule',
            'options': reqParams,
            'returnValues': {
                'Ref': obj.data.ARN
            }
        });
    } else if (obj.type == "secretsmanager.resourcepolicy") {
        reqParams.cfn['SecretId'] = obj.data.ARN;
        reqParams.cfn['ResourcePolicy'] = obj.data.ResourcePolicy;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('secretsmanager', obj.id, 'AWS::SecretsManager::ResourcePolicy'),
            'region': obj.region,
            'service': 'secretsmanager',
            'type': 'AWS::SecretsManager::ResourcePolicy',
            'options': reqParams,
            'returnValues': {
                'Ref': obj.data.ARN
            }
        });
    } else {
        return false;
    }

    return true;
}

module.exports = { section, updateDatatable, mapResources };
