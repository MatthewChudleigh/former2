// shared/formatters.js
//
// Formatter functions extracted from js/datatables.js.
// These are referenced in service file column definitions (e.g. formatter: primaryFieldFormatter).
//
// Browser-only formatters (primaryTextFormatter, detailFormatter, recursivePrettyPrintMap)
// are NOT included here — they depend on browser globals (output_objects, DOM).

function textFormatter(data) {
    return data;
}

function primaryFieldFormatter(data, row) {
    if (row.f2link) {
        return "<a href=\"" + row.f2link + "\" target=\"_blank\">" + data + "</a>";
    }

    return data;
}

function dateFormatter(data) {
    if (data) {
        if (typeof data == "string") {
            parseddate = Date.parse(data);
            if (isNaN(parseddate)) {
                return data;
            }
            data = new Date(parseddate);
        }
        if (!data instanceof Date) {
            return data;
        }

        var seconds = Math.floor((new Date() - data) / 1000);
        var interval = Math.floor(seconds / 31536000);

        if (interval > 1) {
            return interval + " years ago";
        }
        interval = Math.floor(seconds / 2592000);
        if (interval > 1) {
            return interval + " months ago";
        }
        interval = Math.floor(seconds / 86400);
        if (interval > 1) {
            return interval + " days ago";
        }
        interval = Math.floor(seconds / 3600);
        if (interval > 1) {
            return interval + " hours ago";
        }
        interval = Math.floor(seconds / 60);
        if (interval > 1) {
            return interval + " minutes ago";
        }
        if (seconds > 0) {
            return Math.floor(seconds) + " seconds ago";
        }
        return "In the future";
    }

    return data;
}

function tickFormatter(data) {
    if (data) {
        return '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>';
    }

    return "";
}

function byteSizeFormatter(data) {
    var bytes = parseInt(data);

    if (bytes < 1024) {
        return bytes + " bytes";
    } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + " kB";
    } else if (bytes < 1024 * 1024 * 1024) {
        return (bytes / 1024 / 1024).toFixed(1) + " MB";
    }

    return data;
}

function timeAgoFormatter(data) {
    const NOW = new Date();
    const times = [["second", 1], ["minute", 60], ["hour", 3600], ["day", 86400], ["week", 604800], ["month", 2592000], ["year", 31536000], ["", Infinity]];

    var date = Date.parse(data);

    var diff = Math.round((NOW - date) / 1000);
    for (var t = 0; t < times.length; t++) {
        if (diff < times[t][1]) {
            if (t == 0) {
                return "Just now";
            } else {
                diff = Math.round(diff / times[t - 1][1]);
                return diff + " " + times[t - 1][0] + (diff == 1 ? " ago" : "s ago");
            }
        }
    }
}

function lambdaRuntimeFormatter(data) {
    var runtimeMappings = {
        'nodejs14.x': 'Node.js 14',
        'nodejs12.x': 'Node.js 12',
        'nodejs10.x': 'Node.js 10',
        'nodejs8.10': 'Node.js 8.10',
        'nodejs6.10': 'Node.js 6.10',
        'python3.6': 'Python 3.6',
        'python3.7': 'Python 3.7',
        'python3.8': 'Python 3.8',
        'python2.7': 'Python 2.7',
        'ruby2.5': 'Ruby 2.5',
        'java8': 'Java 8',
        'go1.x': 'Go 1.x',
        'dotnetcore2.1': '.NET Core 2.1',
        'dotnetcore2.0': '.NET Core 2.0',
        'dotnetcore1.0': '.NET Core 1.0',
        'provided': 'Custom Runtime'
    };

    if (runtimeMappings[data]) {
        return runtimeMappings[data];
    }

    return data;
}

module.exports = {
    textFormatter,
    primaryFieldFormatter,
    dateFormatter,
    tickFormatter,
    byteSizeFormatter,
    timeAgoFormatter,
    lambdaRuntimeFormatter,
};
