var appName = "HAFAKA POPUP V2";
var appVersion = "1.0"
var _extProvider, _globalContext, _wsRecord, session="", constants, cid, inc_id=0, hafakadata={},interfaceurl="", accountId;
var recordID, recordType;
var serverProps = [
    "Apply_RTL",
	"hostURL",
	"oicURL",
	"CarProductGroupName",
	"Lead_reportId",
	"InctAssetElm_reportId",
	"LeadAttribute_reportId",
	"trigger_event",
	"lead_attribute_filters",
	"mendatory_param_message",
	"loaded_event",
	"show_extn_button"
]


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
					/*
					if(recordType == "Contact"){
						//Contact Scenerios Contact 360. First phase will have only Lead/Incident Worskapce implemented.
						workspaceRecord.getFieldValues(['Contact.c_id']).then(function(IFieldDetails)
						{	
							cid 			= IFieldDetails.getField('Contact.c_id').getValue();
										
						});
					}
					*/
					
					
					
					
					if(constants.show_extn_button){
						var buttonHafaka = document.getElementById("hafaka_popup_button");
						buttonHafaka.style.display='';
					}
					if(recordType == "Incident"){
						workspaceRecord.getFieldValues(['Incident.CId','Incident.IId']).then(function(IFieldDetails)
						{								
							cid 			= IFieldDetails.getField('Incident.CId').getValue();
							inc_id 			= IFieldDetails.getField('Incident.IId').getValue();
						});
					}
					workspaceRecord.addNamedEventListener(constants.trigger_event,initHafaka);
					workspaceRecord.addRecordSavedListener(recordSavedFunction);
                });
            });
        });
    });



