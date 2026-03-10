const section = {
    'category': 'Mobile',
    'service': 'Location Service',
    'resourcetypes': {
        'Geofence Collections': {
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
        'Maps': {
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
        'Place Indices': {
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
        'Route Calculators': {
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
        'Trackers': {
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
        'Tracker Consumers': {
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
                        title: 'Consumer ARN',
                        field: 'consumerarn',
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
                        field: 'trackername',
                        title: 'Tracker Name',
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
    await context.sdkcall("Location", "listGeofenceCollections", {
        // no params
    }, false).then(async (data) => {
        await Promise.all(data.Entries.map(entry => {
            return context.sdkcall("Location", "describeGeofenceCollection", {
                CollectionName: entry.CollectionName
            }, false).then((data) => {
                resources.push({
                    f2id: data.CollectionArn,
                    f2type: 'locationservice.geofencecollection',
                    f2data: data,
                    f2region: context.region,
                    name: data.CollectionName,
                    description: data.Description
                });
            });
        }));
    }).catch(() => { });

    await context.sdkcall("Location", "listMaps", {
        // no params
    }, false).then(async (data) => {
        await Promise.all(data.Entries.map(entry => {
            return context.sdkcall("Location", "describeMap", {
                MapName: entry.MapName
            }, false).then((data) => {
                resources.push({
                    f2id: data.MapArn,
                    f2type: 'locationservice.map',
                    f2data: data,
                    f2region: context.region,
                    name: data.MapName,
                    description: data.Description
                });
            });
        }));
    }).catch(() => { });

    await context.sdkcall("Location", "listPlaceIndexes", {
        // no params
    }, false).then(async (data) => {
        await Promise.all(data.Entries.map(entry => {
            return context.sdkcall("Location", "describePlaceIndex", {
                IndexName: entry.IndexName
            }, false).then((data) => {
                resources.push({
                    f2id: data.IndexArn,
                    f2type: 'locationservice.placeindex',
                    f2data: data,
                    f2region: context.region,
                    name: data.IndexName,
                    description: data.Description
                });
            });
        }));
    }).catch(() => { });

    await context.sdkcall("Location", "listRouteCalculators", {
        // no params
    }, false).then(async (data) => {
        await Promise.all(data.Entries.map(entry => {
            return context.sdkcall("Location", "describeRouteCalculator", {
                CalculatorName: entry.CalculatorName
            }, false).then((data) => {
                resources.push({
                    f2id: data.CalculatorArn,
                    f2type: 'locationservice.routecalculator',
                    f2data: data,
                    f2region: context.region,
                    name: data.CalculatorName,
                    description: data.Description
                });
            });
        }));
    }).catch(() => { });

    await context.sdkcall("Location", "listTrackers", {
        // no params
    }, false).then(async (data) => {
        await Promise.all(data.Entries.map(async (entry) => {
            await context.sdkcall("Location", "describeTracker", {
                TrackerName: entry.TrackerName
            }, false).then((data) => {
                resources.push({
                    f2id: data.TrackerArn,
                    f2type: 'locationservice.tracker',
                    f2data: data,
                    f2region: context.region,
                    name: data.TrackerName,
                    description: data.Description
                });
            });

            return context.sdkcall("Location", "listTrackerConsumers", {
                TrackerName: entry.TrackerName
            }, false).then((data) => {
                data.ConsumerArns.forEach(consumerarn => {
                    resources.push({
                        f2id: entry.TrackerName + " Consumer " + consumerarn,
                        f2type: 'locationservice.trackerconsumer',
                        f2data: {
                            'TrackerName': entry.TrackerName,
                            'ConsumerArn': consumerarn
                        },
                        f2region: context.region,
                        trackername: entry.TrackerName,
                        consumerarn: consumerarn
                    });
                });
            });
        }));
    }).catch(() => { });

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "locationservice.geofencecollection") {
        reqParams.cfn['CollectionName'] = obj.data.CollectionName;
        reqParams.cfn['Description'] = obj.data.Description;
        reqParams.cfn['KmsKeyId'] = obj.data.KmsKeyId;
        reqParams.cfn['PricingPlan'] = obj.data.PricingPlan;
        reqParams.cfn['PricingPlanDataSource'] = obj.data.PricingPlanDataSource;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('locationservice', obj.id, 'AWS::Location::GeofenceCollection'),
            'region': obj.region,
            'service': 'locationservice',
            'type': 'AWS::Location::GeofenceCollection',
            'options': reqParams,
            'returnValues': {
                'Ref': obj.data.CollectionName
            }
        });
    } else if (obj.type == "locationservice.map") {
        reqParams.cfn['MapName'] = obj.data.MapName;
        reqParams.cfn['Description'] = obj.data.Description;
        reqParams.cfn['Configuration'] = obj.data.Configuration;
        reqParams.cfn['PricingPlan'] = obj.data.PricingPlan;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('locationservice', obj.id, 'AWS::Location::Map'),
            'region': obj.region,
            'service': 'locationservice',
            'type': 'AWS::Location::Map',
            'options': reqParams,
            'returnValues': {
                'Ref': obj.data.MapName
            }
        });
    } else if (obj.type == "locationservice.placeindex") {
        reqParams.cfn['IndexName'] = obj.data.IndexName;
        reqParams.cfn['Description'] = obj.data.Description;
        reqParams.cfn['PricingPlan'] = obj.data.PricingPlan;
        reqParams.cfn['DataSource'] = obj.data.DataSource;
        reqParams.cfn['DataSourceConfiguration'] = obj.data.DataSourceConfiguration;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('locationservice', obj.id, 'AWS::Location::PlaceIndex'),
            'region': obj.region,
            'service': 'locationservice',
            'type': 'AWS::Location::PlaceIndex',
            'options': reqParams
        });
    } else if (obj.type == "locationservice.routecalculator") {
        reqParams.cfn['CalculatorName'] = obj.data.CalculatorName;
        reqParams.cfn['Description'] = obj.data.Description;
        reqParams.cfn['PricingPlan'] = obj.data.PricingPlan;
        reqParams.cfn['DataSource'] = obj.data.DataSource;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('locationservice', obj.id, 'AWS::Location::RouteCalculator'),
            'region': obj.region,
            'service': 'locationservice',
            'type': 'AWS::Location::RouteCalculator',
            'options': reqParams
        });
    } else if (obj.type == "locationservice.tracker") {
        reqParams.cfn['TrackerName'] = obj.data.TrackerName;
        reqParams.cfn['Description'] = obj.data.Description;
        reqParams.cfn['KmsKeyId'] = obj.data.KmsKeyId;
        reqParams.cfn['PricingPlan'] = obj.data.PricingPlan;
        reqParams.cfn['PricingPlanDataSource'] = obj.data.PricingPlanDataSource;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('locationservice', obj.id, 'AWS::Location::Tracker'),
            'region': obj.region,
            'service': 'locationservice',
            'type': 'AWS::Location::Tracker',
            'options': reqParams
        });
    } else if (obj.type == "locationservice.trackerconsumer") {
        reqParams.cfn['TrackerName'] = obj.data.TrackerName;
        reqParams.cfn['ConsumerArn'] = obj.data.ConsumerArn;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('locationservice', obj.id, 'AWS::Location::TrackerConsumer'),
            'region': obj.region,
            'service': 'locationservice',
            'type': 'AWS::Location::TrackerConsumer',
            'options': reqParams
        });
    } else {
        return false;
    }

    return true;
}

module.exports = { section, updateDatatable, mapResources };
