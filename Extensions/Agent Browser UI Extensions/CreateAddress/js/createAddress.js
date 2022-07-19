var appId = "CreateAddress";
var apiVersion = "1.0";
var constants = {
    sesToken: null,
    hostURL: null,
	idNotFound: null,
	recordId: null,
    _extensionProvider: null,
	errorMsg: "",
	report_id:null,
	addressData: null,
	cntryData: null,
	citiesData: null,
	contactIdNumber:null,
	mktData: null,
	accountId: null,
	contactDetails: null,
	incident_primary_id:null,
	incident_primary_name:null,
	incident_related_id:null,
	incident_related_name:null,
	labels: null,
	default_country_name: null,
	default_country_code:null
};
var contactData = {};
var ieFlag = window.ActiveXObject || "ActiveXObject" in window;
var workspaceType = "";
var poBoxesData = null;
var valdiateIns = null;
var isOnClickDefine = false;
var validateRules = null;
var messagesList = null;

//This function intialize the extension according the passed parameter whether it is main screen or dialog.
//Parameter: screen (Values: Dialog and Main)
function initialize(screen) {
    if (screen == "dialog") {
        loadDialog();
    } else {
        loadExtension();
    }
}

//Following function will load the extension.
function loadExtension() {
    ORACLE_SERVICE_CLOUD.extension_loader.load(appId, apiVersion).then(function (extensionProvider) {
        constants._extensionProvider = extensionProvider;
		extensionProvider.getGlobalContext().then(function(globalContext) {
			constants.accountId = globalContext.getAccountId();
		});
		
		extensionProvider.registerWorkspaceExtension(function(workspaceRecord)
		{
			workspaceRecord.addRecordSavingListener(function(wsData){
				if($('#inputCity').val() != "" && (!($("#address-from").valid()))){
					wsData.getCurrentEvent().cancel();
				}
				if($.trim($("#inputPhone").val()!="") && (!valdiateIns.element('#inputPhone'))){
					wsData.getCurrentEvent().cancel();
				}
				if($.trim($("#inputCellular").val()!="") && (!valdiateIns.element('#inputCellular'))){
					wsData.getCurrentEvent().cancel();
				}
				if($.trim($("#inputEmail").val()!="") && (!valdiateIns.element('#inputEmail'))){
					wsData.getCurrentEvent().cancel();
				}				
				//else {
					// if($.trim($("#inputEmail").val()!="")){
						// var validateData = {session_id:constants.sesToken};
						// validateData["method"] = "ValidateEmail";
						// validateData["email_address"] = $.trim($("#inputEmail").val());
						// $.ajax({
							// type: "POST",
							// async: false,
							// url: constants.hostURL, 			
							// dataType: "json", 
							// data:validateData,
							// success: function (data) {
								// console.log(data);
								// if(data.success == 0){
									// wsData.getCurrentEvent().cancel();
									// $('#warning-msg').show();
									// $('#warning-msg').html("Email address already exists.");
									// $('div.overlay').removeClass('show');
									// $('div.spanner').removeClass('show');
									// setTimeout(function(){
										// $('#warning-msg').hide();
										// $('#warning-msg').html("");
									// }, 10000);
								// }							
							// },
							// error: function (jqXHR, exception) {
								// wsData.getCurrentEvent().cancel();
								// $('#warning-msg').show();
								// $('#warning-msg').html(constants.errorMsg);
								// $('div.overlay').removeClass('show');
								// $('div.spanner').removeClass('show');
								// setTimeout(function(){
									// $('#warning-msg').hide();
									// $('#warning-msg').html("");
								// }, 10000);
							// }
						// });
					// }
				//}
			});
			workspaceRecord.addRecordSavedListener(createCustomerAddress).prefetchWorkspaceFields(["Contact.c_id"]);
		});
		
		extensionProvider.getGlobalContext().then(function(globalContext) {
			globalContext.getSessionToken().then(function(sessionToken)
			{
				constants.sesToken = sessionToken;
				globalContext.getExtensionContext('CreateAddress').then(function(extensionContext) {
					extensionContext.getProperties(['hostURL','errorMsg','idNotFound','report_id','screen_labels','default_country_name','default_country_code']).then(function(collection) {
						constants.hostURL = (window.location.protocol+"//"+window.location.hostname)+(collection.get('hostURL').value);
						constants.errorMsg = collection.get('errorMsg').value;
						constants.idNotFound = collection.get('idNotFound').value;
						constants.report_id = collection.get('report_id').value;
						constants.default_country_name = collection.get('default_country_name').value;
						constants.default_country_code = collection.get('default_country_code').value;
						
						var screenLabels = new Array();
						var explodedLabels = collection.get('screen_labels').value.split(',');
						
						for (var i = 0; i < explodedLabels.length; i++) {
							var labelIns = explodedLabels[i].split(":::");
							screenLabels[labelIns[0].toLowerCase()] = labelIns[1];
						}
						constants.labels = screenLabels;
						setupExtension();
						updateTranslation();
						$('div.overlay').removeClass('show');
						$('div.spanner').removeClass('show');
						
						//$('#updateAddress').html(getTranslation("Create Address"));
					});
				});
			});
		});
    });
	ORACLE_SERVICE_CLOUD.extension_loader.load('ClearSessionStorage').then(function (extensionProvider) {
		extensionProvider.getGlobalContext().then(function (globalContext) {
			globalContext.addLoggingOutEventListener(function (param) {
				console.log('logging out started with reason : ' + param.getReason());
				sessionStorage.clear();
				return Promise.resolve();
			});
		});
	});
}

