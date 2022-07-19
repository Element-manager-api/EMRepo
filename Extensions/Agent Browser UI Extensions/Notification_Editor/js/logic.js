var appId = "Notification_Editor_Pane_BUI";
var appVersion = "1.0";
var constants, rightPane;
var _extensionProvider, globalContext, sessionToken, restUrl, interfaceurl ,incID, incType, catID, _wsRecord , accountId;
var standardTextList = [], recipientsList = [], stdTextForCatList = [];
var parentFrameId = null, parentFrame = null;
var ieFlag = window.ActiveXObject || "ActiveXObject" in window;
var recipients = [], standardTextVal, freeTextVal;
var phonesToShow = [];
var additionalPhoneNumber = null, additionalPhoneAreaCode = null, allowNonContact = false;
var incidents_with_cat_change_handler = [];
var tab_to_open;

$(document).ready(function () {
	//alert( window.frameElement.id);
    loadExtension().then(function () {
        localStorage.setItem("Notification_Editor_Pane_FrameId", window.frameElement.id);
        if (!parentFrameId) {
            parentFrameId = localStorage.getItem("Notification_Editor_FrameId");
        }
        if (parentFrameId) {
            if (ieFlag) {
                parentFrame = window.parent.frames[parentFrameId];
            } else {
                parentFrame = window.parent.frames[parentFrameId].contentWindow;
            }
            console.log(parentFrame.constants);
            constants = parentFrame.constants;
          //  setPhonesToShow();
            incID = parentFrame.incID;
            incType = parentFrame.incType;
			console.log(parentFrame.tab_to_open);
			tab_to_open = parentFrame.tab_to_open;

           $("#emailtab").attr("title", constants.email_tab_title );
		   $("#smstab").attr("title", constants.SMS_tab_title );
		   $("#easytab").attr("title", constants.Easy_tab_title );
		   
		   $("#easytab").attr("title", constants.Easy_tab_title );
		    $("#related_doc_email").html(constants.Related_document_email_label);
			$(".recepients_lbl").html(constants.Recipients_Label);
			 $("#email_add_lbl").html(constants.Email_Address_Label);
			 $("#email_add_op1_lbl").html(constants.Email_Address_Label);
			 $("#email_add_op2_lbl").html(constants.Email_Address_Label);
			 $("#email_add_op3_lbl").html(constants.Email_Address_Label);
			 
			  $(".sbtn").html(constants.Submit_Button_Label);
			  $("#related_doc_sms").html(constants.Related_document_SMS_Label);
			  $("#phoneno_lbl").html(constants.Phone_number_Label);
			  $("#phoneno_op1_lbl").html(constants.Phone_number_Label);
			  $("#phoneno_op2_lbl").html(constants.Phone_number_Label);
			  $("#phoneno_op3_lbl").html(constants.Phone_number_Label);
			  
			  $("#tabes_hd1").html(constants.Easy_send_option_1_Label);
			  $("#tabes_hd2").html(constants.Easy_send_option_2_Label);
			  $("#tabes_hd3").html(constants.Easy_send_option_3_Label);
			  // $("#easy_send_hd1").html(constants.Easy_send_option_1_Label);
			  //$("#easy_send_hd2").html(constants.Easy_send_option_2_Label);
			  //$("#easy_send_hd3").html(constants.Easy_send_option_3_Label);
			  $(".easy_send_doc").html(constants.Easy_send_related_doc_Label);
			  $(".easy_send_by").html(constants.Send_by_Label);
			  
			  
			  
			  
			  
			  
			  
			  
			  
			  
			  
			  
			  
			 
			 
			
		   
		   
		   
		   
		   
		   
		   
		   
           // $("#standardTextsList option:first-child").text(constants.StandardText_Label);
           // $("#recepients legend").text(constants.Recipients_Label);
           // $("#recepients #selectAllNode").text(constants.Recipients_SelectAll_Label);
            //$("#recepients .refresh-icon").attr("title", constants.Refresh_Label);
            //processFreeTextBox();

            if (incType == "") {
                deactivatePane();
            }
         //   $("#refreshRecipients").on("click", function () {
           //     refreshRecipients();
           // });

getdocumentlist();



           /* refreshRecipients().then(function () {

                $("#selectAllNode").on("click", function () {
                    if ($(this).hasClass('select-all')) {
                        $(this).text(constants.Recipients_ClearAll_Label);
                        $(this).removeClass('select-all');
                        $(this).addClass('clear-all');
                        $("#recepients input[type='checkbox']").not(':disabled').prop('checked', true).trigger("change");
                    } else {
                        $(this).text(constants.Recipients_SelectAll_Label);
                        $(this).addClass('select-all');
                        $(this).removeClass('clear-all');
                        $("#recepients input[type='checkbox']").not(':disabled').prop('checked', false).trigger("change");
                    }
                });

                getStandardTextOptList().then(function () {
                    $("#standardTextsList").on("change", function () {
                        var selectedVal = $(this).val();
                        standardTextVal = selectedVal;
                        if (selectedVal == "") {
                            $(this).hasClass('select-empty') ? true : $(this).addClass('select-empty');
                            $('#freeTextBox').val("").trigger("keyup");
                            if (allowNonContact) {
                                if ($("#recepient_NonContact").prop("checked")) {
                                    $('#freeTextBox').attr('disabled', true);
                                }
                                else {
                                    $('#freeTextBox').attr('disabled', false);
                                }
                            }
                            else {
                                $('#freeTextBox').attr('disabled', false);
                                $('#freeTextBox').val("").trigger("keyup");
                            }
                            if (!constants.allow_free_text) {
                                $('#freeTextBoxDiv').hide();
                            }
                        } else {
                            $(this).hasClass('select-empty') ? $(this).removeClass('select-empty') : false;
                            $('#freeTextBox').attr('disabled', true);
                            $('#freeTextBox').val(getStandardTextOriginalVal(selectedVal)).trigger("keyup");
                            if (!constants.allow_free_text) {
                                $('#freeTextBoxDiv').show();
                            }
                        }
                        console.log(standardTextVal);
                    });

                    $("#freeTextBox").on("keyup", function () {
                        freeTextVal = $(this).val();
                        if (constants.allow_free_text && constants.allow_standard_text && $("#standardTextsList").val() == "") {
                            if (freeTextVal != "") {
                                $("#standardTextsList").attr("disabled", true);
                            } else {
                                $("#standardTextsList").attr("disabled", false);
                            }
                        }
                        console.log(freeTextVal);
                        countChar(this.id, this.nextElementSibling.id);
                        resizeTextArea(this);
                    });

                    if (localStorage.getItem("Notification_Editor_Incident_" + parentFrame.incID)) {
                        var info = JSON.parse(localStorage.getItem("Notification_Editor_Incident_" + parentFrame.incID));
                        console.log(info);
                        localStorage.removeItem("Notification_Editor_Incident_" + parentFrame.incID);
                        recipients = info.recipients;
                        standardTextVal = info.standardTextVal;
                        freeTextVal = info.freeTextVal;
                        if (info.recipients.length > 0) {
                            $("#recepients input[type='checkbox']").each(function () {
                                for (var i = 0; i < info.recipients.length; i++) {
                                    if (this.value == info.recipients[i]) {
                                        this.checked = true;
                                        if (this.className.indexOf("recepient_") > -1) {
                                            if ($("." + this.className + ":checkbox:checked").length == $("." + this.className + ":checkbox").length) {
                                                $("#" + this.className).prop("indeterminate", false);
                                                $("#" + this.className).prop("checked", true);
                                            } else if ($("." + this.className + ":checkbox:checked").length > 0) {
                                                $("#" + this.className).prop("indeterminate", true);
                                            } else {
                                                $("#" + this.className).prop("indeterminate", false);
                                                $("#" + this.className).prop("checked", false);
                                            }
                                        }
                                        return;
                                    }
                                }
                            });
                        }
                        $("#standardTextsList").val(info.standardTextVal ? info.standardTextVal : "").trigger("change");
                        if (info.standardTextVal) {
                            $('#freeTextBox').attr('disabled', true);
                            $('#freeTextBox').val(getStandardTextOriginalVal(info.standardTextVal));
                        } else {
                            $("#freeTextBox").val(info.freeTextVal ? info.freeTextVal : "").trigger('keyup');
                        }
                        if (info.nonContact) {
                            additionalPhoneAreaCode = info.nonContact_phoneAreaCode;
                            additionalPhoneNumber = info.nonContact_phoneNumber;
                            if (additionalPhoneNumber || additionalPhoneAreaCode) {
                                $("#recepient_NonContact").prop("checked", true).trigger("change");
                                additionalPhoneNumber ? $("#nonContact").val(additionalPhoneNumber) : $("#nonContact").val('');
                                additionalPhoneAreaCode ? $("#nonContact_areaCode").val(additionalPhoneAreaCode) : $("#nonContact_areaCode").val('');
                            }
                        }
                        if (info.expanded) expandPane();
                    }

                    if (!constants.allow_standard_text && !constants.allow_free_text) {
                        handleGenericError();
                    } else if (!constants.send_to_internal_customer && !constants.send_to_external_customer) {
                        handleGenericError();
                    } else {
                        $("#errorMsg").text("");
                    }
                }).catch(function () {
                    handleGenericError();
                });
            }); */
			checktab(1);
			$("#email_ajx").hide();
			$("#mn_loader").hide();
			$("#wrp_notification23").show();
			
			
			
        }
    });


});

