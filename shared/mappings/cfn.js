var { processCfnParameter } = require('./helpers');

function outputMapCfn(index, service, type, options, region, was_blocked, logicalId, cfn_deletion_policy, tracked_resources, state) {
    var output = '';
    var params = '';
    var cfnspacing = state.cfnspacing;

    if (Object.keys(options).length) {
        for (option in options) {
            if (options[option] !== undefined && options[option] !== null) {
                var optionvalue = processCfnParameter(options[option], (cfnspacing.length * 3), index, tracked_resources, state);

                if (!option.match(/^[a-zA-Z0-9-_]+$/g)) {
                    option = `"${option.replace(/"/g, "\\\"")}"`;
                }

                if (optionvalue !== undefined) {
                    params += `
${cfnspacing}${cfnspacing}${cfnspacing}${option}: ${optionvalue}`;
                }
            }
        }
        params += `
`;
    }

    if (params.trim() == "") {
        output += `${cfnspacing}${logicalId}:${was_blocked ? ' # blocked' : ''}${cfn_deletion_policy ? `
${cfnspacing}${cfnspacing}DeletionPolicy: "${cfn_deletion_policy}"` : ''}
${cfnspacing}${cfnspacing}Type: "${type}"

`;
    } else {
        output += `${cfnspacing}${logicalId}:${was_blocked ? ' # blocked' : ''}${cfn_deletion_policy ? `
${cfnspacing}${cfnspacing}DeletionPolicy: "${cfn_deletion_policy}"` : ''}
${cfnspacing}${cfnspacing}Type: "${type}"
${cfnspacing}${cfnspacing}Properties:${params}
`;
    }

    return output;
}

module.exports = { outputMapCfn };
