var appId = "WS_Analytics_Simulator";
var apiVersion = "1.0";
var constants = {
    sesToken: null,
    restURL: null,
    _extensionProvider: null,
    _globalContext: null,
    _wsRecord: null,
    recordID: null,
    recordType: null,
    wsConfigProperties: null
};
var url, chartData = null;
var wsProperties = [
    "height",
    "width",
    "reportID",
    "filterName",
    "filterValue",
    "recordLayout",
    "font",
    "column_header_font_size",
    "data_font_size",
    "column_header_font_color",
    "data_font_color",
    "column_header_background_color",
    "data_background_color",
    "open_object_type",
    "open_object_id",
    "open_object_link",
    "order_of_columns",
    "NoInfoFound",
    "borderless_record_layout",
    "column_header_alignment",
    "data_alignment",
    "data_text_bold",
    "column_header_text_bold"
];

$(document).ready(function () {
    loadExtension();
});

function loadExtension() {
    ORACLE_SERVICE_CLOUD.extension_loader.load(appId, apiVersion).then(function (extensionProvider) {
        constants._extensionProvider = extensionProvider;
        extensionProvider.getGlobalContext().then(function (globalContext) {
            constants._globalContext = globalContext;
            globalContext.getContainerContext().then(function (containerContext) {
                containerContext.getProperties(wsProperties).then(function (wsPropertiesCollection) {
                    constants.wsConfigProperties = setConstants(wsPropertiesCollection);
                    if (constants && (constants.wsConfigProperties.reportID == 0 || !constants.wsConfigProperties.reportID)) {
                        handleError();
                        return;
                    }
                    //setDivSize(constants.wsConfigProperties.width, constants.wsConfigProperties.height);
                    globalContext.getSessionToken().then(function (sessionToken) {
                        constants.restURL = globalContext.getInterfaceServiceUrl("REST") + "/connect/latest/";
                        constants.sesToken = sessionToken;
                        console.log(constants.restURL);
                        console.log(constants.sesToken);
                        extensionProvider.registerWorkspaceExtension(function (workspaceRecord) {
                            constants._wsRecord = workspaceRecord;
                            constants.recordID = workspaceRecord.getWorkspaceRecordId();
                            constants.recordType = workspaceRecord.getWorkspaceRecordType();
                            if (constants.wsConfigProperties.filterValue) {
                                workspaceRecord.addFieldValueListener(constants.wsConfigProperties.filterValue, processReport);
                            }
                            workspaceRecord.addExtensionLoadedListener(processReport);
                            workspaceRecord.addRecordSavedListener(processReport);
                        });
                    });
                });
            });
        });
    });
}

function processReport() {
    showLoadingIcon();
    $('#main').empty();
    getFieldValue().then(function (value) {
        var payload = setReportPayload(value);
        if (!payload) {
            handleError();
            return;
        }
        url = constants.restURL + "analyticsReportResults";
        getReportData(payload, url).then(function (result) {
            if (result && result.count > 0) {
                console.log(result);
                var data = processReportData(result);
                if (constants.wsConfigProperties.recordLayout) {
                    setRecordLayout(data);
                } else {
                    setTabularLayout(data);
                }
                return;
            }
            else {
                handleError();
                return;
            }
        }).catch(function (Err) {
            console.log(Err);
            handleError();
            return;
        });
    });
}

function getFieldValue() {
    return new Promise(function (resolve, reject) {
        if (constants.wsConfigProperties.filterValue) {
            var fName = constants.wsConfigProperties.filterValue;
            constants._wsRecord.getFieldValues([fName]).then(function (IFieldDetails) {
                console.log(IFieldDetails.getField(fName).getValue());
                var fValue = IFieldDetails.getField(fName).getValue();
                resolve(fValue);
            }).catch(function (Err) {
                console.log(Err);
                reject(Err);
            });
        } else {
            resolve(null);
        }

    });
}

function processReportData(result) {
    let headings = result.columnNames;
    let rows = result.rows;
    var data = [];
    for (var j = 0; j < rows.length; j++) {
        var rowData = {};
        for (var i = 0; i < headings.length; i++) {
            rowData[headings[i]] = rows[j][i] != null ? rows[j][i] : "";
        }
        data.push(rowData);
    }
    return [headings, data];
}

