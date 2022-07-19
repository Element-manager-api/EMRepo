var tableName = "ContactLeads$ContactLeadInfo";
var numOfRows = 0;
var numOfColumns = 0;
var columns = [];
var jsonObj = [];
var idNumber;
var reportRow = [];
var _urlrest;
var phoneNum = 0;
var serverProperties = [
  
  "REPORT_ID_FOR_POLICY_HOLDER_REPORT",
  "REPORT_FILTERNAME_FOR_POLICY_HOLDER_REPORT",
  "REPORT_ID_FOR_LEAD_REPORT_APPLICANT",
  "REPORT_FILTERNAME_FOR_LEAD_REPORT_APPLICANT",
  "REPORT_ID_FOR_LEAD_REPORT_PHONENUM",
  "REPORT_FILTERNAME_FOR_LEAD_REPORT_PHONENUM"
  
];

var _extensionProvider, _globalContext, constants;
var subNo = 0;
var recordId, recordType, _wsRecord;
var payloadPH;

$(document).ready(function () {
  buildTable();
});

let cxAuthentication = new Promise(function (resolve, reject) {
  ORACLE_SERVICE_CLOUD.extension_loader.load("analyticsReportContactLead_main").then(function (extensionProvider) {
    extensionProvider.getGlobalContext().then(function (globalContext) {
      _urlrest = globalContext.getInterfaceServiceUrl("REST") + "/connect/latest/";
      _accountId = globalContext.getAccountId();
      _intfUrl = globalContext.getInterfaceUrl() + "/php/custom/"
      globalContext.getSessionToken().then(function (sessionToken) {
        resolve({
          intfUrl: _intfUrl,
          sessionToken: sessionToken,
          restEndPoint: _urlrest,
          accountId: _accountId,
        });
      });
    });
  });
});
var sessionInfo;
cxAuthentication.then(function (result) {
  sessionInfo = result;
});

function buildTable() {
  ORACLE_SERVICE_CLOUD.extension_loader.load("analyticsReport_ContactLead").then(function (extensionProvider) {
    _extensionProvider = extensionProvider;
    _extensionProvider.getGlobalContext().then(function (globalContext) {
      _globalContext = globalContext;
	  _extensionProvider.registerWorkspaceExtension(function (workspaceRecord) {
	_wsRecord = workspaceRecord;
	var currentWorkspaceObj = workspaceRecord.getCurrentWorkspace();
	workspaceRecord.getFieldValues(['Contacts.CId']).then(function(IFieldDetails)
			{
				idNumber = (IFieldDetails.getField('Contacts.CId').getValue());
			});
	});
	idNumber = parseInt(idNumber);
	console.log(idNumber);
      initializeConstants().then(function () {
        _extensionProvider.registerAnalyticsExtension(function (IAnalyticsContext) {
          IAnalyticsContext.addTableDataRequestListener('ContactLeads$ContactLeadInfo',enterDataToReport);
        });
      });
    });
  });
}

	
	
function initializeConstants() {
  return new Promise(function (resolve, reject) {
    _globalContext.getExtensionContext("analyticsReportContactLead").then(function (extensionContext) {
      console.log("inside getExtensionContext then");
      console.log(extensionContext);
      extensionContext.getProperties(serverProperties).then(function (serverPropertiesCollection) {
        console.log("inside extensionContext then");
        console.log(serverPropertiesCollection);
        var collection = serverPropertiesCollection;
        resolve(setConstants(collection));
      }).catch(function (err) {
        console.log("inside extensionContext catch");
        console.log(err);
        reject(err);
      });
    }).catch(function (err) {
      console.log("inside getExtensionContext catch");
      console.log(err);
      reject(err);
    });
  });
}

function setConstants(collection) {
  console.log("inside setConstants function");
  console.log(collection);
  var propertiesJSON = collection.extensionProperiesMap;
  constants = {};
  for (var key in propertiesJSON) {
    constants[key] = propertiesJSON[key].getValue();
  }
  return constants;
}

