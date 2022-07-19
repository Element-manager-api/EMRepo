var appName = "ClickToDialFields";
var appVersion = "1.0"
var _extProvider, _globalContext, _wsRecord, interactionCF=0,session="", constants, interaction={},interfaceurl="",id_number=0, cid=0,oid=0, iid=0, contactInteraction={}, accountId;
var recordID, recordType;
var serverProps = [
    "Apply_RTL"
]
function init() {
    ORACLE_SERVICE_CLOUD.extension_loader.load(appName, appVersion).then(function (extensionProvider) {
        _extProvider = extensionProvider;
        extensionProvider.getGlobalContext().then(function (globalContext) {
            _globalContext = globalContext;
			 accountId = _globalContext.getAccountId();
			  _globalContext.getSessionToken().then(
              function (sessionToken) {
                session = sessionToken;  
				//console.log(session);
                
            });
			
				 
			 interfaceurl = globalContext.getInterfaceUrl();
            initializeConstants(globalContext).then(function () {
                if (constants.Apply_RTL) document.dir = "rtl";
                extensionProvider.registerWorkspaceExtension(function (workspaceRecord) {
					
					_wsRecord = workspaceRecord;
					
		
					
					
					
					
                    recordID = workspaceRecord.getWorkspaceRecordId();
                    recordType = workspaceRecord.getWorkspaceRecordType();
					
					if(recordType == "Contact"){
						workspaceRecord.getFieldValues(['Contact.c_id', 'Contact.CO$id_number']).then(function(IFieldDetails)
						{	
							cid 			= IFieldDetails.getField('Contact.c_id').getValue();
							id_number       = IFieldDetails.getField('Contact.CO$id_number').getValue();
							
										
							
							
							
										
						});
						renderList();	
					}
					
					console.log(recordType);
					if(recordType == "Org"){
						workspaceRecord.getFieldValues(['Org.org_id', 'Org.CO$id_number']).then(function(IFieldDetails)
						{	
							oid 			= IFieldDetails.getField('Org.org_id').getValue();
							id_number       = IFieldDetails.getField('Org.CO$id_number').getValue();
										
						});
						renderList();
					}
					
					if(recordType == "Incident"){
						workspaceRecord.getFieldValues(['Incident.CId', 'Contact.CO$id_number']).then(function(IFieldDetails)
						{								
							cid 			= IFieldDetails.getField('Incident.CId').getValue();
							id_number       = IFieldDetails.getField('Contact.CO$id_number').getValue();
						});
						
						renderList();
					}
	
	                 
					//workspaceRecord.addDataLoadedListener(dataLoadedFunction);
                   // /workspaceRecord.addRecordSavingListener(recordSavingFunctionCC); 
					workspaceRecord.addRecordSavedListener(renderList);
					workspaceRecord.addRecordClosingListener(clearList);
					
                });
            });
        });
    });
	
ORACLE_SERVICE_CLOUD.extension_loader.load('LOG_OUT').then(function (extensionProvider) {
		extensionProvider.getGlobalContext().then(function (globalContext) {
			globalContext.addLoggingOutEventListener(function (param) {
			sessionStorage.clear();
				return Promise.resolve();
			});
		});
	});
	
}

function renderList() {
	
	
		
	

					
					var ajaxUrl = interfaceurl + "/php/custom/interaction_middleware.php?psk=" + session + "&recordID=" + recordID + "&recordType=" + recordType + "&apifunction=get_phones_list";
					
					console.log(ajaxUrl);
					$.ajax({
					  type : "POST",
					  dataType: "json",
					  data: recordID,
					  url : ajaxUrl,
					  // Disable caching of AJAX responses
					  cache: false,
					  error: function (jqXHR, exception) {
						var msg = 'C2DF: Error Accessing OSC Server - communication failed with status = ' + jqXHR.status 
						//console.log('Error Accessing OSC Server .\n' + jqXHR.responseText);
						alert(msg);
					  }
					}).done(
					  function(jsonData) {
						//results1 = jsonData;
						//jsonData = JSON.parse(jsonData);
						//console.log(jsonData);
						if(jsonData.DATARET.ERROR == ''){
							alert(jsonData.DATARET.ERROR);
						}else{
							if(typeof jsonData.DATARET.PhoneList != 'undefined'){
								if(jsonData.DATARET.PhoneList.length > 0){
									
									var phoneListSession ={};
									
									var PhoneTable='';
										PhoneTable+='<table><tr><th>Type</th><th>#</th></tr>';
									var i=0;
									
									for(var phone in jsonData.DATARET.PhoneList){
										i++;
										console.log(jsonData.DATARET.PhoneList[phone]);
										
										PhoneTable+='<tr>';
										
										for(var phoneNum in jsonData.DATARET.PhoneList[phone]){
											PhoneTable+='<td>'+phoneNum+'</td><td><a href="javascript:CallNumber(\''+jsonData.DATARET.PhoneList[phone][phoneNum]+'\')">'+jsonData.DATARET.PhoneList[phone][phoneNum]+'</a></td>';
											phoneListSession[phoneNum]=jsonData.DATARET.PhoneList[phone][phoneNum];
										}
										PhoneTable+='</tr>';
									}
									PhoneTable+='</table>';
									phoneListSession['ID_NUMBER']=id_number;
									//console.log(PhoneTable);
									//document.getElementById('DialList').innerHTML = PhoneTable;
									console.log(phoneListSession);
									
									var PhoneListSessionName = recordType+"_PHONELIST_"+recordID;
									
									var PhoneListString=JSON.stringify(phoneListSession);
									//if(PhoneListString !=''){
										sessionStorage.setItem(PhoneListSessionName,PhoneListString);
										_wsRecord.triggerNamedEvent('PHONE_LIST_UPDATED');
									//}
									//ORACLE_SERVICE_CLOUD.extensionResizeHandler.resize(300,400);
									
								}
							}
						}
						
						//console.log(jsonData.ERROR);
						//console.log(jsonData.SUCCESS);
						// Check if its an error or successfully
						if(jsonData.ERROR !=''){
							alert(jsonData.ERROR);
							return Promise.resolve();
						}else if(jsonData.SUCCESS !=''){
							
						
						   return Promise.resolve();
						}
						
						
						
						
					});
					
				
					

			
			return Promise.resolve();
			
			
			//console.log(contactInteraction);		
			


}
function CallNumber(phoneNumber=''){
			let nextId = 0;
			//let phoneNumber="8888888888";
			//console.log(amcTechnologydavinciApi);
			// amcTechnologydavinciApi.clickToDial("9999999999", []);
	var entity = [];		 
	const amcFrame = window.parent.document.getElementsByName('sidePaneBrowserExtension');
	console.log(amcFrame);
      amcFrame[0].contentWindow.postMessage(
        {
		  ContactIDNumber:id_number,
          id: nextId++,
          type: 'clickToDialORACLE',
          from: 'OracleCX-for-Davinci',
          isReply: false,
          message: {
            phoneNumber,
            entity
          }
        },
        '*'
      ); 
			 
			 
			 
}
function clearList(){
	var PhoneListSessionName = recordType+"_PHONELIST_"+recordID;
	sessionStorage.removeItem(PhoneListSessionName);
	_wsRecord.triggerNamedEvent('CLEAR_PHONE_LIST');
	
}


function initializeConstants(globalContext) {
    return new Promise(function (resolve, reject) {
        globalContext.getExtensionContext(appName).then(function (extensionContext) {
            extensionContext.getProperties(serverProps).then(function (collection) {
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
