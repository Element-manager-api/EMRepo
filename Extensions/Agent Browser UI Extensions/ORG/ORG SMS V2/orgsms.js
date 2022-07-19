var appName = "ORG SMS V2";
var appVersion = "1.0"
var _extProvider;




var _extProvider, _globalContext, _wsRecord, session="", constants, cid, smsData={}, accountId, displayStringSMS='',displayStringEMAIL='',displayStringSMSData ='',displayStringEMAILData= '', mainFlow, myModalWin,interfaceurl='',id_number='', popup_title='',first_name='',last_name='';
var recordID, recordType;
var serverProps = [
    "Apply_RTL",
	"hostURL",
	"oicURL",
	"trigger_event",
	"mendatory_param_message",
	"loaded_event",
	"show_extn_button",
	"Date_Comparision_Error",
	"Mobile_Number_Empty_Error",
	"EMAIL_ADDRESS_INVALID_ERROR",
	"EMAIL_ADDRESS_NULL_ERROR",
	"MOBILE_OR_EMAIL_EMPTY_ERROR",
	"Separator_For_AreaCode_and_Phone",
	"Msg_Wrong_Format_Error",
	"Msg_Number_Of_Digits_Error",
	"Msg_Wrong_Area_Code_Error",
	"Sent_Date_Label",
	"SMS_Text_Label",
	"Sent_Time_Label",
	"ID_Label",
	"Sending_System_Label",
	"Activity_Number_Label",
	"Cellular_Number_Label",
	"Status_Label",
	"Email_Sent_date_Label",
	"Mail_Title_Label",
	"Email_Sent_Tile_Label",
	"Message_Content_Label",
	"No_data_Found",
	"Mobile_Phone_Number_Of_Digits",
	"Mobile_Phone_Area_Zones",
	"Mobile_Label",
	"SMS_Content_Label",
	"Email_Status_Label"
]


const urlParams = new URLSearchParams(window.location.search);
const param_x = urlParams.get('param_x');
console.log(param_x);



if(typeof param_x =='undefined' || param_x == null)mainFlow=true;
else mainFlow = false;

 

if(mainFlow){
	$(document).ready(function(){
	document.getElementById('emailButton').style.display='';
	//document.getElementById('closeButton').style.display='none';
	document.getElementById('LoadingData').style.display='none';
	
	});
	
	ORACLE_SERVICE_CLOUD.extension_loader.load(appName, appVersion).then(function (extensionProvider) {
        _extProvider = extensionProvider;
});




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
						//Contact Scenerios Contact 360. First phase will have only Lead/Incident Worskapce implemented.
						workspaceRecord.getFieldValues(['Contact.c_id', 'Contact.CO$id_number', 'Contact.Name.First', 'Contact.Name.Last']).then(function(IFieldDetails)
						{	
							cid 			= IFieldDetails.getField('Contact.c_id').getValue();
							id_number       = IFieldDetails.getField('Contact.CO$id_number').getValue();
							first_name       = IFieldDetails.getField('Contact.Name.First').getValue();
							last_name       = IFieldDetails.getField('Contact.Name.Last').getValue();
							$(document).ready(function(){

						console.log(id_number);
						if(id_number != ''){
											document.getElementById('id_number_value').value = id_number;
											document.getElementById('id_number_value_e').value = id_number;
											popup_title+=id_number+' '+first_name+' '+last_name;
											
										}
							})
						
									
						});
					}
									
					
					if(recordType == "Incident"){
						workspaceRecord.getFieldValues(['Incident.CId']).then(function(IFieldDetails)
						{								
							cid 			= IFieldDetails.getField('Incident.CId').getValue();
						
						});
					}
					
					
					
					
					
					resizeExtension();
					
					
					
                });
            });
        });
    });


}
  
