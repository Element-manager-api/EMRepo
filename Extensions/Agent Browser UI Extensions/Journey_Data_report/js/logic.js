var paneFrameId = null, paneFrame = null;
var ieFlag = window.ActiveXObject || "ActiveXObject" in window;
var appName = "Journey_Data_report";
var serverProperties = [
    "hostURL",
	"oicURL"
	
];
var assetelm_id;
var modalWindow;
var poilcy_number;
var constants, rightPane, _extensionProvider, gContext, sessionToken, restUrl, interfaceurl ,incID, incType = "", catID;
var extensionProvider_n;
ORACLE_SERVICE_CLOUD.extension_loader.load(appName)
.then(function(extensionProvider)
	{ extensionProvider_n = extensionProvider;
		
		extensionProvider.getGlobalContext().then(function (globalContext) {
           // clearLocalStorage();
            //globalContext.addLoggingOutEventListener(clearLocalStorage);
            gContext = globalContext;
            initializeConstants(globalContext).then(function () {
                
                gContext.getSessionToken().then(function (session) {
                    sessionToken = session;
					interfaceurl = globalContext.getInterfaceUrl();
					
						extensionProvider.registerWorkspaceExtension(function(workspaceRecord)
										{
										   workspaceRecord_ex = workspaceRecord;
											 
									workspaceRecord.addExtensionLoadedListener(load_external_data).prefetchWorkspaceFields(["Incident.IID" , "Incident.DispId"]);		
						
							 })		
					
                    
                });
            });
        });
		
		

	});

function load_external_data(workspaceRecordEventParameter)
	{
	//alert(Incident_id);
	Incident_id = workspaceRecordEventParameter.event.fields["Incident.IID"];
	Disposition = workspaceRecordEventParameter.event.fields["Incident.DispId"];
	//alert(Incident_id);
	//psk:sessionToken,doc_id:doc_id,Incident_id:Incident_id
	if(Incident_id!=''){
	
	
				var formData = {psk:sessionToken,Incident_id:Incident_id,requestfor:'journey_data' };
									console.log(formData);
				       var ajaxUrl = interfaceurl + "/php/custom/journey_data.php";
            	
																
										//Empty UL element's innerHTML before you get indications and update the UI
										$.ajax({
											type: "POST",
											async: false,
											url: ajaxUrl, 			
											dataType: "json", 
											data:formData,
											success: function (data) {
												console.log('journey_data');
												console.log(data);
												
												var res_middleware  = data['success'];
												
												if(res_middleware){
														var OIC_response = data['OIC_response'];
												
														var re_message = OIC_response.GetJourneyStepsStatusResponse.Response.MESSAGE
														
														var data_rows = OIC_response.GetJourneyStepsStatusResponse.Response.RESPONSE;
													
													
														
														var tabel_html = '<table cellpadding="0" cellspacing="0" width="98%">'+
																			  '<thead>'+
																				'<tr>'+
																				'<th width="15%">שם קמפיין</th>'+
																				'<th width="10%">סוג פעולה</th>'+
																				 '<th width="10%">פרטי קשר</th>'+
																				 '<th width="10%">סטטוס השליחה</th>'+
																				 '<th width="10%">תאריך שליחה</th>'+
																				 '<th width="10%">טופיק</th>'+
																				  '<th width="25%">מלל</th>'+ 
																				'</tr>'+
																			  '</thead>'+
																			  '<tbody>';
														if(re_message == 'Success'){
															$.each( data_rows, function( key, value ) {
																	value['CAMPAIGN_NAME'];
																	value['CHANNEL'];
																	value['CELL_PHONE'];
																	value['STATUS'];
																	value['STATUS_TIMESTAMP'];
																	value['TOPIC'];
																	value['SMS_TEXT'];
																	tabel_html = tabel_html +'<tr>'+
																	'<td>'+value['CAMPAIGN_NAME']+'</td>'+
																	 '<td>'+value['CHANNEL']+'</td>'+
																	 '<td>'+value['CELL_PHONE']+'</td>'+
																	  '<td>'+value['STATUS']+'</td>'+
																	   '<td>'+value['STATUS_TIMESTAMP']+'</td>'+
																	   '<td>'+value['TOPIC']+'</td>'+
																	  '<td>'+value['SMS_TEXT']+'</td>'+
																	   
																	'</tr>';
																	
																	
																	console.log(value);
														
																});
															
														}else{
															tabel_html = tabel_html + '<tr> <td colspan = "7" >'+re_message+'</td </tr>';
														}
					
				  
														
														
														
														//alert();
														tabel_html = tabel_html + '</tbody></table>';
														$('#df_mn_loader').hide();
														$('#data_reflection').html(tabel_html);
														
												}else{
													var res_msg = data['msg'];
													$('#df_mn_loader').hide();
													$('#data_reflection').html(res_msg);
												}
													
											},
											
											error: function (jqXHR, exception) {
												//Hide loading icon on success / error of AJAX call
												$('#indication-loading-icon').hide();
												var msg = '';
												if (jqXHR.status === 0) {
													msg = 'Not connect.\n Verify Network.';
												} else if (jqXHR.status == 404) {
													msg = 'Requested page not found. [404]';
												} else if (jqXHR.status == 500) {
													msg = 'Internal Server Error [500].';
												} else if (exception === 'parsererror') {
													msg = 'Can\'t fetch data.Please contact your Admin.';
												} else if (exception === 'timeout') {
													msg = 'Time out error.';
												} else if (exception === 'abort') {
													msg = 'Ajax request aborted.';
												} else {
													msg = 'Uncaught Error.\n' + jqXHR.responseText;
												}
												alert(msg);
												console.log(msg);
												//addNoIndicationsMessage(noIndicationsMessage.value);
												
												
											}
											
										});	
	
			}
	
	
    
	
	
	
	 

	// Custom implementation goes here.
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