const section = {
    'category': 'Analytics',
    'service': 'QuickSight',
    'resourcetypes': {
        'Analyses': {
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
        'Dashboards': {
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
        'Templates': {
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
        'Themes': {
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
        'Groups': {
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
                        title: 'Group Name',
                        field: 'groupname',
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
        'Data Sources': {
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
        'Data Sets': {
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
        }
    }
};

async function updateDatatable(context) {
    const resources = [];
    await context.sdkcall("STS", "getCallerIdentity", {
        // no params
    }, true).then(async (data) => {
        var accountId = data.Account;

        await context.sdkcall("QuickSight", "listGroups", {
            Namespace: 'default',
            AwsAccountId: accountId
        }, false).then(async (data) => {
            data.GroupList.forEach(group => {
                group['AccountId'] = accountId;

                resources.push({
                    f2id: group.Arn,
                    f2type: 'quicksight.group',
                    f2data: group,
                    f2region: context.region,
                    groupname: group.GroupName,
                    description: group.Description
                });
            });
        }).catch(() => { });

        await context.sdkcall("QuickSight", "listAnalyses", {
            AwsAccountId: accountId
        }, false).then(async (data) => {
            await Promise.all(data.AnalysisSummaryList.map(async (analysis) => {
                return context.sdkcall("QuickSight", "describeAnalysis", {
                    AnalysisId: analysis.AnalysisId,
                    AwsAccountId: accountId
                }, false).then(async (data) => {
                    data.Analysis['AccountId'] = accountId;

                    await context.sdkcall("QuickSight", "describeAnalysisPermissions", {
                        AnalysisId: analysis.AnalysisId,
                        AwsAccountId: accountId
                    }, false).then(permissionsdata => {
                        data.Analysis['Permissions'] = permissionsdata.Permissions;
                    });

                    resources.push({
                        f2id: data.Analysis.Arn,
                        f2type: 'quicksight.analysis',
                        f2data: data.Analysis,
                        f2region: context.region,
                        name: data.Analysis.Name,
                        id: data.Analysis.AnalysisId
                    });
                });
            }));
        }).catch(() => { });

        await context.sdkcall("QuickSight", "listDashboards", {
            AwsAccountId: accountId
        }, false).then(async (data) => {
            await Promise.all(data.DashboardSummaryList.map(async (dashboard) => {
                return context.sdkcall("QuickSight", "describeDashboard", {
                    DashboardId: dashboard.DashboardId,
                    AwsAccountId: accountId
                }, false).then(async (data) => {
                    data.Dashboard['AccountId'] = accountId;

                    await context.sdkcall("QuickSight", "describeDashboardPermissions", {
                        DashboardId: dashboard.DashboardId,
                        AwsAccountId: accountId
                    }, false).then(permissionsdata => {
                        data.Dashboard['Permissions'] = permissionsdata.Permissions;
                    });

                    resources.push({
                        f2id: data.Dashboard.Arn,
                        f2type: 'quicksight.dashboard',
                        f2data: data.Dashboard,
                        f2region: context.region,
                        name: data.Dashboard.Name,
                        id: data.Dashboard.DashboardId
                    });
                });
            }));
        }).catch(() => { });

        await context.sdkcall("QuickSight", "listTemplates", {
            AwsAccountId: accountId
        }, false).then(async (data) => {
            await Promise.all(data.TemplateSummaryList.map(template => {
                return context.sdkcall("QuickSight", "describeTemplate", {
                    TemplateId: template.TemplateId,
                    AwsAccountId: accountId
                }, false).then(async (data) => {
                    data.Template['AccountId'] = accountId;

                    resources.push({
                        f2id: data.Template.Arn,
                        f2type: 'quicksight.template',
                        f2data: data.Template,
                        f2region: context.region,
                        name: data.Template.Name,
                        id: data.Template.TemplateId
                    });
                });
            }));
        }).catch(() => { });

        await context.sdkcall("QuickSight", "listThemes", {
            AwsAccountId: accountId
        }, false).then(async (data) => {
            await Promise.all(data.ThemeSummaryList.map(theme => {
                return context.sdkcall("QuickSight", "describeTheme", {
                    ThemeId: theme.ThemeId,
                    AwsAccountId: accountId
                }, false).then(async (data) => {
                    data.Theme['AccountId'] = accountId;

                    resources.push({
                        f2id: data.Theme.Arn,
                        f2type: 'quicksight.theme',
                        f2data: data.Theme,
                        f2region: context.region,
                        name: data.Theme.Name,
                        id: data.Theme.ThemeId
                    });
                });
            }));
        }).catch(() => { });

        await context.sdkcall("QuickSight", "listDataSources", {
            AwsAccountId: accountId
        }, false).then(async (data) => {
            await Promise.all(data.DataSources.map(datasource => {
                return context.sdkcall("QuickSight", "describeDataSource", {
                    DataSourceId: datasource.DataSourceId,
                    AwsAccountId: accountId
                }, false).then(async (data) => {
                    data.DataSource['AccountId'] = accountId;

                    resources.push({
                        f2id: data.DataSource.Arn,
                        f2type: 'quicksight.datasource',
                        f2data: data.DataSource,
                        f2region: context.region,
                        name: data.DataSource.Name,
                        id: data.DataSource.DataSourceId
                    });
                });
            }));
        }).catch(() => { });

        await context.sdkcall("QuickSight", "listDataSets", {
            AwsAccountId: accountId
        }, false).then(async (data) => {
            await Promise.all(data.DataSetSummaries.map(dataset => {
                return context.sdkcall("QuickSight", "describeDataSet", {
                    DataSetId: dataset.DataSetId,
                    AwsAccountId: accountId
                }, false).then(async (data) => {
                    data.DataSet['AccountId'] = accountId;

                    await context.sdkcall("QuickSight", "describeDataSetPermissions", {
                        DataSetId: dataset.DataSetId,
                        AwsAccountId: accountId
                    }, false).then(async (permissionsdata) => {
                        data.DataSet['Permissions'] = permissionsdata['Permissions'];
                    });

                    resources.push({
                        f2id: data.DataSet.Arn,
                        f2type: 'quicksight.dataset',
                        f2data: data.DataSet,
                        f2region: context.region,
                        name: data.DataSet.Name,
                        id: data.DataSet.DataSetId
                    });
                });
            }));
        }).catch(() => { });
    });

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "quicksight.group") {
        reqParams.tf['group_name'] = obj.data.GroupName;
        reqParams.tf['aws_account_id'] = obj.data.AccountId;
        reqParams.tf['description'] = obj.data.Description;
        reqParams.tf['namespace'] = "default";

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('quicksight', obj.id, 'AWS::QuickSight::Group'), // not real resource type
            'region': obj.region,
            'service': 'quicksight',
            'terraformType': 'aws_quicksight_group',
            'options': reqParams
        });
    } else if (obj.type == "quicksight.analysis") {
        reqParams.cfn['AnalysisId'] = obj.data.AnalysisId;
        reqParams.cfn['Name'] = obj.data.Name;
        reqParams.cfn['AwsAccountId'] = obj.data.AccountId;
        reqParams.cfn['ThemeArn'] = obj.data.ThemeArn;
        reqParams.cfn['SourceEntity'] = "REPLACEME";
        reqParams.cfn['Permissions'] = obj.data.Permissions;


        /*
        Parameters: 
            Parameters
        Permissions: 
            - ResourcePermission
        SourceEntity: 
            AnalysisSourceEntity
        Tags: 
            - Tag
        */

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('quicksight', obj.id, 'AWS::QuickSight::Analysis'),
            'region': obj.region,
            'service': 'quicksight',
            'type': 'AWS::QuickSight::Analysis',
            'options': reqParams,
            'returnValues': {
                'GetAtt': {
                    'Arn': obj.data.Arn
                }
            },
            'Import': {
                'AwsAccountId': obj.data.AccountId,
                'AnalysisId': obj.data.AnalysisId
            }
        });
    } else if (obj.type == "quicksight.dashboard") {
        reqParams.cfn['DashboardId'] = obj.data.DashboardId;
        reqParams.cfn['Name'] = obj.data.Name;
        reqParams.cfn['AwsAccountId'] = obj.data.AccountId;
        if (obj.data.Version) {
            reqParams.cfn['VersionDescription'] = obj.data.Version.Description;
            reqParams.cfn['ThemeArn'] = obj.data.Version.ThemeArn;
        }
        reqParams.cfn['Permissions'] = obj.data.Permissions;
        reqParams.cfn['SourceEntity'] = "REPLACEME";

        /*
        DashboardPublishOptions: 
            DashboardPublishOptions
        Parameters: 
            Parameters
        SourceEntity: 
            DashboardSourceEntity
        Tags: 
            - Tag
        */

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('quicksight', obj.id, 'AWS::QuickSight::Dashboard'),
            'region': obj.region,
            'service': 'quicksight',
            'type': 'AWS::QuickSight::Dashboard',
            'options': reqParams,
            'returnValues': {
                'GetAtt': {
                    'Arn': obj.data.Arn
                },
                'Import': {
                    'AwsAccountId': obj.data.AccountId,
                    'DashboardId': obj.data.DashboardId
                }
            }
        });
    } else if (obj.type == "quicksight.template") {
        reqParams.cfn['TemplateId'] = obj.data.TemplateId;
        reqParams.cfn['Name'] = obj.data.Name;
        reqParams.cfn['AwsAccountId'] = obj.data.AccountId;
        if (obj.data.Version) {
            reqParams.cfn['VersionDescription'] = obj.data.Version.Description;
        }

        /*
        Permissions: 
            - ResourcePermission
        SourceEntity: 
            TemplateSourceEntity
        Tags: 
            - Tag
        */

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('quicksight', obj.id, 'AWS::QuickSight::Template'),
            'region': obj.region,
            'service': 'quicksight',
            'type': 'AWS::QuickSight::Template',
            'options': reqParams,
            'returnValues': {
                'GetAtt': {
                    'Arn': obj.data.Arn
                },
                'Import': {
                    'AwsAccountId': obj.data.AccountId,
                    'TemplateId': obj.data.TemplateId
                }
            }
        });
    } else if (obj.type == "quicksight.theme") {
        reqParams.cfn['ThemeId'] = obj.data.ThemeId;
        reqParams.cfn['Name'] = obj.data.Name;
        reqParams.cfn['AwsAccountId'] = obj.data.AccountId;
        if (obj.data.Version) {
            reqParams.cfn['BaseThemeId'] = obj.data.Version.BaseThemeId;
            reqParams.cfn['VersionDescription'] = obj.data.Version.Description;
            reqParams.cfn['Configuration'] = obj.data.Version.Configuration;
        }

        /*
        Permissions: 
            - ResourcePermission
        Tags: 
            - Tag
        */

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('quicksight', obj.id, 'AWS::QuickSight::Theme'),
            'region': obj.region,
            'service': 'quicksight',
            'type': 'AWS::QuickSight::Theme',
            'options': reqParams,
            'returnValues': {
                'GetAtt': {
                    'Arn': obj.data.Arn
                },
                'Import': {
                    'AwsAccountId': obj.data.AccountId,
                    'ThemeId': obj.data.ThemeId
                }
            }
        });
    } else if (obj.type == "quicksight.datasource") {
        reqParams.cfn['DataSourceId'] = obj.data.DataSourceId;
        reqParams.cfn['Name'] = obj.data.Name;
        reqParams.cfn['AwsAccountId'] = obj.data.AccountId;
        reqParams.cfn['Type'] = obj.data.Type;
        reqParams.cfn['DataSourceParameters'] = obj.data.DataSourceParameters;
        reqParams.cfn['AlternateDataSourceParameters'] = obj.data.AlternateDataSourceParameters;
        reqParams.cfn['VpcConnectionProperties'] = obj.data.VpcConnectionProperties;
        reqParams.cfn['SslProperties'] = obj.data.SslProperties;

        /*
        Credentials: 
            DataSourceCredentials
        Permissions: 
            - ResourcePermission
        Tags: 
            - Tag
        */

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('quicksight', obj.id, 'AWS::QuickSight::DataSource'),
            'region': obj.region,
            'service': 'quicksight',
            'type': 'AWS::QuickSight::DataSource',
            'options': reqParams,
            'returnValues': {
                'GetAtt': {
                    'Arn': obj.data.Arn
                }
            }
        });
    } else if (obj.type == "quicksight.dataset") {
        reqParams.cfn['DataSetId'] = obj.data.DataSetId;
        reqParams.cfn['Name'] = obj.data.Name;
        reqParams.cfn['AwsAccountId'] = obj.data.AccountId;
        reqParams.cfn['PhysicalTableMap'] = obj.data.PhysicalTableMap;
        reqParams.cfn['LogicalTableMap'] = obj.data.LogicalTableMap;
        reqParams.cfn['ImportMode'] = obj.data.ImportMode;
        reqParams.cfn['ColumnGroups'] = obj.data.ColumnGroups;
        if (obj.data.FieldFolders) {
            reqParams.cfn['FieldFolders'] = {};
            for (var k of Object.keys(obj.data.FieldFolders)) {
                reqParams.cfn['FieldFolders'][k] = {
                    'Description': obj.data.FieldFolders[k]['description'],
                    'Columns': obj.data.FieldFolders[k]['columns']
                };
            }
        }
        reqParams.cfn['RowLevelPermissionDataSet'] = obj.data.RowLevelPermissionDataSet;
        reqParams.cfn['ColumnLevelPermissionRules'] = obj.data.ColumnLevelPermissionRules;
        reqParams.cfn['Permissions'] = obj.data.Permissions;

        /*
        IngestionWaitPolicy: 
            IngestionWaitPolicy
        Tags: 
            - Tag
        */

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('quicksight', obj.id, 'AWS::QuickSight::DataSet'),
            'region': obj.region,
            'service': 'quicksight',
            'type': 'AWS::QuickSight::DataSet',
            'options': reqParams,
            'returnValues': {
                'GetAtt': {
                    'Arn': obj.data.Arn
                }
            }
        });
    } else {
        return false;
    }

    return true;
}

module.exports = { section, updateDatatable, mapResources };
