var { processCdkParameter, processCdkv2Parameter, lcfirststr, pythonAttr } = require('./helpers');

function outputMapCdk(index, service, type, options, region, was_blocked, logicalId, tracked_resources, state) {
    var output = '';
    var params = '';
    var iaclangselect = state.iaclangselect;

    if (Object.keys(options).length) {
        for (option in options) {
            if (typeof options[option] !== "undefined" && options[option] !== null) {
                var initialSpacing = 12;
                if (iaclangselect == "java" || iaclangselect == "dotnet") {
                    initialSpacing = 20;
                }
                var optionvalue = processCdkParameter(options[option], initialSpacing, index, tracked_resources);

                if (typeof optionvalue !== "undefined") {
                    if (iaclangselect == "python") {
                        params += `
            ${pythonAttr(option)}=${optionvalue},`;
                    } else if (iaclangselect == "java") {
                        params += `
                put("${option}", ${optionvalue});`;
                    } else if (iaclangselect == "dotnet") {
                        params += `
                ["${option}"] = ${optionvalue},`;
                    } else {
                        params += `
            ${lcfirststr(option)}: ${optionvalue},`;
                    }
                }
            }
        }
    }

    cdkservice = type.split("::")[1].toLowerCase();
    if (cdkservice == "lambda" && iaclangselect == "python") {
        cdkservice = "_lambda";
    }
    cdktype = type.split("::")[2];

    if (iaclangselect == "typescript") {
        params = "{" + params.substring(0, params.length - 1) + `
        }`; // remove last comma

        output += `        const ${logicalId} = new ${cdkservice}.Cfn${cdktype}(this, '${logicalId}', ${params});

`;
    } else if (iaclangselect == "python") {
        params = params.substring(0, params.length - 1); // remove last comma
        output += `        ${logicalId.toLowerCase()} = ${cdkservice}.Cfn${cdktype}(
            self,
            "${logicalId}",${params}
        )

`;
    } else if (iaclangselect == "java") {
        output += `        CfnResource ${lcfirststr(logicalId)} = CfnResource.Builder.create(this, "${logicalId}")
            .type("${type}")
            .properties(new HashMap<String, Object>() {{
                ${params}
            }})
            .build();

`;
    } else if (iaclangselect == "dotnet") {
        params = params.substring(0, params.length - 1); // remove last comma
        output += `            var ${logicalId.toLowerCase()} = new CfnResource(this, "${logicalId}", new CfnResourceProps
            {
                Type = "${type}",
                Properties = new Dictionary<string, object>
                {${params}
                }
            });

`;
    }

    return output;
}

function outputMapCdkv2(index, service, type, options, region, was_blocked, logicalId, tracked_resources, state) {
    var output = '';
    var params = '';
    var iaclangselect = state.iaclangselect;

    if (Object.keys(options).length) {
        for (option in options) {
            if (typeof options[option] !== "undefined" && options[option] !== null) {
                var initialSpacing = 12;
                if (iaclangselect == "java" || iaclangselect == "dotnet") {
                    initialSpacing = 20;
                }
                var optionvalue = processCdkv2Parameter(options[option], initialSpacing, index, tracked_resources);

                if (typeof optionvalue !== "undefined") {
                    if (iaclangselect == "python") {
                        params += `
            ${pythonAttr(option)}=${optionvalue},`;
                    } else if (iaclangselect == "java") {
                        params += `
                put("${option}", ${optionvalue});`;
                    } else if (iaclangselect == "dotnet") {
                        params += `
                ["${option}"] = ${optionvalue},`;
                    } else {
                        params += `
            ${lcfirststr(option)}: ${optionvalue},`;
                    }
                }
            }
        }
    }

    cdkservice = type.split("::")[1].toLowerCase();
    if (cdkservice == "lambda" && iaclangselect == "python") {
        cdkservice = "_lambda";
    }
    cdktype = type.split("::")[2];

    if (iaclangselect == "typescript") {
        params = "{" + params.substring(0, params.length - 1) + `
        }`; // remove last comma

        output += `        const ${logicalId} = new ${cdkservice}.Cfn${cdktype}(this, '${logicalId}', ${params});

`;
    } else if (iaclangselect == "python") {
        params = params.substring(0, params.length - 1); // remove last comma
        output += `        ${logicalId.toLowerCase()} = ${cdkservice}.Cfn${cdktype}(
            self,
            "${logicalId}",${params}
        )

`;
    } else if (iaclangselect == "java") {
        output += `        CfnResource ${lcfirststr(logicalId)} = CfnResource.Builder.create(this, "${logicalId}")
            .type("${type}")
            .properties(new HashMap<String, Object>() {{
                ${params}
            }})
            .build();

`;
    } else if (iaclangselect == "dotnet") {
        params = params.substring(0, params.length - 1); // remove last comma
        output += `            var ${logicalId.toLowerCase()} = new CfnResource(this, "${logicalId}", new CfnResourceProps
            {
                Type = "${type}",
                Properties = new Dictionary<string, object>
                {${params}
                }
            });

`;
    }

    return output;
}

module.exports = { outputMapCdk, outputMapCdkv2 };
