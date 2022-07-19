var appId = "Hafaka_popup_report_BUI";
var appVersion = "1.0";
var constants, rightPane;
var _extensionProvider, globalContext, sessionToken, restUrl, interfaceurl ,incID, incType, catID, _wsRecord , Lead_reportId , StatusType , Status_for_view;
var hostURL , assetelm_id , oicURL , InctAssetElm_reportId , LeadAttribute_reportId , lead_attribute_filters , mendatory_param_message ;
var appVersion = "1.0";
var constants;
var parentFrameId = null, parentFrame = null;
var ieFlag = window.ActiveXObject || "ActiveXObject" in window;
var incidents_with_cat_change_handler = [];
var currentframe;
var accountId;


$(document).ready(function () {
	//alert( window.frameElement.id);
    loadExtension().then(function () {
		
        localStorage.setItem("HAFAKAPOPUPAnalytics__Pane_FrameId", window.frameElement.id);
		currentframe = window.frameElement.id;
        if (!parentFrameId) {
            parentFrameId = localStorage.getItem("HAFAKAPOPUPAnalytics_main");
			//alert( parentFrameId);
        }
        if (parentFrameId) {
            if (ieFlag) {
                parentFrame = window.parent.frames[parentFrameId];
            } else {
                parentFrame = window.parent.frames[parentFrameId].contentWindow;
            }
            console.log(parentFrame.constants);
            constants = parentFrame.constants;
			console.log(constants.hostURL);
			console.log(parentFrame.assetelm_id);
			hostURL = constants.hostURL;
			assetelm_id = parentFrame.assetelm_id;
			poilcy_number = parentFrame.poilcy_number;
			oicURL = constants.oicURL;
			incID = parentFrame.incID;
			Lead_reportId = constants.Lead_reportId;
			InctAssetElm_reportId = constants.InctAssetElm_reportId;
			LeadAttribute_reportId = constants.LeadAttribute_reportId;
			lead_attribute_filters = constants.lead_attribute_filters;
			mendatory_param_message = constants.mendatory_param_message;
			Status_for_view = constants.Status_for_view;
			
          //  setPhonesToShow();
           

          // $("#emailtab").attr("title", constants.email_tab_title );
		   
           getactioncode();
        }
    });


});

