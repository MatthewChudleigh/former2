const section = {
    'category': 'Storage',
    'service': 'Glacier',
    'resourcetypes': {
        'Vaults': {
            'terraformonly': true,
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
                        field: 'numberofarchives',
                        title: 'Number of Archives',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    },
                    {
                        field: 'size',
                        title: 'Size',
                        sortable: true,
                        editable: true,
                        formatter: 'byteSizeFormatter',
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    }
                ]
            ]
        },
        'Vault Locks': {
            'terraformonly': true,
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
                        title: 'Vault Name',
                        field: 'vaultname',
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
        }
    }
};

async function updateDatatable(context) {
    const resources = [];
    await context.sdkcall("Glacier", "listVaults", {
        // no params
    }, true).then(async (data) => {
        await Promise.all(data.VaultList.map(vault => {
            return Promise.all([
                context.sdkcall("Glacier", "getVaultAccessPolicy", {
                    vaultName: vault.VaultName
                }, true).then(async (data) => {
                    vault['AccessPolicy'] = data.policy.Policy;

                    await context.sdkcall("Glacier", "getVaultNotifications", {
                        vaultName: vault.VaultName
                    }, true).then((data) => {
                        vault['NotificationConfig'] = data.vaultNotificationConfig;

                        resources.push({
                            f2id: vault.VaultARN,
                            f2type: 'glacier.vault',
                            f2data: vault,
                            f2region: context.region,
                            name: vault.VaultName,
                            numberofarchives: vault.NumberOfArchives,
                            size: vault.SizeInBytes
                        });
                    });
                }),
                context.sdkcall("Glacier", "getVaultLock", {
                    VaultName: vault.VaultName
                }, false).then((data) => {
                    data['VaultName'] = vault.VaultName;
                    resources.push({
                        f2id: vault.VaultName + " VaultLock",
                        f2type: 'glacier.vaultlock',
                        f2data: data,
                        f2region: context.region,
                        vaultname: vault.VaultName,
                        creationtime: data.CreationDate
                    });
                }).catch(() => { })
            ]);
        }));
    });

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "glacier.vault") {
        reqParams.tf['name'] = obj.data.VaultName;
        reqParams.tf['access_policy'] = obj.data.AccessPolicy;
        if (obj.data.NotificationConfig) {
            reqParams.tf['notification'] = {
                'events': obj.data.NotificationConfig.Events,
                'sns_topic': obj.data.NotificationConfig.SNSTopic
            };
        }

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('glacier', obj.id, 'AWS::Glacier::Vault'), // not real resource type
            'region': obj.region,
            'service': 'glacier',
            'terraformType': 'aws_glacier_vault',
            'options': reqParams
        });
    } else if (obj.type == "glacier.vaultlock") {
        var completelock = false;
        if (obj.data.State == "Locked") {
            completelock = true;
        }
        reqParams.tf['vault_name'] = obj.data.VaultName;
        reqParams.tf['complete_lock'] = completelock;
        reqParams.tf['policy'] = obj.data.Policy;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('glacier', obj.id, 'AWS::Glacier::VaultLock'), // not real resource type
            'region': obj.region,
            'service': 'glacier',
            'terraformType': 'aws_glacier_vault_lock',
            'options': reqParams
        });
    } else {
        return false;
    }

    return true;
}

module.exports = { section, updateDatatable, mapResources };