if(!mainFlow){
	$(document).ready(function(){
	document.getElementById('emailButton').style.display='none';
	//document.getElementById('closeButton').style.display='';
	document.getElementById('LoadingData').style.display='';

	});
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
					if(constants.show_extn_button){
						var buttonorgsms_button = document.getElementById("orgsms_button");
						buttonorgsms_button.style.display='';
					}
					*/
					if(recordType == "Contact"){
						//Contact Scenerios Contact 360. First phase will have only Lead/Incident Worskapce implemented.
						workspaceRecord.getFieldValues(['Contact.c_id', 'Contact.CO$id_number', 'Contact.Name.First', 'Contact.Name.Last']).then(function(IFieldDetails)
						{	
							cid 			= IFieldDetails.getField('Contact.c_id').getValue();
							id_number       = IFieldDetails.getField('Contact.CO$id_number').getValue();
							first_name       = IFieldDetails.getField('Contact.Name.First').getValue();
							last_name       = IFieldDetails.getField('Contact.Name.Last').getValue();
							$(document).ready(function(){

						console.log(id_number);
						if(id_number != ''){
											document.getElementById('id_number_value').value = id_number;
											document.getElementById('id_number_value_e').value = id_number;
											popup_title+=id_number+' '+first_name+' '+last_name;
											
										}
							})
						
							initSMSEMAILPane('initmode');			
						});
					}
									
					
					if(recordType == "Incident"){
						workspaceRecord.getFieldValues(['Incident.CId']).then(function(IFieldDetails)
						{								
							cid 			= IFieldDetails.getField('Incident.CId').getValue();
							//inc_id 			= IFieldDetails.getField('Incident.IId').getValue();3
							initSMSEMAILPane('initmode');
						});
					}
					
					
	extensionProvider.registerUserInterfaceExtension(function(IUserInterfaceContext)
		{
		IUserInterfaceContext.getModalWindowContext().then(function(IModalWindowContext)
			{
			IModalWindowContext.getCurrentModalWindow().then(function(IModalWindow)
				{
				 myModalWin = IModalWindow;
				 console.log(myModalWin);
				// Perform some operations on IModalWindow.
				});
			});
		});
					//workspaceRecord.addNamedEventListener(constants.trigger_event,initSMSEMAIL);
					
					//workspaceRecord.addRecordSavedListener(recordSavedFunction);
                });
            });
        });
    });
	
	
	
	

	

}
function ValidateEmail(mail) 
{
 if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
  {
    return (true)
  }
   
    return (false)
}

function validateNumber(phoneNumber, requiredPhoneLength, areaCodes, type) {
    var result = {
        pass: true,
        msg: ""
    }
    if (!phoneNumber || !areaCodes || !requiredPhoneLength) {
        return result;
    }

    var validCodes = areaCodes.split(",");
    var areaCodeRange = getAreaCodeRange(validCodes);
    if (phoneNumber.split(constants.Separator_For_AreaCode_and_Phone).length > 1) {
        var regexPattern = "^(\\d*)" + constants.Separator_For_AreaCode_and_Phone + "(\\d*)$";
        if (!(new RegExp(regexPattern).test(phoneNumber))) {
            result = {
                pass: false,
                msg: constants.Msg_Wrong_Format_Error.replace("[TYPE]", type).replace("[NUMBER]", requiredPhoneLength)
            }
            return result;
        }
        var givenCode = phoneNumber.split(constants.Separator_For_AreaCode_and_Phone)[0];
        var givenLength = phoneNumber.split(constants.Separator_For_AreaCode_and_Phone)[1].length;
        if (givenLength != requiredPhoneLength) {
            result = {
                pass: false,
                msg: constants.Msg_Number_Of_Digits_Error.replace("[NUMBER]", requiredPhoneLength).replace("[TYPE]", type)
            }
        } else {
            var regexPattern = "^(\\d{" + areaCodeRange + "})" + constants.Separator_For_AreaCode_and_Phone + "(\\d{" + requiredPhoneLength + "})$";
            if (new RegExp(regexPattern).test(phoneNumber)) {
                /* for (var i = 0; i < validCodes.length; i++) {
                    validCodes[i] = validCodes[i].trim();
                } */
                if (!inArray(givenCode, validCodes)) {
                    result = {
                        pass: false,
                        msg: constants.Msg_Wrong_Area_Code_Error.replace("[TYPE]", type)
                    }
                }
            } else {
                result = {
                    pass: false,
                    msg: constants.Msg_Wrong_Format_Error.replace("[TYPE]", type).replace("[NUMBER]", requiredPhoneLength)
                }
            }
        }
        return result;
    } else {
        var regexPattern = "^(\\d{" + areaCodeRange + "})(\\d{" + requiredPhoneLength + "})$";
        if (new RegExp(regexPattern).test(phoneNumber)) {
            phoneNumber = addSeparator(phoneNumber, type);
            console.log(phoneNumber);
            var givenCode = phoneNumber.split(constants.Separator_For_AreaCode_and_Phone)[0];
            var givenLength = phoneNumber.split(constants.Separator_For_AreaCode_and_Phone)[1].length;
            if (givenLength != requiredPhoneLength) {
                result = {
                    pass: false,
                    msg: constants.Msg_Number_Of_Digits_Error.replace("[NUMBER]", requiredPhoneLength).replace("[TYPE]", type)
                }
            } else {
                var regexPattern = "^(\\d{" + areaCodeRange + "})" + constants.Separator_For_AreaCode_and_Phone + "(\\d{" + requiredPhoneLength + "})$";
                if (new RegExp(regexPattern).test(phoneNumber)) {
                    /* for (var i = 0; i < validCodes.length; i++) {
                        validCodes[i] = validCodes[i].trim();
                    } */
                    if (!inArray(givenCode, validCodes)) {
                        result = {
                            pass: false,
                            msg: constants.Msg_Wrong_Area_Code_Error.replace("[TYPE]", type)
                        }
                    }
                } else {
                    result = {
                        pass: false,
                        msg: constants.Msg_Wrong_Format_Error.replace("[TYPE]", type).replace("[NUMBER]", requiredPhoneLength)
                    }
                }
            }
        } else {
            result = {
                pass: false,
                msg: constants.Msg_Wrong_Format_Error.replace("[TYPE]", type).replace("[NUMBER]", requiredPhoneLength)
            }
        }
        return result;
    }
    return result;
}