function setRecordLayout(data) {
    var openLink = false;
    if (constants.wsConfigProperties.open_object_type && constants.wsConfigProperties.open_object_id && constants.wsConfigProperties.open_object_link) {
        openLink = true;
    }
    var border = constants.wsConfigProperties.borderless_record_layout ? "" : " style='border:1px solid #e0e1e1'";
    var container = $('#main'), table = $('<table id="recordLayout" class="recordLayout"' + border + '>');
    container.empty();
    if (constants.wsConfigProperties.font) {
        document.getElementById("main").style.fontFamily = constants.wsConfigProperties.font;
    }
    data = data[1][0];
    var columnHeaderCSS = (constants.wsConfigProperties.column_header_font_color ? "color: " + constants.wsConfigProperties.column_header_font_color + ";" : "") +
        (constants.wsConfigProperties.column_header_background_color ? "background-color: " + constants.wsConfigProperties.column_header_background_color + ";" : "") +
        (constants.wsConfigProperties.column_header_font_size ? "font-size: " + constants.wsConfigProperties.column_header_font_size + ";" : "") +
        (constants.wsConfigProperties.column_header_alignment ? "text-align: " + constants.wsConfigProperties.column_header_alignment + ";" : "") +
        (constants.wsConfigProperties.column_header_text_bold ? "font-weight: bold;" : "font-weight: normal;");
    var columnDataCSS = (constants.wsConfigProperties.data_font_color ? "color: " + constants.wsConfigProperties.data_font_color + ";" : "") +
        (constants.wsConfigProperties.data_background_color ? "background-color: " + constants.wsConfigProperties.data_background_color + ";" : "") +
        (constants.wsConfigProperties.data_font_size ? "font-size: " + constants.wsConfigProperties.data_font_size + ";" : "") +
        (constants.wsConfigProperties.data_alignment ? "text-align: " + constants.wsConfigProperties.data_alignment + ";" : "") +
        (constants.wsConfigProperties.data_text_bold ? "font-weight: bold;" : "font-weight: normal;");
    if (Object.keys(data).length > 0) {
        console.log("Data before checking for order:", data);
        if (constants.wsConfigProperties.order_of_columns) {
            console.log("Order must be changed to ", constants.wsConfigProperties.order_of_columns);
            var temp = {};
            var order = constants.wsConfigProperties.order_of_columns.split(",");
            for (var i = 0; i < order.length; i++) {
                order[i] = order[i].trim();
                if (data.hasOwnProperty(order[i])) {
                    temp[order[i]] = data[order[i]];
                }
            }
            for (var key in data) {
                if (!temp.hasOwnProperty(key)) {
                    temp[key] = data[key];
                }
            }
            data = temp;
        }
        console.log("Data after checking for order:", data);
        for (var key in data) {
            if (!(key.trim().toLowerCase().startsWith("hidden"))) {
                var tr = $('<tr>');
                tr.append("<td style='" + columnHeaderCSS + "'>" + key + ":</td>");
                if (openLink && constants.wsConfigProperties.open_object_link == key && data.hasOwnProperty(constants.wsConfigProperties.open_object_id) && data[constants.wsConfigProperties.open_object_id]) {
                    tr.append("<td style='" + columnDataCSS + "'><a href='javascript:void(0);' onclick='javascript:openWS(\"" + data[constants.wsConfigProperties.open_object_id] + "\", \"" + constants.wsConfigProperties.open_object_type + "\");'>" + data[key] + "</a></td>");
                } else {
                    tr.append("<td style='" + columnDataCSS + "'>" + data[key] + "</td>");
                }
                table.append(tr);
            }
        }
        container.append(table);
        var size = getDivSize("recordLayout");
        resizeExt(size[0], size[1]);
        setDivSize(constants.wsConfigProperties.width, constants.wsConfigProperties.height);
        hideLoadingIcon();
    }
    else {
        handleError();
        resizeExt(100, 100);
    }
}