function enterDataToReport(reportObject) { 
	console.log("inside function enterDataToReport");
  var extensionPromise = new ExtensionPromise();
  var tempSubNo = 0;
  console.log(reportObject);
  var filterDetails = reportObject.getReportFilters();
  var filterList = filterDetails.getFilterList();
   _extensionProvider.registerWorkspaceExtension(function (workspaceRecord) {
	_wsRecord = workspaceRecord;
	var currentWorkspaceObj = workspaceRecord.getCurrentWorkspace();
	workspaceRecord.getFieldValues(['Contacts.CId','Contact.ph_home','Contact.ph_mobile','Contact.ph_office','Contact.ph_fax' ]).then(function(IFieldDetails)
			{
				idNumber = (IFieldDetails.getField('Contacts.CId').getValue());
				var mobNum = (IFieldDetails.getField('Contact.ph_mobile').getValue());
				var homeNum = (IFieldDetails.getField('Contact.ph_home').getValue());
				var officeNum = (IFieldDetails.getField('Contact.ph_office').getValue());
				var faxNum = (IFieldDetails.getField('Contact.ph_fax').getValue());
				
			if(mobNum) 
			{
				phoneNum = mobNum;
			}
			else if(homeNum)
			{
				phoneNum = homeNum;
			}
			else if(officeNum)
			{
				phoneNum = officeNum;
			}
			else if(faxNum)
			{
				phoneNum = faxNum;
			}
			idNumber = parseInt(idNumber); 
			console.log(idNumber);
			var promises = [];	
			payloadPH = setReportPayload(constants.REPORT_ID_FOR_POLICY_HOLDER_REPORT, constants.REPORT_FILTERNAME_FOR_POLICY_HOLDER_REPORT, parseInt(idNumber));
			var payloadAID = setReportPayload(constants.REPORT_ID_FOR_LEAD_REPORT_APPLICANT, constants.REPORT_FILTERNAME_FOR_LEAD_REPORT_APPLICANT, parseInt(idNumber));
			var payloadAPhone = setReportPayload(constants.REPORT_ID_FOR_LEAD_REPORT_PHONENUM, constants.REPORT_FILTERNAME_FOR_LEAD_REPORT_PHONENUM, (phoneNum));
			
			promises.push(getReportData(payloadPH));
			promises.push(getReportData(payloadAID));
			if(phoneNum)
			{
				promises.push(getReportData(payloadAPhone));
			}
			var tblData = [];
			var tblKey = [];
			Promise.all(promises).then(function(results){
				console.log(results);
				for(var i=0;i<results.length;i++)
				{
					console.log(results[i]);
					var result = results[i];
					if(result.count > 0 ){
						for(var r = 0; r<result.rows.length;r++){
							var rowInfo = result.rows[r];
							var rowToPush = {};
                         				var isExist = false;
							var incidentId = "";
							var createDate = "";
							for( var c = 0; c<result.columnNames.length;c++){
								var colName = result.columnNames[c];
								if(colName == "IncidentID"){
									incidentId = rowInfo[c];
								}
								if(colName == "תאריך פתיחה"){
									createDate = rowInfo[c];
								}
								var cellData = rowInfo[c];
								rowToPush[colName] = cellData;
							}
							var tempKey = incidentId +""+createDate;
							if(!tblKey.includes(tempKey)){
								tblData.push(rowToPush);
								tblKey.push(tempKey);
							}
							
						}
					}
					
				} // to process each result
				console.log(tblData);
				extensionPromise.resolve(create_reportData(reportObject, tblData));
			});
		});
	});
	
	
  return extensionPromise;
}


function updateRecordId(param) {
  recordId = wsParam.workspaceRecord.getWorkspaceRecordId();
  recordType = wsParam.workspaceRecord.getWorkspaceRecordType();
}

function getData() {
  return new Promise(function (resolve, reject) {
    callScript().then(function (result) {
      resolve(jsonToJson(result));
      //resolve(jsonToArray(result));
    }).catch(function (error) {
      reject(error);
    });
  });
}