function doSearch(stype){
	var formData = {mendatory_param_message:constants.mendatory_param_message,oicURL:constants.oicURL, contact:cid, psk:session, dtype:stype};
	if(stype == 'SMS'){
	var dateStart = document.getElementById("datefrom_sms").value;
	var dateend = document.getElementById("dateto_sms").value;
     
		var dateStartArray = dateStart.split("/");
		var dateendArray = dateend.split("/");
	
	
	var dateStartComp = new Date(dateStartArray[2], dateStartArray[1], dateStartArray[0], 0,0,0);
	var dateEndComp = new Date(dateendArray[2], dateendArray[1], dateendArray[0], 0,0,0);

	
	console.log(dateStartComp);
	console.log(dateEndComp);
	if(dateStartComp > dateEndComp){
		alert(constants.Date_Comparision_Error);
		return false;
	}
	
	// Do logic for Duration. Small and bigger date etc. @TODO
	var mobile_number = document.getElementById("mobile_number").value;
	
	var checkedtype = (document.getElementById('mobilenumber_s').checked)?'mobilenumber_s':'idnumber_s';
	
	
	console.log(checkedtype);
	
	if(checkedtype == 'mobilenumber_s'){
		
			if(mobile_number!=""){
	
				var validatedRes = validateNumber(mobile_number, constants.Mobile_Phone_Number_Of_Digits, constants.Mobile_Phone_Area_Zones, constants.Mobile_Label);
				if(!validatedRes.pass){
					alert(validatedRes.msg);
					document.getElementById("mobile_number").focus();
					return false;
				}
			}else{
				alert(constants.Mobile_Number_Empty_Error);
				document.getElementById("mobile_number").focus();
				return false;
			}
		//initSMSEMAILPane('searchmode');
		//return false;	
	}else{
		initSMSEMAILPane('searchmode');
		return false;
	}
	
	
/*	
	if(mobile_number!=""){
	
		var validatedRes = validateNumber(mobile_number, constants.Mobile_Phone_Number_Of_Digits, constants.Mobile_Phone_Area_Zones, constants.Mobile_Label);
			if(!validatedRes.pass){
				alert(validatedRes.msg);
				document.getElementById("mobile_number").focus();
				return false;
			}
	}else{
		
				initSMSEMAILPane('searchmode');
				//alert(constants.Mobile_Number_Empty_Error);
				//document.getElementById("mobile_number").focus();
				return false;
	}
	
	*/
	
	
	if(dateStart !=''){
		formData['DateFrom'] = dateStart;
	}
	
	if(dateend !=''){
		formData['DateTo'] = dateend;
	}
	formData['mobile_number'] = mobile_number;
	
	$('#smsesdata').html('<img src="/euf/assets/images/extension/loading-circle.gif" alt="loading..." />');
	
	}else if(stype == 'EMAIL'){
		var emaildatefrom = document.getElementById("datefrom_email").value;
		var emaildateto = document.getElementById("dateto_email").value;
		
		
		var dateStartArray = emaildatefrom.split("/");
		var dateendArray = emaildateto.split("/");
	
	
	var dateStartComp = new Date(dateStartArray[2], dateStartArray[1], dateStartArray[0], 0,0,0);
	var dateEndComp = new Date(dateendArray[2], dateendArray[1], dateendArray[0], 0,0,0);

	
	console.log(dateStartComp);
	console.log(dateEndComp);
	if(dateStartComp > dateEndComp){
	alert(constants.Date_Comparision_Error);
		return false;
	}
		var email_data = document.getElementById("email_data").value;
		
		
		
		
			var checkedtype_e = (document.getElementById('emailaddress_e').checked)?'emailaddress_e':'idnumber_e';
	
	
	console.log(checkedtype_e);
	
	if(checkedtype_e == 'emailaddress_e'){
			if(email_data !=""){
				if(!ValidateEmail(email_data)){ 
					alert(constants.EMAIL_ADDRESS_INVALID_ERROR);
					document.getElementById("email_data").focus();
					return false;
				}
			}else{
						alert(constants.EMAIL_ADDRESS_NULL_ERROR);
						document.getElementById("email_data").focus();
						//initSMSEMAILPane('searchmode');
						return false;
			}


		//initSMSEMAILPane('searchmode');
		//return false;	
	}else{
		initSMSEMAILPane('searchmode');
		return false;
	}
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
	

	
	if(emaildatefrom !=''){
		formData['DateFrom'] = emaildatefrom;
	}
	
	if(emaildateto !=''){
		formData['DateTo'] = emaildateto;
	}
	formData['email_data'] = email_data;
		$('#emaildata').html('<img src="/euf/assets/images/extension/loading-circle.gif" alt="loading..." />');
	}
	console.log(formData);
	
	
	if(mobile_number !='' || email_data !=''){
		
		
				console.log(formData);

		//Load the data
	//console.log(constants);
		if(cid > 0 && session!=''){ // Lead/Incident Edit case
				
			console.log(formData);
				var ajaxUrl = interfaceurl+constants.hostURL;	
				console.log(ajaxUrl);
					$.ajax({
					  type : "POST",
					  dataType: "json",
					  data: formData,
					  url : ajaxUrl,
					  // Disable caching of AJAX responses
					  cache: false,
					  error: function (jqXHR, exception) {
						var msg = 'ORG SMS V2: Error Accessing OSC Server - communication failed with status = ' + jqXHR.status 
						//console.log('Error Accessing OSC Server .\n' + jqXHR.responseText);
						_wsRecord.triggerNamedEvent(constants.loaded_event);
						alert(msg);
					  }
					}).done(
					  function(jsonData) {
					
						console.log(jsonData);
						// We got the responseText
						
						
						 
		  								
						displayStringSMSData ='';
						displayStringEMAILData= '';
						if(jsonData.API_ERROR !=''){
							_wsRecord.triggerNamedEvent(constants.loaded_event);
							alert(jsonData.API_ERROR); // This will be a MODEL POPUP
							return Promise.resolve();
						}else if(typeof jsonData.API_RESPONSE != 'undefined' && jsonData.API_RESPONSE !=''){
							// Check if API has real responses
							if(typeof jsonData.API_RESPONSE.AllCustomerMessagesResponse != 'undefined'){
								if(typeof jsonData.API_RESPONSE.AllCustomerMessagesResponse.Response != 'undefined'){
									if(typeof jsonData.API_RESPONSE.AllCustomerMessagesResponse.Response.CustomerData != 'undefined'){
										var messagesData=jsonData.API_RESPONSE.AllCustomerMessagesResponse.Response.CustomerData;
									for(var ii=0; ii < messagesData.length; ii++){
										
										if(stype =="SMS" && messagesData[ii].SMS !=""){
										
										
											displayStringSMSData+= '<tr class="">';
											var dateNew='';
											var datetime='';
												if(messagesData[ii].Date!=""){
											 dateNew = new Date(messagesData[ii].Date);
											console.log(dateNew);
											var dd = String(dateNew.getDate()).padStart(2, '0');
											var mm = String(dateNew.getMonth() + 1).padStart(2, '0'); //January is 0!
											var yyyy = dateNew.getFullYear();
											var seconds = String(dateNew.getSeconds()).padStart(2, '0');
											var minutes = String(dateNew.getMinutes()).padStart(2, '0');
											var hour = String(dateNew.getHours()).padStart(2, '0');
											
											 dateNew = dd + '/' + mm + '/' + yyyy;
											 datetime = hour+':'+minutes+':'+seconds;
											
												}
											displayStringSMSData+= '<td>'+ dateNew +'</td>';
											//displayStringSMSData+= '<td>'+ messagesData[ii].SMS.substring(0, 5) +'</td>';
											displayStringSMSData+= '<td>'+ datetime +'</td>';
											displayStringSMSData+= '<td>'+ messagesData[ii].IDNumber +'</td>';
											displayStringSMSData+= '<td>'+ messagesData[ii].Initiating_System +'</td>';
											displayStringSMSData+= '<td>'+ messagesData[ii].CHNumber +'</td>';
											displayStringSMSData+= '<td>'+ messagesData[ii].Mobile +'</td>';
											
											displayStringSMSData+= '<td>'+messagesData[ii].SMS+'</td>';
											
											displayStringSMSData+= '<td>'+ messagesData[ii].Status_Desc +'</td>';
											displayStringSMSData+= '</tr>';
										
										}else if(stype =="EMAIL" && messagesData[ii].EMail_Subject !=""){
												
													displayStringEMAILData+= '<tr class="">';
											
											
											
											var dateNew='';
											var datetime='';
												if(messagesData[ii].Date!=""){
											 dateNew = new Date(messagesData[ii].Date);
											console.log(dateNew);
											var dd = String(dateNew.getDate()).padStart(2, '0');
											var mm = String(dateNew.getMonth() + 1).padStart(2, '0'); //January is 0!
											var yyyy = dateNew.getFullYear();
											var seconds = String(dateNew.getSeconds()).padStart(2, '0');
											var minutes = String(dateNew.getMinutes()).padStart(2, '0');
											var hour = String(dateNew.getHours()).padStart(2, '0');
											
											 dateNew = dd + '/' + mm + '/' + yyyy;
											 datetime = hour+':'+minutes+':'+seconds;
											
												}
											displayStringEMAILData+= '<td>'+ dateNew +'</td>';
											displayStringEMAILData+= '<td>'+ datetime +'</td>';
											displayStringEMAILData+= '<td>'+ messagesData[ii].EMail_Subject +'</td>';
											displayStringEMAILData+= '<td>'+ messagesData[ii].Initiating_System +'</td>';
											
											displayStringEMAILData+= '<td>'+ messagesData[ii].Status_Desc +'</td>';
											displayStringEMAILData+= '<td>'+ messagesData[ii].EMail_Body +'</td>';
											displayStringEMAILData+= '</tr>';
											
										}
										
										
										//var subStr = str1.substring(0, 5);
										//smsData[ii]=messagesData[ii];
										
										
									}
									
									console.log(messagesData);
									}else{
										if(typeof jsonData.API_RESPONSE.AllCustomerMessagesResponse.Response.ERROR_DESC != 'undefined'){
											if(jsonData.API_RESPONSE.AllCustomerMessagesResponse.Response.ERROR_DESC != ''){
												alert(jsonData.API_RESPONSE.AllCustomerMessagesResponse.Response.ERROR_DESC);
											}
										}
									}
									
								
									
									
									
								}
							}
							
						}
						



										if(stype =="SMS"){
													displayStringSMS = '<table class="table"><thead class="table-light sticky-header">';
													 displayStringSMS+= '<tr>';
													 displayStringSMS+= '<th class="text-nowrap">'+constants.Sent_Date_Label+'</th>';
													 //displayStringSMS+= '<th style="width:150px;">'+constants.SMS_Text_Label+'</th>';
													 displayStringSMS+= '<th class="text-nowrap">'+constants.Sent_Time_Label+'</th>';
													 displayStringSMS+= '<th >'+constants.ID_Label+'</th>';
													 displayStringSMS+= '<th class="text-nowrap">'+constants.Sending_System_Label+'</th>';
													 displayStringSMS+= '<th class="text-nowrap">'+constants.Activity_Number_Label+'</th>';
													 displayStringSMS+= '<th class="text-nowrap">'+constants.Cellular_Number_Label+'</th>';  
													 displayStringSMS+= '<th class="text-nowrap">'+constants.SMS_Content_Label+'</th>';
													 displayStringSMS+= '<th class="text-nowrap">'+constants.Status_Label+'</th>';
													 displayStringSMS+= '</tr></thead><tbody>';
													 
											if(displayStringSMSData == ''){
											displayStringSMSData+= '<tr class="">';
											displayStringSMSData+= '<td colspan="8">'+constants.No_data_Found+'</td>';
									
											displayStringSMSData+= '</tr>';							
											}
										displayStringSMS+= displayStringSMSData+'</tbody></table>';
										$('#smsesdata').html(displayStringSMS);
										}else if(stype =="EMAIL"){
													displayStringEMAIL = '<table class="table"><thead class="table-light sticky-header">';
													 displayStringEMAIL+= '<tr>';
													 displayStringEMAIL+= '<th class="text-nowrap">'+constants.Email_Sent_date_Label+'</th>';
													 displayStringEMAIL+= '<th class="text-nowrap">'+constants.Email_Sent_Tile_Label+'</th>';
													 displayStringEMAIL+= '<th class="text-nowrap">'+constants.Mail_Title_Label+'</th>';
													 displayStringEMAIL+= '<th class="text-nowrap">'+constants.Sending_System_Label+'</th>';
													 
													 displayStringEMAIL+= '<th class="text-nowrap">'+constants.Email_Status_Label+'</th>';
													 displayStringEMAIL+= '<th class="text-nowrap">'+constants.Message_Content_Label+'</th>';
											
													 displayStringEMAIL+= '</tr></thead><tbody>';
						 
											if(displayStringEMAILData == ''){
												displayStringEMAILData+= '<tr class="">';
												displayStringEMAILData+= '<td colspan="6">'+constants.No_data_Found+'</td>';
										
												displayStringEMAILData+= '</tr>';							
												}
											 displayStringEMAIL+= displayStringEMAILData+'</tbody></table>';
											 $('#emaildata').html(displayStringEMAIL);
										}
						

						 
						

						
						
						
						                   
						
						
						
						

						
						

					
						 
						
						

				
					
						
						
						
				
			
						//renderDialog(displayString);
				
				
				
						return Promise.resolve();
						
					});
			
			
			
		}else{// New Lead/Incident
		_wsRecord.triggerNamedEvent(constants.loaded_event);
			
		}
		
		
	}else{
		alert(constants.MOBILE_OR_EMAIL_EMPTY_ERROR);
	}
	
	
	
	
}