//Create Address for customer
function createCustomerAddress(wsCustomerData){
	var submitData = {session_id:constants.sesToken};
	submitData["method"] = "CreateCustomerAddress";
	submitData["cntry_id"] = $("#inputCountry").data('ID');
	submitData["c_id"] = wsCustomerData.event.fields["Contact.c_id"];
	
	var sendData = false;

	if($('input[type=radio][name=address-type-selection]:checked').val() == "address"){
		if($("#inputStreet").data('id')!=undefined && $("#inputStreet").data('id')!="" && $("#inputHouseNo").data('id')!=undefined && $("#inputHouseNo").data('id')!=""){
			submitData["street"] = $("#inputStreet").data('id');
			submitData["zip_code"] = $("#inputHouseNo").data('id');
		} else {
			submitData["street_text"] = $("#inputStreet").val();
			if(!$("#inputZipCode").prop("readonly")){
				submitData["zip_code"] = $("#inputZipCode").val();
			} else {
				submitData["zip_code_text"] = $("#inputZipCode").val();
			}
		}
		
		if($("#inputStreet").val()!=""){
			submitData["entrance"] = $("#inputEntrance").val();
			submitData["house_no"] = $("#inputHouseNo").val();
		}
		submitData["address"] = 1;
	} else {
		if($("#inputPOBox").val()!=""){
			submitData["pobox"] = $("#inputPOBox").val();
			submitData["poboxid"] = $("#inputPOBox").data("ID");
		}
		submitData["address"] = 0;
	}
			
	if($("#inputCity").val()!=""){
		submitData["city"] = $("#inputCity").data('id');
		sendData = true;
	} else {
		submitData["city"] = "";
	}
			
	submitData["address_cross"] = $('#addressCross').is(":checked") ? 1 : 0;
	submitData["cell_cross"] = $('#cellularCross').is(":checked") ? 1 : 0;
	submitData["phone_cross"] = $('#phoneCross').is(":checked") ? 1 : 0;
	submitData["email_cross"] = $('#emailCross').is(":checked") ? 1 : 0;
	// submitData["mkt_Cross"] = $('#marketingCross').is(":checked") ? 1 : 0;
	// submitData["pen_Cross"] = $('#pension').is(":checked") ? 1 : 0;
	// submitData["ins_cross"] = $('#insurance').is(":checked") ? 1 : 0;
	submitData["phone"] = $("#inputPhone").val();
	submitData["cellular"] = $("#inputCellular").val();
	submitData["email_address"] = $("#inputEmail").val();
	submitData["fax"] = $("#inputFax").val();
	
	if($("#inputPhone").val()!= "" || $("#inputCellular").val()!= "" || $("#inputEmail").val()!= "" || $("#inputFax").val()!= ""){
		sendData = true;
	}
	console.log("Submitting Record");
	console.log(submitData);
	
	submitData["account_id"] = constants.accountId;
	if(sendData){
		$('div.overlay').addClass('show');
		$('div.spanner').addClass('show');

		$.ajax({
			url : constants.hostURL,
			type: "POST",
			data : submitData,
			success: function(data, textStatus, jqXHR)
			{
				console.log("Record Created.");
				var errorHappened = false;
				var errorMessage = "";
				if(IsJsonString(data)){
					var dataRes = JSON.parse(data);
					if(dataRes.success == 1){
						//getAllData();
						$('div.overlay').removeClass('show');
						$('div.spanner').removeClass('show');
						valdiateIns.resetForm();
					} else {
						errorHappened = true;
						errorMessage= dataRes.error;
					}
				} else {
					errorHappened = true;
					errorMessage = constants.errorMsg;
				}
				if(errorHappened){
					$('#warning-msg').show();
					$('#warning-msg').html(errorMessage);
					$('div.overlay').removeClass('show');
					$('div.spanner').removeClass('show');
					$('div.modal').css("z-index","1055");
					setTimeout(function(){
						$('#warning-msg').hide();
						$('#warning-msg').html("");
					}, 10000);
				}
			},
			error: function (jqXHR, textStatus, errorThrown)
			{
				//showError("<p>"+constants.errorMsg+"</p>");
				console.log(errorThrown);
			}
		});
	}
}

