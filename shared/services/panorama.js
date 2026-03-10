const section = {
    'category': 'Machine Learning',
    'service': 'Panorama',
    'resourcetypes': {
        'Application Instances': {
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
        'Packages': {
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
        'Package Versions': {
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
                        field: 'version',
                        title: 'Version',
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
    var packageversions = {};

    await context.sdkcall("Panorama", "listApplicationInstances", {
        // no params
    }, false).then(async (data) => {
        await Promise.all(data.ApplicationInstances.map(async (applicationinstance) => {
            await context.sdkcall("Panorama", "describeApplicationInstance", {
                ApplicationInstanceId: applicationinstance.ApplicationInstanceId
            }, true).then(async (data) => {
                await context.sdkcall("Panorama", "describeApplicationInstanceDetails", {
                    ApplicationInstanceId: applicationinstance.ApplicationInstanceId
                }, false).then(async (detailsdata) => {
                    data['Details'] = detailsdata;
                });

                resources.push({
                    f2id: data.Arn,
                    f2type: 'panorama.applicationinstance',
                    f2data: data,
                    f2region: context.region,
                    name: data.Name,
                    description: data.Description,
                    id: data.ApplicationInstanceId
                });
            });

            return context.sdkcall("Panorama", "listApplicationInstanceNodeInstances", {
                ApplicationInstanceId: applicationinstance.ApplicationInstanceId
            }, true).then(async (data) => {
                data.NodeInstances.forEach(nodeinstance => {
                    if (!packageversions[nodeinstance.PackageName]) {
                        packageversions[nodeinstance.PackageName] = [];
                    }
                    packageversions[nodeinstance.PackageName].push(nodeinstance.PackageVersion);
                });
            });
        }));
    }).catch(() => { });

    await context.sdkcall("Panorama", "listPackages", {
        // no params
    }, false).then(async (data) => {
        await Promise.all(data.Packages.map(async (package) => {
            if (packageversions[package.PackageName]) {
                packageversions[package.PackageName].forEach(async (packageversion) => {
                    await context.sdkcall("Panorama", "describePackageVersion", {
                        PackageId: package.PackageId,
                        PackageVersion: packageversion
                    }, true).then(async (data) => {
                        resources.push({
                            f2id: data.PackageArn + " " + data.PackageVersion + " " + data.PatchVersion,
                            f2type: 'panorama.packageversion',
                            f2data: data,
                            f2region: context.region,
                            version: data.PackageVersion,
                            id: data.PackageId
                        });
                    });
                });
            }

            return context.sdkcall("Panorama", "describePackage", {
                PackageId: package.PackageId
            }, true).then(async (data) => {
                resources.push({
                    f2id: data.Arn,
                    f2type: 'panorama.package',
                    f2data: data,
                    f2region: context.region,
                    name: data.PackageName,
                    id: data.PackageId
                });
            });
        }));
    }).catch(() => { });

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "panorama.applicationinstance") {
        reqParams.cfn['Name'] = obj.data.Name;
        reqParams.cfn['Description'] = obj.data.Description;
        reqParams.cfn['DefaultRuntimeContextDevice'] = obj.data.DefaultRuntimeContextDevice;
        reqParams.cfn['ApplicationInstanceIdToReplace'] = obj.data.ApplicationInstanceIdToReplace;
        reqParams.cfn['RuntimeRoleArn'] = obj.data.RuntimeRoleArn;
        if (obj.data.Tags) {
            reqParams.cfn['Tags'] = [];
            Object.keys(obj.data.Tags).forEach(tagKey => {
                if (!tagKey.startsWith("aws:")) {
                    reqParams.cfn['Tags'].push({
                        'Key': tagKey,
                        'Value': obj.data.Tags[tagKey]
                    });
                }
            });
        }
        if (obj.data.Details) {
            if (obj.data.Details.ManifestPayload) {
                reqParams.cfn['ManifestPayload'] = obj.data.ManifestPayload;
            }
            if (obj.data.Details.ManifestOverridesPayload) {
                reqParams.cfn['ManifestOverridesPayload'] = obj.data.ManifestOverridesPayload;
            }
        }
        
        /*
        TODO:
        DeviceId: String
        StatusFilter: String
        */

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('panorama', obj.id, 'AWS::Panorama::ApplicationInstance'),
            'region': obj.region,
            'service': 'panorama',
            'type': 'AWS::Panorama::ApplicationInstance',
            'options': reqParams,
            'returnValues': {
                'GetAtt': {
                    'ApplicationInstanceId': obj.data.ApplicationInstanceId,
                    'Arn': obj.data.Arn
                }
            }
        });
    } else if (obj.type == "panorama.package") {
        reqParams.cfn['PackageName'] = obj.data.PackageName;
        if (obj.data.Tags) {
            reqParams.cfn['Tags'] = [];
            Object.keys(obj.data.Tags).forEach(tagKey => {
                if (!tagKey.startsWith("aws:")) {
                    reqParams.cfn['Tags'].push({
                        'Key': tagKey,
                        'Value': obj.data.Tags[tagKey]
                    });
                }
            });
        }

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('panorama', obj.id, 'AWS::Panorama::Package'),
            'region': obj.region,
            'service': 'panorama',
            'type': 'AWS::Panorama::Package',
            'options': reqParams,
            'returnValues': {
                'GetAtt': {
                    'PackageId': obj.data.PackageId,
                    'Arn': obj.data.Arn
                }
            }
        });
    } else if (obj.type == "panorama.packageversion") {
        reqParams.cfn['PackageId'] = obj.data.PackageId;
        reqParams.cfn['PackageVersion'] = obj.data.PackageVersion;
        reqParams.cfn['PatchVersion'] = obj.data.PatchVersion;
        reqParams.cfn['MarkLatest'] = obj.data.IsLatestPatch;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('panorama', obj.id, 'AWS::Panorama::PackageVersion'),
            'region': obj.region,
            'service': 'panorama',
            'type': 'AWS::Panorama::PackageVersion',
            'options': reqParams
        });
    } else {
        return false;
    }

    return true;
}

module.exports = { section, updateDatatable, mapResources };
