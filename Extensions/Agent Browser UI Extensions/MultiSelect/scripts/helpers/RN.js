const MY_APP_VERSION = "1.0";
const MY_APP_ID = "RNAuthenticator";
var rnSessionToken;
var rnProfileName;
var rnRestURL;
var rn;
	
var cxAuthentication = new Promise(function (resolve, reject) {
  ORACLE_SERVICE_CLOUD.extension_loader
    .load(MY_APP_ID, MY_APP_VERSION)
    .then(function (extensionProvider) {
      extensionProvider.getGlobalContext().then(function (globalContext) {
        _urlrest = globalContext.getInterfaceServiceUrl("REST");
        _accountId = globalContext.getAccountId();
        _profile_name = globalContext.getProfileName();

        globalContext.getSessionToken().then(function (sessionToken) {
          resolve({
            sessionToken: sessionToken,
            restEndPoint: _urlrest,
            accountId: _accountId,
            profileName: _profile_name,
          });
        });
      });
    });
});

class RN {
  /* Class Constructor */
  constructor() {
    this.headers = [{
        key: "Content-Type",
        value: "application/json",
      },
      {
        key: "OSvC-CREST-Application-Context",
        value: "valid request",
      },
    ];

    //this.urlPrefix = "https://rnowgse00722.rightnowdemo.com/services/rest/connect/v1.4";
  }
  /* Class Functions */
  assignGlobalContextVars() {
    return new Promise(function (resolve, reject) {
      cxAuthentication.then(function (result) {
        rnSessionToken = result["sessionToken"];
        rnProfileName = result["profileName"];
        rnRestURL = result["restEndPoint"];
        let globalContextVars = {};
        globalContextVars["rnSessionToken"] = rnSessionToken;
        globalContextVars["rnProfileName"] = rnProfileName;
        globalContextVars["rnRestURL"] = rnRestURL;
        resolve(globalContextVars);
      });
    });
  }
  // getSessionToken() {
  //   cxAuthentication.then(function (result) {
  //     rnSessionToken = result["sessionToken"];
  //     return rnSessionToken;
  //   });

  // }

  getFieldValuesFromWS(fieldsNamesArr) {
    return new Promise(function (resolve, reject) {
      ORACLE_SERVICE_CLOUD.extension_loader
        .load("CUSTOM_APP_ID", "1")
        .then(function (extensionProvider) {
          extensionProvider.registerWorkspaceExtension(function (
            WorkspaceRecord
          ) {
            WorkspaceRecord.getFieldValues([fieldsNamesArr]).then(function (
              IFieldDetails
            ) {
              var fieldsValArr = [];
              for (let i = 0; i < fieldsNamesArr.length; i++) {
                fieldsValArr[i] = IFieldDetails.getField(
                  fieldsNamesArr[i]
                ).getValue();
              }
              resolve({
                status: "ok",
                returnJson: JSON.parse(fieldsValArr),
              });
            });
          });
        })
        .catch(function (error) {
          reject({
            status: "notOk",
            returnJson: error,
          });
        });
    });
  }
  
  getReport(reportId, filterName = "", filterValue = "") {
    return new Promise(function (resolve, reject) {
      rn = new RN();
      rn.assignGlobalContextVars().then(function (globalContextObject) {
        console.log(globalContextObject["rnProfileName"]);

        let queryParams = [];
        let analiticResults = "analyticsReportResults";
		let urlPrefix = globalContextObject["rnRestURL"] + "/connect/latest";
        rn = new RN();
        if (filterName != "" && filterName!=null) {
          var reportJson = {
            id: reportId,
            filters: [{
              name: filterName,
              values: filterValue,
            }, ],
          };
        } else {
          var reportJson = {
            id: reportId,
          };
        }
        rn.insertObject(
            analiticResults,
            reportJson,
            rn.headers,
            globalContextObject["rnSessionToken"],
            urlPrefix,
            queryParams
          )
          .then(function (result) {
            resolve({
              status: "ok",
              returnJson: JSON.parse(result),
            });
          })
          .catch(function (error) {
            reject({
              status: "notOk",
              returnJson: error,
            });
          });
      });
    });
  }

  /* Private Functions */

  insertObject(
    objectName,
    data,
    headers,
    rnSessionToken,
    urlPrefix,
    queryParams
  ) {
    return new Promise(function (resolve, reject) {
      let url = urlPrefix + "/" + objectName;
      performPOST(headers, rnSessionToken, url, data, queryParams)
        .then(function (result) {
          resolve(result);
        })
        .catch(function (error) {
          reject(error);
        });
    });
  }
  deleteObject(
    objectName,
    objectId,
    headers,
    rnSessionToken,
    urlPrefix,
  ) {
    return new Promise(function (resolve, reject) {
      let url = urlPrefix + "/" + objectName + "/" + objectId;
      performDELETE(url, rnSessionToken)
        .then(function (result) {
          resolve(result);
        })
        .catch(function (error) {
          reject(error);
        });
    });
  }

  updateObject(
    objectName,
    objectId,
    data,
    headers,
    rnSessionToken,
    urlPrefix,
    queryParams
  ) {
    return new Promise(function (resolve, reject) {
      let url = urlPrefix + "/" + objectName + "/" + objectId;
      performPATCH(headers, rnSessionToken, url, data, queryParams)
        .then(function (result) {
          resolve(result);
        })
        .catch(function (error) {
          reject(error);
        });
    });
  }

  executeQuery(selectStatment, headers, rnSessionToken, urlPrefix) {
    return new Promise(function (resolve, reject) {
      let url = urlPrefix + "/queryResults";
      let queryParams = [{
        key: "query",
        value: selectStatment,
      }, ];
      performGET(headers, rnSessionToken, url, queryParams)
        .then(function (result) {
          resolve(result);
        })
        .catch(function (error) {
          reject(error);
        });
    });
  }
}