//This function will get setup the extension events and get the data from the server.
function setupExtension(){
	validateRules = {
		inputCity: {required: true},
		//inputCountry: {required: true},
		inputStreet: {required:{
			depends: function(element) {
			  return $('input[type=radio][name=address-type-selection]:checked').val() == "address" ? true : false;
			}
		}},
		inputHouseNo: {required:{
			depends: function(element) {
			  return $('input[type=radio][name=address-type-selection]:checked').val() == "address" ? true : false;
			}
		},digits: true},
		// inputEntrance: {required:{
			// depends: function(element) {
			  // return $('input[type=radio][name=address-type-selection]:checked').val() == "address" ? true : false;
			// }
		// }},
		inputZipCode: {required: true,maxlength: 7,digits: true},
		inputPOBox: {required:{
			depends: function(element) {
			  return $('input[type=radio][name=address-type-selection]:checked').val() == "pobox" ? true : false;
			}
		}},
		inputEmail: {
			required:{
				depends: function(element) {
					return $('#emailCross').prop('checked') ? true : false;
			}},
			validEmail: true
		},
		inputPhone:{
			required:{
				depends: function(element) {
					return $('#phoneCross').prop('checked') ? true : false;
			}},
			validPhone: true
		},
		inputCellular:{
			required:{
				depends: function(element) {
					return $('#cellularCross').prop('checked') ? true : false;
			}},
			validCell: true
		},
		inputFax:{
			maxlength: 10,
			digits: true
		}
	};
	messagesList = {
		inputCity: {required: getTranslation("City is required.")},
		inputCountry: {required: getTranslation("Country is required.")},
		inputStreet: {required: getTranslation("Street is required.")},
		inputHouseNo: {required: getTranslation("House number is required.")},
		//inputEntrance: {required: getTranslation("Entrance is required.")},
		inputZipCode: {required: getTranslation("Zip code is required.")},
		inputPOBox: {required: getTranslation("PO Box is required.")},
		inputEmail: {required: getTranslation("Email address is required."),validEmail:getTranslation("Please enter a valid email address.")},
		inputCellular: {required: getTranslation("Mobile number is required as you selected cross field."),validCell: getTranslation("Please enter a valid mobile number.")},
		inputPhone: {required: getTranslation("Phone number is required as you selected cross field."),validPhone: getTranslation("Please enter a valid phone number.")}
	};
	if(valdiateIns != null){
		valdiateIns.resetForm();
	}
	
	jQuery.validator.addMethod("validEmail", function(value, element) {
		  return this.optional( element ) || /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test( value );
	}, 'Please enter a valid email address.');
	jQuery.validator.addMethod("validPhone", function(value, element) {
	  return this.optional( element ) || /^0([23489])[ -/]?\d{7}$/.test( value );
	}, 'Please enter a valid phone number.');
	jQuery.validator.addMethod("validCell", function(value, element) {
	  return this.optional( element ) || /^05([01234895])[ -/]?\d{7}$/.test( value );
	}, 'Please enter a valid mobile number.');
	valdiateIns = $("#address-from").validate({
		rules: validateRules,
		messages: messagesList,
		errorElement: "em",
		errorPlacement: function ( error, element ) {
			// Add the `invalid-feedback` class to the error element
			error.addClass( "invalid-feedback" );

			if ( element.prop( "type" ) === "checkbox" ) {
				error.insertAfter( element.next( "label" ) );
			} else {
				error.insertAfter( element );
			}
		},
		highlight: function ( element, errorClass, validClass ) {
			$( element ).addClass( "is-invalid" ).removeClass( "is-valid" );
		},
		unhighlight: function (element, errorClass, validClass) {
			$( element ).addClass( "is-valid" ).removeClass( "is-invalid" );
		}
	});
	
	var formData = {method:"GetAddressData"};
	formData["session_id"] = constants.sesToken;
	
	if(sessionStorage.getItem("countryData")!=undefined){
		constants.cntryData = sessionStorage.getItem("countryData");
		constants.citiesData = sessionStorage.getItem("citiesData");
		setupAddressInput();
	} else {
		$.ajax({
			url : constants.hostURL,
			type: "POST",
			data : formData,
			success: function(data, textStatus, jqXHR)
			{
				if(IsJsonString(data)){
					console.log(data);
					var cityData = [];
					var countryData = [];
					var resp = JSON.parse(data);
					$(resp.city).each(function(key, val) {
						cityData.push({value: val.city_id,id:val.ID,label: val.name_1,city_type:val.city_type,zip_code_5:val.zip_code_5,zip_code_7:val.zip_code_7});
					});
					$(resp.country).each(function(key, val) {
						countryData.push({ID: val.ID,value: val.ID,label: val.Name,LookupName:val.LookupName});
					});
					sessionStorage.setItem("countryData", JSON.stringify(countryData));
					sessionStorage.setItem("citiesData", JSON.stringify(cityData));
					constants.cntryData = JSON.stringify(countryData);
					constants.citiesData = JSON.stringify(cityData);
					setupAddressInput();
				}
				else {
					showError(data);
				}
			},
			error: function (jqXHR, textStatus, errorThrown)
			{
				showError("<p>"+constants.errorMsg+"</p>");
			}
		});
	}
}

