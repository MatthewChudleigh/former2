const section = {
    'category': 'Security, Identity, &amp; Compliance',
    'service': 'Single Sign-On',
    'resourcetypes': {
        'Permission Sets': {
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
        'Assignments': {
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
                        title: 'Principal ID',
                        field: 'principalid',
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
                        field: 'targetid',
                        title: 'Target ID',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    },
                    {
                        field: 'permissionsetarn',
                        title: 'Permission Set ARN',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    },
                    {
                        field: 'instancearn',
                        title: 'Instance ARN',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    }
                ]
            ]
        },
        'Instance Access Control Attribute Configurations': {
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
                        title: 'Instance ARN',
                        field: 'instancearn',
                        rowspan: 2,
                        align: 'center',
                        valign: 'middle',
                        sortable: true,
                        formatter: 'primaryFieldFormatter',
                        footerFormatter: 'textFormatter'
                    }
                ],
                [
                    // none
                ]
            ]
        }
    }
};

async function updateDatatable(context) {
    const resources = [];
    await context.sdkcall("SSOAdmin", "listInstances", {
        // no params
    }, true).then(async (data) => {
        await Promise.all(data.Instances.map(async (instance) => {
            await context.sdkcall("SSOAdmin", "listPermissionSets", {
                InstanceArn: instance.InstanceArn
            }, true).then(async (data) => {
                await Promise.all(data.PermissionSets.map(async (permissionSet) => {
                    await context.sdkcall("SSOAdmin", "describePermissionSet", {
                        InstanceArn: instance.InstanceArn,
                        PermissionSetArn: permissionSet
                    }, true).then(async (data) => {
                        data.PermissionSet['InstanceArn'] = instance.InstanceArn;

                        await context.sdkcall("SSOAdmin", "getInlinePolicyForPermissionSet", {
                            InstanceArn: instance.InstanceArn,
                            PermissionSetArn: permissionSet
                        }, true).then(async (inlinepolicy) => {
                            data.PermissionSet['InlinePolicy'] = inlinepolicy.InlinePolicy;
                        }).catch(() => { });

                        await context.sdkcall("SSOAdmin", "listManagedPoliciesInPermissionSet", {
                            InstanceArn: instance.InstanceArn,
                            PermissionSetArn: permissionSet
                        }, true).then(async (managedpolicies) => {
                            data.PermissionSet['ManagedPolicies'] = managedpolicies.AttachedManagedPolicies;
                        }).catch(() => { });

                        resources.push({
                            f2id: data.PermissionSet.PermissionSetArn,
                            f2type: 'singlesignon.permissionset',
                            f2data: data.PermissionSet,
                            f2region: context.region,
                            name: data.PermissionSet.Name,
                            description: data.PermissionSet.Description
                        });
                    });
                    
                    return context.sdkcall("SSOAdmin", "listAccountsForProvisionedPermissionSet", {
                        InstanceArn: instance.InstanceArn,
                        PermissionSetArn: permissionSet
                    }, true).then(async (accountids) => {
                        await Promise.all(accountids.AccountIds.map(async (accountid) => {
                            return context.sdkcall("SSOAdmin", "listAccountAssignments", {
                                InstanceArn: instance.InstanceArn,
                                PermissionSetArn: permissionSet,
                                AccountId: accountid
                            }, true).then(async (assignments) => {
                                assignments.AccountAssignments.forEach(assignment => {
                                    assignment['InstanceArn'] = instance.InstanceArn;

                                    resources.push({
                                        f2id: assignment.AccountId + " " + assignment.PermissionSetArn + " " + assignment.PrincipalId + " assignment for " + instance.InstanceArn,
                                        f2type: 'singlesignon.assignment',
                                        f2data: assignment,
                                        f2region: context.region,
                                        principalid: assignment.PrincipalId,
                                        targetid: assignment.AccountId,
                                        permissionsetarn: assignment.PermissionSetArn,
                                        instancearn: instance.InstanceArn
                                    });
                                });
                            }).catch(() => { });
                        }));
                    }).catch(() => { });
                }));
            });

            return context.sdkcall("SSOAdmin", "describeInstanceAccessControlAttributeConfiguration", {
                InstanceArn: instance.InstanceArn
            }, false).then(async (iacac) => {
                iacac['InstanceArn'] = instance.InstanceArn;

                resources.push({
                    f2id: instance.InstanceArn + " IACAC",
                    f2type: 'singlesignon.iacac',
                    f2data: iacac,
                    f2region: context.region,
                    instancearn: instance.InstanceArn
                });
            }).catch(() => { });
        }));
    }).catch(() => { });

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "singlesignon.permissionset") {
        reqParams.cfn['Name'] = obj.data.Name;
        reqParams.tf['name'] = obj.data.Name;
        reqParams.cfn['Description'] = obj.data.Description;
        reqParams.tf['description'] = obj.data.Description;
        reqParams.cfn['SessionDuration'] = obj.data.SessionDuration;
        reqParams.tf['session_duration'] = obj.data.SessionDuration;
        reqParams.cfn['RelayStateType'] = obj.data.RelayState;
        reqParams.tf['relay_state'] = obj.data.RelayState;
        reqParams.cfn['InstanceArn'] = obj.data.InstanceArn;
        reqParams.tf['instance_arn'] = obj.data.InstanceArn;
        reqParams.cfn['InlinePolicy'] = obj.data.InlinePolicy;
        if (obj.data.ManagedPolicies) {
            reqParams.cfn['ManagedPolicies'] = [];

            obj.data.ManagedPolicies.forEach(managedpolicy => {
                reqParams.cfn['ManagedPolicies'].push(managedpolicy.Arn);
            });
        }

        /*
        TODO:
        Tags: 
            - Tag
        */

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('singlesignon', obj.id, 'AWS::SSO::PermissionSet'),
            'region': obj.region,
            'service': 'singlesignon',
            'type': 'AWS::SSO::PermissionSet',
            'terraformType': 'aws_ssoadmin_permission_set',
            'options': reqParams,
            'returnValues': {
                'Terraform': {
                    'arn': obj.data.PermissionSetArn
                },
                'GetAtt': {
                    'PermissionSetArn': obj.data.PermissionSetArn
                }
            }
        });

        if (obj.data.InlinePolicy) {
            reqParams = {
                'boto3': {},
                'go': {},
                'cfn': {},
                'cli': {},
                'tf': {},
                'iam': {}
            };

            reqParams.tf['inline_policy'] = obj.data.InlinePolicy;
            reqParams.tf['instance_arn'] = obj.data.InstanceArn;
            reqParams.tf['permission_set_arn'] = obj.data.PermissionSetArn;

            tracked_resources.push({
                'obj': obj,
                'logicalId': getResourceName('singlesignon', obj.id + " Inline Policy", 'AWS::SSO::PermissionSetInlinePolicy'), // not real resource type
                'region': obj.region,
                'service': 'singlesignon',
                'terraformType': 'aws_ssoadmin_permission_set_inline_policy',
                'options': reqParams
            });
        }

        if (obj.data.ManagedPolicies) {
            var i = 0;
            obj.data.ManagedPolicies.forEach(managedpolicy => {
                i += 1;
                reqParams = {
                    'boto3': {},
                    'go': {},
                    'cfn': {},
                    'cli': {},
                    'tf': {},
                    'iam': {}
                };

                reqParams.tf['managed_policy_arn'] = managedpolicy.Arn;
                reqParams.tf['instance_arn'] = obj.data.InstanceArn;
                reqParams.tf['permission_set_arn'] = obj.data.PermissionSetArn;

                tracked_resources.push({
                    'obj': obj,
                    'logicalId': getResourceName('singlesignon', obj.id + " Managed Policy Attachment " + i, 'AWS::SSO::ManagedPolicyAttachment'), // not real resource type
                    'region': obj.region,
                    'service': 'singlesignon',
                    'terraformType': 'aws_ssoadmin_managed_policy_attachment',
                    'options': reqParams
                });
            });
        }
    } else if (obj.type == "singlesignon.assignment") {
        reqParams.cfn['InstanceArn'] = obj.data.InstanceArn;
        reqParams.tf['instance_arn'] = obj.data.InstanceArn;
        reqParams.cfn['PermissionSetArn'] = obj.data.PermissionSetArn;
        reqParams.tf['permission_set_arn'] = obj.data.PermissionSetArn;
        reqParams.cfn['PrincipalId'] = obj.data.PrincipalId;
        reqParams.tf['principal_id'] = obj.data.PrincipalId;
        reqParams.cfn['PrincipalType'] = obj.data.PrincipalType;
        reqParams.tf['principal_type'] = obj.data.PrincipalType;
        reqParams.cfn['TargetId'] = obj.data.AccountId;
        reqParams.tf['target_id'] = obj.data.AccountId;
        reqParams.cfn['TargetType'] = "AWS_ACCOUNT";
        reqParams.tf['target_type'] = "AWS_ACCOUNT";

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('singlesignon', obj.id, 'AWS::SSO::Assignment'),
            'region': obj.region,
            'service': 'singlesignon',
            'type': 'AWS::SSO::Assignment',
            'terraformType': 'aws_ssoadmin_account_assignment',
            'options': reqParams
        });
    } else if (obj.type == "singlesignon.iacac") {
        reqParams.cfn['InstanceArn'] = obj.data.InstanceArn;
        reqParams.cfn['AccessControlAttributes'] = obj.data.InstanceAccessControlAttributeConfiguration.AccessControlAttributes;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('singlesignon', obj.id, 'AWS::SSO::InstanceAccessControlAttributeConfiguration'),
            'region': obj.region,
            'service': 'singlesignon',
            'type': 'AWS::SSO::InstanceAccessControlAttributeConfiguration',
            'options': reqParams
        });
    } else {
        return false;
    }

    return true;
}

module.exports = { section, updateDatatable, mapResources };