function create_reportData(reportObject, tableData) {
  if (tableData && tableData.length > 0) {
		
    var reportData = reportObject.createReportData();
    debugger;
	var columns = reportObject.getReportDefinition().getColumnDefinitions();
    var columnsToShow = [];
    var columnsToAppend = [];
    for (var i = 0; i < columns.length; i++) {
      var colName = columns[i].getColumnReference();
      if (colName.split(".").length > 1) {
        columnsToShow.push(colName.split(".")[1]);
      } else {
        columnsToShow.push(columns[i].getColumnName());
        columnsToAppend.push({
          "name": columns[i].getColumnName(),
          "value": removeQuotes(columns[i].getColumnReference())
        });
      }
      //var field = columns[i].getColumnReference().split(".")[1];
      //columnsToShow.push(field);
    }
    if (columnsToAppend && columnsToAppend.length > 0) {
      for (var i = 0; i < columnsToAppend.length; i++) {
        var columnInfo = columnsToAppend[i];
        for (var j = 0; j < tableData.length; j++) {
          tableData[j][columnInfo.name] = columnInfo.value
        }
      }
    }
    var filterDetails = reportObject.getReportFilters();
    var filterList = filterDetails.getFilterList();
    if (filterList && filterList.length > 0) {
      var columnsToCheck = {};
      for (var i = 0; i < filterList.length; i++) {
        var filter = filterList[i];
        for (var j = 0; j < columns.length; j++) {
          if (columns[j].columnReference == filter.columnReference && filter.value) {
            var field = columns[j].getColumnReference().split(".")[1];
            columnsToCheck[field] = {
              value: filter.value ? filter.value : null,
              operator: filter.getOperatorType(),
              dataType: filter.getDataType()
            }
            break;
          }
        }
      }
    }
    console.log("Filter columns: ", columnsToCheck);
    for (var i = 0; i < tableData.length; i++) {
     var row = tableData[i];
	  //var row = tableData[i]; // var row = tableData[i].rows[i];
      var addToTable = true;
      for (var idx in columnsToCheck) {
        var val = columnsToCheck[idx].value;
        var type = columnsToCheck[idx].dataType;
        var op = columnsToCheck[idx].operator
        switch (op) {
          case 'Equals':
            if (type == "DateTime") {
              if (val != null) {
                if (row[idx]) {
                  var a = new Date(row[idx]);
                  var b = new Date(val);
                  if (b.setSeconds(0) != a.setSeconds(0)) {
                    addToTable = false;
                  }
                } else {
                  addToTable = false;
                }
              }
            } else {
              if (type != "Menu" && val != null && val != "~any~" && val != row[idx]) {
                addToTable = false;
              } else if (type == "Menu") {
                if (val == 0) {
                  if (row[idx] && row[idx] != 0) {
                    addToTable = false;
                  }
                } else if (val != null && val != "~any~" && val != row[idx]) {
                  addToTable = false;
                }
              }
            }
            break;
          case 'NotEquals':
            if (type == "DateTime") {
              if (val != null && row[idx] != null) {
                var a = new Date(row[idx]);
                var b = new Date(val);
                if (b.setSeconds(0) == a.setSeconds(0)) {
                  addToTable = false;
                }
              }
            } else {
              if (val != null && val == "~any~" && val == row[idx]) {
                addToTable = false;
              }
            }
            break;
          case 'NotEqualsOrNull':
            if (type == "DateTime") {
              if (val != null) {
                if (row[idx]) {
                  var a = new Date(row[idx]);
                  var b = new Date(val);
                  if (b.setSeconds(0) == a.setSeconds(0)) {
                    addToTable = false;
                  }
                } else {
                  addToTable = false;
                }
              } else if (row[idx] == null) {
                addToTable = false;
              }
            } else {
              if (val == "~any~" || (val != null && val == row[idx]) || !row[idx]) {
                addToTable = false;
              }
            }
            break;
          case 'LessThan':
            if (type == "DateTime") {
              if (val != null) {
                if (row[idx] != null) {
                  var a = new Date(row[idx]);
                  var b = new Date(val);
                  if (b.setSeconds(0) <= a.setSeconds(0)) {
                    addToTable = false;
                  }
                } else {
                  addToTable = false;
                }
              }
            } else {
              if ((val != null && val <= row[idx]) || !row[idx]) {
                addToTable = false;
              }
            }
            break;
          case 'LessThanEquals':
            if (type == "DateTime") {
              if (val != null) {
                if (row[idx] != null) {
                  var a = new Date(row[idx]);
                  var b = new Date(val);
                  if (b.setSeconds(0) < a.getTime()) {
                    addToTable = false;
                  }
                } else {
                  addToTable = false;
                }
              }
            } else {
              if ((val != null && val < row[idx]) || !row[idx]) {
                addToTable = false;
              }
            }
            break;
          case 'GreaterThan':
            if (type == "DateTime") {
              if (val != null) {
                if (row[idx] != null) {
                  var a = new Date(row[idx]);
                  var b = new Date(val);
                  if (b.setSeconds(0) >= a.setSeconds(0)) {
                    addToTable = false;
                  }
                } else {
                  addToTable = false;
                }
              }
            } else {
              if ((val != null && val >= row[idx]) || !row[idx]) {
                addToTable = false;
              }
            }
            break;
          case 'GreaterThanEquals':
            if (type == "DateTime") {
              if (val != null) {
                if (row[idx] != null) {
                  var a = new Date(row[idx]);
                  var b = new Date(val);
                  if (b.setSeconds(0) > a.getTime()) {
                    addToTable = false;
                  }
                } else {
                  addToTable = false;
                }
              }
            } else {
              if ((val != null && val > row[idx]) || !row[idx]) {
                addToTable = false;
              }
            }
            break;
          case 'Like':
            if (val != null) {
              if (row[idx]) {
                if (val.split("%").length > 1) {
                  if (!(matchText(row[idx], val.replaceAll("%", "*")))) {
                    addToTable = false;
                  }
                } else if (val.split("*").length > 1) {
                  if (!(matchText(row[idx], val))) {
                    addToTable = false;
                  }
                } else {
                  if (row[idx].replaceAll("\n", "") != val.replaceAll("\n", "")) {
                    addToTable = false;
                  }
                }
              } else {
                addToTable = false;
              }
            }
            break;
          case 'NotLike':
            if (val != null) {
              if (row[idx]) {
                if (val.split("%").length > 1) {
                  if (matchText(row[idx], val.replaceAll("%", "*"))) {
                    addToTable = false;
                  }
                } else if (val.split("*").length > 1) {
                  if (matchText(row[idx], val)) {
                    addToTable = false;
                  }
                } else {
                  if (row[idx].replaceAll("\n", "") == val.replaceAll("\n", "")) {
                    addToTable = false;
                  }
                }
              } else {
                addToTable = false;
              }
            }
            break;
          case 'List':
            if (val != null) {
              if (val != "~any~") {
                if (type == "Menu" || row[idx]) {
                  val = val.split(",");
                  if (!inArray(row[idx], val)) {
                    addToTable = false;
                  }
                } else {
                  addToTable = false;
                }
              }
            }
            break;
          case 'NotList':
            if (val != null) {
              if (val == "~any~") {
                addToTable = false;
              } else {
                if (type == "Menu" || row[idx]) {
                  val = val.split(",");
                  if (inArray(row[idx], val)) {
                    addToTable = false;
                  }
                } else {
                  addToTable = false;
                }
              }
            }
            break;
          case 'NotLikeOrNull':
            if (val != null) {
              if (row[idx]) {
                if (val.split("%").length > 1) {
                  if (matchText(row[idx], val.replaceAll("%", "*"))) {
                    addToTable = false;
                  }
                } else if (val.split("*").length > 1) {
                  if (matchText(row[idx], val)) {
                    addToTable = false;
                  }
                } else {
                  if (row[idx].replaceAll("\n", "") == val.replaceAll("\n", "")) {
                    addToTable = false;
                  }
                }
              }
            }
            break;
          case 'Range':
            if (val != null) {
              var start = null, end = null;
              if (Array.isArray(val)) {
                start = val[0];
                end = val[1];
              } else {
                start = val.split("|")[0];
                end = val.split("|")[1];
              }
              var a = row[idx];
              if ((start || end) && row[idx]) {
                if (type == "DateTime") {
                  a = new Date(row[idx]).getTime();
                  start = start ? new Date(start).setSeconds(0) : null;
                  end = end ? new Date(end).setSeconds(0) : null;
                }
                if ((start && start > a) || (end && end < a)) {
                  addToTable = false;
                }
              }
            }
            break;
          default:
            if (type == "DateTime") {
              if (val != null) {
                if (row[idx]) {
                  var a = new Date(row[idx]);
                  var b = new Date(val);
                  if (b.setSeconds(0) != a.setSeconds(0)) {
                    addToTable = false;
                  }
                } else {
                  addToTable = false;
                }
              }
            } else {
              if (val != null && val != "~any~" && val != row[idx]) {
                addToTable = false;
              }
            }
        }
      }
      if (addToTable) {
		 reportRow[i] = reportObject.createReportDataRow();
		
			for (var k = 0; k < columnsToShow.length; k++) {
				var dataCell = reportObject.createReportDataCell();
				dataCell.setData(removeQuotes(row[columnsToShow[k]]));
				//dataCell.setData(row.rows[m][k]);
				reportRow[i].getCells().push(dataCell);
			   
			}
        /* for (var j = 0; j < numOfColumns; j++) {
          var dataCell = reportObject.createReportDataCell();
          // dataCell.setData(tableData[i].getContactAsArray(j));
          dataCell.setData(tableData[i][j]);
          reportRow[i].getCells().push(dataCell);
        } */
        var rowInfo = reportObject.createReportRecordInfo();
        rowInfo.setRecordType("Incident");
		rowInfo.setRecordId(tableData[i]['IncidentID']);
		//rowInfo.setRecordId(tableData[i].rows[0]); //-
		reportRow[i].getRecordInfoList().push(rowInfo);
        reportData.getRows().push(reportRow[i]);
	  
     
    }
	}
    return reportData;
	
 } else {
    return false;
  }


}