function loadExtension() {
    return new Promise(function (resolve, reject) {
        ORACLE_SERVICE_CLOUD.extension_loader.load(appId, appVersion).then(function (extensionProvider) {
            _extensionProvider = extensionProvider;
            extensionProvider.getGlobalContext().then(function (gContext) {
                globalContext = gContext;
				accountId = globalContext.getAccountId();
                globalContext.getSessionToken().then(function (session) {
                    sessionToken = session;
					
                    restUrl = globalContext.getInterfaceServiceUrl('Rest') + "/connect/latest/";
					interfaceurl = globalContext.getInterfaceUrl();
                    _extensionProvider.registerWorkspaceExtension(function (workspaceRecord) {
                        _wsRecord = workspaceRecord;
						workspaceRecord.addNamedEventListener('easy_send_to_customer',open_notification_tab);
                        workspaceRecord.getFieldValues(['Incident.CatId']).then(function (IFieldDetails) {
                            catID = IFieldDetails.getField('Incident.CatId').getValue();
                            console.log("catID is " + catID);
							
                            resolve();
                        });
                    });
                });
            });
        });
    });
}

function open_notification_tab(){
	//rightPanelMenu_;
	//alert('heloo');
	
	
	parentFrame.rightPanelMenu_.expand();

	 parentFrame.rightPanelMenu_.render();
	 
	checktab(3);
			
	 		 
	

}

function getdocumentlist(){
	//alert(incID);
	
					var formData = {psk:sessionToken,Incident_id:incID,requestfor:'documentlist'  };
									console.log(formData);
				       var ajaxUrl = interfaceurl + "/php/custom/send_document.php";
            	
																
										//Empty UL element's innerHTML before you get indications and update the UI
										$.ajax({
											type: "POST",
											async: false,
											url: ajaxUrl, 			
											dataType: "json", 
											data:formData,
											success: function (data) {
												console.log(data);
												var incident_cur;
												var details_mail;
												var details_sms;
												var details_obj;
												
												incident_cur = data['incident_id'];
												details_mail = data['detailsemail'];
												details_sms = data['detailssms'];	
												details_easysend_op1 = data['easy_send_op1_doc'];
												details_easysend_op2 = data['easy_send_op2_doc'];
												details_easysend_op3 = data['easy_send_op3_doc'];
												
												
												
												

												//details_obj = JSON.parse(details);
												$.each( details_mail, function( key, value ) {
													
													//alert(value['documentname']);
													 $('#emaildocs').append($('<option/>', { 
															value: value['ID'],
															text : value['documentname'] 
														}));
												});
												
												$.each( details_sms, function( key2, value2 ) {
													//alert(value2['documentname']);
													 $('#smsdocs').append($('<option/>', { 
															value: value2['ID'],
															text : value2['documentname'] 
														}));
													
												});
												
												$.each( details_easysend_op2, function( key4, value4 ) {
													//alert(value2['documentname']);
													 $('#easy_send_op2_doc').append($('<option/>', { 
															value: value4['doc_id'],
															text : value4['label'] 
														}));
													
												});
												
												var easy_send_doc_op3 = "";
												$.each( details_easysend_op3, function( key5, value5 ) {
													//alert(value2['documentname']);
													 $('#easy_send_op3_doc').append($('<option/>', { 
															value: value5['doc_id'],
															text : value5['label'] 
														}));
														
												easy_send_doc_op3 =  easy_send_doc_op3 + '<div class="recepients_row">'+
													'<div class="fl recep_wr">'+
													'<label for="doc_list_3_'+value5["label"]+'">'+ value5["label"] + '</label><br>'+
														
													'</div>'+
													'<div class="fr chkbx_wr">'+
														 '<input  type="radio" name="easy_send_doc_op3" id="doc_list_3_'+value5["label"]+'" easy_send_type_doc="'+value5["easy_send_type_doc"]+'"  value="'+value5["doc_id"]+'">'+
													'</div>'+
													'<div class="clr">&nbsp;</div>'+
												'</div>';	
													
												});
												
												//easy_send_op3_doc_list
												$('#easy_send_op3_doc_list').html(easy_send_doc_op3);
												
												var easy_send_doc_op1='';
												$.each( details_easysend_op1, function( key3, value3 ) {
													//alert(value2['documentname']);
													
														
														
														easy_send_doc_op1 =  easy_send_doc_op1 + '<div class="recepients_row">'+
													'<div class="fl recep_wr">'+
													'<label for="doc_list'+value3["label"]+'">'+ value3["label"] + '</label><br>'+
														
													'</div>'+
													'<div class="fr chkbx_wr">'+
														 '<input type="checkbox" missing_document_id = '+value3["document_missing_id"]+' name="easy_send_doc_op1" id="doc_list'+value3["label"]+'" easy_send_type_doc="'+value3["easy_send_type_doc"]+'"  value="'+value3["doc_id"]+'">'+
													'</div>'+
													'<div class="clr">&nbsp;</div>'+
												'</div>';

													
												});
												$('#easy_send_op1_doc_list').html(easy_send_doc_op1);
												
												var easy_send_doc_op2_ty3 ='';
												var easy_send_doc_op2_ty2 ='';
												$.each( details_easysend_op2, function( keyi, valuei ) {
													//alert(value2['documentname']);
													
														if(valuei["easy_send_type_doc"]==3){
															easy_send_doc_op2_ty3 =  easy_send_doc_op2_ty3 + '<div class="recepients_row">'+
													'<div class="fl recep_wr">'+
													'<label for="doc_list'+valuei["label"]+'">'+ valuei["label"] + '</label><br>'+
														
													'</div>'+
													'<div class="fr chkbx_wr">'+
														 '<input type="checkbox" onchange="disable_type2()" name="easy_send_doc_op2_type3" id="doc_list'+valuei["label"]+'" easy_send_type_doc="'+valuei["easy_send_type_doc"]+'"   missing_document_id = "'+valuei["document_missing_id"]+'"  value="'+valuei["doc_id"]+'">'+
													'</div>'+
													'<div class="clr">&nbsp;</div>'+
												'</div>';	
														}
														
														if(valuei["easy_send_type_doc"]==2){
															easy_send_doc_op2_ty2 =  easy_send_doc_op2_ty2 + '<div class="recepients_row">'+
													'<div class="fl recep_wr">'+
													'<label for="doc_list'+valuei["label"]+'">'+ valuei["label"] + '</label><br>'+
														
													'</div>'+
													'<div class="fr chkbx_wr">'+
														 '<input onchange="disable_type3()" type="radio" name="easy_send_doc_op2_type2" id="doc_list'+valuei["label"]+'" easy_send_type_doc="'+valuei["easy_send_type_doc"]+'"  value="'+valuei["doc_id"]+'">'+
													'</div>'+
													'<div class="clr">&nbsp;</div>'+
												'</div>';	
														}
														
														

													
												});
												$('#easy_send_op2_doc_list_ty3').html(easy_send_doc_op2_ty3);
												$('#easy_send_op2_doc_list_ty2').html(easy_send_doc_op2_ty2);
												
												
												
												//easy_send_op2_doc_list_ty3
												
												
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
												alert(msg);
												console.log(msg);
												//addNoIndicationsMessage(noIndicationsMessage.value);
											}
											
										});	
}

function disable_type2(){
	var type3_doc_selected = false;
	$('input[name="easy_send_doc_op2_type3"]:checked').each(function() {
   
 
	type3_doc_selected = true;
	});
	if(type3_doc_selected){
		$('input[name="easy_send_doc_op2_type2"]').each(function(){
        $(this).attr('disabled', true);
	});	
	}else{
		$('input[name="easy_send_doc_op2_type2"]').each(function(){
        $(this).attr('disabled', false);
		});	
	}
	
}

function disable_type3(){
	var type2_doc_selected = false;
	$('input[name="easy_send_doc_op2_type2"]:checked').each(function() {
   
 
	type2_doc_selected = true;
	});
	if(type2_doc_selected){
		$('input[name="easy_send_doc_op2_type3"]').each(function(){
        $(this).attr('disabled', true);
	});	
	}else{
		$('input[name="easy_send_doc_op2_type3"]').each(function(){
        $(this).attr('disabled', false);
		});	
	}
	
}

