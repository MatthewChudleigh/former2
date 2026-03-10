var { processTfParameter } = require('./helpers');

function outputMapTf(index, service, type, options, region, was_blocked, logicalId, tracked_resources, state) {
    var output = '';
    var params = '';

    if (Object.keys(options).length) {
        for (option in options) {
            if (typeof options[option] !== "undefined" && options[option] !== null) {
                if (Array.isArray(options[option]) && typeof options[option][0] === 'object') {
                    for (var i = 0; i < options[option].length; i++) {
                        var optionvalue = processTfParameter(options[option][i], 4, option, index, tracked_resources);
                        if (typeof optionvalue !== "undefined") {
                            if (optionvalue[0] == '{') {
                                params += `
    ${option} ${optionvalue}`;
                            } else {
                                if (option.match(/^[0-9]+$/g)) {
                                    option = "\"" + option + "\"";
                                }
                                params += `
    ${option} = ${optionvalue}`;
                            }
                        }

                    }
                } else {
                    var optionvalue = processTfParameter(options[option], 4, option, index, tracked_resources);
                    if (typeof optionvalue !== "undefined") {
                        if (options[option].constructor === Set || options[option].constructor === Map) {
                            params += `
    ${option} = ${optionvalue}`;
                        } else if (optionvalue[0] == '{') {
                            params += `
    ${option} ${optionvalue}`;
                        } else {
                            if (option.match(/^[0-9]+$/g)) {
                                option = "\"" + option + "\"";
                            }
                            params += `
    ${option} = ${optionvalue}`;
                        }
                    }
                }
            }
        }
        params += `
`;
    }

    output += `
resource "${type}" "${logicalId}" {${params}}
`;

    return output;
}

module.exports = { outputMapTf };
