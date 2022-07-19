var iconFont = "fa fa-paper-plane";
var iconColor = "#259fed";
var createIcon = "font awesome";
var rightSidePaneURL = "../view/pane.html";
var rightSidePaneLabel = "Click2Dial Section";
var appName = "Click2DialLeft";
var appVersion = "1.0";
var paneFrameId = null, paneFrame = null;
var ieFlag = window.ActiveXObject || "ActiveXObject" in window;
var serverProperties = [
    "Extension_Label"
];
var constants, rightPane, _extensionProvider, gContext, sessionToken, restUrl, interfaceurl ,incID, incType = "", catID, wsType, wsrecordID;
var incidents_with_close_handler = [];
var incidents_with_saved_handler = [];

function loadExtension() {
    ORACLE_SERVICE_CLOUD.extension_loader.load(appName, appVersion).then(function (extensionProvider) {
        _extensionProvider = extensionProvider;
        extensionProvider.getGlobalContext().then(function (globalContext) {
            gContext = globalContext;
            initializeConstants(globalContext).then(function () {
                gContext.getSessionToken().then(function (session) {
                    sessionToken = session;
                     interfaceurl = globalContext.getInterfaceUrl();
                    _extensionProvider.registerWorkspaceExtension(function (workspaceRecord) {
                        wsType = workspaceRecord.getWorkspaceRecordType();
                        wsrecordID = workspaceRecord.getWorkspaceRecordId();
                        workspaceRecord.addCurrentEditorTabChangedListener(viewChangeHandler);
						
                    });
                });
            });
        });
    });
}


function viewChangeHandler(parameter) {
    //console.log(parameter);
    if (rightPane) {
        rightPane.isExpanded().then(function (status) {
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
            ISidePaneContext.getSidePane('Click2DialPane').then(function (rightPanelMenu) {
                
            
                if (parameter && (parameter.newWorkspace.objectType == "Incident" || parameter.newWorkspace.objectType == "Contact") && parameter.newWorkspace.objectId > 0) {
                    
                            _extensionProvider.registerWorkspaceExtension(function (workspaceRecord) {
                               workspaceRecord.addRecordClosingListener(handleWSClose);
							   		workspaceRecord.addNamedEventListener('PHONE_LIST_UPDATED',function(){
										activatePane(rightPanelMenu, parameter.newWorkspace.objectType, parameter.newWorkspace.objectId);
									});
                            });

                            activatePane(rightPanelMenu, parameter.newWorkspace.objectType, parameter.newWorkspace.objectId);
                        
                  
                } else if (parameter && (parameter.newWorkspace.objectType == "Incident" || parameter.newWorkspace.objectType == "Contact") &&  parameter.newWorkspace.objectId < 1) {
                    _extensionProvider.registerWorkspaceExtension(function (workspaceRecord) {

                       workspaceRecord.addRecordSavedListener(viewChangeHandler);
                    });
                }
            });
        });
    });
}
 
function activatePane(pane, recType, rec_ID) {
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
	const myTimeout = setTimeout(renderList, 1000, recType, rec_ID);
	
	
}


function initializeConstants(globalContext) {
    return new Promise(function (resolve, reject) {
        globalContext.getExtensionContext(appName).then(function (extensionContext) {
            extensionContext.getProperties(serverProperties).then(function (collection) {
				//var email_config =  collection.get('email_tab_title');
				//console.log(email_config);
                resolve(setConstants(collection));
            }).catch(function (err) {
                //console.log("inside extensionContext catch");
                //console.log(err);
                reject(err);
            });
        }).catch(function (err) {
            //console.log("inside getExtensionContext catch");
            //console.log(err);
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
        //console.log('closing ws promise returned');
        if (rightPane) {
            rightPane.dispose();
            rightPane = null;
        }
        if (param.workspaceRecord.getWorkspaceRecordType() == "Incident" || param.workspaceRecord.getWorkspaceRecordType() == "Contact") {
            //console.log(param);
        }
         resolve();
    });
}
function renderList(recType, rec_ID) {
	var PhoneListSessionName = recType+"_PHONELIST_"+rec_ID;
	
	
	var PhoneListParser = sessionStorage.getItem(PhoneListSessionName);
			
			if(PhoneListParser){
				 PList = JSON.parse(PhoneListParser);
				 //console.log(PList);
				 
		var PhoneTable='';
		var ID_NumberofCustomer = 0;
		PhoneTable+='<table><tr><th>Type</th><th>#</th></tr>';
									
									
									for(var phoneva in PList){
										
										
										if(phoneva == 'ID_NUMBER'){
											ID_NumberofCustomer = PList[phoneva];
										}
									}
									
									
									
									var entityID = [];
									
									for(var phone in PList){
										//console.log(PList[phone]);
										
										PhoneTable+='<tr>';
										
										
										
										if(phone != 'ID_NUMBER'){
									
										PhoneTable+='<td>'+phone+'</td><td><a href="javascript:CallNumber(\''+PList[phone]+'\', '+ID_NumberofCustomer+')">'+PList[phone]+'</a></td>';
										PhoneTable+='</tr>';
									}
									}
									PhoneTable+='</table>';
									//console.log(PhoneTable);
									//document.getElementById('tab1').innerHTML = PhoneTable;
									
									
									mytargetFrame=null;
									
										paneFrame = window.parent.frames;
									
									
									//console.log(paneFrame);
								
								for(var win=0; win<paneFrame.length;win++){
									if(paneFrame[win].click2dialName == 'Click2DialLeft'){
										mytargetFrame = paneFrame[win].frameElement.contentWindow;
									}
									
									
								}
								mytargetFrame.document.getElementById('tab1').innerHTML = PhoneTable;
								
//console.log(mytargetFrame);								
									
									
									//ORACLE_SERVICE_CLOUD.extensionResizeHandler.resize(300,400);
				}
	
	
//PHONE_LIST_UPDATED
}
loadExtension();