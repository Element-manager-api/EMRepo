function performGET(sessionToken, url, queryParams = []) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        for (var i = 0; i < queryParams.length; i++) {
            if (i == 0) {
                url += "?" + queryParams[i].key + "=" + encodeURI(queryParams[i].value);
            } else {
                url += "&" + queryParams[i].key + "=" + encodeURI(queryParams[i].value);
            }
        }
        xhr.open("GET", url);

        xhr.setRequestHeader("Authorization", "Session " + sessionToken);
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("OSvC-CREST-Application-Context", "This is a valid request");

        xhr.send();
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(this.responseText);
            } else {
                reject(xhr.status);
            }
        }
    });
}

function performPOST(sessionToken, url, payload, queryParams = []) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        for (var i = 0; i < queryParams.length; i++) {
            if (i == 0) {
                url += "?" + queryParams[i].key + "=" + encodeURI(queryParams[i].value);
            } else {
                url += "&" + queryParams[i].key + "=" + encodeURI(queryParams[i].value);
            }
        }
        xhr.open("POST", url);

        xhr.setRequestHeader("Authorization", "Session " + sessionToken);
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader(
            "OSvC-CREST-Application-Context",
            "This is a valid request"
        );

        xhr.send(JSON.stringify(payload));

        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                console.log(this.responseText);
                resolve(JSON.parse(this.responseText));
            } else {
                reject(xhr.status);
            }
        };
    });
}

function performPATCH(sessionToken, url, payload, queryParams = []) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();

        for (var i = 0; i < queryParams.length; i++) {
            if (i == 0) {
                url += "?" + queryParams[i].key + "=" + encodeURI(queryParams[i].value);
            } else {
                url += "&" + queryParams[i].key + "=" + encodeURI(queryParams[i].value);
            }
        }
        xhr.open("PATCH", url);
        xhr.setRequestHeader("Authorization", "Session " + sessionToken);
        xhr.setRequestHeader("content-type", "application/json");
        xhr.setRequestHeader("OSvC-CREST-Application-Context", "This is a valid request");

        xhr.send(JSON.stringify(payload));

        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {

                resolve(this.responseText);
            } else {
                reject(xhr.status);
            }
        }
    });
}

function countChar(nodeID, target) {
    var node = document.getElementById(nodeID);
    var len = node.value.length;
    var maxLen = node.maxLength;
    if (len > maxLen) {
        node.value = node.value.substring(0, maxLen);
    } else {
        $("#" + target).text(maxLen - len);
    }
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

function extractID(a) {
    var id = a.split("/")[a.split("/").length - 1];
    return id;
}