var appName = "Interaction_EXT2";
var appVersion = "1.0"
var _extProvider, _globalContext, _wsRecord, interactionCF=0,session="", constants, interaction={},interfaceurl="",id_number=0, cid, iid=0, contactInteraction={}, accountId;
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
					
					console.log(recordType);
					if(recordType == "Contact"){
						workspaceRecord.getFieldValues(['Contact.c_id', 'Contact.CO$id_number']).then(function(IFieldDetails)
						{	
							cid 			= IFieldDetails.getField('Contact.c_id').getValue();
							id_number       = IFieldDetails.getField('Contact.CO$id_number').getValue();
										
						});
					}
					if(recordType == "Incident"){
						workspaceRecord.getFieldValues(['Incident.CId','Incident.c$interaction_id', 'Contact.CO$id_number']).then(function(IFieldDetails)
						{								
							cid 			= IFieldDetails.getField('Incident.CId').getValue();
							//iid 			= IFieldDetails.getField('Incident.IId').getValue();
							interactionCF 	= IFieldDetails.getField('Incident.c$interaction_id').getValue();
							id_number       = IFieldDetails.getField('Contact.CO$id_number').getValue();
						});
						
						
					}
	
	                 
					workspaceRecord.addDataLoadedListener(dataLoadedFunction);
                    //workspaceRecord.addRecordSavingListener(recordSavingFunctionCC); 
					workspaceRecord.addRecordSavedListener(recordSavingFunction);
					//workspaceRecord.addRecordClosingListener(recordClosingFunction);
					
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


