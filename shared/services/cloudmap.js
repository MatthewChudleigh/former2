const section = {
    'category': 'Networking &amp; Content Delivery',
    'service': 'Cloud Map',
    'resourcetypes': {
        'HTTP Namespaces': {
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
                        field: 'servicecount',
                        title: 'Service Count',
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
        'Public DNS Namespaces': {
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
                        field: 'servicecount',
                        title: 'Service Count',
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
        'Private DNS Namespaces': {
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
                        field: 'servicecount',
                        title: 'Service Count',
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
        'Services': {
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
                    },
                    {
                        field: 'namespaceid',
                        title: 'Namespace ID',
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
                        field: 'instancecount',
                        title: 'Instance Count',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    }
                ]
            ]
        },
        'Instances': {
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
        }
    }
};

async function updateDatatable(context) {
    const resources = [];
    await context.sdkcall("ServiceDiscovery", "listNamespaces", {
        // no params
    }, true).then(async (data) => {
        await Promise.all(data.Namespaces.map(namespace => {
            return context.sdkcall("ServiceDiscovery", "getNamespace", {
                Id: namespace.Id
            }, true).then((data) => {
                if (data.Namespace.Type == "HTTP") {
                    resources.push({
                        f2id: data.Namespace.Arn,
                        f2type: 'servicediscovery.httpnamespace',
                        f2data: data.Namespace,
                        f2region: context.region,
                        id: data.Namespace.Id,
                        name: data.Namespace.Name,
                        description: data.Namespace.Description,
                        servicecount: data.Namespace.ServiceCount,
                        creationtime: data.Namespace.CreateDate
                    });
                } else if (data.Namespace.Type == "DNS_PUBLIC") {
                    resources.push({
                        f2id: data.Namespace.Arn,
                        f2type: 'servicediscovery.publicdnsnamespace',
                        f2data: data.Namespace,
                        f2region: context.region,
                        name: data.Namespace.Name,
                        description: data.Namespace.Description,
                        servicecount: data.Namespace.ServiceCount,
                        creationtime: data.Namespace.CreateDate
                    });
                } else if (data.Namespace.Type == "DNS_PRIVATE") {
                    resources.push({
                        f2id: data.Namespace.Arn,
                        f2type: 'servicediscovery.privatednsnamespace',
                        f2data: data.Namespace,
                        f2region: context.region,
                        name: data.Namespace.Name,
                        description: data.Namespace.Description,
                        servicecount: data.Namespace.ServiceCount,
                        creationtime: data.Namespace.CreateDate
                    });
                }
            });
        }));
    });

    await context.sdkcall("ServiceDiscovery", "listServices", {
        // no params
    }, true).then(async (data) => {
        await Promise.all(data.Services.map(service => {
            return Promise.all([
                context.sdkcall("ServiceDiscovery", "listInstances", {
                    ServiceId: service.Id
                }, true).then((data) => {
                    data.Instances.forEach(instance => {
                        context.sdkcall("ServiceDiscovery", "getInstance", {
                            InstanceId: instance.Id,
                            ServiceId: service.Id
                        }, true).then((data) => {
                            data.Instance['ServiceId'] = service.Id;
                            resources.push({
                                f2id: data.Instance.Id,
                                f2type: 'servicediscovery.instance',
                                f2data: data.Instance,
                                f2region: context.region,
                                id: data.Instance.Id
                            });
                        });
                    });
                }),
                context.sdkcall("ServiceDiscovery", "getService", {
                    Id: service.Id
                }, true).then((data) => {
                    resources.push({
                        f2id: data.Service.Arn,
                        f2type: 'servicediscovery.service',
                        f2data: data.Service,
                        f2region: context.region,
                        id: data.Service.Id,
                        name: data.Service.Name,
                        namespaceid: data.Service.NamespaceId,
                        description: data.Service.Description,
                        instancecount: data.Service.InstanceCount
                    });
                })
            ]);
        }));
    });

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "servicediscovery.httpnamespace") {
        reqParams.cfn['Description'] = obj.data.Description;
        reqParams.tf['description'] = obj.data.Description;
        reqParams.cfn['Name'] = obj.data.Name;
        reqParams.tf['name'] = obj.data.Name;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('servicediscovery', obj.id, 'AWS::ServiceDiscovery::HttpNamespace'),
            'region': obj.region,
            'service': 'servicediscovery',
            'type': 'AWS::ServiceDiscovery::HttpNamespace',
            'terraformType': 'aws_service_discovery_http_namespace',
            'options': reqParams
        });
    } else if (obj.type == "servicediscovery.privatednsnamespace") {
        reqParams.cfn['Description'] = obj.data.Description;
        reqParams.tf['description'] = obj.data.Description;
        reqParams.cfn['Name'] = obj.data.Name;
        reqParams.tf['name'] = obj.data.Name;

        /*
        TODO:
        Vpc
        */

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('servicediscovery', obj.id, 'AWS::ServiceDiscovery::PrivateDnsNamespace'),
            'region': obj.region,
            'service': 'servicediscovery',
            'type': 'AWS::ServiceDiscovery::PrivateDnsNamespace',
            'terraformType': 'aws_service_discovery_private_dns_namespace',
            'options': reqParams
        });
    } else if (obj.type == "servicediscovery.publicdnsnamespace") {
        reqParams.cfn['Description'] = obj.data.Description;
        reqParams.tf['description'] = obj.data.Description;
        reqParams.cfn['Name'] = obj.data.Name;
        reqParams.tf['name'] = obj.data.Name;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('servicediscovery', obj.id, 'AWS::ServiceDiscovery::PublicDnsNamespace'),
            'region': obj.region,
            'service': 'servicediscovery',
            'type': 'AWS::ServiceDiscovery::PublicDnsNamespace',
            'terraformType': 'aws_service_discovery_public_dns_namespace',
            'options': reqParams
        });
    } else if (obj.type == "servicediscovery.service") {
        reqParams.cfn['Name'] = obj.data.Name;
        reqParams.tf['name'] = obj.data.Name;
        reqParams.cfn['Description'] = obj.data.Description;
        reqParams.tf['description'] = obj.data.Description;
        reqParams.cfn['NamespaceId'] = obj.data.NamespaceId;
        if (obj.data.DnsConfig) {
            var tfdnsrecords = [];
            obj.data.DnsConfig.DnsRecords.forEach(dnsrecord => {
                tfdnsrecords.push({
                    'ttl': dnsrecord.TTL,
                    'type': dnsrecord.Type
                });
            });
            reqParams.cfn['DnsConfig'] = {
                'DnsRecords': obj.data.DnsConfig.DnsRecords,
                'NamespaceId': obj.data.DnsConfig.NamespaceId,
                'RoutingPolicy': obj.data.DnsConfig.RoutingPolicy
            };
            reqParams.tf['dns_config'] = {
                'dns_records': tfdnsrecords,
                'namespace_id': obj.data.DnsConfig.NamespaceId,
                'routing_policy': obj.data.DnsConfig.RoutingPolicy
            };
        }
        reqParams.cfn['HealthCheckConfig'] = obj.data.HealthCheckConfig;
        if (obj.data.HealthCheckConfig) {
            reqParams.tf['health_check_config'] = {
                'failure_threshold': obj.data.HealthCheckConfig.FailureThreshold,
                'resource_path': obj.data.HealthCheckConfig.ResourcePath,
                'type': obj.data.HealthCheckConfig.Type
            };
        }
        reqParams.cfn['HealthCheckCustomConfig'] = obj.data.HealthCheckCustomConfig;
        if (obj.data.HealthCheckCustomConfig) {
            reqParams.tf['health_check_custom_config'] = {
                'failure_threshold': obj.data.HealthCheckCustomConfig.FailureThreshold
            };
        }

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('servicediscovery', obj.id, 'AWS::ServiceDiscovery::Service'),
            'region': obj.region,
            'service': 'servicediscovery',
            'type': 'AWS::ServiceDiscovery::Service',
            'terraformType': 'aws_service_discovery_service',
            'options': reqParams
        });
    } else if (obj.type == "servicediscovery.instance") {
        reqParams.cfn['InstanceId'] = obj.data.Id;
        reqParams.cfn['InstanceAttributes'] = obj.data.Attributes;
        reqParams.cfn['ServiceId'] = obj.data.ServiceId;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('servicediscovery', obj.id, 'AWS::ServiceDiscovery::Instance'),
            'region': obj.region,
            'service': 'servicediscovery',
            'type': 'AWS::ServiceDiscovery::Instance',
            'options': reqParams
        });
    } else {
        return false;
    }

    return true;
}

module.exports = { section, updateDatatable, mapResources };