function getactioncode(){
	//alert(incID);
	
					var formData = {psk:sessionToken,assetelm_id:assetelm_id,poilcy_number:poilcy_number,oicURL:oicURL,incident:incID,Lead_reportId:Lead_reportId,requestfor:'get_action_code',Status_for_view:Status_for_view , mendatory_param_message:mendatory_param_message , accountId:accountId  };
									console.log(formData);
				       var ajaxUrl = interfaceurl + hostURL;
            	
																
										//Empty UL element's innerHTML before you get indications and update the UI
										$.ajax({
											type: "POST",
											async: false,
											url: ajaxUrl, 			
											dataType: "json", 
											data:formData,
											success: function (data) {
												if(data.show_action_code=='Yes'){
													if(data.API_ERROR !=''){
							
							
													var errordisplay = data.API_ERROR;
													
													/*if(data.API_RESPONSE.title){
														errordisplay+= ':'+data.API_RESPONSE.title;
													}
													if(data.API_RESPONSE.detail){
														errordisplay+= '\n\n'+data.API_RESPONSE.detail;
													}*/
													//alert(errordisplay); // This will be a MODEL POPUP
													errordisplay = '<p>'+errordisplay+'</p>';
													$(".hafakapop_loading").hide();
													$("#hafakapop_tb").html(errordisplay);
													$("#hafakapop_tb").show();
							
							
												}else if(data.API_RESPONSE !=''){
													
													if(data.API_RESPONSE.GetActionCodes_Response.ErrorMessage != ""){
														var errordisplay = data.API_RESPONSE.GetActionCodes_Response.ErrorMessage;
													
													/*if(data.API_RESPONSE.title){
														errordisplay+= ':'+data.API_RESPONSE.title;
													}
													if(data.API_RESPONSE.detail){
														errordisplay+= '\n\n'+data.API_RESPONSE.detail;
													}*/
													//alert(errordisplay); // This will be a MODEL POPUP
													errordisplay = '<p>'+errordisplay+'</p>';
													$(".hafakapop_loading").hide();
													$("#hafakapop_tb").html(errordisplay);
													$("#hafakapop_tb").show();
													}else{
														
														var action_codes;
												console.log(data);
												console.log(data.API_RESPONSE.GetActionCodes_Response.ActionCodes);
												
												
												action_codes = data.API_RESPONSE.GetActionCodes_Response.ActionCodes;
												var tabelhtml = '<table cellpadding="0" cellspacing="0" width="100%">'+
												                '<tr>'+	
																'<td>קוד</td>'+
																'<td>תיאור</td>'+
																
																'</tr>';
	

												var table_n_html = '';

												$.each( action_codes, function( key, value ) {
													console.log(key);
													console.log(value);
													table_n_html = table_n_html + '<tr>'+	
	
      
														'<td><span class="getlink" onclick="get_hafaka_link('+value['Code']+');">'+value['Code']+'</span></td>'+
														'<td>'+value['Desc']+'</td>'+

													'</tr>';
												
												});
												
												var tabel_final =   tabelhtml +table_n_html+'</table>';
												$("#hafakapop_tb").html(tabel_final);
												$(".hafakapop_loading").hide();
												$("#hafakapop_tb").show();
														
													}
													
													
												}
													
													
											}else if(data.show_action_code=='No'){
												get_hafaka_link(7);
											}
												
												//alert('Ajax response');
												//alert(incident_cur);
												
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
												//alert(msg);
												console.log(msg);
												$("#hafakapop_tb").html(msg);
												$(".hafakapop_loading").hide();
												$("#hafakapop_tb").show();
												//addNoIndicationsMessage(noIndicationsMessage.value);
											}
											
										});	
}
function get_hafaka_link(action_code){
	
	
	var selected_action_code = action_code;
	//alert(action_code);
	
	var formData = {psk:sessionToken,
	               assetelm_id:assetelm_id,
				   poilcy_number:poilcy_number,
				   oicURL:oicURL,
				   incident:incID,
				   Lead_reportId:Lead_reportId,
				   requestfor:'',
				   InctAssetElm_reportId:InctAssetElm_reportId,
				   LeadAttribute_reportId:LeadAttribute_reportId,
				   lead_attribute_filters:lead_attribute_filters,
				   mendatory_param_message:mendatory_param_message,
				   selected_action_code:selected_action_code,
				   accountId:accountId
				   };
				   
				   
									console.log(formData);
				       var ajaxUrl = interfaceurl + hostURL;
					   $(".getlink").addClass("disable");
            	
																
										//Empty UL element's innerHTML before you get indications and update the UI
										$.ajax({
											type: "POST",
											async: false,
											url: ajaxUrl, 			
											dataType: "json", 
											data:formData,
											success: function (data) {

												$(".hafakapop_loading").hide();
												if(data.API_ERROR !=''){
							
							
													var errordisplay = data.API_ERROR;
													
													/*if(data.API_RESPONSE.title){
														errordisplay+= ':'+data.API_RESPONSE.title;
													}
													if(data.API_RESPONSE.detail){
														errordisplay+= '\n\n'+data.API_RESPONSE.detail;
													}*/
													//alert(errordisplay); // This will be a MODEL POPUP
													$("#hafakapop_tb").html(errordisplay);
							
							
												}else if(data.API_RESPONSE !=''){
							
							
													  if(data.API_RESPONSE.HafakaPopUp_Response.IsSuccess && data.API_RESPONSE.HafakaPopUp_Response.Url !=""){
														   
														  window.open(data.API_RESPONSE.HafakaPopUp_Response.Url,"_blank");
														 
														  console.log(currentframe);
														  parentFrame.modalWindow.close();  
													  }else{
														  
														 //alert(data.API_RESPONSE.HafakaPopUp_Response.ErrorMessage);// This will be a MODEL POPUP 
														 $("#hafakapop_tb").html(data.API_RESPONSE.HafakaPopUp_Response.ErrorMessage);
													  }
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
function loadExtension() {
    return new Promise(function (resolve, reject) {
        ORACLE_SERVICE_CLOUD.extension_loader.load(appId, appVersion).then(function (extensionProvider) {
            _extensionProvider = extensionProvider;
            extensionProvider.getGlobalContext().then(function (gContext) {
                globalContext = gContext;
                globalContext.getSessionToken().then(function (session) {
                    sessionToken = session;
                    restUrl = globalContext.getInterfaceServiceUrl('Rest') + "/connect/latest/";
					interfaceurl = globalContext.getInterfaceUrl();
					accountId = globalContext.getAccountId();
                    _extensionProvider.registerWorkspaceExtension(function (workspaceRecord) {
                        _wsRecord = workspaceRecord;
						
                        workspaceRecord.getFieldValues(['Incident.CatId','Incident.Status.Id']).then(function (IFieldDetails) {
                            catID = IFieldDetails.getField('Incident.CatId').getValue();
							StatusType = IFieldDetails.getField('Incident.Status.Id').getValue();
							
                            console.log("catID is " + catID);
							console.log("StatusType is " + StatusType);
							
							
							
                            resolve();
                        });
                    });
                });
            });
        });
    });
}