function dataLoadedFunction(wsParam) {
		
		//Load the Interaction if available
		//This function will verify in an Interaction is already in session when this Incident is opened.
		
		//Interaction name will be same throughout
		var intName = "current_interaction_record";
		
		
				
		
		//contactInteraction = sessionStorage.getItem("interaction_"+cid);
		
			
			
			var interact = sessionStorage.getItem(intName);
			
			if(interact){
				    contactInteraction = JSON.parse(interact);
					contactInteraction.Contact_ID 		= cid;
					contactInteraction.accountId 		= accountId;
					sessionStorage.setItem(intName,JSON.stringify(contactInteraction));
					 
					 
					 
					 
					 
				





	if(recordType == "Incident"){			
		  	_wsRecord.getFieldValues([ 'Incident.IId', 'Incident.C$interaction_id', 'Contact.CO$id_number']).then(function(IFieldDetails)
						{								
							
							iid 			= IFieldDetails.getField('Incident.IId').getValue();
							interactionIdassigned = IFieldDetails.getField('Incident.C$interaction_id').getValue();
							id_number       = IFieldDetails.getField('Contact.CO$id_number').getValue();
							//alert(iid);
							
									if(recordType == "Incident" && iid > 0){	
		
		
		
		
				if(interact){
				 contactInteraction = JSON.parse(interact);
				 // Set the Custom Field Interaction_ID
				// alert(contactInteraction.interactionID);
				_wsRecord.updateField('Incident.C$interaction_id',  contactInteraction.interactionID);
				
				
				
				
				var ajaxUrl = interfaceurl + "/php/custom/interaction_middleware.php?psk=" + session + "&incident=" + iid + "&interaction=" + contactInteraction.interactionID + "&apifunction=link_interaction_inc";
				//alert(ajaxUrl);
				if(interactionIdassigned != contactInteraction.interactionID && iid >0 && contactInteraction.interactionID > 0){
                $.ajax({
                  type : "POST",
                  dataType: "json",
                  data: contactInteraction,
                  url : ajaxUrl,
                  // Disable caching of AJAX responses
                  cache: false,
                  error: function (jqXHR, exception) {
                    var msg = 'Interaction Ext2: Error Accessing OSC Server - communication failed with status = ' + jqXHR.status 
                   // console.log('Error Accessing OSC Server .\n' + jqXHR.responseText);
                    alert(msg);
                  }
                }).done(
                  function(jsonData) {
                   		console.log(jsonData);
						//console.log(jsonData.ERROR);
						//console.log(jsonData.SUCCESS);
						// Check if its an error or successfully
						if(jsonData.ERROR !=''){
							alert(jsonData.ERROR);
							return Promise.resolve();
							//resolve();
						}else if(jsonData.SUCCESS !=''){
							
							//interaction.interactions2incidents 	= jsonData.DATARET.interactions2incidents; // Interaction ID to be received from an AJAX Call. Relevant data to be sent to AJAX.
						   //sessionStorage.setItem(intName,JSON.stringify(interaction));
					       //contactInteraction			= interaction;
						  // resolve();
						  return Promise.resolve();
						}
					
					
					
					
					
                   // resolve();
                });
				 
				 //Make an AjaX Call to associate Interation to Incident.
				 
				 
				 
				} 
				 
				}
		}
							
						});		
				
			//alert("testest");	
			
	}



				
					 
					 
					      
				 return Promise.resolve();
				}
				/*
				else{
					//Create Interaction @TODO
					
					interaction.Contact_ID 		= cid;
					interaction.accountId 		= accountId;
					
					var ajaxUrl = interfaceurl + "/php/custom/interaction_middleware.php?psk=" + session + "&contact=" + cid + "&accountId=" + interaction.accountId + "&apifunction=create_interaction";
					
					//console.log(ajaxUrl);
					$.ajax({
					  type : "POST",
					  dataType: "json",
					  data: interaction,
					  url : ajaxUrl,
					  // Disable caching of AJAX responses
					  cache: false,
					  error: function (jqXHR, exception) {
						var msg = 'Error Accessing OSC Server - communication failed with status = ' + jqXHR.status 
						//console.log('Error Accessing OSC Server .\n' + jqXHR.responseText);
						alert(msg);
					  }
					}).done(
					  function(jsonData) {
						//results1 = jsonData;
						//jsonData = JSON.parse(jsonData);
						//console.log(jsonData.DATARET);
						//console.log(jsonData.ERROR);
						//console.log(jsonData.SUCCESS);
						// Check if its an error or successfully
						if(jsonData.ERROR !=''){
							alert(jsonData.ERROR);
							return Promise.resolve();
						}else if(jsonData.SUCCESS !=''){
							
							interaction.interactionID 	= jsonData.DATARET.interactionID; // Interaction ID to be received from an AJAX Call. Relevant data to be sent to AJAX.
						   sessionStorage.setItem(intName,JSON.stringify(interaction));
					       contactInteraction			= interaction;
						   return Promise.resolve();
						}
						
						
						
						
					});
					
				
					
				}
			*/
			return Promise.resolve();
			
			
			//console.log(contactInteraction);		
			


}
function recordSavingFunction(wsParam) {
   
  
  //alert('Saving');

				
				// Agent is saving this record. Lets check if This incident is linked to currently active Interaction for this customer.
				
	
				
				if(recordType == "Contact"){
						_wsRecord.getFieldValues(['Contact.c_id', 'Contact.CO$id_number']).then(function(IFieldDetails)
						{	
							cid 			= IFieldDetails.getField('Contact.c_id').getValue();
							id_number       = IFieldDetails.getField('Contact.CO$id_number').getValue();
							//alert(cid);
							if(id_number > 0 && cid > 0){
							var intName = "current_interaction_record";
							var interactC = sessionStorage.getItem(intName);
			
							if(interactC){
								 contactInteractionCreated = JSON.parse(interactC);
								// alert(contactInteractionCreated.Contact_ID);
								 if(contactInteractionCreated.Contact_ID == 0 || contactInteractionCreated.Contact_ID == null || contactInteractionCreated.Contact_ID == ''){
									contactInteractionCreated.Contact_ID =cid;
									contactInteractionCreated.Contact_Identified =1;
								 }
								 sessionStorage.setItem(intName,JSON.stringify(contactInteractionCreated));
								}
						}
										
						});
						

						
				return Promise.resolve();
					}
				
		




		



		
				
	if(recordType == "Incident"){			
		  	_wsRecord.getFieldValues([ 'Incident.IId', 'Incident.C$interaction_id', 'Contact.CO$id_number']).then(function(IFieldDetails)
						{								
							
							iid 			= IFieldDetails.getField('Incident.IId').getValue();
							interactionIdassigned = IFieldDetails.getField('Incident.C$interaction_id').getValue();
							id_number       = IFieldDetails.getField('Contact.CO$id_number').getValue();
							//alert(iid);
							
									if(recordType == "Incident" && iid > 0){	
		
		
		
		
			var intName = "current_interaction_record";	
			var interact = sessionStorage.getItem(intName);			
				if(interact){
				 contactInteraction = JSON.parse(interact);
				 // Set the Custom Field Interaction_ID
				// alert(contactInteraction.interactionID);
				contactInteraction.Contact_ID =cid;
				contactInteraction.Contact_Identified =1;
				 sessionStorage.setItem(intName,JSON.stringify(contactInteraction));
				_wsRecord.updateField('Incident.C$interaction_id',  contactInteraction.interactionID);
				
				
				
				
				var ajaxUrl = interfaceurl + "/php/custom/interaction_middleware.php?psk=" + session + "&incident=" + iid + "&interaction=" + contactInteraction.interactionID + "&apifunction=link_interaction_inc";
				//alert(ajaxUrl);
				if(interactionIdassigned != contactInteraction.interactionID && iid > 0 && contactInteraction.interactionID > 0){
                $.ajax({
                  type : "POST",
                  dataType: "json",
                  data: contactInteraction,
                  url : ajaxUrl,
                  // Disable caching of AJAX responses
                  cache: false,
                  error: function (jqXHR, exception) {
                    var msg = 'Interaction Ext2:Error Accessing OSC Server - communication failed with status = ' + jqXHR.status 
                   // console.log('Error Accessing OSC Server .\n' + jqXHR.responseText);
                    alert(msg);
                  }
                }).done(
                  function(jsonData) {
                   		//console.log(jsonData.DATARET);
						//console.log(jsonData.ERROR);
						//console.log(jsonData.SUCCESS);
						// Check if its an error or successfully
						if(jsonData.ERROR !=''){
							alert(jsonData.ERROR);
							return Promise.resolve();
							//resolve();
						}else if(jsonData.SUCCESS !=''){
							
							//interaction.interactions2incidents 	= jsonData.DATARET.interactions2incidents; // Interaction ID to be received from an AJAX Call. Relevant data to be sent to AJAX.
						   //sessionStorage.setItem(intName,JSON.stringify(interaction));
					       //contactInteraction			= interaction;
						  // resolve();
						  return Promise.resolve();
						}
					
					
					
					
					
                   // resolve();
                });
				 
				 //Make an AjaX Call to associate Interation to Incident.
				 
				 
				 
				} 
				 
				}
		}
							
						});		
				
			//alert("testest");	
			
	}		

			//resolve();
			//console.log('recordSavingFunction');
			
	return Promise.resolve();
	
  
}


function recordClosingFunction(wsParam) {
   
  
		
		if(recordType == "Contact"){
					//Contact record is being closed. Close the Interaction.
					// Later make a check if any Incident is opened for same contact. In case Interaction is not yet closed.
					
					var intName = "current_interaction_record";	
					var interact = sessionStorage.removeItem(intName);	
				}
		if(recordType == "Incident"){
			// Check if Contact record is already opened.
			// If yes. don't close the Interaction ELSE Close the Interaction
			
			var contactEditorStatus = _wsRecord.isEditorOpen('Contact',cid);
			if(!contactEditorStatus){
				var intName = "current_interaction_record";	
				var interact = sessionStorage.removeItem(intName);
			}
		}
			//console.log('recordClosingFunction');
			
    return Promise.resolve();
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
