var { processBoto3Parameter, ensureInitDeclaredBoto3 } = require('./helpers');

function outputMapBoto3(service, method, options, region, was_blocked, state) {
    var output = ensureInitDeclaredBoto3(service, region, state);
    var params = '';

    if (Object.keys(options).length) {
        for (option in options) {
            if (typeof options[option] !== "undefined" && options[option] !== null) {
                var optionvalue = processBoto3Parameter(options[option], 4);
                if (typeof optionvalue !== "undefined") {
                    params += `
    ${option}=${optionvalue},`;
                }
            }
        }
        params = params.substring(0, params.length - 1) + `
`; // remove last comma
    }

    output += `response = ${service}_client.${method}(${params})${was_blocked ? ' # blocked' : ''}
`

    return output;
}

module.exports = { outputMapBoto3 };
