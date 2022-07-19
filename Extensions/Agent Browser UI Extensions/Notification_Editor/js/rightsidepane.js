var iconFont = "fa fa-paper-plane";
var iconColor = "#259fed";
var createIcon = "font awesome";
var tab_to_open = 1;
var rightSidePaneURL = "../view/pane.html";
var rightSidePaneLabel = "Notification Editor";
var appName = "Notification_Editor";
var appVersion = "1.0";
var paneFrameId = null, paneFrame = null;
var ieFlag = window.ActiveXObject || "ActiveXObject" in window;
var rightPanelMenu_;
var serverProperties = [
    "Extension_Label",
	"SMS_tab_title",
	"Easy_tab_title",
    "Recipients_Label",
	"Related_document_email_label",
	"Email_Address_Label",
	"Submit_Button_Label",
	"Related_document_SMS_Label",
	"Phone_number_Label",
	"Easy_send_option_1_Label",
	"Easy_send_option_2_Label",
	"Easy_send_option_3_Label",
	"Easy_send_related_doc_Label",
    "Recipients_SelectAll_Label",
    "Recipients_ClearAll_Label",
    "Refresh_Label",
    "StandardText_Label",
    "FreeText_Label",
    "send_to_internal_customer",
    "send_to_external_customer",
    "allow_sending_to_noncontact_for_incident",
    "allow_sending_to_noncontact_for_task",
    "allow_standard_text",
    "allow_free_text",
    "allow_sending_to_mobile",
    "allow_sending_to_home",
    "allow_sending_to_office",
    "allow_sending_to_fax",
    "allow_sending_to_addlPhone",
    "max_length_for_sms_max255",
    "Object_Type_IDS",
	"Send_by_Label",
    "Incident_External_Reports_IDS",
    "Incident_External_Reports_FilterName",
    "Incident_Internal_Reports_IDS",
    "Incident_Internal_Reports_FilterName",
    "Task_Internal_Reports_IDS",
    "Task_Internal_Reports_FilterName",
	"Lead_Internal_Reports_IDS",
    "Lead_Internal_Reports_FilterName",
	"allow_sending_to_noncontact_for_lead",
    "Error_No_Recipients_found",
    "Error_Generic",
    "Error_Select_Recipients",
    "Error_SMS_Content_Not_Found",
    "Error_SMS_Content_Has_Url",
    "Error_Select_Area_Code",
    "Error_Enter_Phone_Number",
    "Error_Invalid_Phone_Number_Format",
    "Error_Title_For_SubmitDisable",
    "Area_codes_for_Additional_phone",
	"email_tab_title",
    "Number_of_digits_for_Additional_phone",
    "Report_ID_CN_Mapping",
    "Report_Filter_Name_For_STDTexts"
];
var constants, rightPane, _extensionProvider, gContext, sessionToken, restUrl, interfaceurl ,incID, incType = "", catID;
var incidents_with_close_handler = [];
var incidents_with_saved_handler = [];

function loadExtension() {
    ORACLE_SERVICE_CLOUD.extension_loader.load(appName, appVersion).then(function (extensionProvider) {
        _extensionProvider = extensionProvider;
        extensionProvider.getGlobalContext().then(function (globalContext) {
            clearLocalStorage();
            globalContext.addLoggingOutEventListener(clearLocalStorage);
            gContext = globalContext;
            initializeConstants(globalContext).then(function () {
                rightSidePaneLabel = constants.Extension_Label;
                gContext.getSessionToken().then(function (session) {
                    sessionToken = session;
                    restUrl = globalContext.getInterfaceServiceUrl('Rest') + "/connect/latest/";
					interfaceurl = globalContext.getInterfaceUrl();
                    _extensionProvider.registerWorkspaceExtension(function (workspaceRecord) {
                        console.log(workspaceRecord.getWorkspaceRecordType());
                        console.log(workspaceRecord.getWorkspaceRecordId());
                        workspaceRecord.addCurrentEditorTabChangedListener(viewChangeHandler);
						
                    });
                });
            });
        });
    });
}


function viewChangeHandler(parameter) {
    console.log(parameter);
    if (rightPane) {
        rightPane.isExpanded().then(function (status) {
            console.log(status);
            paneFrameId = null;
            if (!paneFrameId && localStorage.getItem("Notification_Editor_Pane_FrameId")) {
                paneFrameId = localStorage.getItem("Notification_Editor_Pane_FrameId");
                localStorage.removeItem("Notification_Editor_Pane_FrameId");
            }
            if (paneFrameId) {
                if (ieFlag) {
                    paneFrame = window.parent.frames[paneFrameId];
                } else {
                    paneFrame = window.parent.frames[paneFrameId].contentWindow;
                }
                console.log(paneFrame.recipients);
                console.log(paneFrame.standardTextVal);
                console.log(paneFrame.freeTextVal);
                console.log(incID);
                var info = {
                    "recipients": paneFrame.recipients ? paneFrame.recipients : null,
                    "standardTextVal": paneFrame.standardTextVal ? paneFrame.standardTextVal : null,
                    "freeTextVal": paneFrame.freeTextVal ? paneFrame.freeTextVal : null,
                    "nonContact": paneFrame.allowNonContact,
                    "nonContact_phoneNumber": paneFrame.additionalPhoneNumber ? paneFrame.additionalPhoneNumber : null,
                    "nonContact_phoneAreaCode": paneFrame.additionalPhoneAreaCode ? paneFrame.additionalPhoneAreaCode : null,
                    "expanded": status
                };
                console.log(info);
                console.log(JSON.stringify(info));
                localStorage.setItem("Notification_Editor_Incident_" + incID, JSON.stringify(info));
            }
            rightPane.dispose();
            rightPane = null;
            registerUIExtension(parameter);
        });
    } else {
        registerUIExtension(parameter);
    }
}