function callScript() {
  return new Promise(function (resolve, reject) {
    if (subNo === 0 || subNo === "0") {
      resolve(null);
      return;
    }
    var url = sessionInfo.intfUrl + "call_subs_service.php";
    var payload = [{
      "key": "authToken",
      "value": sessionInfo.sessionToken
    },
    {
      "key": "oic",
      "value": constants.OIC_ENDPOINT_URL.replaceAll("%s", subNo)
    }]
    performGET(sessionInfo.sessionToken, url, payload).then(function (response) {
      var result = JSON.parse(response);
      if (result && result.success) {
        resolve(result.data);
      } else {
        resolve(null);
      }
    }).catch(function (error) {
      reject(error);
      console.log(error);
    });;
  })
}

function callAPI(method, url, auth) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();

    xhr.open(method, url);
    xhr.setRequestHeader("Authorization", "Basic " + auth);
    xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
    xhr.send();

    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(this.responseText);
      } else {
        reject(Error(xhr.status));
      }
    };
  });
}

function jsonToJson(json) {
  var tableData = [];
  if (json) {
    jsonObj = JSON.parse(json);
    if (jsonObj.calls && jsonObj.calls.length > 0) {
      tableData = jsonObj.calls;
    }
  }
  return tableData;
}

function jsonToArray(json) {
  var tableData = [];
  if (json) {
    jsonObj = JSON.parse(json);
    if (jsonObj.calls && jsonObj.calls.length > 0) {
      numOfColumns = Object.keys(jsonObj.calls[0]).length;
      numOfRows = jsonObj.calls.length;
      var attributes = [];
      for (let i = 0; i < numOfRows; i++) {
        var j = 0;
        for (var key in jsonObj.calls[i]) {
          attributes[j] = jsonObj.calls[i][key];
          j++;
        }
        tableData.push([...attributes]);
      }
    }
    console.log(tableData);
  }
  return tableData;
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

function performPOST1(sessionToken, url, payload, queryParams = []) {
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
        console.log(this.responseText);
        resolve(JSON.parse(this.responseText));
      } else {
        reject(xhr.status);
      }
    };
  });
}

