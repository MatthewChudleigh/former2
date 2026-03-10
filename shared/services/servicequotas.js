const section = {
    'category': 'Other',
    'service': 'Service Quotas',
    'resourcetypes': {
        'Service Quotas': {
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
                        title: 'Service Name',
                        field: 'servicename',
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
                        field: 'quotaname',
                        title: 'Quota Name',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    },
                    {
                        field: 'value',
                        title: 'Value',
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
    await context.sdkcall("ServiceQuotas", "listRequestedServiceQuotaChangeHistory", {
        // no params
    }, true).then(async (data) => {
        data.RequestedQuotas.forEach(quota => {
            var value = quota.DesiredValue;

            if (quota.Unit && quota.Unit != "None") {
                value = value + " " + quota.Unit;
            }

            resources.push({
                f2id: quota.Id,
                f2type: 'servicequotas.servicequota',
                f2data: quota,
                f2region: context.region,
                id: quota.Id,
                servicename: quota.ServiceName,
                quotaname: quota.QuotaName,
                value: value
            });
        });
    }).catch(() => { });

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "servicequotas.servicequota") {
        reqParams.tf['quota_code'] = obj.data.QuotaCode;
        reqParams.tf['service_code'] = obj.data.ServiceCode;
        reqParams.tf['value'] = obj.data.DesiredValue;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('servicequotas', obj.id, 'AWS::ServiceQuotas::ServiceQuota'), // not real resource type
            'region': obj.region,
            'service': 'servicequotas',
            'terraformType': 'aws_servicequotas_service_quota',
            'options': reqParams
        });
    } else {
        return false;
    }

    return true;
}

module.exports = { section, updateDatatable, mapResources };