function setTabularLayout(data) {
    var openLink = false;
    if (constants.wsConfigProperties.open_object_type && constants.wsConfigProperties.open_object_id && constants.wsConfigProperties.open_object_link) {
        openLink = true;
    }
    var container = $('#main'), table = $('<table id="tableLayout" class="tableLayout">');
    container.empty();
    if (constants.wsConfigProperties.font) {
        document.getElementById("main").style.fontFamily = constants.wsConfigProperties.font;
    }
    var columnHeaderCSS = (constants.wsConfigProperties.column_header_font_color ? "color: " + constants.wsConfigProperties.column_header_font_color + ";" : "") +
        (constants.wsConfigProperties.column_header_background_color ? "background-color: " + constants.wsConfigProperties.column_header_background_color + ";" : "") +
        (constants.wsConfigProperties.column_header_font_size ? "font-size: " + constants.wsConfigProperties.column_header_font_size + ";" : "") +
        (constants.wsConfigProperties.column_header_alignment ? "text-align: " + constants.wsConfigProperties.column_header_alignment + ";" : "") +
        (constants.wsConfigProperties.column_header_text_bold ? "font-weight: bold;" : "font-weight: normal;");
    var columnDataCSS = (constants.wsConfigProperties.data_font_color ? "color: " + constants.wsConfigProperties.data_font_color + ";" : "") +
        (constants.wsConfigProperties.data_background_color ? "background-color: " + constants.wsConfigProperties.data_background_color + ";" : "") +
        (constants.wsConfigProperties.data_font_size ? "font-size: " + constants.wsConfigProperties.data_font_size + ";" : "") +
        (constants.wsConfigProperties.data_alignment ? "text-align: " + constants.wsConfigProperties.data_alignment + ";" : "") +
        (constants.wsConfigProperties.data_text_bold ? "font-weight: bold;" : "font-weight: normal;");
    var thead = $('<thead>');
    var tbody = $('<tbody>');
    var headerRow = $('<tr>');
    var headings = data[0];
    console.log("Headings before checking for order:", headings);
    if (constants.wsConfigProperties.order_of_columns) {
        var order = constants.wsConfigProperties.order_of_columns.split(",");
        console.log("Order to follow:", order);
        var temp = [];
        for (var i = 0; i < order.length; i++) {
            order[i] = order[i].trim();
            temp.push(order[i]);
        }
        headings.forEach((header) => {
            if (!inArray(header, temp)) {
                temp.push(header);
            }
        });
        headings = temp;
    }
    console.log("Headings after checking for order:", headings);
    headings.forEach((header) => {
        if (!(header.trim().toLowerCase().startsWith("hidden"))) {
            headerRow.append("<th style='" + columnHeaderCSS + "'>" + header + "</th>");
        }
    });
    thead.append(headerRow);
    var rows = data[1];
    rows.forEach((row) => {
        var tr = $('<tr>');
        console.log("Row before checking for order:", row);
        if (constants.wsConfigProperties.order_of_columns) {
            console.log("Order must be changed to ", constants.wsConfigProperties.order_of_columns);
            var temp = {};
            var order = constants.wsConfigProperties.order_of_columns.split(",");
            for (var i = 0; i < order.length; i++) {
                order[i] = order[i].trim();
                if (row.hasOwnProperty(order[i])) {
                    temp[order[i]] = row[order[i]];
                }
            }
            for (var key in row) {
                if (!temp.hasOwnProperty(key)) {
                    temp[key] = row[key];
                }
            }
            row = temp;
        }
        console.log("Row after checking for order:", row);
        for (var key in row) {
            if (!(key.trim().toLowerCase().startsWith("hidden"))) {
                if (openLink && constants.wsConfigProperties.open_object_link == key && row.hasOwnProperty(constants.wsConfigProperties.open_object_id) && row[constants.wsConfigProperties.open_object_id]) {
                    tr.append("<td style='" + columnDataCSS + "'><a href='javascript:void(0);' onclick='javascript:openWS(\"" + row[constants.wsConfigProperties.open_object_id] + "\", \"" + constants.wsConfigProperties.open_object_type + "\");'>" + row[key] + "</a></td>");
                } else {
                    tr.append("<td style='" + columnDataCSS + "'>" + row[key] + "</td>");
                }
            }
        }
        tbody.append(tr);
    });
    table.append(thead).append(tbody);
    container.append(table);
    var size = getDivSize("tableLayout");
    resizeExt(size[0], size[1]);
    setDivSize(constants.wsConfigProperties.width, constants.wsConfigProperties.height);
    hideLoadingIcon();
}

function openWS(id, obj) {
    if (id && obj) {
        ORACLE_SERVICE_CLOUD.extension_loader.load('openWS', '1.0').then(function (extensionProvider) {
            extensionProvider.registerWorkspaceExtension(function (workspaceRecord) {
                workspaceRecord.editWorkspaceRecord(obj, id);
            });
        });
    }
}

function getDivSize(id) {
    var mainDiv = document.getElementById(id);
    return [mainDiv.clientWidth, mainDiv.clientHeight];
}

function resizeExt(w, h) {
    ORACLE_SERVICE_CLOUD.extensionResizeHandler.resize(w + 10, h + 10);
}

function setReportPayload(value) {
    var payload = null;
    payload = {
        id: parseInt(constants.wsConfigProperties.reportID)
    };
    if (value) {
        if (constants.wsConfigProperties.filterName && constants.wsConfigProperties.filterName != "") {
            payload["filters"] = [{
                name: constants.wsConfigProperties.filterName,
                values: [value.toString()]
            }];
        }
    }
    return payload;
}

function getReportData(payload, url) {
    return new Promise(function (resolve, reject) {
        performPOST(constants.sesToken, url, payload, []).then(function (resp) {
            console.log(resp);
            var result = JSON.parse(resp);
            resolve(result);
        }).catch(function (Err) {
            console.log(Err);
            reject(Err);
        });
    });
}

function setConstants(collection) {
    console.log("inside setConstants function");
    console.log(collection);
    var propertiesJSON = collection.extensionProperiesMap;
    var constants = {};
    for (var key in propertiesJSON) {
        constants[key] = propertiesJSON[key].getValue();
    }
    return constants;
}

function handleError() {
    hideLoadingIcon();
    document.getElementById('main').innerHTML = constants.wsConfigProperties.NoInfoFound;
    document.getElementById('main').style.color = "red";
    document.getElementById('main').style.textAlign = "center";
}

function setDivSize(width, height) {
    var mainDiv = document.getElementById('main');
    mainDiv.style.width = width;
    mainDiv.style.height = height;
}

function showLoadingIcon() {
    document.getElementById('loadingDiv').style = "text-align: center; font-size: 45px; color: grey";

}

function hideLoadingIcon() {
    document.getElementById('loadingDiv').style = "display:none";
}

function inArray(needle, haystack) {
    var length = haystack.length;
    for (var i = 0; i < length; i++) {
        if (isNaN(haystack[i])) {
            if (haystack[i].trim() == needle) return true;
        } else {
            if (haystack[i] == needle) return true;
        }
    }
    return false;
}