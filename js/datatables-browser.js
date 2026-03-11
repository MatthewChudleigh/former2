// js/datatables-browser.js
//
// Browser-only formatter functions extracted from js/datatables.js.
// These depend on browser globals (output_objects, DOM) and cannot be bundled.
//
// The isomorphic formatters (textFormatter, primaryFieldFormatter, etc.)
// are now in the bundle via shared/formatters.js.

function primaryTextFormatter(data, row) {
    var exists = false;
    output_objects.forEach(output_object => { // check if already added
        if (output_object.id == row.f2id && output_object.region == row.f2region && output_object.type == row.f2type) {
            exists = true;
        }
    });

    if (exists) {
        return data + "&nbsp;&nbsp;<button type=\"button\" class=\"btn btn-sm btn-default-outline\">Added <i class=\"fa fa-times\"></i></button>";
    }

    return data;
}

function detailFormatter(row, data) {
    var ret = recursivePrettyPrintMap(data['f2data'], 0)

    if (ret && ret.length > 6) {
        ret = ret.substring(6);
    }

    return `<div class="f2detailformatter">${ret}</div>`;
}

function recursivePrettyPrintMap(param, spacing) {
    var paramitems = [];

    if (param === undefined || param === null || (Array.isArray(param) && param.length == 0))
        return undefined;
    if (typeof param == "boolean") {
        if (param)
            return 'true';
        return 'false';
    }
    if (typeof param == "number") {
        return param;
    }
    if (typeof param == "string") {
        if (param.startsWith("!Ref ") || param.startsWith("!GetAtt ")) {
            return undefined;
        }

        return param.replace(/\</g, "&lt;"); // TODO: Better sanitization here
    }
    if (Array.isArray(param)) {
        if (param.length == 0) {
            return '[]';
        }

        param.forEach(paramitem => {
            paramitems.push(recursivePrettyPrintMap(paramitem, spacing + 4));
        });

        return `<br />
` + '&nbsp;'.repeat(spacing + 4) + "<b>-</b> " + paramitems.join(`<br />
` + '&nbsp;'.repeat(spacing + 4) + "<b>-</b> ");
    }
    if (typeof param == "object") {
        if (Object.keys(param).length === 0 && param.constructor === Object) {
            return "&lt;empty object&gt;";
        }

        Object.keys(param).forEach(function (key) {
            var subvalue = recursivePrettyPrintMap(param[key], spacing + 4);

            if (subvalue !== undefined) {
                paramitems.push(`<b>${key}:</b> ${subvalue}`);
            }
        });

        return `<br />
` + '&nbsp;'.repeat(spacing + 4) + paramitems.join(`<br />
` + '&nbsp;'.repeat(spacing + 4));
    }

    return undefined;
}