function getemaildoc_id(email_doc){
	//Incident_id:incID
	var recipient_type = 'email';
	var doc_id = email_doc.value;
	var formData = {psk:sessionToken,doc_id:doc_id,Incident_id:incID,requestfor:'recipientlist' , recipientType:recipient_type  };
									console.log(formData);
				       var ajaxUrl = interfaceurl + "/php/custom/send_document.php";
            	
																
										
										$.ajax({
											type: "POST",
											async: false,
											url: ajaxUrl, 			
											dataType: "json", 
											data:formData,
											success: function (data) {
												console.log(data);
												var doc_cur;
												var recipient_details;
												
												doc_cur = data['doc_id'];
												recipient_details = data['recipient_details'];
												
												//alert(doc_cur);
											var recepient_list = '';
												$.each( recipient_details, function( key, value ) {
													recepient_list =  recepient_list + '<div class="recepients_row">'+
													'<div class="fl recep_wr">'+
													'<label for="email_list'+value["contact_id"]+'">'+ value["first_name"]  +' '+ value["last_name"]  +  '<br>'+ value["email"]  + '</label><br>'+
														
													'</div>'+
													'<div class="fr chkbx_wr">'+
														 '<input type="checkbox" id="email_list'+value["contact_id"]+'"  email_add = "'+value["email"]+'"  mobile="'+value["mobile"]+'" id_number="'+value["id_number"]+'" contact_id="'+value["contact_id"]+'" first_name="'+value["first_name"]+'" last_name="'+value["last_name"]+'" name="email_list" value="'+value["contact_id"]+'">'+
													'</div>'+
													'<div class="clr">&nbsp;</div>'+
												'</div>';
													
												
												});
												$("#recep_wrp").html(recepient_list);
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

function send_emaillist(){
	var recepientselected = false;
	var sendtype = 'email';
	var constant_mail;
	var doc_id = $('#emaildocs').val();
	if(!(doc_id)){
		alert('Please select document');
		return false;
	}
	var contact_list = [];
	$('input[name="constant_mail"]:checked').each(function() {
		//var cnt_mail = this.value;
		constant_mail = $('#mmail').val();
		if(constant_mail==""){
			alert("Please enter a constant mail");
			return false;
		}else{
			var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
			var validate = regex.test(constant_mail);
			if(!(validate)){
				alert("Please enter mail in correct format");
				return false;
			}
		} 
		recepientselected = true;
		
		});
	$('input[name="email_list"]:checked').each(function() {
   
   var contactid = this.value;
   var email_add = $(this).attr("email_add");
   var first_name = $(this).attr("first_name");
   var last_name = $(this).attr("last_name");
   var id_number = $(this).attr("id_number");
   var mobile = $(this).attr("mobile");
   contact_list.push({email_id: email_add, contact_id: contactid, first_name:first_name, last_name:last_name, id_number:id_number, mobile:mobile   });
//alert(email_add);
	recepientselected = true;
});

//console.log(contact_list);
 if(!(recepientselected)){
	 alert('Please select a recepient');
	 return false;
 }
$("#email_ajx").show();
var formData = {psk:sessionToken,doc_id:doc_id,Incident_id:incID,requestfor:'sendemail_oic' , senddetails:contact_list , constant_mail:constant_mail , sendtype:sendtype , accountId:accountId };
									console.log(formData);
				       var ajaxUrl = interfaceurl + "/php/custom/send_document.php";
												
																
										//Empty UL element's innerHTML before you get indications and update the UI
										$.ajax({
											type: "POST",
											async: false,
											url: ajaxUrl, 			
											dataType: "json", 
											data:formData,
											success: function (data) {
												console.log(data);
												$("#email_ajx").hide();
												if(data['isfailed']){
													alert('Error in sending document');
												}else{
													alert('Document send succefully to recepients');
												}
											},
											
											error: function (jqXHR, exception) {
												//Hide loading icon on success / error of AJAX call
												$("#email_ajx").hide();
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

function send_smslist(){
	var sendtype = 'SMS';
	var recepientselected = false;
	
	var constant_phone;
	var doc_id = $('#smsdocs').val();
	if(!(doc_id)){
		alert('Please select document');
		return false;
	}
	var contact_list = [];
	$('input[name="constant_phone"]:checked').each(function() {
		//var cnt_mail = this.value;
		constant_phone = $('#mphone').val();
		if(constant_phone==""){
			alert("Please enter a constant phone");
			return false;
		}
		recepientselected = true;
		
		});
	$('input[name="phone_list"]:checked').each(function() {
   
   var contactid = this.value;
   var email_add = $(this).attr("email_add");
   var first_name = $(this).attr("first_name");
   var last_name = $(this).attr("last_name");
   var id_number = $(this).attr("id_number");
   var mobile = $(this).attr("mobile");
   contact_list.push({email_id: email_add, contact_id: contactid, first_name:first_name, last_name:last_name, id_number:id_number, mobile:mobile });
//alert(email_add);
	recepientselected = true;
});

//console.log(contact_list);
 if(!(recepientselected)){
	 alert('Please select a recepient');
	 return false;
 }

var formData = {psk:sessionToken,doc_id:doc_id,Incident_id:incID,requestfor:'sendemail_oic' , senddetails:contact_list , constant_phone:constant_phone , sendtype:sendtype , accountId:accountId  };
									console.log(formData);
				       var ajaxUrl = interfaceurl + "/php/custom/send_document.php";
												
																
										//Empty UL element's innerHTML before you get indications and update the UI
										$.ajax({
											type: "POST",
											async: false,
											url: ajaxUrl, 			
											dataType: "json", 
											data:formData,
											success: function (data) {
												console.log(data);
												
												if(data['isfailed']){
													alert('Error in sending document');
												}else{
													alert('Document send succefully to recepients');
												}
												
											},
											
											error: function (jqXHR, exception) {
												//Hide loading icon on success / error of AJAX call
												$("#email_ajx").hide();
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


function getsmsdoc_id(sms_doc){
//alert(sms_doc.value);
var doc_id = sms_doc.value
	var formData = {psk:sessionToken,doc_id:doc_id,Incident_id:incID,requestfor:'recipientlist'  };
									console.log(formData);
				       var ajaxUrl = interfaceurl + "/php/custom/send_document.php";
            	
																
										
										$.ajax({
											type: "POST",
											async: false,
											url: ajaxUrl, 			
											dataType: "json", 
											data:formData,
											success: function (data) {
												console.log(data);
												var doc_cur;
												var recipient_details;
												
												doc_cur = data['doc_id'];
												recipient_details = data['recipient_details'];
												
												//alert(doc_cur);
											var recepient_list = '';
												$.each( recipient_details, function( key, value ) {
													recepient_list =  recepient_list + '<div class="recepients_row">'+
													'<div class="fl recep_wr">'+
													'<label for="phone_list'+value["contact_id"]+'">'+ value["first_name"]  +' '+ value["last_name"]  +  '<br>'+ value["mobile"]  + '</label><br>'+
														
													'</div>'+
													'<div class="fr chkbx_wr">'+
														 '<input type="checkbox" id="phone_list'+value["contact_id"]+'"  email_add = "'+value["email"]+'"  mobile="'+value["mobile"]+'" id_number="'+value["id_number"]+'" contact_id="'+value["contact_id"]+'" first_name="'+value["first_name"]+'" last_name="'+value["last_name"]+'" name="phone_list" value="'+value["contact_id"]+'">'+
													'</div>'+
													'<div class="clr">&nbsp;</div>'+
												'</div>';
													
												
												});
												$("#recep_phwrp").html(recepient_list);
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

function easy_send_op1_notification(that) {
	
var constant_phone = "";
var constant_mail = "";
	var docselected = false;
	var sendtype = 'easy_send_doc_op1';
	
	var send_by = $('#eaysend_by_op1').val();
	
	
	
	
var doc_list = [];
	$('input[name="easy_send_doc_op1"]:checked').each(function() {
   
   var doc_id = this.value;
   
   var easy_send_type_doc = $(this).attr("easy_send_type_doc");
    var missing_document_id = $(this).attr("missing_document_id");

   doc_list.push({doc_id: doc_id, easy_send_type_doc: easy_send_type_doc, sendtype:sendtype , missing_document_id:missing_document_id   });
//alert(email_add);
	docselected = true;
});

//console.log(contact_list);
 if(!(docselected)){
	 alert('Please select a document');
	 return false;
 }
 if(send_by==""){
		alert('Please select send by');
		return false;
	}
	
		var contact_list = [];
	var recepientselected = false; 
	$('input[name="easysend_op1_rec_list"]:checked').each(function() {
   
   var contactid = this.value;
   var email_add = $(this).attr("email_add");
   var first_name = $(this).attr("first_name");
   var last_name = $(this).attr("last_name");
   var id_number = $(this).attr("id_number");
   var mobile = $(this).attr("mobile");
   contact_list.push({email_id: email_add, contact_id: contactid, first_name:first_name, last_name:last_name, id_number:id_number, mobile:mobile });
//alert(email_add);
	recepientselected = true;
});

if(send_by=="sms"){
		var constant_ph_chk = false;
		$('input[name="constant_phone_op1"]:checked').each(function() {
			constant_ph_chk = true;
			var constant_phone_easy_send_op1 = "";
			constant_phone_easy_send_op1 = $('#mphone_easysend_op1').val();
			
			if(constant_phone_easy_send_op1 == ""){
				alert('enter value for constant phone');
				return false; 
			}else{
				recepientselected = true;
				constant_phone = constant_phone_easy_send_op1;
			}
			
		});
	}else{
		var constant_email_chk = false;
		var constant_email_easy_send_op1 = "";
		$('input[name="constant_op1_mail"]:checked').each(function() {
			constant_email_chk = true;
			
			constant_email_easy_send_op1 = $('#op1_mail').val();
			
			if(constant_email_easy_send_op1 == ""){
				alert('enter value for constant email');
				return false; 
			}else{
				recepientselected = true;
				constant_mail = constant_email_easy_send_op1;
			}
			
		});
		if(constant_email_easy_send_op1 == "" && constant_email_chk == true){
			return false;
		}
		
	}


//console.log(contact_list);
 if(!(recepientselected)){
	 alert('Please select a recepient');
	 return false;
 }
	//constant_phone_op1
	
$('#op1btn_loader').addClass('loader');
$(that).prop('disabled', true);
var formData = {psk:sessionToken,Incident_id:incID,requestfor:'easy_send_doc_op1' , sendtype:sendtype ,doc_list:doc_list, accountId:accountId , senddetails:contact_list ,constant_mail:constant_mail,constant_phone:constant_phone, SendBy:send_by   };
									console.log(formData);
				       var ajaxUrl = interfaceurl + "/php/custom/send_document.php";
												
																
										
										$.ajax({
											type: "POST",
											async: false,
											url: ajaxUrl, 			
											dataType: "json", 
											data:formData,
											success: function (data) {
												
												$('#op1btn_loader').removeClass('loader');
												$(that).prop('disabled',false);
												if(data['isfailed']){
													alert('Error in sending document');
												}else{
													alert('Document send succefully to recepients');
												}
											},
											
											error: function (jqXHR, exception) {
												//Hide loading icon on success / error of AJAX call
												$("#email_ajx").hide();
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

function show_sendby_op1(){
	
	var doc_id = $('#easy_send_op2_doc').val();
	if(doc_id!=""){
		console.log(doc_id);
		$('#send_by_op2_wrp').show();
		
	}else{
		$('#send_by_op2_wrp').hide();
	}
	
}
function show_sendby_op3(){
	var doc_id = $('#easy_send_op3_doc').val();
	if(doc_id!=""){
		console.log(doc_id);
		$('#send_by_op3_wrp').show();
		
	}else{
		$('#send_by_op3_wrp').hide();
	}
	
}
function get_easysend_op1_recipients(){
		var send_type = $('#eaysend_by_op1').val();
		var docselected = false;
		//var sendtype = 'easy_send_doc_op1';
		var doc_id;
		var doc_list = [];
			$('input[name="easy_send_doc_op1"]:checked').each(function() {
		   
			   doc_id = this.value;
			   
			   var easy_send_type_doc = $(this).attr("easy_send_type_doc");

			//   doc_list.push({doc_id: doc_id, easy_send_type_doc: easy_send_type_doc, sendtype:sendtype  });
			//alert(email_add);
			docselected = true;
			});

//console.log(contact_list);
 if(! send_type){
	 alert('Please select send type');
	 return false;
 }

 if(!(docselected)){
	 alert('Please select a document');
	 return false;
 }

  if(send_type=="email"){
	$('#easy_send_constant_mail_op1_wrp').show();
	$('#easy_send_constant_ph_op1_wrp').hide();	
  }else{
	$('#easy_send_constant_mail_op1_wrp').hide();
	$('#easy_send_constant_ph_op1_wrp').show();
  }
 
 
 
 
 
		var formData = {psk:sessionToken,doc_id:doc_id,Incident_id:incID,send_type:send_type ,requestfor:'recipientlist_easy_send_op2'  };
									console.log(formData);
				       var ajaxUrl = interfaceurl + "/php/custom/send_document.php";
            	
																
										
										$.ajax({
											type: "POST",
											async: false,
											url: ajaxUrl, 			
											dataType: "json", 
											data:formData,
											success: function (data) {
												console.log(data);
												var doc_cur;
												var recipient_details;
												
												doc_cur = data['doc_id'];
												recipient_details = data['recipient_details'];
												
												//alert(doc_cur);
											var recepient_list = '';
											if(send_type=="sms"){
												$.each( recipient_details, function( key, value ) {
													if(value["mobile"]!=""){
														recepient_list =  recepient_list + '<div class="recepients_row">'+
													'<div class="fl recep_wr">'+
													'<label for="easysend_op1_list'+value["contact_id"]+'">'+ value["first_name"]  +' '+ value["last_name"]  +  '<br>'+ value["mobile"]  + '</label><br>'+
														
													'</div>'+
													'<div class="fr chkbx_wr">'+
														 '<input type="checkbox" id="easysend_op1_list'+value["contact_id"]+'"  email_add = "'+value["email"]+'"  mobile="'+value["mobile"]+'" id_number="'+value["id_number"]+'" contact_id="'+value["contact_id"]+'" first_name="'+value["first_name"]+'" last_name="'+value["last_name"]+'" name="easysend_op1_rec_list" value="'+value["contact_id"]+'">'+
													'</div>'+
													'<div class="clr">&nbsp;</div>'+
												'</div>';
													}
													
													
												
												});
												
											}else if(send_type=="email"){
													$.each( recipient_details, function( key, value ) {
														if(value["email"]!=""){
																												recepient_list =  recepient_list + '<div class="recepients_row">'+
													'<div class="fl recep_wr">'+
													'<label for="easysend_op1_list'+value["contact_id"]+'">'+ value["first_name"]  +' '+ value["last_name"]  +  '<br>'+ value["email"]  + '</label><br>'+
														
													'</div>'+
													'<div class="fr chkbx_wr">'+
														 '<input type="checkbox" id="easysend_op1_list'+value["contact_id"]+'"  email_add = "'+value["email"]+'"  mobile="'+value["mobile"]+'" id_number="'+value["id_number"]+'" contact_id="'+value["contact_id"]+'" first_name="'+value["first_name"]+'" last_name="'+value["last_name"]+'" name="easysend_op1_rec_list" value="'+value["contact_id"]+'">'+
													'</div>'+
													'<div class="clr">&nbsp;</div>'+
												'</div>';
														}

													
												
												});
											}
												
												$("#recep_easysend_op1").html(recepient_list);
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



function get_easysend_op2_recipients(){
	var send_type = $('#eaysend_by_op2').val();
	//var doc_id = $('#easy_send_op2_doc').val();
	var doc_id;
	var docselected = false;
	$('input[name="easy_send_doc_op2_type3"]:checked').each(function() {
   
				doc_id = this.value;
			   
			   var easy_send_type_doc = $(this).attr("easy_send_type_doc");
			   docselected = true;
	
	});
	
	if( !(docselected)){
		$('input[name="easy_send_doc_op2_type2"]:checked').each(function() {
	   
					doc_id = this.value;
				   
				   var easy_send_type_doc = $(this).attr("easy_send_type_doc");
				   docselected = true;
		
		});
	}
	
	if( !(docselected)){
		alert('Please select a document');
		return false;
	}
	
	if(send_type==""){
		alert('Please select send by');
		return false;
	}
	
	if(send_type=="email"){
	$('#easy_send_constant_mail_op2_wrp').show();
	$('#easy_send_constant_ph_op2_wrp').hide();	
  }else{
	$('#easy_send_constant_mail_op2_wrp').hide();
	$('#easy_send_constant_ph_op2_wrp').show();
  }
	console.log(send_type);
	
	var formData = {psk:sessionToken,doc_id:doc_id,Incident_id:incID,send_type:send_type ,requestfor:'recipientlist_easy_send_op2'  };
									console.log(formData);
				       var ajaxUrl = interfaceurl + "/php/custom/send_document.php";
            	
																
										
										$.ajax({
											type: "POST",
											async: false,
											url: ajaxUrl, 			
											dataType: "json", 
											data:formData,
											success: function (data) {
												console.log(data);
												var doc_cur;
												var recipient_details;
												
												doc_cur = data['doc_id'];
												recipient_details = data['recipient_details'];
												
												//alert(doc_cur);
											var recepient_list = '';
											if(send_type=="sms"){
												$.each( recipient_details, function( key, value ) {
													if(value["mobile"]!=""){
														recepient_list =  recepient_list + '<div class="recepients_row">'+
													'<div class="fl recep_wr">'+
													'<label for="easysend_op2_list'+value["contact_id"]+'">'+ value["first_name"]  +' '+ value["last_name"]  +  '<br>'+ value["mobile"]  + '</label><br>'+
														
													'</div>'+
													'<div class="fr chkbx_wr">'+
														 '<input type="checkbox" id="easysend_op2_list'+value["contact_id"]+'"  email_add = "'+value["email"]+'"  mobile="'+value["mobile"]+'" id_number="'+value["id_number"]+'" contact_id="'+value["contact_id"]+'" first_name="'+value["first_name"]+'" last_name="'+value["last_name"]+'" name="easysend_op2_rec_list" value="'+value["contact_id"]+'">'+
													'</div>'+
													'<div class="clr">&nbsp;</div>'+
												'</div>';
													}
													
													
												
												});
												
											}else if(send_type=="email"){
													$.each( recipient_details, function( key, value ) {
														if(value["email"]!=""){
															recepient_list =  recepient_list + '<div class="recepients_row">'+
													'<div class="fl recep_wr">'+
													'<label for="easysend_op2_list'+value["contact_id"]+'">'+ value["first_name"]  +' '+ value["last_name"]  +  '<br>'+ value["email"]  + '</label><br>'+
														
													'</div>'+
													'<div class="fr chkbx_wr">'+
														 '<input type="checkbox" id="easysend_op2_list'+value["contact_id"]+'"  email_add = "'+value["email"]+'"  mobile="'+value["mobile"]+'" id_number="'+value["id_number"]+'" contact_id="'+value["contact_id"]+'" first_name="'+value["first_name"]+'" last_name="'+value["last_name"]+'" name="easysend_op2_rec_list" value="'+value["contact_id"]+'">'+
													'</div>'+
													'<div class="clr">&nbsp;</div>'+
												'</div>';
														}
													
													
												
												});
											}
												
												$("#recep_easysend_op2").html(recepient_list);
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

function get_easysend_op3_recipients(){
	var send_type = $('#eaysend_by_op3').val();
	var doc_id ;
	if(send_type==""){
		alert('Please select send by');
		return false;
	}
	var docselected = false;
	$('input[name="easy_send_doc_op3"]:checked').each(function() {
   
				doc_id = this.value;
			   
			   var easy_send_type_doc = $(this).attr("easy_send_type_doc");
			   docselected = true;
	
	});
	
	if(!docselected){
		alert('Please select document');
		return false;
	}
	console.log(send_type);
	
	if(send_type=="email"){
	$('#easy_send_constant_mail_op3_wrp').show();
	$('#easy_send_constant_ph_op3_wrp').hide();	
  }else{
	$('#easy_send_constant_mail_op3_wrp').hide();
	$('#easy_send_constant_ph_op3_wrp').show();
  }
	
	var formData = {psk:sessionToken,doc_id:doc_id,Incident_id:incID,send_type:send_type ,requestfor:'recipientlist_easy_send_op2'  };
									console.log(formData);
				       var ajaxUrl = interfaceurl + "/php/custom/send_document.php";
            	
																
										
										$.ajax({
											type: "POST",
											async: false,
											url: ajaxUrl, 			
											dataType: "json", 
											data:formData,
											success: function (data) {
												console.log(data);
												var doc_cur;
												var recipient_details;
												
												doc_cur = data['doc_id'];
												recipient_details = data['recipient_details'];
												
												//alert(doc_cur);
											var recepient_list = '';
											if(send_type=="sms"){
												$.each( recipient_details, function( key, value ) {
													if(value["mobile"]!=""){
														recepient_list =  recepient_list + '<div class="recepients_row">'+
													'<div class="fl recep_wr">'+
													'<label for="easysend_op3_list'+value["contact_id"]+'">'+ value["first_name"]  +' '+ value["last_name"]  +  '<br>'+ value["mobile"]  + '</label><br>'+
														
													'</div>'+
													'<div class="fr chkbx_wr">'+
														 '<input type="checkbox" id="easysend_op3_list'+value["contact_id"]+'"  email_add = "'+value["email"]+'"  mobile="'+value["mobile"]+'" id_number="'+value["id_number"]+'" contact_id="'+value["contact_id"]+'" first_name="'+value["first_name"]+'" last_name="'+value["last_name"]+'" name="easysend_op3_rec_list" value="'+value["contact_id"]+'">'+
													'</div>'+
													'<div class="clr">&nbsp;</div>'+
												'</div>';
													}
													
													
												
												});
												
											}else if(send_type=="email"){
													$.each( recipient_details, function( key, value ) {
														if(value["email"]!=""){
															recepient_list =  recepient_list + '<div class="recepients_row">'+
													'<div class="fl recep_wr">'+
													'<label for="easysend_op3_list'+value["contact_id"]+'">'+ value["first_name"]  +' '+ value["last_name"]  +  '<br>'+ value["email"]  + '</label><br>'+
														
													'</div>'+
													'<div class="fr chkbx_wr">'+
														 '<input type="checkbox" id="easysend_op3_list'+value["contact_id"]+'"  email_add = "'+value["email"]+'"  mobile="'+value["mobile"]+'" id_number="'+value["id_number"]+'" contact_id="'+value["contact_id"]+'" first_name="'+value["first_name"]+'" last_name="'+value["last_name"]+'" name="easysend_op3_rec_list" value="'+value["contact_id"]+'">'+
													'</div>'+
													'<div class="clr">&nbsp;</div>'+
												'</div>';
														}
													
													
												
												});
											}
												
												$("#recep_easysend_op3").html(recepient_list);
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

function easysend_op2_send(){
	var constant_phone = "";
var constant_mail = "";
	
	var send_type = $('#eaysend_by_op2').val();
	var doc_id = "";
	if(send_type==""){
		alert('Please select send by');
		return false;
	}
	
	var docselected = false;
	var sendtype = 'easy_send_doc_op2';
	var recepientselected = false;
	
	var doc_list = [];
	$('input[name="easy_send_doc_op2_type3"]:checked').each(function() {
   
		var doc_id = this.value;
		   
		var easy_send_type_doc = $(this).attr("easy_send_type_doc");
		var missing_document_id = $(this).attr("missing_document_id");

		   doc_list.push({doc_id: doc_id, easy_send_type_doc: easy_send_type_doc, sendtype:sendtype , missing_document_id:missing_document_id   });
		//alert(email_add);
	docselected = true;
	});
	
	if(!(docselected)){
		$('input[name="easy_send_doc_op2_type2"]:checked').each(function() {
   
		var doc_id = this.value;
		   
		var easy_send_type_doc = $(this).attr("easy_send_type_doc");
		var missing_document_id = '';

		   doc_list.push({doc_id: doc_id, easy_send_type_doc: easy_send_type_doc, sendtype:sendtype , missing_document_id:missing_document_id   });
		//alert(email_add);
	docselected = true;
	});
		
	}
	
	
	
	if(!(docselected)){
		alert('Please select document');
		return false;
	}
	var contact_list = [];
	
	$('input[name="easysend_op2_rec_list"]:checked').each(function() {
   
   var contactid = this.value;
   var email_add = $(this).attr("email_add");
   var first_name = $(this).attr("first_name");
   var last_name = $(this).attr("last_name");
   var id_number = $(this).attr("id_number");
   var mobile = $(this).attr("mobile");
   contact_list.push({email_id: email_add, contact_id: contactid, first_name:first_name, last_name:last_name, id_number:id_number, mobile:mobile });
//alert(email_add);
	recepientselected = true;
});
send_by = send_type;
if(send_by=="sms"){
		var constant_ph_chk = false;
		$('input[name="constant_phone_op2"]:checked').each(function() {
			constant_ph_chk = true;
			var constant_phone_easy_send_op2 = "";
			constant_phone_easy_send_op2 = $('#mphone_easysend_op2').val();
			
			if(constant_phone_easy_send_op2 == ""){
				alert('enter value for constant phone');
				return false; 
			}else{
				recepientselected = true;
				constant_phone = constant_phone_easy_send_op2;
			}
			
		});
	}else{
		var constant_email_chk = false;
		var constant_email_easy_send_op2 = "";
		$('input[name="constant_op2_mail"]:checked').each(function() {
			constant_email_chk = true;
			
			constant_email_easy_send_op2 = $('#op2_mail').val();
			
			if(constant_email_easy_send_op2 == ""){
				alert('enter value for constant email');
				return false; 
			}else{
				recepientselected = true;
				constant_mail = constant_email_easy_send_op2;
			}
			
		});
		if(constant_email_easy_send_op2 == "" && constant_email_chk == true){
			return false;
		}
		
	}



//console.log(contact_list);
 if(!(recepientselected)){
	 alert('Please select a recepient');
	 return false;
 }
                
var formData = {psk:sessionToken,Incident_id:incID,requestfor:'easy_send_doc_op1' , sendtype:sendtype ,doc_list:doc_list, accountId:accountId , senddetails:contact_list ,constant_mail:constant_mail,constant_phone:constant_phone, SendBy:send_by };
									console.log(formData);
				       var ajaxUrl = interfaceurl + "/php/custom/send_document.php";
												
																
										//Empty UL element's innerHTML before you get indications and update the UI
										$.ajax({
											type: "POST",
											async: false,
											url: ajaxUrl, 			
											dataType: "json", 
											data:formData,
											success: function (data) {
												console.log(data);
												
												if(data['isfailed']){
													alert('Error in sending document');
												}else{
													alert('Document send succefully to recepients');
												}
												
											},
											
											error: function (jqXHR, exception) {
												//Hide loading icon on success / error of AJAX call
												$("#email_ajx").hide();
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

function easysend_op3_send(){
	var constant_mail;
	var constant_phone;
	var send_by  = $('#eaysend_by_op3').val();
	var doc_id;
	
	var sendtype = 'easy_send_doc_op3';
	if(send_by ==""){
		alert('Please select send by');
		return false;
	}
	
	var docselected = false;
	var doc_list = [];
	$('input[name="easy_send_doc_op3"]:checked').each(function() {
   
				doc_id = this.value;
			   
			  
			   docselected = true;
			   var easy_send_type_doc = $(this).attr("easy_send_type_doc");
    var missing_document_id = $(this).attr("missing_document_id");

   doc_list.push({doc_id: doc_id, easy_send_type_doc: easy_send_type_doc, sendtype:sendtype , missing_document_id:missing_document_id   });
			   
	
	});
	
	if(!docselected){
		alert('Please select document');
		return false;
	}
	var recepientselected = false;
	var contact_list = [];
	
	$('input[name="easysend_op3_rec_list"]:checked').each(function() {
   
   var contactid = this.value;
   var email_add = $(this).attr("email_add");
   var first_name = $(this).attr("first_name");
   var last_name = $(this).attr("last_name");
   var id_number = $(this).attr("id_number");
   var mobile = $(this).attr("mobile");
   contact_list.push({email_id: email_add, contact_id: contactid, first_name:first_name, last_name:last_name, id_number:id_number, mobile:mobile });
//alert(email_add);
	recepientselected = true;
});



if(send_by=="sms"){
		var constant_ph_chk = false;
		$('input[name="constant_phone_op3"]:checked').each(function() {
			constant_ph_chk = true;
			var constant_phone_easy_send_op3 = "";
			constant_phone_easy_send_op3 = $('#mphone_easysend_op3').val();
			
			if(constant_phone_easy_send_op3 == ""){
				alert('enter value for constant phone');
				return false; 
			}else{
				recepientselected = true;
				constant_phone = constant_phone_easy_send_op3;
			}
			
		});
	}else{
		var constant_email_chk = false;
		var constant_email_easy_send_op3 = "";
		$('input[name="constant_op3_mail"]:checked').each(function() {
			constant_email_chk = true;
			
			constant_email_easy_send_op3 = $('#op3_mail').val();
			
			if(constant_email_easy_send_op3 == ""){
				alert('enter value for constant email');
				return false; 
			}else{
				recepientselected = true;
				constant_mail = constant_email_easy_send_op3;
			}
			
		});
		if(constant_email_easy_send_op3 == "" && constant_email_chk == true){
			return false;
		}
		
	}





//console.log(contact_list);
 if(!(recepientselected)){
	 alert('Please select a recepient');
	 return false;
 }
				//
var formData = { psk:sessionToken,Incident_id:incID,requestfor:'easy_send_doc_op1' , sendtype:sendtype ,doc_list:doc_list, accountId:accountId , senddetails:contact_list ,constant_mail:constant_mail,constant_phone:constant_phone, SendBy:send_by };
									console.log(formData);
				       var ajaxUrl = interfaceurl + "/php/custom/send_document.php";
												
																
										//Empty UL element's innerHTML before you get indications and update the UI
										$.ajax({
											type: "POST",
											async: false,
											url: ajaxUrl, 			
											dataType: "json", 
											data:formData,
											success: function (data) {
												console.log(data);
												
												if(data['isfailed']){
													alert('Error in sending document');
												}else{
													alert('Document send succefully to recepients');
												}
												
											},
											
											error: function (jqXHR, exception) {
												//Hide loading icon on success / error of AJAX call
												$("#email_ajx").hide();
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


function getRecipients() {
    return new Promise(function (resolve, reject) {
        var reportIDs = [];
        var filterName, payload;
        var promises = [];
        if (incType == "Incident" && constants.send_to_external_customer) {
            reportIDs = constants[incType + "_External_Reports_IDS"].split(",");
            filterName = constants[incType + "_External_Reports_FilterName"];
            for (var i = 0; i < reportIDs.length; i++) {
                payload = setReportPayload(reportIDs[i], filterName, incID);
                promises.push(getReportData(payload));
            }
            if (constants.send_to_internal_customer) {
                reportIDs = constants[incType + "_Internal_Reports_IDS"].split(",");
                filterName = constants[incType + "_Internal_Reports_FilterName"];
                for (var i = 0; i < reportIDs.length; i++) {
                    payload = setReportPayload(reportIDs[i], filterName, incID);
                    promises.push(getReportData(payload));
                }
            }
        }
        else if (constants.send_to_internal_customer) {
            reportIDs = constants[incType + "_Internal_Reports_IDS"].split(",");
            filterName = constants[incType + "_Internal_Reports_FilterName"];
            for (var i = 0; i < reportIDs.length; i++) {
                payload = setReportPayload(reportIDs[i], filterName, incID);
                promises.push(getReportData(payload));
            }
        }
        if (promises.length > 0) {
            Promise.all(promises).then(responses => {
                resolve(responses.map(response => setRecipientsList(response)));
            });
        } else {
            resolve();
        }
    }).catch(function (err) {
        console.log(err);
        resolve();
    });
}

function setRecipientsList(result) {
    if (result && result.count > 0) {
        var columns = result.columnNames;
        var nameIdx, relationIdx;
        for (var k = 0; k < columns.length; k++) {
            switch (columns[k]) {
                case 'c_relation': relationIdx = k; break;
                case 'c_name': nameIdx = k; break;
            }
        }
        var rows = result.rows;
        for (var j = 0; j < rows.length; j++) {
            var row = rows[j];
            var recipientInfo = {
                "name": "",
                "relation": "",
                "phones": []
            };
            for (var i = 0; i < row.length; i++) {
                if (i == nameIdx) {
                    recipientInfo["name"] = row[i];
                } else if (i == relationIdx) {
                    recipientInfo["relation"] = row[i];
                } else {
                    if (phonesToShow[columns[i]] && row[i]) {
                        recipientInfo["phones"].push({
                            "actualValue": row[i],
                            //"formattedValue": row[i].replace(/[- )(]/g, '')
                        });
                    }
                }
            }
            recipientsList.push(recipientInfo);
            console.log(recipientsList);
        }
    }
}

function refreshRecipients() {
    return new Promise(function (resolve, reject) {
        disableSubmitBtn('');
        $("#recepients #noRecipients").remove();
        $("#recepients .recipientItem").remove();
        recipientsList = [];
        if (incType == "Incident" && constants.allow_sending_to_noncontact_for_incident) {
            allowNonContact = true;
        }
        else if (incType == "Task" && constants.allow_sending_to_noncontact_for_task) {
            allowNonContact = true;
        }
		else if (incType == "Lead" && constants.allow_sending_to_noncontact_for_lead) {
            allowNonContact = true;
        }
        else {
            allowNonContact = false;
        }
        getRecipients().then(function () {
            if (recipientsList.length < 1) {
                $("#recepients").append('<div id="noRecipients">' + constants.Error_No_Recipients_found + '</div>');
                disableSubmitBtn(constants.Error_No_Recipients_found);
                $("#recepients #selectAllNode").addClass("disable-click");
                if (allowNonContact) {
                    var div = createNonContactHTML();
                    var list = "<ul id='recpientsUL'>";
                    var listItem = "<li>";
                    listItem += div + "</li>";
                    list += listItem;
                    list += "</ul>";
                    $("#recepients").append(list);
                    $("#recepients #selectAllNode").removeClass("disable-click");

                    $("#recepients input[type='checkbox']").on("change", function () {
                        if ($(this).hasClass('allowNonContact')) {
                            if (this.checked) {
                                enableNonContact();
                                disableFreeTextBox();
                            }
                            else {
                                disableNonContact();
                                enableFreeTextBox();
                            }
                        }
                    });
                    $("#nonContact").on("change", function () {
                        additionalPhoneNumber = $(this).val();
                        console.log("Phone number is " + additionalPhoneNumber);
                    });
                    $("#nonContact_areaCode").on("change", function () {
                        additionalPhoneAreaCode = $(this).val();
                        console.log("Area code is " + additionalPhoneAreaCode);
                    });

                    if (allowNonContact) {
                        if (additionalPhoneNumber || additionalPhoneAreaCode) {
                            $("#recepient_NonContact").prop("checked", true).trigger("change");
                            additionalPhoneNumber ? $("#nonContact").val(additionalPhoneNumber) : $("#nonContact").val('');
                            additionalPhoneAreaCode ? $("#nonContact_areaCode").val(additionalPhoneAreaCode) : $("#nonContact_areaCode").val('');
                        }
                        else {
                            $("#recepient_NonContact").prop("checked", false).trigger("change");
                        }
                    }

                    enableSubmitBtn();
                }
            } else {
                var list = "<ul id='recpientsUL'>";
                if (allowNonContact) {
                    var div = createNonContactHTML();
                    var listItem = "<li>";
                    listItem += div + "</li>";
                    list += listItem;
                }
                for (var x = 0; x < recipientsList.length; x++) {
                    var listItem = "<li>";
                    var name = recipientsList[x].name;
                    var escapedName = name.replace(/(['"])/g, "\\$1");
                    var relation = recipientsList[x].relation;
                    var phones = recipientsList[x].phones;
                    if (phones.length > 0) {
                        var recipientItem = "<div class='recipientItem'>" +
                            "<input type='checkbox' class='hasChildren' name='" + escapedName + "' id='recepient_" + x + "' value='" + escapedName + "' >" +
                            "<span class='caret fa fa-caret-down'></span>" +
                            "<label for='recepient_" + x + "'>" + name + " - " + relation + "</label>" +
                            "<ul class='nested'>";
                        for (var ctr = 0; ctr < phones.length; ctr++) {
                            var phone = phones[ctr].actualValue;
                            var formattedPhone = phones[ctr].actualValue;
                            //var formattedPhone = phones[ctr].formattedValue;
                            recipientItem += "<li><input type='checkbox' name='" + escapedName + "' class='recepient_" + x + "' id='recepient_" + x + "_" + ctr + "' value='" + escapedName + "|" + formattedPhone + "' >" + phone + "</li>";
                        }
                        recipientItem += "</ul>" + "</div>";
                    } else {
                        var recipientItem = "<div class='recipientItem'>" +
                            "<input type='checkbox' name='" + escapedName + "' id='recepient_" + x + "' value='' disabled >" +
                            "<label for='recepient_" + x + "'>" + name + " - " + relation + "</label>" +
                            "</div>";
                    }
                    listItem += recipientItem + "</li>";
                    list += listItem;
                }
                list += "</ul>";
                $("#recepients").append(list);

                $("#recepients .caret").on("click", function () {
                    this.parentElement.querySelector(".nested").classList.toggle("inactive");
                    if ($(this).hasClass('fa-caret-down')) {
                        $(this).removeClass('fa-caret-down');
                        $(this).addClass('fa-caret-left');
                    } else {
                        $(this).addClass('fa-caret-down');
                        $(this).removeClass('fa-caret-left');
                    }
                });

                $("#recepients input[type='checkbox']").each(function () {
                    for (var i = 0; i < recipients.length; i++) {
                        if (this.value == recipients[i]) {
                            this.checked = true;
                            if (this.className.indexOf("recepient_") > -1) {
                                if ($("." + this.className + ":checkbox:checked").length == $("." + this.className + ":checkbox").length) {
                                    $("#" + this.className).prop("indeterminate", false);
                                    $("#" + this.className).prop("checked", true);
                                } else if ($("." + this.className + ":checkbox:checked").length > 0) {
                                    $("#" + this.className).prop("indeterminate", true);
                                } else {
                                    $("#" + this.className).prop("indeterminate", false);
                                    $("#" + this.className).prop("checked", false);
                                }
                            }
                            return;
                        }
                    }
                });

                $("#recepients input[type='checkbox']").on("change", function () {
                    if ($(this).hasClass('hasChildren')) {
                        if (this.checked) {
                            $("." + this.id).prop("checked", true).trigger("change");
                        } else {
                            $("." + this.id).prop("checked", false).trigger("change");
                        }
                    }
                    else if ($(this).hasClass('allowNonContact')) {
                        if (this.checked) {
                            enableNonContact();
                            disableFreeTextBox();
                        }
                        else {
                            disableNonContact();
                            enableFreeTextBox();
                        }
                    }
                    else {
                        if (this.className.indexOf("recepient_") > -1) {
                            if ($("." + this.className + ":checkbox:checked").length == $("." + this.className + ":checkbox").length) {
                                $("#" + this.className).prop("indeterminate", false);
                                $("#" + this.className).prop("checked", true);
                            } else if ($("." + this.className + ":checkbox:checked").length > 0) {
                                $("#" + this.className).prop("indeterminate", true);
                            } else {
                                $("#" + this.className).prop("indeterminate", false);
                                $("#" + this.className).prop("checked", false);
                            }
                        }
                        if (this.checked) {
                            if (!inArray(this.value, recipients)) recipients.push(this.value);
                        } else {
                            if (inArray(this.value, recipients)) {
                                var index = recipients.indexOf(this.value);
                                if (index > -1) {
                                    recipients.splice(index, 1);
                                }
                            }
                        }
                        console.log(recipients);
                    }
                });

                if (allowNonContact) {
                    $("#nonContact").on("change", function () {
                        additionalPhoneNumber = $(this).val();
                        console.log("Phone number is " + additionalPhoneNumber);
                    });
                    $("#nonContact_areaCode").on("change", function () {
                        additionalPhoneAreaCode = $(this).val();
                        console.log("Area code is " + additionalPhoneAreaCode);
                    });
                    if (additionalPhoneNumber || additionalPhoneAreaCode) {
                        $("#recepient_NonContact").prop("checked", true).trigger("change");
                        additionalPhoneNumber ? $("#nonContact").val(additionalPhoneNumber) : $("#nonContact").val('');
                        additionalPhoneAreaCode ? $("#nonContact_areaCode").val(additionalPhoneAreaCode) : $("#nonContact_areaCode").val('');
                    }
                    else {
                        $("#recepient_NonContact").prop("checked", false).trigger("change");
                    }
                }

                enableSubmitBtn();
                $("#recepients #selectAllNode").removeClass("disable-click");
            }

            resolve();
        }).catch(function (err) {
            handleGenericError();
            reject(err);
        });
    });
}

function createNonContactHTML() {
    var areaCodes = constants.Area_codes_for_Additional_phone.split(",");
    var sel = "<select id='nonContact_areaCode' disabled>" +
        "<option value='' selected></option>";
    for (var i = 0; i < areaCodes.length; i++) {
        sel += "<option value='" + areaCodes[i] + "'>" + areaCodes[i] + "</option>";
    }
    sel += "</select>";
    var txt = "<input type='text' id='nonContact' autocomplete='off' maxlength='7' value disabled />";
    var div = "<div class='recipientItem'>" +
        "<input type='checkbox' id='recepient_NonContact' class='allowNonContact'>" +
        txt + sel + "</div>";
    return div;
}

function enableNonContact() {
    $("#nonContact_areaCode").attr('disabled', false);
    $("#nonContact").attr('disabled', false);
}

function disableNonContact() {
    $("#nonContact_areaCode").val('').attr('disabled', true);
    $("#nonContact").val('').attr('disabled', true);
    additionalPhoneAreaCode = null;
    additionalPhoneNumber = null;
}

function enableFreeTextBox() {
    if (constants.allow_free_text) {
        if (constants.allow_standard_text) {
            $("#standardTextsList").val() == "" ? $('#freeTextBox').attr('disabled', false) : $('#freeTextBox').attr('disabled', true);
        }
        else {
            $('#freeTextBox').attr('disabled', false);
            enableSubmitBtn();
            clearError();
        }
    }
}

function disableFreeTextBox() {
    if (constants.allow_free_text) {
        $('#freeTextBox').attr('disabled', true);
        if (constants.allow_standard_text) {
            if ($("#standardTextsList").val() == "") {
                $('#freeTextBox').val('').trigger("keyup");
            }
        } else {
            $('#freeTextBox').val('').trigger("keyup");
            disableSubmitBtn(constants.Error_Title_For_SubmitDisable);
            showError(constants.Error_Title_For_SubmitDisable);
        }
    }
}

function getStandardTextOptList() {
    return new Promise(function (resolve, reject) {
        if (constants.allow_standard_text) {
            getStandardTextVisibility().then(function (reportsToRun) {
                processReports(reportsToRun).then(function () {
                    for (var i = 0; i < standardTextList.length; i++) {
                        if (standardTextList[i].value && standardTextList[i].value != null && standardTextList[i].value != "") {
                            $("#standardTextsList").append("<option class='stdTextOpt' value=" + i + ">" + standardTextList[i].name + "</option>");
                        }
                    }
                    $("#standardTextsList").show();
                    if (!inArray(incID, incidents_with_cat_change_handler)) {
                        incidents_with_cat_change_handler.push(incID);
                        console.log("pushed " + incID + " into incidents_with_cat_change_handler");
                        _wsRecord.addFieldValueListener('Incident.CatId', updateStandardTextList);
                        _wsRecord.addRecordClosingListener(handleWSClose);
                    }
                    resolve();
                });
            });
        } else {
            $("#standardTextsList").hide();
            resolve();
        }
    });
}

function handleWSClose(param) {
    return new ExtensionPromise(function (resolve, reject) {
        console.log('closing ws promise returned');
        var idx = incidents_with_cat_change_handler.indexOf(param.workspaceRecord.getWorkspaceRecordId());
        if (idx > -1) {
            incidents_with_cat_change_handler.splice(idx, 1);
            console.log("removed " + incID + " from incidents_with_cat_change_handler");
        }
        resolve();
    });
}

function updateStandardTextList(param) {
    return new Promise(function (resolve, reject) {
        $('body').append('<div id="requestOverlay" class="request-overlay"><i class="fa fa-spinner fa-pulse" style="margin-top: 100%;"></i></div>');
        console.log("inside updateStandardTextList");
        console.log(param);
        $("#standardTextsList").val('').trigger("change");
        $("#standardTextsList").attr("disabled", true);
        $("#standardTextsList .stdTextOpt").remove();
        catID = param.event.value;
        console.log("catID updated to " + catID);
        stdTextForCatList = [];
        getStandardTextVisibility().then(function (reportsToRun) {
            processReports(reportsToRun).then(function () {
                for (var i = 0; i < standardTextList.length; i++) {
                    if (standardTextList[i].value && standardTextList[i].value != null && standardTextList[i].value != "") {
                        $("#standardTextsList").append("<option class='stdTextOpt' value=" + i + ">" + standardTextList[i].name + "</option>");
                    }
                }
                $("#standardTextsList").attr("disabled", false);
                $("#requestOverlay").remove();
                resolve();
            })
        });
    })

}

function getStandardTextVisibility() {
    return new Promise(function (resolve, reject) {
        getCategoryParents(catID).then(function (categoriesToCheck) {
            console.log(categoriesToCheck);
            getReportsForCategory(categoriesToCheck).then(function (reportsToRun) {
                resolve(reportsToRun);
            });
        });
    });
}

function processReports(reportsToRun) {
    return new Promise(function (resolve, reject) {
        console.log(reportsToRun);
        var promises = [];
        standardTextList = [];
        for (var i = 0; i < reportsToRun.length; i++) {
            var payload = setReportPayload(reportsToRun[i], constants.Report_Filter_Name_For_STDTexts, incID);
            promises.push(getReportData(payload));
        }
        //console.log(promises);
        Promise.all(promises).then(function (results) {
            console.log("resolved all promises", results);
            for (var promiseItr = 0; promiseItr < results.length; promiseItr++) {
                var result = results[promiseItr];
                if (result && result.count > 0) {
                    var columns = result.columnNames;
                    for (var i = 0; i < columns.length; i++) {
                        for (var j = 0; j < stdTextForInc.length; j++) {
                            if (columns[i] == stdTextForInc[j].column) {
                                stdTextForInc[j]['colIdx'] = i;
                                break;
                            }
                        }
                    }
                    console.log(result);
                    var rows = result.rows;
                    for (var i = 0; i < rows.length; i++) {
                        var row = rows[i];
                        var jsonBody = {};
                        for (var j = 0; j < stdTextForInc.length; j++) {
                            var attr = stdTextForInc[j].attr;
                            var idx = stdTextForInc[j].colIdx;
                            jsonBody[attr] = row[idx];
                        }

                        standardTextList.push(jsonBody);

                    }
                }
            }
            console.log(standardTextList);
            resolve();
        });
    });
}

function getStandardTextOriginalVal(idx) {
    idx = parseInt(idx);
    return standardTextList[idx].value.replace(/<br *\/?>/gi, '\n');
}

function getCategoryParents(id) {
    return new Promise(function (resolve, reject) {
        if (id) {
            var url = restUrl + "serviceCategories/" + id + "/categoryHierarchy";
            performGET(sessionToken, url, queryParams = []).then(function (response) {
                var result = JSON.parse(response);
                if (result.items && result.items.length > 0) {
                    var arr = [id];
                    for (var i = 0; i < result.items.length; i++) {
                        var item = result.items[i];
                        arr.push(parseInt(extractID(item.href)));
                    }
                    resolve(arr);
                }
                else {
                    resolve([id]);
                }
            });
        } else {
            resolve([]);
        }
    });
}


function getReportsForCategory(categoriesToCheck) {
    return new Promise(function (resolve, reject) {
        var reportsForCategory = [];
        var payload = setReportPayload(constants.Report_ID_CN_Mapping, null, null);
        getReportData(payload).then(function (reportData) {
            var result = reportData;
            if (result && result.count > 0) {
                var columns = result.columnNames;
                for (var i = 0; i < columns.length; i++) {
                    for (var j = 0; j < customNotificationMapping.length; j++) {
                        if (columns[i] == customNotificationMapping[j].column) {
                            customNotificationMapping[j]['colIdx'] = i;
                            break;
                        }
                    }
                }
                console.log(result);
                var rows = result.rows;
                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    var jsonBody = {};
                    for (var j = 0; j < customNotificationMapping.length; j++) {
                        var attr = customNotificationMapping[j].attr;
                        var idx = customNotificationMapping[j].colIdx;
                        jsonBody[attr] = row[idx];
                    }
                    if (!jsonBody.cat_id || jsonBody.cat_id == catID || (categoriesToCheck.length > 0 && inArray(jsonBody.cat_id, categoriesToCheck))) {
                        if (!inArray(jsonBody.report_id, reportsForCategory)) {
                            reportsForCategory.push(jsonBody.report_id);
                        }
                    }
                }
                resolve(reportsForCategory);
            }
        });
    });
}

function getReportData(payload) {
    return new Promise(function (resolve, reject) {
        var url = restUrl + "analyticsReportResults";
        performPOST(sessionToken, url, payload, []).then(function (resp) {
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

function validate() {
    submitInProgress();
    var errMsg = "";
    if ($("#recepients input[type='checkbox']:checked").length < 1) {
        errMsg = constants.Error_Select_Recipients;
    }
    if (allowNonContact && $("#recepient_NonContact").prop("checked")) {
        if ($("#nonContact_areaCode").val() == "") {
            errMsg = errMsg ? (errMsg + "<br>" + constants.Error_Select_Area_Code) : constants.Error_Select_Area_Code;
        }
        if ($("#nonContact").val() == "") {
            errMsg = errMsg ? (errMsg + "<br>" + constants.Error_Enter_Phone_Number) : constants.Error_Enter_Phone_Number;
        } else {
            if (!validPhoneNumber($("#nonContact").val())) {
                errMsg = errMsg ? (errMsg + "<br>" + constants.Error_Invalid_Phone_Number_Format) : constants.Error_Invalid_Phone_Number_Format;
            }
        }
    }
    if ($("#standardTextsList").val() == "" && $("#freeTextBox").val() == "") {
        errMsg = errMsg ? (errMsg + "<br>" + constants.Error_SMS_Content_Not_Found) : constants.Error_SMS_Content_Not_Found;
    }
    if (constants.allow_free_text && $("#standardTextsList").val() == "" && $("#freeTextBox").val() != "") {
        if (hasURL($("#freeTextBox").val())) {
            errMsg = errMsg ? (errMsg + "<br>" + constants.Error_SMS_Content_Has_Url) : constants.Error_SMS_Content_Has_Url;
        }
    }
    if (!errMsg) {
        console.log("validation passed");
        validationPassed();
        return;
    } else {
        console.log("validation failed");
        validationFailed(errMsg);
        return;
    }
}

function validPhoneNumber(nbr) {
    if (constants.Number_of_digits_for_Additional_phone)
        var phoneFormat = new RegExp('^\\d{' + constants.Number_of_digits_for_Additional_phone + '}$');
    else
        var phoneFormat = new RegExp('^\\d{7}$');
    if (nbr.match(phoneFormat)) {
        return true;
    }
    else {
        return false;
    }
}

function submit() {
    var payload = {
        "customFields": {
            "c": {}
        }
    };
    for (var i = 0; i < incFields.length; i++) {
        for (var key in incFields[i]) {
            switch (key) {
                case 'recipients':
                    var collatedInfo = '';
                    $("#recepients .hasChildren").each(function () {
                        var name = this.name;
                        var phoneNumbers = ''
                        $(this).parent().find("input[type='checkbox']:checked").each(function () {
                            var number = $(this).val().split("|")[1];
                            phoneNumbers = phoneNumbers ? phoneNumbers + "|" + number : number;
                        });
                        if (phoneNumbers != '') {
                            var contact = name + "::" + phoneNumbers;
                            collatedInfo = (collatedInfo == '') ? contact : (collatedInfo + "," + contact);
                        }
                    });
                    if (allowNonContact && $("#recepient_NonContact").prop("checked")) {
                        var contact = "::" + $("#nonContact_areaCode").val() + "-" + $("#nonContact").val();
                        collatedInfo = (collatedInfo == '') ? contact : (collatedInfo + "," + contact);
                    }
                    console.log(collatedInfo);
                    payload.customFields.c[incFields[i][key].incField] = collatedInfo;
                    break;
                case 'smsContent':
                    payload.customFields.c[incFields[i][key].incField] = $("#freeTextBox").val().replace(/\n/gi, '<br>');
                    break;
                default:
                    payload.customFields.c[incFields[i][key].incField] = incFields[i][key].defaultValue ? incFields[i][key].defaultValue : null;
            }
        }
    }
    performPATCH(sessionToken, restUrl + "incidents/" + incID, payload, []).then(function () {
        submitComplete();
    }).catch(function (err) {
        console.log(Err);
        handleGenericError();
    });
}

function submitInProgress() {
    disableSubmitBtn('');
    $("#submittingDiv").show();
}

function validationPassed() {
    $("#errorMsg").text("");
    submit();
}

function validationFailed(errMsg) {
    $("#submittingDiv").hide();
    $("#errorMsg").html(errMsg);
    enableSubmitBtn();
}

function submitComplete() {
    $("#submittingDiv").hide();
    resetAll();
    enableSubmitBtn();
}

function enableSubmitBtn() {
    $("#submitBtn").attr("disabled", false);
    $("#submitBtn").attr("title", '');
}

function disableSubmitBtn(title) {
    $("#submitBtn").attr("disabled", true);
    if (title)
        $("#submitBtn").attr("title", title);
    else
        $("#submitBtn").attr("title", '');
}

function resetAll() {
    $("#recepients input[type='checkbox']:checked").prop("checked", false).trigger("change");
    $("#recepients input[type='checkbox']:indeterminate").prop("indeterminate", false);
    $("#standardTextsList").val("").trigger("change");
    $("#freeTextBox").val("").trigger("keyup");
}

function expandPane() {
    parentFrame.rightPane.expand();
    parentFrame.rightPane.render();
}

function activatePane() {
    parentFrame.rightPane.setDisabled(false);
    parentFrame.rightPane.render();
}

function deactivatePane() {
    $('body').hide();
    parentFrame.rightPane.collapse();
    parentFrame.rightPane.setDisabled(true);
    parentFrame.rightPane.render();
    return;
}

function processFreeTextBox() {
    if (constants.allow_free_text) {
        $("#freeTextBoxDiv").show();
        $("#freeTextBoxDiv").attr('maxlength', constants.max_length_for_sms_max255 <= 255 ? constants.max_length_for_sms_max255 : 255);
        if (constants.FreeText_Label && constants.FreeText_Label != "") {
            $("#freeTextBox").attr('placeholder', constants.FreeText_Label);
        }
        activateClearIcon();
        countChar('freeTextBox', 'charNum');
    } else {
        $("#freeTextBoxDiv").hide();
        deactivateClearIcon();
    }
}

function resizeTextArea(e) {
    setTimeout(function () {
        e.style.height = 'auto';
        e.style.height = (e.scrollHeight + 10) + 'px';
    }, 100);
}

function setPhonesToShow() {
    phonesToShow["c_mobile"] = constants.allow_sending_to_mobile;
    phonesToShow["c_home"] = constants.allow_sending_to_home;
    phonesToShow["c_office"] = constants.allow_sending_to_office;
    phonesToShow["c_fax"] = constants.allow_sending_to_fax;
    phonesToShow["c_addlPhone"] = constants.allow_sending_to_addlPhone;
}

function hasURL(str) {
    if (new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?").test(str)) {
        return true;
    }
    else {
        return false;
    }
}

function activateClearIcon() {
    $(".freeTextDiv").append("<span data-clear-input>&times;</span>");
    $('.freeTextDiv>[data-clear-input]').on('click', function (e) {
        if ($("#standardTextsList").val() == '') {
            var textArea = e.target.parentElement.firstElementChild;
            textArea.value = '';
            $("#" + textArea.id).trigger('keyup');
        }
    });
}

function deactivateClearIcon() {
    $('.freeTextDiv>[data-clear-input]').off('click');
    $('.freeTextDiv>[data-clear-input]').remove();
}

function handleGenericError() {
    $("#errorMsg").text(constants.Error_Generic);
    disableSubmitBtn('');
}

function showError(txt) {
    $("#errorMsg").text(txt);
}

function clearError() {
    $("#errorMsg").text('');
}

function checktab(tab_id){
	//alert(tab_id);
	$(".alltabs").hide();
	$(".tab_hd").removeClass('selected_tab');
	$("#tab_hd"+tab_id).addClass('selected_tab');
	$("#tab"+tab_id).show();
	if(tab_id==3){
	easytab(0);	
	}
	
	
}

function easytab(easy){
//var tab_id = 0;
var tab_id = $('select#easy_option_list option:selected').val();

//alert(tab_id);
	if(tab_id==0){
		$(".alltabses").hide();
		$(".tab_hde").removeClass('tab_hde_selected');
	}else{
	$(".alltabses").hide();
	$(".tab_hde").removeClass('tab_hde_selected');
	$("#tabes_hd"+tab_id).addClass('tab_hde_selected');
	$("#tabes"+tab_id).show();
	}
	
	
	
}