/*  
**This will be loaded once WS data is loaded successfully.
**wsParam - WS Parameter call back reference.
*/
function initHafaka() {
		
		
		//
		
	/*	Apply_RTL: true
InctAssetElm_reportId: "100215"
LeadAttribute_reportId: "100216"
Lead_reportId: "100207"
lead_attribute_filters: "TESTTESTTESTESTE"
mendatory_param_message: "One of the mandatory parameter is missing."
oicURL: "https://oic-dev-frrjl3e4bk6c-fr.integration.ocp.oraclecloud.com/ic/api/integration/v1/flows/rest/HAFAKA_POP_UP/1.0/HafakaPopUp"

*/
		//Load the data
	//console.log(constants);
		if(inc_id > 0 && session!=''){ // Lead/Incident Edit case
			//var ajaxUrl = interfaceurl + "/php/custom/hafaka_middleware.php?psk=" + session + "&incident=" + iid + "&accountId=" + accountId + "&apifunction=get_hafaka_data";
			var formData = {Lead_reportId:constants.Lead_reportId,InctAssetElm_reportId:constants.InctAssetElm_reportId,LeadAttribute_reportId:constants.LeadAttribute_reportId,lead_attribute_filters:constants.lead_attribute_filters,CarProductGroupName:constants.CarProductGroupName,mendatory_param_message:constants.mendatory_param_message,oicURL:constants.oicURL, incident:inc_id, psk:session , selected_action_code:1 , accountId:accountId};
			console.log(formData);
				var ajaxUrl = interfaceurl + constants.hostURL;	
				console.log(ajaxUrl);
					$.ajax({
					  type : "POST",
					  dataType: "json",
					  data: formData,
					  url : ajaxUrl,
					  // Disable caching of AJAX responses
					  cache: false,
					  error: function (jqXHR, exception) {
						var msg = 'Hafaka Popup V2: Error Accessing OSC Server - communication failed with status = ' + jqXHR.status 
						//console.log('Error Accessing OSC Server .\n' + jqXHR.responseText);
						_wsRecord.triggerNamedEvent(constants.loaded_event);
						alert(msg);
					  }
					}).done(
					  function(jsonData) {
						//results1 = jsonData;
						//jsonData = JSON.parse(jsonData);
						//console.log(jsonData);
						//console.log(jsonData.ERROR);
						console.log(jsonData);
						// Check if its an error or successfully
						if(jsonData.API_ERROR !=''){
							_wsRecord.triggerNamedEvent(constants.loaded_event);
							
							var errordisplay = jsonData.API_ERROR;
							let is_api_response = jsonData.hasOwnProperty('API_RESPONSE');
							if(is_api_response){
								let is_error_title = jsonData.API_RESPONSE.hasOwnProperty('title');
								if(is_error_title){
									errordisplay+= ':'+jsonData.API_RESPONSE.title;
								}
								let is_error_detail = jsonData.API_RESPONSE.hasOwnProperty('detail');
								if(is_error_detail){
									errordisplay+= '\n\n'+jsonData.API_RESPONSE.detail;
								}	
							}

							alert(errordisplay); // This will be a MODEL POPUP
							
							return Promise.resolve();
						}else if(jsonData.API_RESPONSE !=''){
							
							//interaction.interactionID 	= jsonData.DATARET.interactionID; // Interaction ID to be received from an AJAX Call. Relevant data to be sent to AJAX.
						  // sessionStorage.setItem(intName,JSON.stringify(interaction));
					      // contactInteraction			= interaction;
						 // console.log(jsonData.API_RESPONSE.HafakaPopUp_Response.IsSuccess);
						  if(jsonData.API_RESPONSE.HafakaPopUp_Response.IsSuccess && jsonData.API_RESPONSE.HafakaPopUp_Response.Url !=""){
							   _wsRecord.triggerNamedEvent(constants.loaded_event);
							  window.open(jsonData.API_RESPONSE.HafakaPopUp_Response.Url,"_blank");
							  _wsRecord.executeEditorCommand('Refresh');
							  
						  }else{
							  _wsRecord.triggerNamedEvent(constants.loaded_event);
							 alert(jsonData.API_RESPONSE.HafakaPopUp_Response.ErrorMessage);// This will be a MODEL POPUP
							 
							/*
									_extProvider.registerUserInterfaceExtension(function(IUserInterfaceContext)
										{
										IUserInterfaceContext.getPopupWindowContext().then(function(IPopupWindowContext)
											{
											var popupWindow = IPopupWindowContext.createPopupWindow('myFirstPopupWindow');
											});
										});
								
							 */
							 
							 
							 
						  }
/*
{
    "HafakaPopUp_Response": {
        "Url": "https://haftst01/hafakanet/login.aspx?ExternalStateId=ca3e6b67df654fc5a5df9901c8c5f282&User=204331086&Token=2043310861_692198355",
        "AgentNumber": 34470,
        "ErrorCode": 0,
        "ErrorMessage": "",
        "IsSuccess": true
    }
}
*/						   return Promise.resolve();
						}
						
						
						
						
					});
			
			
			
		}else{// New Lead/Incident
		_wsRecord.triggerNamedEvent(constants.loaded_event);
			
		}
	
	
	
	
	
					
				
					
		
			
			return Promise.resolve();
			
			
			//console.log(contactInteraction);		
			


}

function recordSavedFunction(wsParam) {
 			// Agent is saving this incident. Lets check if This incident is linked to currently active Interaction for this customer.

		
			if(recordType == "Incident"){
			_wsRecord.getFieldValues([ 'Incident.IId']).then(function(IFieldDetails)
						{								
						inc_id 			= IFieldDetails.getField('Incident.IId').getValue();
						//console.log(inc_id);
						});
			
			}				

  

}





function initializeConstants(globalContext) {
    return new Promise(function (resolve, reject) {
        globalContext.getExtensionContext(appName).then(function (extensionContext) {
            extensionContext.getProperties(serverProps).then(function (collection) {
                resolve(setConstants(collection));
            }).catch(function (err) {
                //console.log("inside extensionContext catch");
                //console.log(err);
                reject(err);
            });
        }).catch(function (err) {
           // console.log("inside getExtensionContext catch");
           // console.log(err);
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