function matchText(str, rule) {
  var escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/gm, "\\$1");
  return new RegExp("^" + rule.split("*").map(escapeRegex).join(".*") + "$", "gm").test(str);
}

function inArray(needle, haystack) {
  var length = haystack.length;
  for (var i = 0; i < length; i++) {
    if (isNaN(haystack[i])) {
      if (removeQuotes(haystack[i].trim()) == needle) return true;
    } else {
      if (parseInt(haystack[i]) == parseInt(needle)) return true;
    }
  }
  return false;
}

function removeQuotes(txt) {
  if (txt && txt.indexOf("'") == 0 && txt.indexOf("'", (txt.length - 1))) {
    return txt.replace(/'/g, '');
  }
  return txt;
}
/*
{
  "name": "DOCTOR_VISIT",
  "label": "DOCTOR_VISIT",
  "description": "DOCTOR_VISIT",
  "dataType": 6,
  "canDisplay": true,
  "canFilter": true,
  "canEdit": false,
  "isKey": false,
  "isNullable": true,
  "optListItems": [
      {
          "id": 0,
          "label": "לא"
      },
      {
          "id": 1,
          "label": "כן"
      }
  ]
},
*/

function getReportData(payload) {
    return new Promise(function (resolve, reject) {
        var url = sessionInfo.restEndPoint  + "analyticsReportResults";
        performPOST(sessionInfo.sessionToken, url, payload, []).then(function (resp) {
            resolve(resp);
        }).catch(function (Err) {
            console.log(Err);
            reject(Err);
        });
    });
}
function setReportPayload(reportID, filterName, filterValue) {
    var payload = {
        id: parseInt(reportID)
    };
    if (filterName && filterName != "") {
        payload["filters"] = [{
            name: filterName,
            values: filterValue.toString()
        }];
    }
    return payload;
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



