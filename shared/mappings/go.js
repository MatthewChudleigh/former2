var { processGoParameter, ensureInitDeclaredGo, mapServiceJs } = require('./helpers');

function outputMapGo(service, method, options, region, was_blocked, state) {
    var output = ensureInitDeclaredGo(service, region, state);
    var params = '';
    var mappedservice = mapServiceJs(service).toLowerCase().replace(/\-/g, '');

    if (Object.keys(options).length) {
        for (option in options) {
            if (typeof options[option] !== "undefined" && options[option] !== null) {
                var optionvalue = processGoParameter(mappedservice, option, options[option], 8);
                if (typeof optionvalue !== "undefined") {
                    params += `
        ${option}: ${optionvalue},`;
                }
            }
        }
        params += `
    `;
    }

    output += `    _, err ${state.go_first_output ? ':' : ''}= ${service}svc.${method}(&${mappedservice}.${method}Input{${params}})${was_blocked ? ' // blocked' : ''}
`

    state.go_first_output = false;

    return output;
}

module.exports = { outputMapGo };