function setupAddressInput(){
	$("#inputCity").autocomplete({
		minLength: 2,
		source: JSON.parse(constants.citiesData),
		search: function(e,ui){
			$(this).data("ui-autocomplete").menu.bindings = $();
		},
		focus: function( event, ui ) {
			if(ui.item != null){
				$("#inputCity").val(ui.item.label);
			}
			return false;
		},
		select: function (event, ui) {
			if(ui.item != null){
				$("#inputCity").val(ui.item.label);
				$("#inputCity").data('id',ui.item.id);
				$("#inputCity").data('id',ui.item.id);
				$("#inputCity").data('zip_code_7',ui.item.zip_code_7);
			}
			return false;
		},
		change: function( event, ui ) {
			if(ui.item != null){
				$("#inputCity").val(ui.item.label);
				$("#inputCity").data('id',ui.item.id);
				$("#inputCity").data('city_type',ui.item.city_type);
				$("#inputCity").data('zip_code_7',ui.item.zip_code_7);
				$("#inputPOBox").data('ID','');
				$("#inputZipCode").val('');
				$("#inputZipCode").data('zip_code_7','');
				$("#inputStreet").val('');
				$("#inputStreet").data('id','');
				$('#inputHouseNo').val('');
				setStreetAndPOBox(ui.item.value);
			} else {
				$("#inputCity").val('');
			}
		}
	});
	$("#inputCountry").autocomplete({
		minLength: 2,
		source: JSON.parse(constants.cntryData),
		search: function(e,ui){
			$(this).data("ui-autocomplete").menu.bindings = $();
		},
		focus: function( event, ui ) {
			if(ui.item != null){
				$("#inputCountry").val(ui.item.label);
			}
			return false;
		},
		select: function (event, ui) {
			if(ui.item != null){
				$("#inputCountry").val(ui.item.label);
				$("#inputCountry").data('Lookup',ui.item.LookupName);
				$("#inputCountry").data('ID',ui.item.ID);
			}
		},
		change: function( event, ui ) {
			if(ui.item != null){
				$("#inputCountry").val(ui.item.label);
				$("#inputCountry").data('Lookup',ui.item.LookupName);
				$("#inputCountry").data('ID',ui.item.ID);
			}
		}
	});
	$("#inputCountry").val(constants.default_country_name);
	$("#inputCountry").data("LookupName",constants.default_country_code);
	$("#inputCountry").data("ID",constants.default_country_code);
	$("#inputCountry").trigger('keydown');
	$('input[type=radio][name=address-type-selection]').change(function() {
		if (this.value == 'address') {
			$('div.address-part').show();
			$('#pobox-parent').hide();
		}
		if (this.value == 'pobox') {
			$('div.address-part').hide();
			$('#pobox-parent').show();
		}
	});

	setTimeout(function(){
		$("#inputCity").autocomplete("close");
		$("#inputCountry").autocomplete('close');
		$("#inputStreet").autocomplete('close');
		$("#inputHouseNo").autocomplete('close');
		$('#inputPOBox').autocomplete('close');
	}, 400);
}