/*  
**This will be loaded once WS data is loaded successfully.
**wsParam - WS Parameter call back reference.
*/
function initSMSEMAILPane(whichMode) {
	
	//console.log(DatatypeRequest);
	//if(DatatypeRequest == 'SMS'){
		// Need to get SMS Data
	//	var formData = {DateFrom:"28.01.2021",DateTo:"01.12.2021",mendatory_param_message:constants.mendatory_param_message,oicURL:constants.oicURL, contact:cid, psk:session, dtype:DatatypeRequest};
		
	//}else(DatatypeRequest == 'EMAIL'){
		// Email Data
		//const d = new Date();
		//var dateToday = new Date().toISOString().slice(0, 10);
		//var dateFrom = 
		
		
		if(whichMode == 'initmode'){
			var formData = {mendatory_param_message:constants.mendatory_param_message,oicURL:constants.oicURL, contact:cid, psk:session, dtype:"all"};
		}else if(whichMode == 'searchmode'){
			
			
			
			
			var dateStart = document.getElementById("datefrom_sms").value;
			var dateend = document.getElementById("dateto_sms").value;
			 
				var dateStartArray = dateStart.split("/");
				var dateendArray = dateend.split("/");
			
			
			var dateStartComp = new Date(dateStartArray[2], dateStartArray[1], dateStartArray[0], 0,0,0);
			var dateEndComp = new Date(dateendArray[2], dateendArray[1], dateendArray[0], 0,0,0);

			
			console.log(dateStartComp);
			console.log(dateEndComp);
			if(dateStartComp > dateEndComp){
				alert(constants.Date_Comparision_Error);
				return false;
			}
			
			
			
			$('#smsesdata').html('<img src="/euf/assets/images/extension/loading-circle.gif" alt="loading..." />');
			$('#emaildata').html('<img src="/euf/assets/images/extension/loading-circle.gif" alt="loading..." />');
			
			
			
			var formData = {mendatory_param_message:constants.mendatory_param_message,oicURL:constants.oicURL, contact:cid, psk:session, dtype:"all"};
				if(dateStart !=''){
					formData['DateFrom'] = dateStart;
				}
	
			if(dateend !=''){
				formData['DateTo'] = dateend;
			}
		}
		
	//}
		
		console.log(formData);

		//Load the data
	//console.log(constants);
		if(cid > 0 && session!=''){ // Lead/Incident Edit case
			//var ajaxUrl = interfaceurl + "/php/custom/hafaka_middleware.php?psk=" + session + "&incident=" + iid + "&accountId=" + accountId + "&apifunction=get_hafaka_data";
			
			console.log(formData);
				var ajaxUrl = interfaceurl+constants.hostURL;	
				console.log(ajaxUrl);
					$.ajax({
					  type : "POST",
					  dataType: "json",
					  data: formData,
					  url : ajaxUrl,
					  // Disable caching of AJAX responses
					  cache: false,
					  error: function (jqXHR, exception) {
						var msg = 'ORG SMS V2: Error Accessing OSC Server - communication failed with status = ' + jqXHR.status 
						//console.log('Error Accessing OSC Server .\n' + jqXHR.responseText);
						_wsRecord.triggerNamedEvent(constants.loaded_event);
						// Set the ID number field
						
						
						
						alert(msg);
					  }
					}).done(
					  function(jsonData) {
					
						console.log(jsonData);
						// We got the responseText
						
						// Set the ID number field
						
						 
		  								
						displayStringSMSData ='';
						displayStringEMAILData= '';
						if(jsonData.API_ERROR !=''){
							_wsRecord.triggerNamedEvent(constants.loaded_event);
							alert(jsonData.API_ERROR); // This will be a MODEL POPUP
							return Promise.resolve();
						}else if(typeof jsonData.API_RESPONSE != 'undefined' && jsonData.API_RESPONSE !=''){
							// Check if API has real responses
							if(typeof jsonData.API_RESPONSE.AllCustomerMessagesResponse != 'undefined'){
								if(typeof jsonData.API_RESPONSE.AllCustomerMessagesResponse.Response != 'undefined'){
									if(typeof jsonData.API_RESPONSE.AllCustomerMessagesResponse.Response.CustomerData != 'undefined'){
										var messagesData=jsonData.API_RESPONSE.AllCustomerMessagesResponse.Response.CustomerData;
									for(var ii=0; ii < messagesData.length; ii++){
										
										if(messagesData[ii].SMS !=""){
											displayStringSMSData+= '<tr class="">';
											var dateNew='';
											var datetime='';
												if(messagesData[ii].Date!=""){
											 dateNew = new Date(messagesData[ii].Date);
											console.log(dateNew);
											var dd = String(dateNew.getDate()).padStart(2, '0');
											var mm = String(dateNew.getMonth() + 1).padStart(2, '0'); //January is 0!
											var yyyy = dateNew.getFullYear();
											var seconds = String(dateNew.getSeconds()).padStart(2, '0');
											var minutes = String(dateNew.getMinutes()).padStart(2, '0');
											var hour = String(dateNew.getHours()).padStart(2, '0');
											
											 dateNew = dd + '/' + mm + '/' + yyyy;
											 datetime = hour+':'+minutes+':'+seconds;
											
												}
											displayStringSMSData+= '<td>'+ dateNew +'</td>';
											//displayStringSMSData+= '<td><span  id="main_sms_'+recordType+'_'+recordID+'_'+ii+'">'+ messagesData[ii].SMS.substring(0, 5) +'</span><span style="display:none;" id="sms_'+recordType+'_'+recordID+'_'+ii+'">'+messagesData[ii].SMS+'</span>&nbsp;<a class="fa-minus-circle" style="font-size:18px;" id= "anchor_plus_'+recordType+'_'+recordID+'_'+ii+'" href="javascript:ShowThisSMS(\''+recordType+'_'+recordID+'_'+ii+'\');">+</a></td>';
											displayStringSMSData+= '<td>'+ datetime +'</td>';
											displayStringSMSData+= '<td>'+ messagesData[ii].IDNumber +'</td>';
											displayStringSMSData+= '<td>'+ messagesData[ii].Initiating_System +'</td>';
											displayStringSMSData+= '<td>'+ messagesData[ii].CHNumber +'</td>';
											displayStringSMSData+= '<td>'+ messagesData[ii].Mobile +'</td>';
											displayStringSMSData+= '<td>'+ messagesData[ii].SMS +'</td>';
											displayStringSMSData+= '<td>'+ messagesData[ii].Status_Desc +'</td>';
											displayStringSMSData+= '</tr>';
								
											
											
										}else if(messagesData[ii].EMail_Subject !=""){
											displayStringEMAILData+= '<tr class="">';
											
											
											
											var dateNew='';
											var datetime='';
												if(messagesData[ii].Date!=""){
											 dateNew = new Date(messagesData[ii].Date);
											console.log(dateNew);
											var dd = String(dateNew.getDate()).padStart(2, '0');
											var mm = String(dateNew.getMonth() + 1).padStart(2, '0'); //January is 0!
											var yyyy = dateNew.getFullYear();
											var seconds = String(dateNew.getSeconds()).padStart(2, '0');
											var minutes = String(dateNew.getMinutes()).padStart(2, '0');
											var hour = String(dateNew.getHours()).padStart(2, '0');
											
											 dateNew = dd + '/' + mm + '/' + yyyy;
											 datetime = hour+':'+minutes+':'+seconds;
											
												}
											displayStringEMAILData+= '<td>'+ dateNew +'</td>';
											displayStringEMAILData+= '<td>'+ datetime +'</td>';
											displayStringEMAILData+= '<td>'+ messagesData[ii].EMail_Subject +'</td>';
											displayStringEMAILData+= '<td>'+ messagesData[ii].Initiating_System +'</td>';
											
											displayStringEMAILData+= '<td>'+ messagesData[ii].Status_Desc +'</td>';
											displayStringEMAILData+= '<td>'+ messagesData[ii].EMail_Body +'</td>';
											displayStringEMAILData+= '</tr>';
										}
										
										
										//var subStr = str1.substring(0, 5);
										//smsData[ii]=messagesData[ii];
										
										
									}
									
									console.log(messagesData);
									}else{
										if(typeof jsonData.API_RESPONSE.AllCustomerMessagesResponse.Response.ERROR_DESC != 'undefined'){
											if(jsonData.API_RESPONSE.AllCustomerMessagesResponse.Response.ERROR_DESC != ''){
												alert(jsonData.API_RESPONSE.AllCustomerMessagesResponse.Response.ERROR_DESC);
											}
										}
									}
									
								
									
									
									
								}
							}
							
						}
						

					
						 displayStringSMS = '<table class="table"><thead class="table-light sticky-header">';
						 displayStringSMS+= '<tr>';
						  displayStringSMS+= '<th class="text-nowrap">'+constants.Sent_Date_Label+'</th>';
													// displayStringSMS+= '<th style="width:150px;">'+constants.SMS_Text_Label+'</th>';
													 displayStringSMS+= '<th class="text-nowrap">'+constants.Sent_Time_Label+'</th>';
													 displayStringSMS+= '<th >'+constants.ID_Label+'</th>';
													 displayStringSMS+= '<th class="text-nowrap">'+constants.Sending_System_Label+'</th>';
													 displayStringSMS+= '<th class="text-nowrap">'+constants.Activity_Number_Label+'</th>';
													 displayStringSMS+= '<th class="text-nowrap">'+constants.Cellular_Number_Label+'</th>'; 
													 displayStringSMS+= '<th class="text-nowrap">'+constants.SMS_Content_Label+'</th>'; 
													 displayStringSMS+= '<th class="text-nowrap">'+constants.Status_Label+'</th>';
						 displayStringSMS+= '</tr></thead><tbody>';
						 
													 displayStringEMAIL = '<table class="table"><thead class="table-light sticky-header">';
													 displayStringEMAIL+= '<tr>';
													 displayStringEMAIL+= '<th class="text-nowrap">'+constants.Email_Sent_date_Label+'</th>'; 
													 displayStringEMAIL+= '<th class="text-nowrap">'+constants.Email_Sent_Tile_Label+'</th>';
													 displayStringEMAIL+= '<th class="text-nowrap">'+constants.Mail_Title_Label+'</th>';
													 displayStringEMAIL+= '<th class="text-nowrap">'+constants.Sending_System_Label+'</th>';
													
													 displayStringEMAIL+= '<th class="text-nowrap">'+constants.Email_Status_Label+'</th>';
													 displayStringEMAIL+= '<th class="text-nowrap">'+constants.Message_Content_Label+'</th>';
				
						 displayStringEMAIL+= '</tr></thead><tbody>';
						 
				
						
						
						
						                   
						
						
						
						
						if(displayStringSMSData == ''){
											displayStringSMSData+= '<tr class="">';
											displayStringSMSData+= '<td colspan="8">'+constants.No_data_Found+'</td>';
								
											displayStringSMSData+= '</tr>';							
						}
						
						if(displayStringEMAILData == ''){
											displayStringEMAILData+= '<tr class="">';
											displayStringEMAILData+= '<td colspan="6">'+constants.No_data_Found+'</td>';
									
											displayStringEMAILData+= '</tr>';							
						}
					
						 displayStringSMS+= displayStringSMSData+'</tbody></table>';
						 displayStringEMAIL+= displayStringEMAILData+'</tbody></table>';
						
				console.log(displayStringSMS);console.log(displayStringEMAIL);
			
						//renderDialog(displayString);
				$('#smsesdata').html(displayStringSMS);
				$('#emaildata').html(displayStringEMAIL);
				
						return Promise.resolve();
						
					});
			
			
			
		}else{// New Lead/Incident
		_wsRecord.triggerNamedEvent(constants.loaded_event);
			
		}
	
	
	
	
	
					
				
					
		
			
			return Promise.resolve();
			
			
			//console.log(contactInteraction);		
			


}
function ShowThisSMS(idofspan){
	console.log(idofspan);

	if(document.getElementById('main_sms_'+idofspan).style.display=='none'){
		document.getElementById('main_sms_'+idofspan).style.display='';
		document.getElementById('sms_'+idofspan).style.display='none';
		document.getElementById('anchor_plus_'+idofspan).innerHTML='+';
	}else{
		document.getElementById('main_sms_'+idofspan).style.display='none';
		document.getElementById('sms_'+idofspan).style.display='';
		document.getElementById('anchor_plus_'+idofspan).innerHTML='-';
	}
	
	

	
	
}
function renderDialogSMSEM() {
	
	
	    _extProvider.registerUserInterfaceExtension(function (uiContext) {
        uiContext.getModalWindowContext().then(function (IModalWindowContext) {
			
            var modalWindow = IModalWindowContext.createModalWindow();
			
			if(popup_title!=''){
				modalWindow.setTitle(popup_title);
			}else{
				modalWindow.setTitle("SMS");
			}
			
            modalWindowID = modalWindow.getId();
            modalWindow.setContentUrl("init.html?param_x=orgsms");
			modalWindow.setClosable(true);
            modalWindow.setWidth(Math.round(window.parent.innerWidth*0.9)+"px");
            modalWindow.setHeight(Math.round(window.parent.innerHeight*0.85)+"px");
			
			 //modalWindow.render();
			// $( "<style> .oj-dialog { display: none; }</style>" ).appendTo( window.parent.$('head') );
			 
			 //window.parent.$('style').css('display','block'); 
			 
			 myModalWin = modalWindow;

			
			
			
			console.log(modalWindowID);	
			
			//modalWindowID = modalWindow.getId();
			
			myModalWin.render();
			
			
			
		
			
        });
    });
	
	/*
            myModalWin.render().then(function(renderedWindow)
			{
				
			 
			 // setTimeout(function(){ $('.oj-dialog',window.parent.document).parent().css('right',-1592);
			  // }, 5);
			  //setTimeout(function(){
			//  $('.oj-dialog',window.parent.document).parent().css('display','block!important'); }, 15);
			  
			// console.log(renderedWindow);
			 
			 //$('#Messages').html(contentRender);
			// setTimeout(function(){ $('.oj-dialog',window.parent.document).parent().animate({right: -1}); }, 100);
			});
			*/
}

