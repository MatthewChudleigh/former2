const section = {
    'category': 'Storage',
    'service': 'Backup',
    'resourcetypes': {
        'Backup Vaults': {
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
                        field: 'numberofrecoverypoints',
                        title: 'Number of Recovery Points',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    }
                ]
            ]
        },
        'Backup Plans': {
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
                    }
                ]
            ]
        },
        'Backup Selections': {
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
                    }
                ]
            ]
        },
        'Backup Frameworks': {
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
        'Backup Report Plans': {
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
    await context.sdkcall("Backup", "listBackupVaults", {
        // no params
    }, true).then(async (data) => {
        data.BackupVaultList.forEach(async (backupvault) => {
            await Promise.all([
                context.sdkcall("Backup", "getBackupVaultAccessPolicy", {
                    BackupVaultName: backupvault.BackupVaultName
                }, false).then(async (data) => {
                    backupvault['AccessPolicy'] = data.Policy;
                }).catch(() => { }),
                context.sdkcall("Backup", "getBackupVaultNotifications", {
                    BackupVaultName: backupvault.BackupVaultName
                }, false).then(async (data) => {
                    backupvault['Notifications'] = {
                        'SNSTopicArn': data.SNSTopicArn,
                        'BackupVaultEvents': data.BackupVaultEvents
                    };
                }).catch(() => { })
            ]);

            resources.push({
                f2id: backupvault.BackupVaultArn,
                f2type: 'backup.backupvault',
                f2data: backupvault,
                f2region: context.region,
                f2link: 'https://console.aws.amazon.com/backup/home?region=' + region + '#backupvaults/details/' + backupvault.BackupVaultName,
                name: backupvault.BackupVaultName,
                numberofrecoverypoints: backupvault.NumberOfRecoveryPoints
            });
        });
    });

    await context.sdkcall("Backup", "listBackupPlans", {
        // no params
    }, true).then(async (data) => {
        await Promise.all(data.BackupPlansList.map(async (backupplan) => {
            await context.sdkcall("Backup", "listBackupSelections", {
                BackupPlanId: backupplan.BackupPlanId
            }, true).then(async (data) => {

                await Promise.all(data.BackupSelectionsList.map(backupselection => {
                    return context.sdkcall("Backup", "getBackupSelection", {
                        BackupPlanId: backupplan.BackupPlanId,
                        SelectionId: backupselection.SelectionId
                    }, true).then(async (data) => {
                        resources.push({
                            f2id: backupselection.SelectionId,
                            f2type: 'backup.backupselection',
                            f2data: data,
                            f2region: context.region,
                            id: backupselection.SelectionId,
                            name: backupselection.SelectionName
                        });
                    });
                }));
            });

            return context.sdkcall("Backup", "getBackupPlan", {
                BackupPlanId: backupplan.BackupPlanId
            }, true).then(async (data) => {
                resources.push({
                    f2id: backupplan.BackupPlanArn,
                    f2type: 'backup.backupplan',
                    f2data: data,
                    f2region: context.region,
                    id: backupplan.BackupPlanId,
                    name: backupplan.BackupPlanName
                });
            });
        }));
    });

    await context.sdkcall("Backup", "listFrameworks", {
        // no params
    }, true).then(async (data) => {
        await Promise.all(data.Frameworks.map(async (framework) => {
            return context.sdkcall("Backup", "describeFramework", {
                FrameworkName: framework.FrameworkName
            }, true).then(async (data) => {
                resources.push({
                    f2id: data.FrameworkArn,
                    f2type: 'backup.backupframework',
                    f2data: data,
                    f2region: context.region,
                    name: data.FrameworkName,
                    description: data.FrameworkDescription
                });
            });
        }));
    });

    await context.sdkcall("Backup", "listReportPlans", {
        // no params
    }, true).then(async (data) => {
        await Promise.all(data.ReportPlans.map(async (reportplan) => {
            return context.sdkcall("Backup", "describeReportPlan", {
                ReportPlanName: reportplan.ReportPlanName
            }, true).then(async (data) => {
                resources.push({
                    f2id: data.ReportPlan.ReportPlanArn,
                    f2type: 'backup.backupreportplan',
                    f2data: data.ReportPlan,
                    f2region: context.region,
                    name: data.ReportPlan.ReportPlanName,
                    description: data.ReportPlan.ReportPlanDescription
                });
            });
        }));
    });

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "backup.backupvault") {
        reqParams.cfn['BackupVaultName'] = obj.data.BackupVaultName;
        reqParams.tf['name'] = obj.data.BackupVaultName;
        reqParams.cfn['EncryptionKeyArn'] = obj.data.EncryptionKeyArn;
        reqParams.tf['kms_key_arn'] = obj.data.EncryptionKeyArn;
        reqParams.cfn['AccessPolicy'] = obj.data.AccessPolicy;
        reqParams.cfn['Notifications'] = obj.data.Notifications;

        /*
        TODO:
        BackupVaultTags: Json

        tags
        */

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('backup', obj.id, 'AWS::Backup::BackupVault'),
            'region': obj.region,
            'service': 'backup',
            'type': 'AWS::Backup::BackupVault',
            'terraformType': 'aws_backup_vault',
            'options': reqParams,
            'returnValues': {
                'Ref': obj.data.BackupVaultName,
                'GetAtt': {
                    'BackupVaultName': obj.data.BackupVaultName,
                    'BackupVaultArn': obj.data.BackupVaultArn
                }
            }
        });
    } else if (obj.type == "backup.backupplan") {
        var rules = [];
        var tfRules = [];

        if (obj.data.BackupPlan.Rules) {
            obj.data.BackupPlan.Rules.forEach(rule => {
                rules.push({
                    'CompletionWindowMinutes': rule.CompletionWindowMinutes,
                    'Lifecycle': rule.Lifecycle,
                    'RecoveryPointTags': rule.RecoveryPointTags,
                    'RuleName': rule.RuleName,
                    'ScheduleExpression': rule.ScheduleExpression,
                    'StartWindowMinutes': rule.StartWindowMinutes,
                    'TargetBackupVault': rule.TargetBackupVaultName,
                });
                var tfLifecycle = null;
                if (rule.Lifecycle) {
                    tfLifecycle = {
                        'cold_storage_after': rule.Lifecycle.MoveToColdStorageAfterDays,
                        'delete_after': rule.Lifecycle.DeleteAfterDays
                    };
                }
                tfRules.push({
                    'completion_window': rule.CompletionWindowMinutes,
                    'lifecycle': tfLifecycle,
                    'recovery_point_tags': rule.RecoveryPointTags,
                    'rule_name': rule.RuleName,
                    'schedule': rule.ScheduleExpression,
                    'start_window': rule.StartWindowMinutes,
                    'target_vault_name': rule.TargetBackupVaultName,
                });
            });
        }

        reqParams.cfn['BackupPlan'] = {
            'BackupPlanName': obj.data.BackupPlan.BackupPlanName,
            'BackupPlanRule': rules,
            'AdvancedBackupSettings': obj.data.BackupPlan.AdvancedBackupSettings
        };

        reqParams.tf['name'] = obj.data.BackupPlan.BackupPlanName;
        reqParams.tf['rule'] = tfRules;

        /*
        TODO:
        BackupPlanTags: Json

        tags
        */

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('backup', obj.id, 'AWS::Backup::BackupPlan'),
            'region': obj.region,
            'service': 'backup',
            'type': 'AWS::Backup::BackupPlan',
            'terraformType': 'aws_backup_plan',
            'options': reqParams,
            'returnValues': {
                'Ref': obj.data.BackupPlanId,
                'GetAtt': {
                    'BackupPlanId': obj.data.BackupPlanId,
                    'BackupPlanArn': obj.data.BackupPlanArn,
                    'VersionId': obj.data.VersionId
                }
            }
        });
    } else if (obj.type == "backup.backupselection") {
        reqParams.cfn['BackupPlanId'] = obj.data.BackupPlanId;
        reqParams.cfn['BackupSelection'] = obj.data.BackupSelection;

        reqParams.tf['plan_id'] = obj.data.BackupPlanId;
        reqParams.tf['name'] = obj.data.BackupSelection.SelectionName;
        reqParams.tf['resources'] = obj.data.BackupSelection.Resources;
        reqParams.tf['iam_role_arn'] = obj.data.BackupSelection.IamRoleArn;
        if (obj.data.BackupSelection.ListOfTags) {
            reqParams.tf['selection_tag'] = [];
            obj.data.BackupSelection.ListOfTags.forEach(tag => {
                reqParams.tf['selection_tag'].push({
                    'type': tag.ConditionType,
                    'key': tag.ConditionKey,
                    'value': tag.ConditionValue
                });
            });
        }

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('backup', obj.id, 'AWS::Backup::BackupSelection'),
            'region': obj.region,
            'service': 'backup',
            'type': 'AWS::Backup::BackupSelection',
            'terraformType': 'aws_backup_selection',
            'options': reqParams,
            'returnValues': {
                'Ref': obj.data.SelectionId,
                'GetAtt': {
                    'BackupPlanId': obj.data.BackupPlanId,
                    'SelectionId': obj.data.SelectionId
                }
            }
        });
    } else if (obj.type == "backup.backupframework") {
        reqParams.cfn['FrameworkName'] = obj.data.FrameworkName;
        reqParams.cfn['FrameworkDescription'] = obj.data.FrameworkName;
        reqParams.cfn['FrameworkControls'] = obj.data.FrameworkControls;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('backup', obj.id, 'AWS::Backup::Framework'),
            'region': obj.region,
            'service': 'backup',
            'type': 'AWS::Backup::Framework',
            'options': reqParams,
            'returnValues': {
                'GetAtt': {
                    'FrameworkArn': obj.data.FrameworkArn
                }
            }
        });
    } else if (obj.type == "backup.backupreportplan") {
        reqParams.cfn['ReportPlanName'] = obj.data.ReportPlanName;
        reqParams.cfn['ReportPlanDescription'] = obj.data.ReportPlanDescription;
        reqParams.cfn['ReportDeliveryChannel'] = obj.data.ReportDeliveryChannel;
        reqParams.cfn['ReportSetting'] = obj.data.ReportSetting;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('backup', obj.id, 'AWS::Backup::ReportPlan'),
            'region': obj.region,
            'service': 'backup',
            'type': 'AWS::Backup::ReportPlan',
            'options': reqParams,
            'returnValues': {
                'GetAtt': {
                    'ReportPlanArn': obj.data.ReportPlanArn
                }
            }
        });
    } else {
        return false;
    }

    return true;
}

module.exports = { section, updateDatatable, mapResources };