function setAutocompletCurrentValue(id, value) {
   $(id).val(value);
   var textToShow = $(id).find(":selected").text();
   $(id).parent().find("span").find("input").val(textToShow);
}

function setStreetAndPOBox(cityId){
	$.ajax({
		url : constants.hostURL,
		type: "POST",
		data : {method:"GetStreetAndPOBox",city_id: cityId,session_id: constants.sesToken},
		success: function(newData, textStatus, jqXHR)
		{
			if(IsJsonString(newData)){
				console.log(newData);
				var streetData = [];
				var newResp = JSON.parse(newData);
				poBoxesData = newResp.poBoxes;
				$(newResp.streets).each(function(key, val) {
					streetData.push({value: val.street_id,id:val.ID,label: val.name_1,city_id:val.city_id,name_2:val.name_2});
				});
				var poboxData = [];
				$(newResp.poBoxes).each(function(key, val) {
					for(let i=parseInt(val.po_box_low); i<=parseInt(val.po_box_high); i++) {
						poboxData.push({ID:val.ID,value: i,label: i,zip_code_7:val.zip_code_7});
					}
				});
				$("#inputZipCode").prop("readonly", false);
				if(poboxData.length == 0 && streetData.length == 0){
					$("#inputZipCode").prop("readonly", true);
					if($("#inputCity").data('zip_code_7')!="" && $("#inputCity").data('zip_code_7')!=undefined){
						$("#inputZipCode").val($("#inputCity").data('zip_code_7'));
					}
				}
				$("#inputPOBox").autocomplete({
					minLength: 1,
					source: poboxData,
					search: function(e,ui){
						$(this).data("ui-autocomplete").menu.bindings = $();
					},
					select: function( event, ui ) {
						if(ui.item != null){
							$("#inputPOBox").data('ID',ui.item.ID);
							$("#inputZipCode").val(ui.item.zip_code_7);
							$("#inputZipCode").data('zip_code_7',ui.item.zip_code_7);
						}
					},
					change: function( event, ui ) {
						if(ui.item != null){
							$("#inputPOBox").data('ID',ui.item.ID);
							$("#inputZipCode").val(ui.item.zip_code_7);
							$("#inputZipCode").data('zip_code_7',ui.item.zip_code_7);
						}
					}
				});
				$("#inputStreet").autocomplete({
					minLength: 1,
					source: streetData,
					search: function(e,ui){
						$(this).data("ui-autocomplete").menu.bindings = $();
					},
					focus: function( event, ui ) {
						if(ui.item != null){
							$("#inputStreet").val(ui.item.label);
						}
						return false;
					},
					select: function (event, ui) {
						if(ui.item != null){
							$("#inputStreet").val(ui.item.label);
						}
						return false;
					},
					change: function( event, ui ) {
						if(ui.item != null){
							$("#inputStreet").val(ui.item.label);
							$("#inputStreet").data('id',ui.item.id);
							setZipData(ui.item.value,ui.item.city_id);
							$("#inputZipCode").data('zip_code_7','');
							$("#inputZipCode").val('');
						} else {
							$("#inputStreet").data('id',"");
							$("#inputHouseNo").autocomplete('option', 'source', []);
						}
						$("#inputHouseNo").data('id','');
						$("#inputHouseNo").val('');
						$("#inputEntrance").val('');
					}
				});
			} else {
				showError(newData);
			}
		}, 
		error: function (jqXHR, textStatus, errorThrown)
		{
			showError("<p>"+constants.errorMsg+"</p>");
		}
	});
}

