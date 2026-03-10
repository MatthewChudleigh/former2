/**
 * SimpleDB service module (converted from js/services/simpledb.js).
 *
 * @type {import('../types').ServiceModule}
 */

const section = {
    'category': 'Other',
    'service': 'SimpleDB',
    'resourcetypes': {
        'Domains': {
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
                        title: 'Domain Name',
                        field: 'domainname',
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
                        field: 'itemcount',
                        title: 'Item Count',
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

/**
 * @param {import('../types').Former2Context} context
 * @returns {Promise<Array<import('../types').ResourceRecord>>}
 */
async function updateDatatable(context) {
    const resources = [];

    await context.sdkcall("SimpleDB", "listDomains", {}, false).then(async (data) => {
        await Promise.all(data.DomainNames.map(domainname => {
            return context.sdkcall("SimpleDB", "domainMetadata", {
                DomainName: domainname
            }, true).then((data) => {
                data['DomainName'] = domainname;
                resources.push({
                    f2id: "SDB " + data.DomainName,
                    f2type: 'simpledb.domain',
                    f2data: data,
                    f2region: context.region,
                    domainname: domainname,
                    itemcount: data.ItemCount
                });
            });
        }));
    }).catch(() => { });

    return resources;
}

/**
 * @type {import('../types').MapResourcesFn}
 */
function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "simpledb.domain") {
        reqParams.cfn['Description'] = "REPLACEME";

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('simpledb', obj.id, 'AWS::SDB::Domain'),
            'region': obj.region,
            'service': 'simpledb',
            'type': 'AWS::SDB::Domain',
            'options': reqParams,
            'returnValue': {
                'Ref': obj.data.DomainName
            }
        });
    } else {
        return false;
    }

    return true;
}

module.exports = { section, updateDatatable, mapResources };
