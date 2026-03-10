const section = {
    'category': 'Management &amp; Governance',
    'service': 'Service Catalog',
    'resourcetypes': {
        'Portfolios': {
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
                        field: 'providername',
                        title: 'Provider Name',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    }
                ]
            ]
        },
        'Portfolio Principal Associations': {
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
                        title: 'Portfolio ID',
                        field: 'portfolioid',
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
                        field: 'principalarn',
                        title: 'Principal ARN',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    }
                ]
            ]
        },
        'Portfolio Product Associations': {
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
                        title: 'Portfolio Name',
                        field: 'portfolioname',
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
                        field: 'productid',
                        title: 'Product ID',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    },
                    {
                        field: 'portfolioid',
                        title: 'Portfolio ID',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    }
                ]
            ]
        },
        'Accepted Portfolio Shares': {
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
                        field: 'providername',
                        title: 'Provider Name',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    }
                ]
            ]
        },
        'CloudFormation Products': {
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
                        field: 'productid',
                        title: 'Product ID',
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
                        field: 'distributor',
                        title: 'Distributor',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    }
                ]
            ]
        },
        'CloudFormation Provisioned Products': {
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
                        field: 'productid',
                        title: 'Product ID',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    },
                    {
                        field: 'provisioningartifactid',
                        title: 'Provisioning Artifact ID',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    }
                ]
            ]
        },
        'Launch Notification Constraints': {
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
        'Launch Role Constraints': {
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
        'Launch Template Constraints': {
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
        'Stack Set Constraints': {
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
        'Tag Options': {
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
                        field: 'key',
                        title: 'Key',
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
        },
        'Tag Option Associations': {
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
                        title: 'Resource Name',
                        field: 'resourcename',
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
                        field: 'tagoptionid',
                        title: 'Tag Option ID',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    },
                    {
                        field: 'resourceid',
                        title: 'Resource ID',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    }
                ]
            ]
        },
        'AppRegistry Applications': {
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
        'AppRegistry Attribute Groups': {
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
        'AppRegistry Attribute Group Associations': {
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
                        title: 'Application',
                        field: 'application',
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
                        field: 'attributegroup',
                        title: 'Attribute Group',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    }
                ]
            ]
        },
        'AppRegistry Resource Associations': {
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
                        title: 'Application',
                        field: 'application',
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
                    }
                ]
            ]
        },
        'Service Actions': {
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
        'Service Action Associations': {
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
                        title: 'Service Action ID',
                        field: 'serviceactionid',
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
                        field: 'productid',
                        title: 'Product ID',
                        sortable: true,
                        editable: true,
                        footerFormatter: 'textFormatter',
                        align: 'center'
                    },
                    {
                        field: 'provisioningartifactid',
                        title: 'Provisioning Artifact ID',
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
    await context.sdkcall("ServiceCatalog", "listPortfolios", {
        // no params
    }, true).then(async (data) => {
        await Promise.all(data.PortfolioDetails.map(portfolio => {
            return Promise.all([
                context.sdkcall("ServiceCatalog", "listPrincipalsForPortfolio", {
                    PortfolioId: portfolio.Id
                }, true).then((data) => {
                    data.Principals.forEach(principal => {
                        resources.push({
                            f2id: principal.PrincipalARN + " " + portfolio.Id,
                            f2type: 'servicecatalog.portfolioprincipalassociation',
                            f2data: {
                                'portfolio': portfolio,
                                'principal': principal
                            },
                            f2region: context.region,
                            principalarn: principal.PrincipalARN,
                            portfolioid: portfolio.Id
                        });
                    });
                }),
                context.sdkcall("ServiceCatalog", "describePortfolio", {
                    Id: portfolio.Id
                }, true).then((data) => {
                    resources.push({
                        f2id: data.PortfolioDetail.ARN,
                        f2type: 'servicecatalog.portfolio',
                        f2data: data,
                        f2region: context.region,
                        name: data.PortfolioDetail.DisplayName,
                        id: data.PortfolioDetail.Id,
                        description: data.PortfolioDetail.Description,
                        providername: data.PortfolioDetail.ProviderName
                    });
                })
            ]);
        }));
    });

    await context.sdkcall("ServiceCatalog", "searchProductsAsAdmin", {
        // no params
    }, true).then(async (data) => {
        await Promise.all(data.ProductViewDetails.map(productView => {
            return context.sdkcall("ServiceCatalog", "describeProductAsAdmin", {
                Id: productView.ProductViewSummary.Id
            }, false).then((data) => {
                if (data.ProductViewDetail.ProductViewSummary.Type == "CLOUD_FORMATION_TEMPLATE") {
                    resources.push({
                        f2id: data.ProductViewDetail.ProductViewSummary.Id,
                        f2type: 'servicecatalog.cloudformationproduct',
                        f2data: data,
                        f2region: context.region,
                        name: data.ProductViewDetail.ProductViewSummary.Name,
                        id: data.ProductViewDetail.ProductViewSummary.Id,
                        productid: data.ProductViewDetail.ProductViewSummary.ProductId,
                        description: data.ProductViewDetail.ProductViewSummary.ShortDescription,
                        distributor: data.ProductViewDetail.ProductViewSummary.Distributor
                    });
                }
            }).catch(() => { });
        }));
    });

    await context.sdkcall("ServiceCatalog", "listAcceptedPortfolioShares", {
        // no params
    }, true).then((data) => {
        data.PortfolioDetails.forEach(portfolio => {
            resources.push({
                f2id: portfolio.ARN,
                f2type: 'servicecatalog.acceptedportfolioshare',
                f2data: portfolio,
                f2region: context.region,
                name: portfolio.DisplayName,
                id: portfolio.Id,
                description: portfolio.Description,
                providername: portfolio.ProviderName
            });
        });
    });

    await context.sdkcall("ServiceCatalog", "listServiceActions", {
        // no params
    }, false).then(async (data) => {
        await Promise.all(data.ServiceActionSummaries.map(serviceAction => {
            return context.sdkcall("ServiceCatalog", "describeServiceAction", {
                Id: serviceAction.Id
            }, true).then((data) => {
                resources.push({
                    f2id: data.ServiceActionDetail.ServiceActionSummary.Id,
                    f2type: 'servicecatalog.serviceaction',
                    f2data: data.ServiceActionDetail,
                    f2region: context.region,
                    name: data.ServiceActionDetail.ServiceActionSummary.Name,
                    description: data.ServiceActionDetail.ServiceActionSummary.Description
                });
            });
        }));
    }).catch(() => { });

    await context.sdkcall("ServiceCatalog", "searchProvisionedProducts", {
        // no params
    }, true).then(async (data) => {
        await Promise.all(data.ProvisionedProducts.map(provisionedProduct => {
            return Promise.all([
                context.sdkcall("ServiceCatalog", "listPortfoliosForProduct", {
                    ProductId: provisionedProduct.ProductId
                }, true).then(async (data) => {
                    await Promise.all(data.PortfolioDetails.map(portfolio => {
                        resources.push({
                            f2id: portfolio.ARN,
                            f2type: 'servicecatalog.portfolioproductassociation',
                            f2data: {
                                'portfolio': portfolio,
                                'product': provisionedProduct
                            },
                            f2region: context.region,
                            portfolioname: portfolio.DisplayName,
                            portfolioid: portfolio.Id,
                            productid: provisionedProduct.Id
                        });
                        return context.sdkcall("ServiceCatalog", "listConstraintsForPortfolio", {
                            PortfolioId: portfolio.Id
                        }, true).then(async (data) => {
                            await Promise.all(data.ConstraintDetails.map(constraint => {
                                return context.sdkcall("ServiceCatalog", "describeConstraint", {
                                    Id: constraint.ConstraintId
                                }, true).then((data) => {
                                    data['PortfolioId'] = portfolio.Id;
                                    data['ProductId'] = provisionedProduct.Id;

                                    if (data.ConstraintDetail.Type == "NOTIFICATION") {
                                        resources.push({
                                            f2id: data.ConstraintDetail.ConstraintId,
                                            f2type: 'servicecatalog.launchnotificationconstraint',
                                            f2data: data,
                                            f2region: context.region,
                                            id: data.ConstraintDetail.ConstraintId,
                                            description: data.ConstraintDetail.Description
                                        });
                                    } else if (data.ConstraintDetail.Type == "LAUNCH") {
                                        resources.push({
                                            f2id: data.ConstraintDetail.ConstraintId,
                                            f2type: 'servicecatalog.launchroleconstraint',
                                            f2data: data,
                                            f2region: context.region,
                                            id: data.ConstraintDetail.ConstraintId,
                                            description: data.ConstraintDetail.Description
                                        });
                                    } else if (data.ConstraintDetail.Type == "TEMPLATE") {
                                        resources.push({
                                            f2id: data.ConstraintDetail.ConstraintId,
                                            f2type: 'servicecatalog.launchtemplateconstraint',
                                            f2data: data,
                                            f2region: context.region,
                                            id: data.ConstraintDetail.ConstraintId,
                                            description: data.ConstraintDetail.Description
                                        });
                                    } else if (data.ConstraintDetail.Type == "STACKSET") {
                                        resources.push({
                                            f2id: data.ConstraintDetail.ConstraintId,
                                            f2type: 'servicecatalog.stacksetconstraint',
                                            f2data: data,
                                            f2region: context.region,
                                            id: data.ConstraintDetail.ConstraintId,
                                            description: data.ConstraintDetail.Description
                                        });
                                    }
                                });
                            }));
                        });
                    }));
                }),
                context.sdkcall("ServiceCatalog", "describeProvisionedProduct", {
                    Id: provisionedProduct.Id
                }, true).then((data) => {
                    if (data.ProvisionedProductDetail.Type == "CFN_STACK") {
                        data['Product'] = provisionedProduct;

                        resources.push({
                            f2id: data.ProvisionedProductDetail.Arn,
                            f2type: 'servicecatalog.cloudformationprovisionedproduct',
                            f2data: data,
                            f2region: context.region,
                            name: data.ProvisionedProductDetail.Name,
                            id: data.ProvisionedProductDetail.Id,
                            productid: data.ProvisionedProductDetail.ProductId,
                            provisioningartifactid: data.ProvisionedProductDetail.ProvisioningArtifactId
                        });
                    }
                }),
                context.sdkcall("ServiceCatalog", "listServiceActionsForProvisioningArtifact", {
                    ProvisioningArtifactId: provisionedProduct.ProvisioningArtifactId,
                    ProductId: provisionedProduct.ProductId
                }, true).then((data) => {
                    data.ServiceActionSummaries.forEach(serviceActionSummary => {
                        resources.push({
                            f2id: data.ProvisionedProductDetail.Arn,
                            f2type: 'servicecatalog.serviceactionassociation',
                            f2data: {
                                'ServiceActionId': serviceActionSummary.Id,
                                'ProvisioningArtifactId': provisionedProduct.ProvisioningArtifactId,
                                'ProductId': provisionedProduct.ProductId
                            },
                            f2region: context.region,
                            name: data.ProvisionedProductDetail.Name,
                            serviceactionid: serviceActionSummary.Id,
                            productid: provisionedProduct.ProductId,
                            provisioningartifactid: provisionedProduct.ProvisioningArtifactId
                        });
                    });
                })
            ]);
        }));
    });

    await context.sdkcall("ServiceCatalog", "listTagOptions", {
        // no params
    }, false).then(async (data) => {
        await Promise.all(data.TagOptionDetails.map(tagOption => {
            return Promise.all([
                context.sdkcall("ServiceCatalog", "listResourcesForTagOption", {
                    TagOptionId: tagOption.Id
                }, true).then((data) => {
                    data.ResourceDetails.forEach(resource => {
                        resources.push({
                            f2id: resource.ARN,
                            f2type: 'servicecatalog.tagoptionassociation',
                            f2data: {
                                'resource': resource,
                                'tagoption': tagOption
                            },
                            f2region: context.region,
                            resourcename: resource.Name,
                            resourceid: resource.Id,
                            tagoptionid: tagOption.Id
                        });
                    });
                }),
                context.sdkcall("ServiceCatalog", "describeTagOption", {
                    Id: tagOption.Id
                }, true).then((data) => {
                    resources.push({
                        f2id: data.TagOptionDetail.Id,
                        f2type: 'servicecatalog.tagoption',
                        f2data: data.TagOptionDetail,
                        f2region: context.region,
                        id: data.TagOptionDetail.Id,
                        key: data.TagOptionDetail.Key,
                        value: data.TagOptionDetail.Value
                    });
                })
            ]);
        }));
    }).catch(() => { });

    await context.sdkcall("ServiceCatalogAppRegistry", "listApplications", {
        // no params
    }, false).then(async (data) => {
        await Promise.all(data.applications.map(async (application) => {
            await context.sdkcall("ServiceCatalog", "getApplication", {
                application: application.id
            }, true).then((data) => {
                resources.push({
                    f2id: data.arn,
                    f2type: 'servicecatalog.appregistryapplication',
                    f2data: data,
                    f2region: context.region,
                    name: data.name,
                    description: data.description
                });
            });

            await context.sdkcall("ServiceCatalogAppRegistry", "listAssociatedAttributeGroups", {
                application: application.id
            }, false).then(async (data) => {
                data.attributeGroups.forEach(attributeGroup => {
                    resources.push({
                        f2id: attributeGroup + " " + application.id + " Association",
                        f2type: 'servicecatalog.appregistryattributegroupassociation',
                        f2data: {
                            'AttributeGroup': attributeGroup,
                            'Application': application.id
                        },
                        f2region: context.region,
                        application: application.id,
                        attributegroup: attributeGroup
                    });
                });
            }).catch(() => { });

            return context.sdkcall("ServiceCatalogAppRegistry", "listAssociatedResources", {
                application: application.id
            }, false).then(async (data) => {
                data.resources.forEach(resource => {
                    resources.push({
                        f2id: resource.arn + " " + application.id + " Association",
                        f2type: 'servicecatalog.appregistryresourceassociation',
                        f2data: {
                            'Resource': resource.arn,
                            'ResourceType': 'CFN_STACK',
                            'Application': application.id
                        },
                        f2region: context.region,
                        application: application.id,
                        resource: resource.arn
                    });
                });
            }).catch(() => { });
        }));
    }).catch(() => { });

    await context.sdkcall("ServiceCatalogAppRegistry", "listAttributeGroups", {
        // no params
    }, false).then(async (data) => {
        await Promise.all(data.attributeGroups.map(attributeGroup => {
            return context.sdkcall("ServiceCatalog", "getAttributeGroup", {
                attributeGroup: attributeGroup.id
            }, true).then((data) => {
                resources.push({
                    f2id: data.arn,
                    f2type: 'servicecatalog.appregistryattributegroup',
                    f2data: data,
                    f2region: context.region,
                    name: data.name,
                    description: data.description
                });
            });
        }));
    }).catch(() => { });

    return resources;
}

function mapResources(reqParams, obj, tracked_resources) {
    if (obj.type == "servicecatalog.cloudformationproduct") {
        reqParams.cfn['Name'] = obj.data.ProductViewDetail.ProductViewSummary.Name;
        reqParams.cfn['Owner'] = obj.data.ProductViewDetail.ProductViewSummary.Owner;
        reqParams.cfn['SupportDescription'] = obj.data.ProductViewDetail.ProductViewSummary.SupportDescription;
        reqParams.cfn['Description'] = obj.data.ProductViewDetail.ProductViewSummary.ShortDescription;
        reqParams.cfn['Distributor'] = obj.data.ProductViewDetail.ProductViewSummary.Distributor;
        reqParams.cfn['SupportEmail'] = obj.data.ProductViewDetail.ProductViewSummary.SupportEmail;
        reqParams.cfn['SupportUrl'] = obj.data.ProductViewDetail.ProductViewSummary.SupportUrl;
        reqParams.cfn['AcceptLanguage'] = 'en'; // TODO: Check for others
        reqParams.cfn['Tags'] = stripAWSTags(obj.data.Tags);

        /*
        TODO:
        ProvisioningArtifactParameters: 
            - ProvisioningArtifactProperties
        */

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('servicecatalog', obj.id, 'AWS::ServiceCatalog::CloudFormationProduct'),
            'region': obj.region,
            'service': 'servicecatalog',
            'type': 'AWS::ServiceCatalog::CloudFormationProduct',
            'options': reqParams
        });
    } else if (obj.type == "servicecatalog.portfolio") {
        reqParams.cfn['ProviderName'] = obj.data.PortfolioDetail.ProviderName;
        reqParams.cfn['Description'] = obj.data.PortfolioDetail.Description;
        reqParams.cfn['DisplayName'] = obj.data.PortfolioDetail.DisplayName;
        reqParams.cfn['ProviderName'] = obj.data.PortfolioDetail.ProviderName;
        reqParams.cfn['Tags'] = stripAWSTags(obj.data.Tags);

        /*
        TODO:
        AcceptLanguage: String
        */

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('servicecatalog', obj.id, 'AWS::ServiceCatalog::Portfolio'),
            'region': obj.region,
            'service': 'servicecatalog',
            'type': 'AWS::ServiceCatalog::Portfolio',
            'options': reqParams
        });
    } else if (obj.type == "servicecatalog.portfolioprincipalassociation") {
        reqParams.cfn['PrincipalARN'] = obj.data.principal.PrincipalARN;
        reqParams.cfn['PrincipalType'] = obj.data.principal.PrincipalType;
        reqParams.cfn['PortfolioId'] = obj.data.portfolio.Id;

        /*
        TODO:
        AcceptLanguage: String
        */

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('servicecatalog', obj.id, 'AWS::ServiceCatalog::PortfolioPrincipalAssociation'),
            'region': obj.region,
            'service': 'servicecatalog',
            'type': 'AWS::ServiceCatalog::PortfolioPrincipalAssociation',
            'options': reqParams
        });
    } else if (obj.type == "servicecatalog.launchnotificationconstraint") {
        reqParams.cfn['Description'] = obj.data.ConstraintDetail.Description;
        reqParams.cfn['PortfolioId'] = obj.data.PortfolioId;
        reqParams.cfn['ProductId'] = obj.data.ProductId;

        /*
        TODO:
        NotificationArns: 
            - String
        AcceptLanguage: String
        */

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('servicecatalog', obj.id, 'AWS::ServiceCatalog::LaunchNotificationConstraint'),
            'region': obj.region,
            'service': 'servicecatalog',
            'type': 'AWS::ServiceCatalog::LaunchNotificationConstraint',
            'options': reqParams
        });
    } else if (obj.type == "servicecatalog.launchroleconstraint") {
        reqParams.cfn['Description'] = obj.data.ConstraintDetail.Description;
        reqParams.cfn['PortfolioId'] = obj.data.PortfolioId;
        reqParams.cfn['ProductId'] = obj.data.ProductId;
        reqParams.cfn['LocalRoleName'] = "REPLACEME";

        /*
        TODO:
        AcceptLanguage: String
        RoleArn: String
        LocalRoleName: String
        */

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('servicecatalog', obj.id, 'AWS::ServiceCatalog::LaunchRoleConstraint'),
            'region': obj.region,
            'service': 'servicecatalog',
            'type': 'AWS::ServiceCatalog::LaunchRoleConstraint',
            'options': reqParams
        });
    } else if (obj.type == "servicecatalog.launchtemplateconstraint") {
        reqParams.cfn['Description'] = obj.data.ConstraintDetail.Description;
        reqParams.cfn['PortfolioId'] = obj.data.PortfolioId;
        reqParams.cfn['ProductId'] = obj.data.ProductId;

        /*
        TODO:
        AcceptLanguage: String
        Rules: String
        */

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('servicecatalog', obj.id, 'AWS::ServiceCatalog::LaunchTemplateConstraint'),
            'region': obj.region,
            'service': 'servicecatalog',
            'type': 'AWS::ServiceCatalog::LaunchTemplateConstraint',
            'options': reqParams
        });
    } else if (obj.type == "servicecatalog.stacksetconstraint") {
        reqParams.cfn['Description'] = obj.data.ConstraintDetail.Description;
        reqParams.cfn['PortfolioId'] = obj.data.PortfolioId;
        reqParams.cfn['ProductId'] = obj.data.ProductId;

        /*
        TODO:
        AcceptLanguage: String
        AccountList: 
            - String
        AdminRole: String
        ExecutionRole: String
        RegionList: 
            - String
        StackInstanceControl: String
        */

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('servicecatalog', obj.id, 'AWS::ServiceCatalog::StackSetConstraint'),
            'region': obj.region,
            'service': 'servicecatalog',
            'type': 'AWS::ServiceCatalog::StackSetConstraint',
            'options': reqParams
        });
    } else if (obj.type == "servicecatalog.acceptedportfolioshare") {
        reqParams.cfn['PortfolioId'] = obj.data.Id;

        /*
        TODO:
        AcceptLanguage: String
        */

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('servicecatalog', obj.id, 'AWS::ServiceCatalog::AcceptedPortfolioShare'),
            'region': obj.region,
            'service': 'servicecatalog',
            'type': 'AWS::ServiceCatalog::AcceptedPortfolioShare',
            'options': reqParams
        });
    } else if (obj.type == "servicecatalog.portfolioproductassociation") {
        reqParams.cfn['PortfolioId'] = obj.data.portfolio.Id;
        reqParams.cfn['ProductId'] = obj.data.product.Id;
        reqParams.cfn[''] = obj.data;

        /*
        TODO:
        SourcePortfolioId: String
        AcceptLanguage: String
        */

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('servicecatalog', obj.id, 'AWS::ServiceCatalog::PortfolioProductAssociation'),
            'region': obj.region,
            'service': 'servicecatalog',
            'type': 'AWS::ServiceCatalog::PortfolioProductAssociation',
            'options': reqParams
        });
    } else if (obj.type == "servicecatalog.cloudformationprovisionedproduct") {
        reqParams.cfn['ProvisionedProductName'] = obj.data.ProvisionedProductDetail.Name;
        reqParams.cfn['ProductId'] = obj.data.ProvisionedProductDetail.ProductId;
        reqParams.cfn['ProvisioningArtifactId'] = obj.data.ProvisionedProductDetail.ProvisioningArtifactId;
        reqParams.cfn['ProductName'] = obj.data.Product.Name;

        /*
        TODO:
        PathId: String
        ProvisioningParameters: 
            - ProvisioningParameter
        ProvisioningArtifactName: String
        NotificationArns: 
            - String
        AcceptLanguage: String
        Tags: 
            - Tag
        */

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('servicecatalog', obj.id, 'AWS::ServiceCatalog::CloudFormationProvisionedProduct'),
            'region': obj.region,
            'service': 'servicecatalog',
            'type': 'AWS::ServiceCatalog::CloudFormationProvisionedProduct',
            'options': reqParams
        });
    } else if (obj.type == "servicecatalog.tagoption") {
        reqParams.cfn['Key'] = obj.data.Key;
        reqParams.cfn['Value'] = obj.data.Value;
        reqParams.cfn['Active'] = obj.data.Active;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('servicecatalog', obj.id, 'AWS::ServiceCatalog::TagOption'),
            'region': obj.region,
            'service': 'servicecatalog',
            'type': 'AWS::ServiceCatalog::TagOption',
            'options': reqParams
        });
    } else if (obj.type == "servicecatalog.tagoptionassociation") {
        reqParams.cfn['TagOptionId'] = obj.data.tagoption.Id;
        reqParams.cfn['ResourceId'] = obj.data.resource.Id;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('servicecatalog', obj.id, 'AWS::ServiceCatalog::TagOptionAssociation'),
            'region': obj.region,
            'service': 'servicecatalog',
            'type': 'AWS::ServiceCatalog::TagOptionAssociation',
            'options': reqParams
        });
    } else if (obj.type == "servicecatalog.appregistryapplication") {
        reqParams.cfn['Name'] = obj.data.name;
        reqParams.cfn['Description'] = obj.data.description;
        reqParams.cfn['Tags'] = stripAWSTags(obj.data.tags);

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('servicecatalog', obj.id, 'AWS::ServiceCatalogAppRegistry::Application'),
            'region': obj.region,
            'service': 'servicecatalog',
            'type': 'AWS::ServiceCatalogAppRegistry::Application',
            'options': reqParams,
            'returnValues': {
                'GetAtt': {
                    'Id': obj.data.id,
                    'Arn': obj.data.arn
                },
                'Import': {
                    'Id': obj.data.id
                }
            }
        });
    } else if (obj.type == "servicecatalog.appregistryattributegroup") {
        reqParams.cfn['Name'] = obj.data.name;
        reqParams.cfn['Description'] = obj.data.description;
        reqParams.cfn['Attributes'] = obj.data.attributes;
        reqParams.cfn['Tags'] = stripAWSTags(obj.data.tags);

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('servicecatalog', obj.id, 'AWS::ServiceCatalogAppRegistry::AttributeGroup'),
            'region': obj.region,
            'service': 'servicecatalog',
            'type': 'AWS::ServiceCatalogAppRegistry::AttributeGroup',
            'options': reqParams,
            'returnValues': {
                'GetAtt': {
                    'Id': obj.data.id,
                    'Arn': obj.data.arn
                },
                'Import': {
                    'Id': obj.data.id
                }
            }
        });
    } else if (obj.type == "servicecatalog.appregistryattributegroupassociation") {
        reqParams.cfn['AttributeGroup'] = obj.data.AttributeGroup;
        reqParams.cfn['Application'] = obj.data.Application;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('servicecatalog', obj.id, 'AWS::ServiceCatalogAppRegistry::AttributeGroupAssociation'),
            'region': obj.region,
            'service': 'servicecatalog',
            'type': 'AWS::ServiceCatalogAppRegistry::AttributeGroupAssociation',
            'options': reqParams
        });
    } else if (obj.type == "servicecatalog.appregistryresourceassociation") {
        reqParams.cfn['Resource'] = obj.data.Resource;
        reqParams.cfn['ResourceType'] = obj.data.ResourceType;
        reqParams.cfn['Application'] = obj.data.Application;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('servicecatalog', obj.id, 'AWS::ServiceCatalogAppRegistry::ResourceAssociation'),
            'region': obj.region,
            'service': 'servicecatalog',
            'type': 'AWS::ServiceCatalogAppRegistry::ResourceAssociation',
            'options': reqParams
        });
    } else if (obj.type == "servicecatalog.serviceaction") {
        reqParams.cfn['Name'] = obj.data.ServiceActionSummary.Name;
        reqParams.cfn['Description'] = obj.data.ServiceActionSummary.Description;
        reqParams.cfn['DefinitionType'] = obj.data.ServiceActionSummary.DefinitionType;
        if (obj.data.Definition) {
            reqParams.cfn['Definition'] = [];
            Object.keys(obj.data.Definition).forEach(defkey => {
                reqParams.cfn['Definition'].push({
                    'Key': defkey,
                    'Value': obj.data.Definition[defkey]
                });
            });
        }

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('servicecatalog', obj.id, 'AWS::ServiceCatalog::ServiceAction'),
            'region': obj.region,
            'service': 'servicecatalog',
            'type': 'AWS::ServiceCatalog::ServiceAction',
            'options': reqParams,
            'returnValues': {
                'GetAtt': {
                    'Id': obj.data.ServiceActionSummary.Id
                },
                'Import': {
                    'Id': obj.data.ServiceActionSummary.Id
                }
            }
        });
    } else if (obj.type == "servicecatalog.serviceactionassociation") {
        reqParams.cfn['ServiceActionId'] = obj.data.ServiceActionId;
        reqParams.cfn['ProvisioningArtifactId'] = obj.data.ProvisioningArtifactId;
        reqParams.cfn['ProductId'] = obj.data.ProductId;

        tracked_resources.push({
            'obj': obj,
            'logicalId': getResourceName('servicecatalog', obj.id, 'AWS::ServiceCatalog::ServiceActionAssociation'),
            'region': obj.region,
            'service': 'servicecatalog',
            'type': 'AWS::ServiceCatalog::ServiceActionAssociation',
            'options': reqParams,
            'returnValues': {
                'Import': {
                    'ProductId': obj.data.ProductId,
                    'ProvisioningArtifactId': obj.data.ProvisioningArtifactId,
                    'ServiceActionId': obj.data.ServiceActionId
                }
            }
        });
    } else {
        return false;
    }

    return true;
}

module.exports = { section, updateDatatable, mapResources };