function setZipData(current_strt_id, current_city_id){
	if(current_strt_id!= undefined && current_strt_id!="" && current_city_id!= undefined && current_city_id!=""){
		$.ajax({
			url : constants.hostURL,
			type: "POST",
			data : {method:"GetZipCodes", session_id: constants.sesToken,street_id:current_strt_id,city_id:current_city_id},
			success: function(zipReturnData, textStatus, jqXHR)
			{
				console.log(zipReturnData);
				var zipData = [];
				var zipResp = JSON.parse(zipReturnData);
				$(zipResp.zipCodes).each(function(key, val) {
					zipData.push({value: val.street_id,id:val.ID,label: val.house_no,city_id:val.city_id,zip_code_5:val.zip_code_5,zip_code_7:val.zip_code_7});
				});
				$("#inputHouseNo").autocomplete({
					minLength: 0,
					source: zipData,
					search: function(e,ui){
						$(this).data("ui-autocomplete").menu.bindings = $();
					},
					focus: function (event, ui) {
						if(ui.item != null){
							$("#inputHouseNo").val(ui.item.label);
						}
						return false;
					},
					select: function (event, ui) {
						if(ui.item != null){
							$("#inputHouseNo").val(ui.item.label);
						}
						return false;
					},
					change: function( event, ui ) {
						if(ui.item != null){
							$("#inputHouseNo").val(ui.item.label);
							$("#inputHouseNo").data('id',ui.item.id);
							$("#inputZipCode").val(ui.item.zip_code_7);
							$("#inputZipCode").data('zip_code_7',ui.item.zip_code_7);
						} else {
							$("#inputHouseNo").data('id',"");
						}
					}
				});
			},
			error: function (jqXHR, textStatus, errorThrown)
			{
				showError(zipData);
			}
		});
	}
}

// function setAddressUpdateData(){
	// $('#submitAddress').data('address-id','');
	// $("#inputCountry").trigger('keydown');
	// $("#inputCity").val('');
	// $("#inputCity").trigger('keydown');
	// $('#inputPOBox').val('');
	// $("#radioAddress").prop("checked", true);
	// $('#inputPOBox').val('');
	// $('#inputPOBox').data('ID','');
	// $('#inputZipCode').val('');
	// $('#inputHouseNo').val('');
	// $('#inputEntrance').val('');
	// $('#inputStreet').val('');
	// $('#inputStreet').data('id','');
	// $('#submitAddress').data('address-id','');
	// $('#inputParty').val('');
	// $("#inputCountry").val('');
	
	// if(constants.default_country_name!=""){
		// $("#inputCountry").val(constants.default_country_name);
		// $("#inputCountry").data("LookupName",constants.default_country_code);
		// $("#inputCountry").data("ID",constants.default_country_code);
		// $("#inputCountry").trigger('keydown');
	// }
	// if($('#checkCross').is(":checked")){
		// $("#marketingCross").prop("checked", true);
	// }
	// if($('#checkPension').is(":checked")){
		// $("#pension").prop("checked", true);
	// }
	// if($('#checkInsurance').is(":checked")){
		// $("#insurance").prop("checked", true);
	// }
	// $('#inputPhone').val($('#home-phone').text());
	// $('#inputCellular').val($('#cell-phone').text());
	// $('#inputEmail').val($('#email').text());
	// $('#inputFax').val($('#fax-phone').text());
// }

