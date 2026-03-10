var { processCdktfParameter, tfToCdktfProp } = require('./helpers');

function outputMapCdktf(index, service, type, options, region, was_blocked, logicalId, tracked_resources, state) {
    var output = '';
    var params = '';
    var iaclangselect = state.iaclangselect;

    var typesplit = type.split("_");
    typesplit.shift(); // throw away "aws_"
    type = typesplit.map(x => x[0].toUpperCase() + x.substr(1)).join('');

    if (Object.keys(options).length) {
        for (option in options) {
            if (typeof options[option] !== "undefined" && options[option] !== null) {
                var initialSpacing = 12;
                var optionvalue = processCdktfParameter(options[option], initialSpacing, index, tracked_resources);

                if (typeof optionvalue !== "undefined") {
                    if (iaclangselect == "typescript") {
                        params += `
            ${tfToCdktfProp(option)}: ${optionvalue},`;
                    }
                }
            }
        }
    }

    cdktype = type;

    if (iaclangselect == "typescript") {
        params = "{" + params.substring(0, params.length - 1) + `
        }`; // remove last comma

        output += `        const ${logicalId.toLowerCase()} = new ${cdktype}(this, '${logicalId}', ${params});

`;
    }

    return output;
}

module.exports = { outputMapCdktf };
