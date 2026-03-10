const section = {
    'category': 'Analytics',
    'service': 'Glue',
    'resourcetypes': {
        'Databases': {
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
                        field: 'locationuri',
                        title: 'Location URI',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    }
                ]
            ]
        },
        'Tables': {
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
                        field: 'databasename',
                        title: 'Database Name',
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
                        field: 'tabletype',
                        title: 'Table Type',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    }
                ]
            ]
        },
        'Partitions': {
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
                        title: 'Table Name',
                        field: 'tablename',
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
                        field: 'databasename',
                        title: 'Database Name',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    },
                    {
                        field: 'values',
                        title: 'Values',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    }
                ]
            ]
        },
        'Crawlers': {
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
                        field: 'databasename',
                        title: 'Database Name',
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
                        field: 'tableprefix',
                        title: 'Table Prefix',
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
        'Classifiers': {
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
                        field: 'type',
                        title: 'Type',
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
        'Jobs': {
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
                        field: 'workertype',
                        title: 'Worker Type',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    }
                ]
            ]
        },
        'Triggers': {
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
                        field: 'type',
                        title: 'Type',
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
                        field: 'schedule',
                        title: 'Schedule',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    }
                ]
            ]
        },
        'Connections': {
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
        'ML Transforms': {
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
                        field: 'name',
                        title: 'Name',
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
        },
        'Dev Endpoints': {
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
                        field: 'subnetid',
                        title: 'Subnet ID',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    },
                    {
                        field: 'availabilityzone',
                        title: 'Availability Zone',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    }
                ]
            ]
        },
        'Workflows': {
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
        },
        'Security Configuration': {
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
        },
        'Data Catalog Encryption Settings': {
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
                        title: 'Catalog ID',
                        field: 'catalogid',
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
        'Registries': {
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
                        formatter: 'dateFormatter',
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    }
                ]
            ]
        },
        'Schemas': {
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
                        formatter: 'dateFormatter',
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    }
                ]
            ]
        },
        'Schema Versions': {
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
                        title: 'Schema ARN',
                        field: 'schemaarn',
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
                        field: 'versionnumber',
                        title: 'Version Number',
                        sortable: true,
                        editable: true,
                        formatter: 'dateFormatter',
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    }
                ]
            ]
        },
        'Schema Version Metadata': {
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
                        title: 'Schema Version ID',
                        field: 'schemaversionid',
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
                        field: 'key',
                        title: 'Key',
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
    await context.sdkcall("Glue", "getDatabases", {
        // no params
    }, true).then(async (data) => {
        await Promise.all(data.DatabaseList.map(database => {
            resources.push({
                f2id: database.Name,
                f2type: 'glue.database',
                f2data: database,
                f2region: context.region,
                name: database.Name,
                description: database.Description,
                locationuri: database.LocationUri
            });
            return context.sdkcall("Glue", "getTables", {
                DatabaseName: database.Name
            }, true).then(async (data) => {
                await Promise.all(data.TableList.map(table => {
                    resources.push({
                        f2id: table.Name,
                        f2type: 'glue.table',
                        f2data: table,
                        f2region: context.region,
                        name: table.Name,
                        databasename: table.DatabaseName,
                        description: table.Description,
                        tabletype: table.TableType
                    });
                    return context.sdkcall("Glue", "getPartitions", {
                        DatabaseName: database.Name,
                        TableName: table.Name
                    }, true).then((data) => {
                        data.Partitions.forEach(partition => {
                            resources.push({
                                f2id: JSON.stringify(partition), // TODO: Better id?
                                f2type: 'glue.partition',
                                f2data: partition,
                                f2region: context.region,
                                tablename: partition.TableName,
                                databasename: partition.DatabaseName,
                                values: partition.Values.join(", ")
                            });
                        });
                    });
                }));
            });
        }));
    }).catch(() => { });

    await context.sdkcall("Glue", "getCrawlers", {
        // no params
    }, true).then((data) => {
        data.Crawlers.forEach(crawler => {
            resources.push({
                f2id: crawler.Name,
                f2type: 'glue.crawler',
                f2data: crawler,
                f2region: context.region,
                name: crawler.Name,
                databasename: crawler.DatabaseName,
                description: crawler.Description,
                tableprefix: crawler.TablePrefix,
                version: crawler.Version
            });
        });
    }).catch(() => { });

    await context.sdkcall("Glue", "getClassifiers", {
        // no params
    }, true).then((data) => {
        data.Classifiers.forEach(classifier => {
            var name = null;
            var version = null;
            var type = null;
            if (classifier.GrokClassifier) {
                name = classifier.GrokClassifier.Name;
                version = classifier.GrokClassifier.Version;
                type = "Grok";
            }
            if (classifier.XMLClassifier) {
                name = classifier.XMLClassifier.Name;
                version = classifier.GrokClassifier.Version;
                type = "XML";
            }
            if (classifier.JsonClassifier) {
                name = classifier.JsonClassifier.Name;
                version = classifier.GrokClassifier.Version;
                type = "JSON";
            }
            if (classifier.CsvClassifier) {
                name = classifier.CsvClassifier.Name;
                version = classifier.CsvClassifier.Version;
                type = "CSV";
            }
            if (name) {
                resources.push({
                    f2id: name,
                    f2type: 'glue.classifier',
                    f2data: classifier,
                    f2region: context.region,
                    name: name,
                    version: version,
                    type: type
                });
            }
        });
    }).catch(() => { });

    await context.sdkcall("Glue", "getJobs", {
        // no params
    }, true).then((data) => {
        data.Jobs.forEach(job => {
            resources.push({
                f2id: job.Name,
                f2type: 'glue.job',
                f2data: job,
                f2region: context.region,
                name: job.Name,
                description: job.Description,
                workertype: job.WorkerType
            });
        });
    }).catch(() => { });

    await context.sdkcall("Glue", "getTriggers", {
        // no params
    }, true).then((data) => {
        data.Triggers.forEach(trigger => {
            resources.push({
                f2id: trigger.Name,
                f2type: 'glue.trigger',
                f2data: trigger,
                f2region: context.region,
                name: trigger.Name,
                type: trigger.Type,
                description: trigger.Description,
                schedule: trigger.Schedule
            });
        });
    }).catch(() => { });

    await context.sdkcall("Glue", "getConnections", {
        // no params
    }, true).then((data) => {
        data.ConnectionList.forEach(connection => {
            resources.push({
                f2id: connection.Name,
                f2type: 'glue.connection',
                f2data: connection,
                f2region: context.region,
                name: connection.Name,
                description: connection.Description,
                type: connection.ConnectionType
            });
        });
    }).catch(() => { });

    await context.sdkcall("Glue", "getMLTransforms", {
        // no params
    }, true).then((data) => {
        data.Transforms.forEach(transform => {
            resources.push({
                f2id: transform.TransformId,
                f2type: 'glue.mltransform',
                f2data: transform,
                f2region: context.region,
                id: transform.TransformId,
                description: transform.Description,
                name: transform.Name,
                creationtime: transform.CreatedOn
            });
        });
    }).catch(() => { });

    await context.sdkcall("Glue", "getDevEndpoints", {
        // no params
    }, true).then((data) => {
        data.DevEndpoints.forEach(devEndpoint => {
            resources.push({
                f2id: devEndpoint.EndpointName,
                f2type: 'glue.devendpoint',
                f2data: devEndpoint,
                f2region: context.region,
                name: devEndpoint.EndpointName,
                subnetid: devEndpoint.SubnetId,
                availabilityzone: devEndpoint.AvailabilityZone
            });
        });
    }).catch(() => { });

    await context.sdkcall("Glue", "listWorkflows", {
        // no params
    }, true).then(async (data) => {
        await Promise.all(data.Workflows.map(workflow => {
            return context.sdkcall("Glue", "getWorkflow", {
                Name: workflow
            }, true).then((data) => {
                resources.push({
                    f2id: data.Workflow.Name,
                    f2type: 'glue.workflow',
                    f2data: data.Workflow,
                    f2region: context.region,
                    name: data.Workflow.Name,
                    description: data.Workflow.Description,
                    creationtime: data.Workflow.CreatedOn
                });
            });
        }));
    }).catch(() => { });

    await context.sdkcall("Glue", "getSecurityConfigurations", {
        // no params
    }, true).then((data) => {
        data.SecurityConfigurations.forEach(securityConfiguration => {
            resources.push({
                f2id: securityConfiguration.EndpointName,
                f2type: 'glue.securityconfiguration',
                f2data: securityConfiguration,
                f2region: context.region,
                name: securityConfiguration.Name,
                creationtime: devEndpoint.CreatedTimeStamp
            });
        });
    }).catch(() => { });

    await context.sdkcall("Glue", "getDataCatalogEncryptionSettings", {
        // no params
    }, true).then((data) => {
        if (
            data.DataCatalogEncryptionSettings.EncryptionAtRest.CatalogEncryptionMode != "DISABLED" ||
            data.DataCatalogEncryptionSettings.ConnectionPasswordEncryption.ReturnConnectionPasswordEncrypted != false
        ) {
            resources.push({
                f2id: 'GlueDataCatalogEncryptionSettingsCurrentAccount',
                f2type: 'glue.datacatalogencryptionsettings',
                f2data: data,
                f2region: context.region,
                catalogid: "(current account)"
            });
        }
    }).catch(() => { });

    await context.sdkcall("Glue", "listRegistries", {
        // no params
    }, false).then(async (data) => {
        await Promise.all(data.Registries.map(registry => {
            return context.sdkcall("Glue", "getRegistry", {
                RegistryId: {
                    'RegistryName': registry.RegistryName
                }
            }, true).then((data) => {
                resources.push({
                    f2id: data.RegistryArn,
                    f2type: 'glue.registry',
                    f2data: data,
                    f2region: context.region,
                    name: data.RegistryName,
                    description: data.Description
                });
            });
        }));
    }).catch(() => { });

    await context.sdkcall("Glue", "listSchemas", {
        // no params
    }, false).then(async (data) => {
        await Promise.all(data.Schemas.map(async (schema) => {
            await context.sdkcall("Glue", "getSchema", {
                SchemaId: {
                    'SchemaArn': schema.SchemaArn
                }
            }, true).then(async (data) => {
                await context.sdkcall("Glue", "getSchemaVersion", {
                    SchemaId: {
                        'SchemaArn': schema.SchemaArn
                    }
                }, true).then(async (schemadata) => {
                    data['SchemaDefinition'] = schemadata.SchemaDefinition;
                });

                resources.push({
                    f2id: data.SchemaArn,
                    f2type: 'glue.schema',
                    f2data: data,
                    f2region: context.region,
                    name: data.SchemaName,
                    description: data.Description
                });
            });

            return context.sdkcall("Glue", "listSchemaVersions", {
                SchemaId: {
                    'SchemaArn': schema.SchemaArn
                }
            }, true).then(async (data) => {
                await Promise.all(data.Schemas.map(async (schemaversion) => {
                    await context.sdkcall("Glue", "getSchemaVersion", {
                        SchemaId: {
                            'SchemaArn': schemaversion.SchemaArn
                        },
                        SchemaVersionId: schemaversion.SchemaVersionId
                    }, true).then(async (data) => {
                        resources.push({
                            f2id: data.SchemaArn + " Version " + data.SchemaVersionId,
                            f2type: 'glue.schemaversion',
                            f2data: data,
                            f2region: context.region,
                            schemaarn: data.SchemaArn,
                            versionnumber: data.VersionNumber
                        });
                    });

                    return context.sdkcall("Glue", "querySchemaVersionMetadata", {
                        SchemaId: {
                            'SchemaArn': schemaversion.SchemaArn
                        },
                        SchemaVersionId: schemaversion.SchemaVersionId
                    }, true).then(async (data) => {
                        Object.keys(data.MetadataInfoMap).forEach(k => {
                            resources.push({
                                f2id: data.SchemaVersionId + " Metadata " + k,
                                f2type: 'glue.schemaversion',
                                f2data: {
                                    'Key': k,
                                    'Value': data.MetadataInfoMap[k].MetadataValue,
                                    'SchemaVersionId': data.SchemaVersionId
                                },
                                f2region: context.region,
                                schemaversionid: data.SchemaVersionId,
                                key: data.k
                            });
                        });
                    });
                }));
            });
        }));
    }).catch(() => { });

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "glue.database") {
        reqParams.cfn['DatabaseInput'] = {
            'Name': obj.data.Name,
            'Description': obj.data.Description,
            'LocationUri': obj.data.LocationUri,
            'Parameters': obj.data.Parameters
        };
        reqParams.cfn['CatalogId'] = "!Ref \"AWS::AccountId\"";

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('glue', obj.id, 'AWS::Glue::Database'),
            'region': obj.region,
            'service': 'glue',
            'type': 'AWS::Glue::Database',
            'options': reqParams
        });
    } else if (obj.type == "glue.table") {
        reqParams.cfn['DatabaseName'] = obj.data.DatabaseName;
        reqParams.cfn['CatalogId'] = "!Ref \"AWS::AccountId\"";
        reqParams.cfn['TableInput'] = {
            'Owner': obj.data.Owner,
            'ViewOriginalText': obj.data.ViewOriginalText,
            'Description': obj.data.Description,
            'TableType': obj.data.TableType,
            'Parameters': obj.data.Parameters,
            'ViewExpandedText': obj.data.ViewExpandedText,
            'StorageDescriptor': obj.data.StorageDescriptor,
            'PartitionKeys': obj.data.PartitionKeys,
            'Retention': obj.data.Retention,
            'Name': obj.data.Name
        };

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('glue', obj.id, 'AWS::Glue::Table'),
            'region': obj.region,
            'service': 'glue',
            'type': 'AWS::Glue::Table',
            'options': reqParams
        });
    } else if (obj.type == "glue.partition") {
        reqParams.cfn['TableName'] = obj.data.TableName;
        reqParams.cfn['DatabaseName'] = obj.data.DatabaseName;
        reqParams.cfn['CatalogId'] = "!Ref \"AWS::AccountId\"";
        reqParams.cfn['PartitionInput'] = {
            'Parameters': obj.data.Parameters,
            'StorageDescriptor': obj.data.StorageDescriptor
        };

        /*
        TODO:
        PartitionInput:
            Values
        */

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('glue', obj.id, 'AWS::Glue::Partition'),
            'region': obj.region,
            'service': 'glue',
            'type': 'AWS::Glue::Partition',
            'options': reqParams
        });
    } else if (obj.type == "glue.crawler") {
        reqParams.cfn['Name'] = obj.data.Name;
        reqParams.cfn['Role'] = obj.data.Role;
        if (obj.data.Targets) {
            reqParams.cfn['Targets'] = {
                'S3Targets': obj.data.Targets.S3Targets,
                'JdbcTargets': obj.data.Targets.JdbcTargets,
                'DynamoDBTargets': obj.data.Targets.DynamoDBTargets,
                'CatalogTargets': obj.data.Targets.CatalogTargets
            };
        }
        reqParams.cfn['DatabaseName'] = obj.data.DatabaseName;
        reqParams.cfn['Description'] = obj.data.Description;
        reqParams.cfn['Classifiers'] = obj.data.Classifiers;
        reqParams.cfn['SchemaChangePolicy'] = obj.data.SchemaChangePolicy;
        reqParams.cfn['TablePrefix'] = obj.data.TablePrefix;
        if (obj.data.Schedule) {
            reqParams.cfn['Schedule'] = {
                'ScheduleExpression': obj.data.Schedule.ScheduleExpression
            };
        }
        reqParams.cfn['Configuration'] = obj.data.Configuration;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('glue', obj.id, 'AWS::Glue::Crawler'),
            'region': obj.region,
            'service': 'glue',
            'type': 'AWS::Glue::Crawler',
            'options': reqParams
        });
    } else if (obj.type == "glue.classifier") {
        if (obj.data.GrokClassifier) {
            reqParams.cfn['GrokClassifier'] = {
                'CustomPatterns': obj.data.GrokClassifier.CustomPatterns,
                'GrokPattern': obj.data.GrokClassifier.GrokPattern,
                'Classification': obj.data.GrokClassifier.Classification,
                'Name': obj.data.GrokClassifier.Name
            };
        }
        if (obj.data.XMLClassifier) {
            reqParams.cfn['XMLClassifier'] = {
                'RowTag': obj.data.XMLClassifier.RowTag,
                'Classification': obj.data.XMLClassifier.Classification,
                'Name': obj.data.XMLClassifier.Name
            };
        }
        if (obj.data.JsonClassifier) {
            reqParams.cfn['JsonClassifier'] = {
                'JsonPath': obj.data.JsonClassifier.JsonPath,
                'Name': obj.data.JsonClassifier.Name
            };
        }
        if (obj.data.CsvClassifier) {
            reqParams.cfn['CsvClassifier'] = {
                'Name': obj.data.CsvClassifier.Name,
                'AllowSingleColumn': obj.data.CsvClassifier.AllowSingleColumn,
                'ContainsHeader': obj.data.CsvClassifier.ContainsHeader,
                'Delimiter': obj.data.CsvClassifier.Delimiter,
                'DisableValueTrimming': obj.data.CsvClassifier.DisableValueTrimming,
                'Header': obj.data.CsvClassifier.Header,
                'QuoteSymbol': obj.data.CsvClassifier.QuoteSymbol
            };
        }

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('glue', obj.id, 'AWS::Glue::Classifier'),
            'region': obj.region,
            'service': 'glue',
            'type': 'AWS::Glue::Classifier',
            'options': reqParams
        });
    } else if (obj.type == "glue.job") {
        reqParams.cfn['Name'] = obj.data.Name;
        reqParams.tf['name'] = obj.data.Name;
        reqParams.cfn['Description'] = obj.data.Description;
        reqParams.tf['description'] = obj.data.Description;
        reqParams.cfn['LogUri'] = obj.data.LogUri;
        reqParams.cfn['Role'] = obj.data.Role;
        reqParams.tf['role_arn'] = obj.data.Role;
        reqParams.cfn['ExecutionProperty'] = obj.data.ExecutionProperty;
        if (obj.data.ExecutionProperty) {
            reqParams.tf['execution_property'] = {
                'max_concurrent_runs': obj.data.ExecutionProperty.MaxConcurrentRuns
            };
        }
        reqParams.cfn['Command'] = obj.data.Command;
        if (obj.data.Command) {
            reqParams.tf['command'] = {
                'name': obj.data.Command.Name,
                'python_version': obj.data.Command.PythonVersion,
                'script_location': obj.data.Command.ScriptLocation
            };
        }
        reqParams.cfn['DefaultArguments'] = obj.data.DefaultArguments;
        reqParams.tf['default_arguments'] = obj.data.DefaultArguments;
        reqParams.cfn['Connections'] = obj.data.Connections;
        if (obj.data.Connections) {
            reqParams.tf['connections'] = obj.data.Connections.Connections;
        }
        reqParams.cfn['MaxRetries'] = obj.data.MaxRetries;
        reqParams.tf['max_retries'] = obj.data.MaxRetries;
        reqParams.cfn['AllocatedCapacity'] = obj.data.AllocatedCapacity;
        reqParams.cfn['Timeout'] = obj.data.Timeout;
        reqParams.tf['timeout'] = obj.data.Timeout;
        reqParams.cfn['NotificationProperty'] = obj.data.NotificationProperty;
        if (obj.data.NotificationProperty) {
            reqParams.tf['notification_property'] = {
                'notify_delay_after': obj.data.NotificationProperty.NotifyDelayAfter
            };
        }
        reqParams.cfn['GlueVersion'] = obj.data.GlueVersion;
        reqParams.tf['glue_version'] = obj.data.GlueVersion;
        reqParams.cfn['MaxCapacity'] = obj.data.MaxCapacity;
        reqParams.tf['max_capacity'] = obj.data.MaxCapacity;
        reqParams.cfn['NumberOfWorkers'] = obj.data.NumberOfWorkers;
        reqParams.tf['number_of_workers'] = obj.data.NumberOfWorkers;
        reqParams.cfn['WorkerType'] = obj.data.WorkerType;
        reqParams.tf['worker_type'] = obj.data.WorkerType;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('glue', obj.id, 'AWS::Glue::Job'),
            'region': obj.region,
            'service': 'glue',
            'type': 'AWS::Glue::Job',
            'terraformType': 'aws_glue_job',
            'options': reqParams,
            'returnValues': {
                'Terraform': {
                    'id': obj.data.Name
                }
            }
        });
    } else if (obj.type == "glue.trigger") {
        reqParams.cfn['Name'] = obj.data.Name;
        reqParams.cfn['Type'] = obj.data.Type;
        reqParams.cfn['Description'] = obj.data.Description;
        reqParams.cfn['Schedule'] = obj.data.Schedule;
        reqParams.cfn['WorkflowName'] = obj.data.WorkflowName;
        reqParams.cfn['StartOnCreation'] = true;
        if (obj.data.Actions) {
            reqParams.cfn['Actions'] = [];
            obj.data.Actions.forEach(action => {
                reqParams.cfn['Actions'].push({
                    'JobName': action.JobName,
                    'Arguments': action.Arguments,
                    'CrawlerName': action.CrawlerName,
                    'NotificationProperty': action.NotificationProperty,
                    'SecurityConfiguration': action.SecurityConfiguration,
                    'Timeout': action.Timeout
                });
            });
        }
        if (obj.data.Predicate) {
            var conditions = null;
            if (obj.data.Predicate.Conditions) {
                conditions = [];
                obj.data.Predicate.Conditions.forEach(condition => {
                    if (condition.State == "SUCCEEDED") {
                        conditions.push({
                            'LogicalOperator': condition.LogicalOperator,
                            'JobName': condition.JobName,
                            'State': 'SUCCEEDED'
                            //'State': condition.State
                        });
                    }
                });
            }
            reqParams.cfn['Predicate'] = {
                'Logical': obj.data.Predicate.Logical,
                'Conditions': conditions
            };
        }

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('glue', obj.id, 'AWS::Glue::Trigger'),
            'region': obj.region,
            'service': 'glue',
            'type': 'AWS::Glue::Trigger',
            'options': reqParams
        });
    } else if (obj.type == "glue.connection") {
        reqParams.cfn['ConnectionInput'] = {
            'Description': obj.data.Description,
            'ConnectionType': obj.data.ConnectionType,
            'MatchCriteria': obj.data.MatchCriteria,
            'PhysicalConnectionRequirements': obj.data.PhysicalConnectionRequirements,
            'ConnectionProperties': obj.data.ConnectionProperties,
            'Name': obj.data.Name
        };
        reqParams.cfn['CatalogId'] = "!Ref \"AWS::AccountId\"";

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('glue', obj.id, 'AWS::Glue::Connection'),
            'region': obj.region,
            'service': 'glue',
            'type': 'AWS::Glue::Connection',
            'options': reqParams
        });
    } else if (obj.type == "glue.devendpoint") {
        reqParams.cfn['EndpointName'] = obj.data.EndpointName;
        reqParams.cfn['RoleArn'] = obj.data.RoleArn;
        reqParams.cfn['SecurityGroupIds'] = obj.data.SecurityGroupIds;
        reqParams.cfn['SubnetId'] = obj.data.SubnetId;
        reqParams.cfn['NumberOfNodes'] = obj.data.NumberOfNodes;
        reqParams.cfn['ExtraPythonLibsS3Path'] = obj.data.ExtraPythonLibsS3Path;
        reqParams.cfn['ExtraJarsS3Path'] = obj.data.ExtraJarsS3Path;
        reqParams.cfn['PublicKey'] = obj.data.PublicKey;
        reqParams.cfn['PublicKeys'] = obj.data.PublicKeys;
        reqParams.cfn['WorkerType'] = obj.data.WorkerType;
        reqParams.cfn['NumberOfWorkers'] = obj.data.NumberOfWorkers;
        reqParams.cfn['GlueVersion'] = obj.data.GlueVersion;
        reqParams.cfn['Arguments'] = obj.data.Arguments;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('glue', obj.id, 'AWS::Glue::DevEndpoint'),
            'region': obj.region,
            'service': 'glue',
            'type': 'AWS::Glue::DevEndpoint',
            'options': reqParams
        });
    } else if (obj.type == "glue.securityconfiguration") {
        reqParams.cfn['Name'] = obj.data.Name;
        if (obj.data.EncryptionConfiguration) {
            reqParams.cfn['EncryptionConfiguration'] = {
                'CloudWatchEncryption': obj.data.CloudWatchEncryption,
                'JobBookmarksEncryption': obj.data.JobBookmarksEncryption,
                'S3Encryptions': obj.data.S3Encryption
            };
        }

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('glue', obj.id, 'AWS::Glue::SecurityConfiguration'),
            'region': obj.region,
            'service': 'glue',
            'type': 'AWS::Glue::SecurityConfiguration',
            'options': reqParams
        });
    } else if (obj.type == "glue.datacatalogencryptionsettings") {
        reqParams.cfn['CatalogId'] = "!Ref \"AWS::AccountId\"";
        if (obj.data.DataCatalogEncryptionSettings) {
            var connectionpasswordencryption = null;
            if (obj.data.DataCatalogEncryptionSettings.ConnectionPasswordEncryption) {
                connectionpasswordencryption = {
                    'ReturnConnectionPasswordEncrypted': obj.data.DataCatalogEncryptionSettings.ConnectionPasswordEncryption.ReturnConnectionPasswordEncrypted,
                    'KmsKeyId': obj.data.DataCatalogEncryptionSettings.ConnectionPasswordEncryption.AwsKmsKeyId
                };
            }
            reqParams.cfn['DataCatalogEncryptionSettings'] = {
                'EncryptionAtRest': obj.data.DataCatalogEncryptionSettings.EncryptionAtRest,
                'ConnectionPasswordEncryption': connectionpasswordencryption
            };
        }

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('glue', obj.id, 'AWS::Glue::DataCatalogEncryptionSettings'),
            'region': obj.region,
            'service': 'glue',
            'type': 'AWS::Glue::DataCatalogEncryptionSettings',
            'options': reqParams
        });
    } else if (obj.type == "glue.mltransform") {
        reqParams.cfn['Description'] = obj.data.Description;
        if (obj.data.InputRecordTables) {
            reqParams.cfn['InputRecordTables'] = {
                'GlueTables': obj.data.InputRecordTables
            };
        }
        reqParams.cfn['MaxCapacity'] = obj.data.MaxCapacity;
        reqParams.cfn['MaxRetries'] = obj.data.MaxRetries;
        reqParams.cfn['Name'] = obj.data.Name;
        reqParams.cfn['NumberOfWorkers'] = obj.data.NumberOfWorkers;
        reqParams.cfn['Role'] = obj.data.Role;
        reqParams.cfn['Timeout'] = obj.data.Timeout;
        reqParams.cfn['TransformParameters'] = obj.data.Parameters;
        reqParams.cfn['WorkerType'] = obj.data.WorkerType;
        reqParams.cfn['GlueVersion'] = obj.data.GlueVersion;

        /*
        TODO:
        Tags
        */

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('glue', obj.id, 'AWS::Glue::MLTransform'),
            'region': obj.region,
            'service': 'glue',
            'type': 'AWS::Glue::MLTransform',
            'options': reqParams
        });
    } else if (obj.type == "glue.workflow") {
        reqParams.cfn['Name'] = obj.data.Name;
        reqParams.cfn['Description'] = obj.data.Description;
        reqParams.cfn['DefaultRunProperties'] = obj.data.DefaultRunProperties;

        /*
        TODO:
        Tags: Json
        */

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('glue', obj.id, 'AWS::Glue::Workflow'),
            'region': obj.region,
            'service': 'glue',
            'type': 'AWS::Glue::Workflow',
            'options': reqParams
        });
    } else if (obj.type == "glue.registry") {
        reqParams.cfn['Name'] = obj.data.RegistryName;
        reqParams.cfn['Description'] = obj.data.Description;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('glue', obj.id, 'AWS::Glue::Registry'),
            'region': obj.region,
            'service': 'glue',
            'type': 'AWS::Glue::Registry',
            'options': reqParams
        });
    } else if (obj.type == "glue.schema") {
        reqParams.cfn['Name'] = obj.data.SchemaName;
        reqParams.cfn['Registry'] = {
            'Name': obj.data.RegistryName,
            'Arn': obj.data.RegistryArn
        };
        reqParams.cfn['Description'] = obj.data.Description;
        reqParams.cfn['DataFormat'] = obj.data.DataFormat;
        reqParams.cfn['Compatibility'] = obj.data.Compatibility;
        reqParams.cfn['SchemaDefinition'] = obj.data.SchemaDefinition;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('glue', obj.id, 'AWS::Glue::Schema'),
            'region': obj.region,
            'service': 'glue',
            'type': 'AWS::Glue::Schema',
            'options': reqParams
        });
    } else if (obj.type == "glue.schemaversion") {
        reqParams.cfn['Schema'] = {
            'SchemaArn': obj.data.SchemaArn
        };
        reqParams.cfn['SchemaDefinition'] = obj.data.SchemaDefinition;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('glue', obj.id, 'AWS::Glue::SchemaVersion'),
            'region': obj.region,
            'service': 'glue',
            'type': 'AWS::Glue::SchemaVersion',
            'options': reqParams
        });
    } else if (obj.type == "glue.schemaversionmetadata") {
        reqParams.cfn['Key'] = obj.data.Key;
        reqParams.cfn['Value'] = obj.data.Value;
        reqParams.cfn['SchemaVersionId'] = obj.data.SchemaVersionId;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('glue', obj.id, 'AWS::Glue::SchemaVersionMetadata'),
            'region': obj.region,
            'service': 'glue',
            'type': 'AWS::Glue::SchemaVersionMetadata',
            'options': reqParams
        });
    } else {
        return false;
    }

    return true;
}

module.exports = { section, updateDatatable, mapResources };
