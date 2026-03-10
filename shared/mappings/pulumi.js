var { processPulumiParameter, tfToPulumiProp } = require('./helpers');

function outputMapPulumi(index, service, type, options, region, was_blocked, logicalId, tracked_resources, state) {
    var output = '';
    var params = '';

    // tf -> pulumi
    logicalId = logicalId.toLowerCase();
    var pulumiConversionTable = {
        'aws_api_gateway_': 'aws_apigateway_',
        'aws_cloudhsm_v2_': 'aws_cloudhsmv2_',
        'aws_launch_configuration': 'aws_ec2_launch_configuration',
        'aws_service_discovery_': 'aws_servicediscovery_',
        'aws_dx_': 'aws_directconnect_',
        'aws_directory_service_': 'aws_directoryservice_',
        'aws_instance': 'aws_ec2_instance',
        'aws_placement_group': 'aws_ec2_placement_group',
        'aws_volume_attachment': 'aws_ec2_volume_attachment',
        'aws_security_group': 'aws_ec2_security_group',
        'aws_elb': 'aws_elb_loadbalancer',
        'aws_launch_template': 'aws_ec2_launch_template',
        'aws_lb': 'aws_lb_loadbalancer',
        'aws_key_pair': 'aws_ec2_key_pair',
        'aws_elastic_beanstalk_': 'aws_elasticbeanstalk_',
        'aws_media_package_': 'aws_mediapackage_',
        'aws_media_store_': 'aws_mediastore_',
        'aws_db_': 'aws_rds_',
        'aws_ec2_transit_gateway_': 'aws_ec2transitgateway_',
        'aws_ec2_transit_gateway': 'aws_ec2transitgateway_transit_gateway',
        'aws_vpc_': 'aws_ec2_vpc_',
        'aws_vpc': 'aws_ec2_vpc',
        'aws_egress_only_internet_gateway': 'aws_ec2_egress_only_internet_gateway',
        'aws_internet_gateway': 'aws_ec2_internet_gateway',
        'aws_vpn_': 'aws_ec2_vpn_',
        'aws_route_table_': 'aws_ec2_route_table_',
        'aws_route_table': 'aws_ec2_route_table',
        'aws_network_': 'aws_ec2_network_',
        'aws_customer_gateway': 'aws_ec2_customer_gateway',
        'aws_subnet': 'aws_ec2_subnet',
        'aws_eip_': 'aws_ec2_eip_',
        'aws_eip': 'aws_ec2_eip',
        'aws_route': 'aws_ec2_route',
        'aws_nat_gateway': 'aws_ec2_nat_gateway',
        'aws_flow_log': 'aws_ec2_flow_log'
    };
    for (var k in pulumiConversionTable) {
        if (type == k) {
            type = pulumiConversionTable[k];
        } else if (k.endsWith("_") && type.startsWith(k)) {
            type = type.replace(k, pulumiConversionTable[k]);
        }
    }
    var typesplit = type.split("_");
    type = typesplit.shift() + "." + typesplit.shift() + "." + typesplit.map(x => x[0].toUpperCase() + x.substr(1)).join('');

    if (Object.keys(options).length) {
        for (option in options) {
            if (typeof options[option] !== "undefined" && options[option] !== null) {
                if (Array.isArray(options[option]) && typeof options[option][0] === 'object') {
                    for (var i = 0; i < options[option].length; i++) {
                        var optionvalue = processPulumiParameter(options[option][i], 4, index, tracked_resources, state);
                        if (typeof optionvalue !== "undefined") {
                            if (optionvalue[0] == '{') {
                                params += `
    ${tfToPulumiProp(option)}: ${optionvalue},`;
                            } else {
                                if (option.match(/^[0-9]+$/g)) {
                                    option = "\"" + option + "\"";
                                }
                                params += `
    ${tfToPulumiProp(option)}: ${optionvalue},`;
                            }
                        }

                    }
                } else {
                    var optionvalue = processPulumiParameter(options[option], 4, index, tracked_resources, state);
                    if (typeof optionvalue !== "undefined") {
                        if (optionvalue[0] == '{') {
                            params += `
    ${tfToPulumiProp(option)}: ${optionvalue},`;
                        } else {
                            if (option.match(/^[0-9]+$/g)) {
                                option = "\"" + option + "\"";
                            }
                            params += `
    ${tfToPulumiProp(option)}: ${optionvalue},`;
                        }
                    }
                }
            }
        }
        params = params.substring(0, params.length - 1) + `
`; // remove last comma
    }

    output += `
const ${logicalId} = new ${type}("${logicalId}", {${params}});
`;

    return output;
}

module.exports = { outputMapPulumi };
