const section = {
    'category': 'Security, Identity, &amp; Compliance',
    'service': 'Audit Manager',
    'resourcetypes': {
        'Assessments': {
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
                        field: 'frameworkid',
                        title: 'Framework ID',
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
    await context.sdkcall("AuditManager", "listAssessments", {
        // no params
    }, false).then(async (data) => {
        await Promise.all(data.assessmentMetadata.map(assessment => {
            return context.sdkcall("AuditManager", "getAssessment", {
                assessmentId: assessment.id
            }, true).then((data) => {
                resources.push({
                    f2id: data.assessment.arn,
                    f2type: 'auditmanager.assessment',
                    f2data: data.assessment,
                    f2region: context.region,
                    name: data.assessment.metadata.name,
                    description: data.assessment.metadata.description,
                    frameworkid: data.assessment.framework.id
                });
            });
        }));
    }).catch(() => { });

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "auditmanager.assessment") {
        if (obj.data.metadata) {
            reqParams.cfn['Name'] = obj.data.metadata.name;
            reqParams.cfn['Description'] = obj.data.metadata.description;
            reqParams.cfn['Scope'] = obj.data.metadata.scope;
            reqParams.cfn['Roles'] = obj.data.metadata.roles;
            reqParams.cfn['AssessmentReportsDestination'] = obj.data.metadata.assessmentReportsDestination;
        }
        if (obj.data.framework) {
            reqParams.cfn['FrameworkId'] = obj.data.framework.id;
        }
        reqParams.cfn['AwsAccount'] = obj.data.awsAccount;
        reqParams.cfn['Tags'] = stripAWSTags(obj.data.tags);

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('auditmanager', obj.id, 'AWS::AuditManager::Assessment'),
            'region': obj.region,
            'service': 'auditmanager',
            'type': 'AWS::AuditManager::Assessment',
            'options': reqParams
        });
    } else {
        return false;
    }

    return true;
}

module.exports = { section, updateDatatable, mapResources };
