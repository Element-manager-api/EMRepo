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