function registerUIExtension(parameter) {
    _extensionProvider.registerUserInterfaceExtension(function (IUserInterfaceContext) {
        IUserInterfaceContext.getLeftSidePaneContext().then(function (ISidePaneContext) {
            ISidePaneContext.getSidePane('notificationEditorPane').then(function (rightPanelMenu) {
                console.log(rightPanelMenu);
				rightPanelMenu_ = rightPanelMenu;
                localStorage.setItem("Notification_Editor_FrameId", this.window.frameElement.id);
                if (parameter && parameter.newWorkspace.objectType == "Incident" && parameter.newWorkspace.objectId > 0) {
                    performGET(sessionToken, restUrl + "incidents/" + parameter.newWorkspace.objectId, []).then(function (incidentInfo) {
                        incidentInfo = JSON.parse(incidentInfo);
                        if (incidentInfo.customFields.c.object_type && inArray(incidentInfo.customFields.c.object_type.id, constants.Object_Type_IDS.split(","))) {
                            incID = parameter.newWorkspace.objectId;
                            _extensionProvider.registerWorkspaceExtension(function (workspaceRecord) {
                                console.log(workspaceRecord.getWorkspaceRecordType());
								console.log('workspacetype and id');
                                console.log(workspaceRecord.getWorkspaceRecordId());
                                if (!inArray(workspaceRecord.getWorkspaceRecordId(), incidents_with_close_handler)) {
                                    incidents_with_close_handler.push(workspaceRecord.getWorkspaceRecordId());
                                    workspaceRecord.addRecordClosingListener(handleWSClose);
									//workspaceRecord.addNamedEventListener('easy_send_to_customer',open_notification_tab);
                                }
                                //workspaceRecord.addRecordClosingListener(handleWSClose);
                            });
                            if (parseInt(incidentInfo.customFields.c.object_type.id) == 2) {
                                incType = "Incident";
                            }else if (parseInt(incidentInfo.customFields.c.object_type.id) == 1) {
                                incType = "Lead";
							}
							else if (parseInt(incidentInfo.customFields.c.object_type.id) == 3) {
                                incType = "Task";
                            }
                            activatePane(rightPanelMenu);
                        }
                    });
                } else if (parameter && parameter.newWorkspace.objectType == "Incident" && parameter.newWorkspace.objectId < 1) {
                    _extensionProvider.registerWorkspaceExtension(function (workspaceRecord) {
                        console.log(workspaceRecord.getWorkspaceRecordType());
                        console.log(workspaceRecord.getWorkspaceRecordId());
                        if (!inArray(workspaceRecord.getWorkspaceRecordId(), incidents_with_saved_handler)) {
                            incidents_with_saved_handler.push(workspaceRecord.getWorkspaceRecordId());
                            workspaceRecord.addRecordSavedListener(viewChangeHandler);
                        }
                    });
                }
            });
        });
    });
}

function activatePane(pane) {
    pane.setContentUrl(rightSidePaneURL);
    pane.setLabel(rightSidePaneLabel);
    pane.setVisible(true);
    var icon = pane.createIcon(createIcon);
    icon.setIconClass(iconFont);
    icon.setIconColor(iconColor);
    pane.addIcon(icon);
    rightPane = pane;
	//pane.expand();
    pane.render();
}

function open_notification_tab(){
	//rightPanelMenu_;
	//alert('heloo');
	tab_to_open = 3;
	
	rightPanelMenu_.expand();

	 rightPanelMenu_.render();
	  var targetFrame =  localStorage.getItem("Notification_Editor_Pane_FrameId");
	 var frameEle = document.getElementById(targetFrame);
	
			
	 		 
	

}
function initializeConstants(globalContext) {
    return new Promise(function (resolve, reject) {
        globalContext.getExtensionContext(appName).then(function (extensionContext) {
            extensionContext.getProperties(serverProperties).then(function (collection) {
				//var email_config =  collection.get('email_tab_title');
				//console.log(email_config);
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
	
	
    var propertiesJSON = collection.extensionProperiesMap;
    constants = {};
    for (var key in propertiesJSON) {
        constants[key] = propertiesJSON[key].getValue();
		
    }
    return constants;
}

function handleWSClose(param) {
    return new ExtensionPromise(function (resolve, reject) {
        console.log('closing ws promise returned');
        if (rightPane) {
            rightPane.dispose();
            rightPane = null;
        }
        if (param.workspaceRecord.getWorkspaceRecordType() == "Incident") {
            if (localStorage.getItem('Notification_Editor_Incident_' + param.workspaceRecord.getWorkspaceRecordId())) {
                localStorage.removeItem('Notification_Editor_Incident_' + param.workspaceRecord.getWorkspaceRecordId())
            }
        }
        var idx = incidents_with_close_handler.indexOf(param.workspaceRecord.getWorkspaceRecordId());
        if (idx > -1) {
            incidents_with_close_handler.splice(idx, 1);
        }
        resolve();
    });
}

function clearLocalStorage(param) {
    return new ExtensionPromise(function (resolve, reject) {
        console.log('clearLocalStorage promise returned');
        if (rightPane) rightPane.dispose();
        for (var key in localStorage) {
            if (key.startsWith('Notification_Editor_')) {
                console.log("Removing key: " + key);
                localStorage.removeItem(key);
            }
        }
        resolve();
    });
}

function performGET(sessionToken, url, queryParams = []) {
	//alert('inperm');
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

loadExtension();