function closeDialogSMSEM(){
	$('#ExtensibilityModalWindowViewModel_layer .oj-dialog',window.parent.document).parent().animate({right: -1592});
	console.log(myModalWin);
	setTimeout(function(){ myModalWin.close(); }, 500);
			
}

								function resizeExtension() {
						
									var minWidth = 80;
									var minHeight = 80;
									
									ORACLE_SERVICE_CLOUD.extensionResizeHandler.resize(minWidth,minHeight);
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

function inArray(needle, haystack) {
    var length = haystack.length;
    for (var i = 0; i < length; i++) {
        if (haystack[i].trim() == needle) return true;
    }
    return false;
}
function getAreaCodeRange(array) {
    var min = Math.min.apply(Math, array.map(function (str) { return str.trim().length; }));
    var max = Math.max.apply(Math, array.map(function (str) { return str.trim().length; }));
    return min + "," + max;
}
function addSeparator(phoneNumber, type) {
    if (phoneNumber && phoneNumber.split("-").length == 1) {
        phoneNumber = phoneNumber.substr(0, phoneNumber.length - 7) + "-" + phoneNumber.substr(phoneNumber.length - 7);
        document.getElementById('mobile_number').value= phoneNumber;
        return phoneNumber;
    } else {
        return phoneNumber;
    }
}