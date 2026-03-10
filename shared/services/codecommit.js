const section = {
    'category': 'Developer Tools',
    'service': 'CodeCommit',
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
        'Notification Rules': {
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
                        field: 'resource',
                        title: 'Resource',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    },
                    {
                        field: 'detailtype',
                        title: 'Detail Type',
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
    /*
    await context.sdkcall("CodeCommit", "listRepositories", {
        // no params
    }, true).then(async (data) => {
        await Promise.all(data.repositories.map(async (repository) => {
            return context.sdkcall("CodeCommit", "getRepository", {
                repositoryName: repository.repositoryName
            }, true).then(async (data) => {
                data['Tags'] = await context.getResourceTags(data.repositoryMetadata.Arn);

                resources.push({
                    f2id: data.repositoryMetadata.repositoryId,
                    f2type: 'codecommit.repository',
                    f2data: data.repositoryMetadata,
                    f2region: context.region,
                    name: data.repositoryMetadata.repositoryName,
                    id: data.repositoryMetadata.repositoryId
                });
            });
        }));
    });

    await context.sdkcall("CodeStarNotifications", "listNotificationRules", {
        // no params
    }, false).then(async (data) => {
        await Promise.all(data.NotificationRules.map(notificationRule => {
            return context.sdkcall("CodeStarNotifications", "describeNotificationRule", {
                Arn: notificationRule.Arn
            }, false).then(async (data) => {
                if (data.Resource.split(":")[2] == "codecommit") {
                    resources.push({
                        f2id: data.Arn,
                        f2type: 'codestarnotifications.notificationrule',
                        f2data: data,
                        f2region: context.region,
                        name: data.Name,
                        resource: data.Resource,
                        detailtype: data.DetailType
                    });
                }
            });
        }));
    }).catch(() => { });
    */

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "codecommit.repository") {
        reqParams.cfn['RepositoryDescription'] = obj.data.repositoryDescription;
        reqParams.tf['description'] = obj.data.repositoryDescription;
        reqParams.cfn['RepositoryName'] = obj.data.repositoryName;
        reqParams.tf['repository_name'] = obj.data.repositoryName;
        reqParams.cfn['Tags'] = context.stripAWSTags(obj.data.Tags);

        /*
        TODO:
        Triggers
        */

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('codecommit', obj.id, 'AWS::CodeCommit::Repository'),
            'region': obj.region,
            'service': 'codecommit',
            'type': 'AWS::CodeCommit::Repository',
            'terraformType': 'aws_codecommit_repository',
            'options': reqParams,
            'returnValues': {
                'Ref': obj.data.repositoryId,
                'GetAtt': {
                    'Arn': obj.data.Arn,
                    'CloneUrlHttp': obj.data.cloneUrlHttp,
                    'CloneUrlSsh': obj.data.cloneUrlSsh,
                    'Name': obj.data.repositoryName
                }
            }
        });
    } else {
        return false;
    }

    return true;
}

module.exports = { section, updateDatatable, mapResources };
