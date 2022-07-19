var appId="OpenInterview";
var apiVersion="1.0";
var prod=null;
var cat=null;
var policyModel = null;
var constants = {
    sesToken: null,
    startURL: null,
	resumeURL: null,
	recordId: null,
	processName: null,
    _extensionProvider: null,
	workspaceRecord: null
};


$(document).ready(function() {
	ORACLE_SERVICE_CLOUD.extension_loader.load(appId, apiVersion).then(function (extensionProvider) {
		constants._extensionProvider = extensionProvider;
		extensionProvider.registerWorkspaceExtension(function(workspaceRecord){			
			constants.workspaceRecord = workspaceRecord;
				//workspaceRecord.addNamedEventListener('OpenInterviewRefresh' , OpenInterview);
			OpenInterview();
			/*workspaceRecord.addRecordSavedListener(function(workspaceRecordEventParameter){
				OpenInterview();
			console.log('Save called.');
			console.log("inside the addRecordSavedListener function");
			});*/
			workspaceRecord.addNamedEventListener('HFBCame',myCustomImplementation);
			workspaceRecord.addFieldValueListener('Incident.CO$change_contact_date', myCustomImplementation);
			function myCustomImplementation(workspaceRecord) {
				OpenInterview();
				} 
				
			function OpenInterview(){
				console.log("inside the function");
				
			workspaceType = workspaceRecord.getWorkspaceRecordType();
			var fieldDetails;
			if(workspaceType == "Incident"){
				fieldDetails = ['Incident.i_id'];
			} else {
				return;
			}
			//Following code to retrieve Product and cat value
			workspaceRecord.getFieldValues(['Incident.prod_id']).then(function(IFieldDetails)
			{
			console.log("Product : "+IFieldDetails.getField('Incident.prod_id').getLabel());
			prod=IFieldDetails.getField('Incident.prod_id').getLabel();
			
			workspaceRecord.getFieldValues(['Incident.cat_id']).then(function(IFieldDetails)
			{
			console.log("Cat : "+IFieldDetails.getField('Incident.cat_id').getLabel());
			cat=IFieldDetails.getField('Incident.cat_id').getLabel();
			
			console.log("before Value set");
			if(prod=="רכב"|| prod=="צד ג" ||prod=="חובה" ||prod=="מקיף" || prod=="חובה ומקיף" || prod=="חובה וצד ג")
			{
				if(cat=="חדש")
				{
					policyModel="New_Car_Sales";
					console.log("Value set");
				}
				if(cat=="חידוש")
				{
					policyModel="CLAL_Renewals";
					console.log("Value set");
				}
				
			}
			if(prod=="דירה"|| prod=="תכולה בלבד" || prod=="מבנה בלבד" ||prod=="מבנה בלבד משועבד" || prod=="מבנה ותכולה")
			{
				if(cat=="חדש")
				{
					policyModel="New_Property_Sale";
				}
				if(cat=="חידוש")
				{
					policyModel="CLAL_Renewals";
				}

				
			}
			if(prod=="סייבר"|| prod=="סייבר משפחתי" )
			{
				if(cat=="חדש")
				{
					policyModel="New_Cyber_Sale";
				}
				if(cat=="חידוש")
				{
					policyModel="CLAL_Renewals";
				}
				
			}
			
			
			console.log("Value policy :"+policyModel);
			// dev code end
			//Following code will retrieve Incident fields. 
			workspaceRecord.getFieldValues(fieldDetails).then(function(IFieldDetails){
				if(workspaceType == "Incident"){
					constants.recordId = IFieldDetails.getField('Incident.i_id').getLabel();
				}
				//Following code will retrieve session token. 
				IFieldDetails.getParent().parent.getExtensionProvider().getGlobalContext().then(function(globalContext) {
					globalContext.getSessionToken().then(function(sessionToken)
					{
						var urltype;
						constants.sesToken = sessionToken;
						//Following code will retrieve configuration properties. 
						globalContext.getExtensionContext('OpenInterview').then(function(extensionContext) {
							extensionContext.getProperties(['startURL','resumeURL','processName','hostURL']).then(function(collection) {
								constants.startURL = collection.get('startURL').value;
								constants.resumeURL = collection.get('resumeURL').value;
								//constants.processName = collection.get('processName').value;
								constants.processName = policyModel;
								constants.hostURL = collection.get('hostURL').value;
								console.log("policyModel:"+policyModel);
								//Following code will prepare payload for checking existing checkpoint.
								var params = { method: 'GetInterviewStatus',session_id: constants.sesToken, policy_model:constants.processName,incident_id:constants.recordId };
								console.log(params);
								var browserControlArray = workspaceRecord.getAllBrowserControls(); //Dev :  created to find existing BC and set it.
								console.log("?browserControlArray="+browserControlArray[0]);
								
								//Following code will retrive data related to checkpoint.
								$.ajax({
									url : constants.hostURL,
									type: "POST",
									data : params,
									success: function(data, textStatus, jqXHR)
									{
										try {
											var resp = JSON.parse(data);
											$('div.overlay').removeClass('show');
											$('div.spanner').removeClass('show');
											if(resp["count"] > 0 ){
											//constants.workspaceRecord.triggerNamedEvent('ResumeURL');
											//location.window.open(constants.resumeURL+constants.recordId)
												//location.href=constants.resumeURL+constants.recordId;
												console.log("Value policy inside:"+policyModel);
												urltype = constants.resumeURL;
												setControlURL(urltype);
											//myIframe.src = constants.resumeURL+constants.recordId;
											} else {
												//constants.workspaceRecord.triggerNamedEvent('StartURL');
													//location.href=constants.startURL+constants.recordId;
												//myIframe.src =constants.startURL+constants.recordId;
												console.log("Value policy inside:"+policyModel);
												urltype = constants.startURL;
												setControlURL(urltype);
											}
										} catch (e) {
											showError(data);
										}
										$($('#'+window.frameElement.id,window.parent.document).parent().parent()).css('min-height','100%');
										//ORACLE_SERVICE_CLOUD.extensionResizeHandler.resize();
									},
									error: function (jqXHR, textStatus, errorThrown)
									{
										//showError("<p>"+constants.errorMsg+"</p>");
										console.log(errorThrown);
									}
								});

								function setControlURL(urltype)
								{
									console.log("?browserControlArray="+browserControlArray[0]);
									console.log("?initID="+constants.recordId);
									browserControlArray[0].setUrl(urltype+policyModel+"?initID="+constants.recordId);//Dev :  created to find existing BC and set it.
									console.log("inside setControlURL"+urltype+policyModel+"?initID="+constants.recordId);
								}

							});
						});
					});
				});
		
			});
		}); // Closing of new field 
	});
			}
		});
	
	});
});


//This will show error in case if any error happens.
//Param: msg- Error Message
function showError(msg){
	$('#warning-msg').show();
	$('#warning-msg').html(msg);
	$('div.overlay').removeClass('show');
	$('div.spanner').removeClass('show');
}

//This function will reload the page on save.
function refreshWindow(workspaceRecordEventParameter){
	workspaceRecord.executeEditorCommand('Refresh', function(workspaceRecord){ console.log("Refresh");});
}