function updateTranslation(){
	$('#createAddress').html(getTranslation("Create Address"));
	$('#updateAddress').html(getTranslation("Update Address"));
	$('#crmAddress').html(getTranslation("CRM Address"));
	$('#interiorMinister').html(getTranslation("Interior Minister"));
	$('#cityHead').html(getTranslation("City"));
	$('#entHead').html(getTranslation("Entrance"));
	$('#streetHead').html(getTranslation("Street"));
	$('#houseHead').html(getTranslation("House No."));
	$('#zipHead').html(getTranslation("Zip Code"));
	$('#poHead').html(getTranslation("PO Box"));
	$('#intcityHead').html(getTranslation("City"));
	$('#intentHead').html(getTranslation("Entrance"));
	$('#intstreetHead').html(getTranslation("Street"));
	$('#inthouseHead').html(getTranslation("House No."));
	$('#intzipHead').html(getTranslation("Zip Code"));
	$('#intpoHead').html(getTranslation("PO Box"));
	$('#phoneTitle').html(getTranslation("Phone"));
	$('#cellTitle').html(getTranslation("Cellular"));
	$('#emailTitle').html(getTranslation("Email"));
	$('#faxTitle').html(getTranslation("Fax"));
	$('#marketingTitle').html(getTranslation("Marketing Data"));
	$('#insTitle').html(getTranslation("Insurance"));
	$('#penTitle').html(getTranslation("Pension"));
	$('#crossTitle').html(getTranslation("Cross"));
	$('h4.modal-title').html(getTranslation("Create/Update Address"));
	$('#lblCntry').html(getTranslation("Country"));
	$('#lblCity').html(getTranslation("City"));
	$('#lblparty').html(getTranslation("Party Type"));
	$('#lblCrossAddress').html(getTranslation("Cross Address"));
	$('#chkAddress').html(getTranslation("Address"));
	$('#chkPOBox').html(getTranslation("PO Box"));
	$('#lblStreet').html(getTranslation("Street"));
	$('#lblHouse').html(getTranslation("House No."));
	$('#lblEnt').html(getTranslation("Entrance"));
	$('#lblPOBox').html(getTranslation("POBox"));
	$('#lblZip').html(getTranslation("Zip Code"));
	$('#lblPhone').html(getTranslation("Phone"));
	$('#lblPhoneCross').html(getTranslation("Cross Phone"));
	$('#lblCell').html(getTranslation("Cellular"));
	$('#lblCrossCell').html(getTranslation("Cross Cellular"));
	$('#lblEmail').html(getTranslation("Email"));
	$('#lblEmailCross').html(getTranslation("Cross Email"));
	$('#lblFax').html(getTranslation("Fax"));
	$('#lblMktData').html(getTranslation("Marketing Data"));
	$('#lblInst').html(getTranslation("Insurance"));
	$('#lblPen').html(getTranslation("Pension"));
	$('#lblCross').html(getTranslation("Cross"));
	$('#submitAddress').html(getTranslation("Save"));
	$('#loaderMsg').html(getTranslation("Loading..."));
}



//Following function will check whether value exist in array or not.
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

//Following function will show error in extension.
//Parameter: msg - Error Message
function showError(msg){
	$('#warning-msg').show();
	$('#warning-msg').html(msg);
	$('div.overlay').removeClass('show');
	$('div.spanner').removeClass('show');
}

//Following function will parse json string to JSON.
//Parameter: str - Json String
function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

//Following function will sort collection of records by a given field.
//Parameter: array - Collection of records
//Parameter: key - Field Name for sorting
function sort_by_key(array, key)
{
	return array.sort(function(a, b)
	{
		if(a[key] == undefined){
			console.log(a);
		}
		if(b[key] == undefined){
			console.log(b);
		}
		var x = a[key].trim(); var y = b[key].trim();
		return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	});
}

//Following method will return selected conutry Object
// Parameter: isoCode - ISO Code of Country
function getCntryId(isoCode){
	var idVal = null;
	$.each(JSON.parse(constants.cntryData), function (key, insCntry) {
		if(insCntry.LookupName == isoCode){
			idVal = insCntry.ID;
			return false;
		}
	});
	return idVal;
}

//Following method will return hebrew for english text. If translation is not available then same message will be return.
//parameter: lblMsg - label text
function getTranslation(lblMsg){
	if(constants.labels[lblMsg.toLowerCase()] !== undefined){
		return constants.labels[lblMsg.toLowerCase()];
	} else {
		return lblMsg;
	}
}