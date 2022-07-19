var appId = "ManageAddress";
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

//This function will open dialog which will create and update Address.                                                                                                                    
function openAddressCreateDialog(btn){
	
	var formData = {method:"GetAddressData"};
	formData["session_id"] = constants.sesToken;
	
	if(workspaceType == "Incident" && $('#inputParty option').length==3){
		$('#inputParty').append('<option value="contact_'+constants.incident_primary_id+'" data-type="contact">'+constants.incident_primary_name+'</option>');
		if(constants.incident_related_id != null){
			$('#inputParty').append('<option value="contact_'+constants.incident_related_id+'" data-type="contact">'+constants.incident_related_name+'</option>');
		}
		validateRules = {
			inputParty: {required: true},
			inputCity: {required: {
				depends: function(element) {
				  return ($('#inputPhone').val()=="" && $('#inputCellular').val()=="" && $('#inputEmail').val()=="" ? true : false) ? true : false;
				}
			}},
			//inputCountry: {required: true},
			inputStreet: {required:{
				depends: function(element) {
				  return ($('input[type=radio][name=address-type-selection]:checked').val() == "address" && $("#inputCity").val()!="" && $("#inputCity").data('street-required') == '1' ) ? true : false;
				}
			}},
			inputHouseNo: {required:{
				depends: function(element) {
				  return ($('input[type=radio][name=address-type-selection]:checked').val() == "address" && $("#inputCity").val()!="" && $("#inputCity").data('street-required') == '1' ) ? true : false;
				}
			},digits: true},
			// inputEntrance: {required:{
				// depends: function(element) {
				  // return $('input[type=radio][name=address-type-selection]:checked').val() == "address" ? true : false;
				// }
			// }},
			inputZipCode: {required: ($("#inputCity").val()!="" ? true : false )},
			inputPOBox: {required:{
				depends: function(element) {
				  return ($('input[type=radio][name=address-type-selection]:checked').val() == "pobox" && $("#inputCity").val()!="") ? true : false;
				}
			}},
			inputEmail: {
				required: {
					depends: function(element) {
					  return ($('#inputPhone').val()=="" && $('#inputCellular').val()=="" && $('#inputCity').val()=="" ? true : false) ? true : false;
					}
				},
				validEmail: true
			},
			inputPhone:{
				required: {
					depends: function(element) {
					  return ($('#inputEmail').val()=="" && $('#inputCellular').val()=="" && $('#inputCity').val()=="" ? true : false) ? true : false;
					}
				},
				validPhone: true
			},
			inputCellular:{
				required: {
					depends: function(element) {
					  return ($('#inputPhone').val()=="" && $('#inputEmail').val()=="" && $('#inputCity').val()=="" ? true : false) ? true : false;
					}
				},
				validCell: true
			},
			inputFax:{
				maxlength: 10,
				digits: true
			}
		};
		messagesList = {
			inputParty: {required: getTranslation("Party Type is required.")},
			inputCity: {required: getTranslation("City is required.")},
			inputCountry: {required: getTranslation("Country is required.")},
			inputStreet: {required: getTranslation("Street is required.")},
			inputHouseNo: {required: getTranslation("House number is required.")},
			//inputEntrance: {required: getTranslation("Entrance is required.")},
			inputZipCode: {required: getTranslation("Zip code is required.")},
			inputPOBox: {required: getTranslation("PO Box is required.")},
			inputEmail: {required: getTranslation("Email address is required."),validEmail:getTranslation("Please enter a valid email address.")},
			inputCellular: {required: getTranslation("Mobile number is required."),validCell: getTranslation("Please enter a valid mobile number.")},
			inputPhone: {required: getTranslation("Phone number is required."),validPhone: getTranslation("Please enter a valid phone number.")}
		};
	}
	if(workspaceType == "Contact"){
		validateRules = {
			inputCity: {required: true},
			//inputCountry: {required: true},
			inputStreet: {required:{
				depends: function(element) {
				  return $('input[type=radio][name=address-type-selection]:checked').val() == "address" && $("#inputCity").data('street-required') == '1'  ? true : false;
				}
			}},
			inputHouseNo: {required:{
				depends: function(element) {
				  return $('input[type=radio][name=address-type-selection]:checked').val() == "address" && $("#inputCity").data('street-required') == '1' ? true : false;
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
	}
	if(workspaceType == "Org"){
		validateRules = {
			inputCity: {required: true},
			//inputCountry: {required: true},
			inputStreet: {required:{
				depends: function(element) {
				  return $('input[type=radio][name=address-type-selection]:checked').val() == "address" && $("#inputCity").data('street-required') == '1'  ? true : false;
				}
			}},
			inputHouseNo: {required:{
				depends: function(element) {
				  return $('input[type=radio][name=address-type-selection]:checked').val() == "address" && $("#inputCity").data('street-required') == '1' ? true : false;
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
				},
				digits: true
			}},
			inputEmail: {
				required: false,
				validEmail: true
			},
			inputPhone:{
				validPhone: true
			},
			inputCellular:{
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
			inputCellular: {validCell: getTranslation("Please enter a valid mobile number.")},
			inputPhone: {validPhone: getTranslation("Please enter a valid phone number.")}
		};
	}
	
	if(valdiateIns != null){
		valdiateIns.resetForm();
	}
	
	if(!isOnClickDefine){
		isOnClickDefine = true;
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
		$('#submitAddress').on('click',function(){
			var submitData = {session_id:constants.sesToken};
			if(!($("#address-from").valid())){
				return false;
			}
			if($('#submitAddress').data('address-id') != undefined && $('#submitAddress').data('address-id')!=""){
				submitData["address_id"] = $('#submitAddress').data('address-id');
				submitData["method"] = "UpdateAddress";
			} else {
				submitData["method"] = "CreateAddress";
			}
			
			submitData["cntry_id"] = $("#inputCountry").data('ID');
			
			if(workspaceType == "Contact"){
				submitData["c_id"] = constants.recordId;
			}
			if(workspaceType == "Incident"){
				submitData["incident_id"] = constants.recordId;
				submitData["party_type"] = $('#inputParty').val();
			}
			if(workspaceType == "Org"){
				submitData["org_id"] = constants.recordId;
			}
			
			if($('input[type=radio][name=address-type-selection]:checked').val() == "address"){
				if($("#inputStreet").data('id')!=undefined && $("#inputStreet").data('id')!="" && $("#inputHouseNo").data('id')!=undefined && $("#inputHouseNo").data('id')!=""){
					submitData["street"] = $("#inputStreet").data('id');
					// if(!$("#inputZipCode").prop("readonly")){
						// submitData["zip_code"] = $("#inputZipCode").val();
					// } else {
						// submitData["zip_code_text"] = $("#inputZipCode").val();
					// }
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
			}
			
			if(workspaceType == "Contact"){
				submitData["address_cross"] = $('#addressCross').is(":checked") ? 1 : 0;
				submitData["cell_cross"] = $('#cellularCross').is(":checked") ? 1 : 0;
				submitData["phone_cross"] = $('#phoneCross').is(":checked") ? 1 : 0;
				submitData["email_cross"] = $('#emailCross').is(":checked") ? 1 : 0;
				submitData["mkt_Cross"] = $('#marketingCross').is(":checked") ? 1 : 0;
				submitData["pen_Cross"] = $('#pension').is(":checked") ? 1 : 0;
				submitData["ins_cross"] = $('#insurance').is(":checked") ? 1 : 0;
			}
			
			if(workspaceType == "Org"){
				submitData["address_cross"] = false;
				submitData["cell_cross"] = false;
				submitData["phone_cross"] = false;
				submitData["email_cross"] = false;	
			}
			
			//if(workspaceType == "Contact" || workspaceType == "Org" ){
			submitData["phone"] = $("#inputPhone").val();
			submitData["cellular"] = $("#inputCellular").val();
			submitData["email_address"] = $("#inputEmail").val();
			submitData["fax"] = $("#inputFax").val();
			//}
			
			console.log("Submitting Record");
			console.log(submitData);
			
			submitData["account_id"] = constants.accountId;
			$('div.overlay').addClass('show');
			$('div.spanner').addClass('show');
			$('div.modal').css("z-index","999");
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
							getAllData();
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
		});
	}
	if(sessionStorage.getItem("countryData")!=undefined){
		constants.cntryData = sessionStorage.getItem("countryData");
		constants.citiesData = sessionStorage.getItem("citiesData");
		setupAddressInput(btn);
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
					setupAddressInput(btn);
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

function getAllData(){
	var calls = [];
	var addressIns = getAddressData();
	calls.push(addressIns);
	if(workspaceType == "Contact" || workspaceType == "Org"){
		var contactIns = getContactInfo();
		calls.push(contactIns);
	}
	if(workspaceType == "Contact" && constants.contactIdNumber!=""){
		var mktIns = getMarketingPref();
		calls.push(mktIns);
	}
	$.when.apply($, calls).then(function(){
		refreshData();
		$('#modalAddress').modal('hide');
		$('div.modal').css("z-index","1055");
		$('div.overlay').removeClass('show');
		$('div.spanner').removeClass('show');
	});
}

function setupAddressInput(btn){
	$("#inputCity").autocomplete({
		minLength: 2,
		source: JSON.parse(constants.citiesData),
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
	setAddressUpdateData(btn);
	$('#modalAddress').modal('show');
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
						$("#inputCity").data('street-required','0');
					}
				} else {
					$("#inputCity").data('street-required','1');
				}
				$("#inputPOBox").autocomplete({
					minLength: 1,
					source: poboxData,
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

function setAddressUpdateData(btn){
	if($(btn).data('id')!=undefined && $(btn).data('id')!=null && $(btn).data('id')!=""){
		$('#submitAddress').data('address-id',$(btn).data('id'));
		if(workspaceType == "Contact" || workspaceType == "Org"){
			setAutocompletCurrentValue("#inputCountry",$(btn).data('country_name'));
			$("#inputCountry").val($(btn).data('country_name'));
			$("#inputCountry").data("LookupName",$(btn).data('iso_cntry_code'));
			$("#inputCountry").data("ID",getCntryId($(btn).data('iso_cntry_code')));
			$("#inputCountry").trigger('keydown');
			setAutocompletCurrentValue("#inputCity",$('#city-block').text());
			$("#inputCity").data('id', $('#city-block').data('city_id'));
			$("#inputCity").trigger('keydown');
			setStreetAndPOBox($('#city-block').data('mdm_city_id'));
			if($('#pobox-id').text()!=""){
				$("#radioPOBox").prop("checked", true);
				$('#inputPOBox').val($('#pobox-id').text());
				$('#inputPOBox').data('ID',$('#pobox-id').data('po_box_id'));
				$('#inputPOBox').trigger('keydown');
				$('div.address-part').hide();
				$('#pobox-parent').show();
				$('#inputHouseNo').val('');
				$('#inputEntrance').val('');
				$('#inputStreet').val('');
				$('#inputStreet').data('id','');
				setAutocompletCurrentValue("#inputPOBox",$('#pobox-id').text());
				$('#inputZipCode').val($('#zipcode-block').text());
			} else {
				$("#radioAddress").prop("checked", true);
				$('#inputZipCode').val($('#zipcode-block').text());
				$('#inputStreet').val($('#street-block').text());
				$('#inputStreet').data('id',$('#street-block').data('id'));
				$('#inputStreet').data('street_id',$('#street-block').data('street_id'));
				$('#inputStreet').trigger('keydown');
				setAutocompletCurrentValue("#inputStreet",$('#street-block').text());
				$('#inputHouseNo').val($('#house-block').text());
				$('#inputHouseNo').trigger('keydown');
				$('#inputHouseNo').data('id',$('#house-block').data('zip_code'));
				setAutocompletCurrentValue("#inputHouseNo",$('#house-block').text());
				$('#inputEntrance').val($('#entrance-block').text());
				$('div.address-part').show();
				$('#inputPOBox').val('');
				$('#inputPOBox').data('ID','');
				$('#pobox-parent').hide();
				setZipData($('#street-block').data('street_id'), $('#city-block').data('mdm_city_id'));
			}
		}
		if(workspaceType == "Incident"){
			setAutocompletCurrentValue("#inputCountry",$(btn).data('country_name'));
			$("#inputCountry").val($(btn).data('country_name'));
			$("#inputCountry").data("LookupName",$(btn).data('iso_cntry_code'));
			$("#inputCountry").data("ID",getCntryId($(btn).data('iso_cntry_code')));
			$("#inputCountry").trigger('keydown');
			var isPartySeleted = false;
			$("#party-parent option").filter(function() {
				if(this.text == $(btn).parent().parent().find('td.party-info').text()){
					isPartySeleted = true;
					return true;
				}
			}).attr('selected', true);
			if(!isPartySeleted){
				$('#inputParty').append('<option value="contact_'+$(btn).parent().parent().find('td.party-info').data("contact_id")+'" data-type="contact" selected>'+$(btn).parent().parent().find('td.party-info').text()+'</option>');
			}
			setAutocompletCurrentValue("#inputCity",$(btn).parent().parent().find('td.city-info').text());
			$("#inputCity").data('id', $(btn).parent().parent().find('td.city-info').data('city_id'));
			$("#inputCity").trigger('keydown');
			setStreetAndPOBox($(btn).parent().parent().find('td.city-info').data('mdm_city_id'));
			
			$('#inputCellular').val($(btn).parent().parent().find('td.cell-info').text());
			$('#inputEmail').val($(btn).parent().parent().find('td.email-info').text());
			$('#inputPhone').val($(btn).parent().parent().find('td.phone-info').text());
			$('#inputFax').val($(btn).parent().parent().find('td.fax-info').text());
			
			if($(btn).parent().parent().find('td.pobox-info').text()!=""){
				$("#radioPOBox").prop("checked", true);
				$('#inputPOBox').val($(btn).parent().parent().find('td.pobox-info').text());
				$('#inputPOBox').data('ID',$(btn).parent().parent().find('td.pobox-info').data('po_box_id'));
				$('#inputPOBox').trigger('keydown');
				$('#inputZipCode').val($(btn).parent().parent().find('td.zip-code-info').text());
				$('div.address-part').hide();
				$('#inputHouseNo').val('');
				$('#inputEntrance').val('');
				$('#inputStreet').val('');
				$('#inputStreet').data('id','');
				$('#pobox-parent').show();
			} else {
				$("#radioAddress").prop("checked", true);
				$('#inputZipCode').val($(btn).parent().parent().find('td.zip-code-info').text());
				$('#inputStreet').val($(btn).parent().parent().find('td.street-info').text());
				$('#inputStreet').data('id',$(btn).parent().parent().find('td.street-info').data('id'));
				$('#inputStreet').data('street_id',$(btn).parent().parent().find('td.street-info').data('street_id'));
				$('#inputStreet').trigger('keydown');
				$('#inputHouseNo').val($(btn).parent().parent().find('td.house-info').text());
				$('#inputHouseNo').trigger('keydown');
				$('#inputHouseNo').data('id',$(btn).parent().parent().find('td.house-info').data('zip_code'));
				$('#inputEntrance').val($(btn).parent().parent().find('td.entrance-info').text());
				$('div.address-part').show();
				$('#inputPOBox').val('');
				$('#inputPOBox').data('ID','');
				$('#pobox-parent').hide();
				setZipData($(btn).parent().parent().find('td.street-info').data('street_id'), $(btn).parent().parent().find('td.city-info').data('mdm_city_id'));
			}
		}
	} else {
		$('#submitAddress').data('address-id','');
		$("#inputCountry").trigger('keydown');
		$("#inputCity").val('');
		$("#inputCity").trigger('keydown');
		$('#inputPOBox').val('');
		$("#radioAddress").prop("checked", true);
		$('#inputPOBox').val('');
		$('#inputPOBox').data('ID','');
		$('#inputZipCode').val('');
		$('#inputHouseNo').val('');
		$('#inputEntrance').val('');
		$('#inputStreet').val('');
		$('#inputStreet').data('id','');
		$('#submitAddress').data('address-id','');
		$('#inputParty').val('');
		$("#inputCountry").val('');
		
		if(constants.default_country_name!=""){
			$("#inputCountry").val(constants.default_country_name);
			$("#inputCountry").data("LookupName",constants.default_country_code);
			$("#inputCountry").data("ID",constants.default_country_code);
			$("#inputCountry").trigger('keydown');
		}
	}
	if(workspaceType == "Contact"){
		if($('#checkCross').is(":checked")){
			$("#marketingCross").prop("checked", true);
		}
		if($('#checkPension').is(":checked")){
			$("#pension").prop("checked", true);
		}
		if($('#checkInsurance').is(":checked")){
			$("#insurance").prop("checked", true);
		}
	}
	//if(workspaceType == "Contact" || workspaceType == "Org"){
	$('#inputPhone').val($('#home-phone').text());
	$('#inputCellular').val($('#cell-phone').text());
	$('#inputEmail').val($('#email').text());
	$('#inputFax').val($('#fax-phone').text());
	//}
	if(workspaceType == "Incident"){
		$('#party-parent').show();
	}
}

//This function will open the dialog and assign constant values to the dialog.
function loadDialog() {
	var parentFrameId = localStorage.getItem("ManageAddress");
    if (parentFrameId) {
        if (ieFlag) {
            parentFrame = window.parent.frames[parentFrameId];
        } else {
            parentFrame = window.parent.frames[parentFrameId].contentWindow;
        }
        constants = parentFrame.constants;
		workspaceType = parentFrame.workspaceType;
		//contactData = parentFrame.contactData;
		updateTranslation();
		refreshData();
		document.getElementById('close-popup').onclick = function () { collapseDialog() };
		document.getElementById('createAddress').onclick = function () { openAddressCreateDialog(this); };
		document.getElementById('updateAddress').onclick = function () { openAddressCreateDialog(this); };
		$(document.body).on('click', 'a.incident-address' ,function(){
			openAddressCreateDialog(this);
		});
		$(document.body).on('click', 'a.incident-address-delete' ,function(){
			deleteAddress(this);
		});
		document.getElementById('closeCreateAddressModal').onclick = function () { $('#modalAddress').modal('hide'); };
        localStorage.removeItem("ManageAddress");
		$("#address-type").change(function() {
			if($('option:selected', this).val() == 'crm-address'){
				$('div.address').hide();
				$('#crm-address').show();
				$('#btn-group').show();
			}
			if($('option:selected', this).val() == 'interior-minister'){
				$('div.address').hide();
				$('#interior-minister-address').show();
				$('#btn-group').hide();
			}
		});
		$('div.overlay').removeClass('show');
		$('div.spanner').removeClass('show');
    }
}

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

//This function will delete address api to delete address
function deleteAddress(btn){
	if($(btn).data('id')!=undefined && $(btn).data('id')!=null && $(btn).data('id')!=""){
		if(confirm('Are you sure you want to delete this address?')) {
			$('div.overlay').addClass('show');
			$('div.spanner').addClass('show');
			$.ajax({
				url : constants.hostURL,
				type: "POST",
				data : {method:"DeleteAddress", session_id: constants.sesToken,address_id:$(btn).data('id')},
				success: function(data, textStatus, jqXHR)
				{
					if(IsJsonString(data)){
						var dataRes = JSON.parse(data);
						if(dataRes.success == 1){
							$('div.overlay').removeClass('show');
							$('div.spanner').removeClass('show');
							getAllData();
						}
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
}

//This function will refersh the address data.
function refreshData(){
	$('#phoneCrossParent').show();
	$('#cellularCrossParent').show();
	$('#emailCrossParent').show();
	$('#addressCrossParent').show();
	if(workspaceType == "Contact" || workspaceType == "Org"){
		$('#home-phone').html(constants.contactDetails.home);
		$('#cell-phone').html(constants.contactDetails.mobile);
		$('#email').html(constants.contactDetails.email);
		$('#fax-phone').html(constants.contactDetails.fax);
	}
	if(constants.addressData != null && constants.addressData.length > 0){
		if(workspaceType == "Contact" || workspaceType == "Org"){
			$('#updateAddress').show();
			$('#createAddress').hide();
			var addIns = constants.addressData[0];
			$('#updateAddress').data('id',addIns.id);
			$('#updateAddress').data('country_name',addIns.country_name);
			$('#updateAddress').data('iso_cntry_code',addIns.iso_cntry_code);
			var addressHTML = '<tr>';
			addressHTML += addIns.city!= '' ? '<td id="city-block" data-mdm_city_id="'+addIns.mdm_city_id+'" data-city_id="'+addIns.city_id+'" >'+addIns.city+'</td>'  : '<td></td>' ;
			addressHTML += addIns.entrance!= '' ? '<td id="entrance-block">'+addIns.entrance+'</td>'  : '<td></td>' ;
			addressHTML += (addIns.street_name!= '' || addIns.stree_text!="") ? '<td id="street-block" data-street_id="'+addIns.mdm_street_id+'" data-id="'+addIns.street_id+'">'+addIns.street_name+addIns.stree_text+'</td>'  : '<td></td>' ;
			
			addressHTML += addIns.house_no!= ''? '<td id="house-block" data-zip_code="'+addIns.zip_code+'">'+addIns.house_no+'</td>'  : '<td></td>' ;
			addressHTML += (addIns.zip_code_7!= '' || addIns.po_box_zip_code_7!="" || addIns.zip_code_text !="") ? '<td id="zipcode-block">'+addIns.zip_code_7+addIns.po_box_zip_code_7+addIns.zip_code_text+'</td>'  : '<td class="zipcode-block"></td>' ;
			addressHTML += addIns.po_box!= ''? '<td id="pobox-id" data-po_box_id='+addIns.po_box_id+'>'+addIns.po_box+'</td>'  : '<td></td>' ;
			addressHTML += '</tr>';
			$('#contactInfoData').show();
			$('#contact-info').show();
		}
		if(workspaceType == "Incident"){
			$('#updateAddress').hide();
			$('#createAddress').show();
			var addressHTML = "";
			for (var i = 0; i < constants.addressData.length; i++) {
				var addIns = constants.addressData[i];
				addressHTML += '<tr>';
				addressHTML += addIns.city!= '' ? '<td class="city-info" data-mdm_city_id="'+addIns.mdm_city_id+'" data-city_id="'+addIns.city_id+'" >'+addIns.city+'</td>'  : '<td class="city-info"></td>' ;
				addressHTML += addIns.entrance!= '' ? '<td class="entrance-info">'+addIns.entrance+'</td>'  : '<td class="entrance-info"></td>' ;
				addressHTML += (addIns.street_name!= '' || addIns.stree_text!="") ? '<td class="street-info" data-street_id="'+addIns.mdm_street_id+'" data-id="'+addIns.street_id+'">'+addIns.street_name+addIns.stree_text+'</td>'  : '<td class="street-info"></td>';
				addressHTML += addIns.house_no!= ''? '<td class="house-info" data-zip_code="'+addIns.zip_code+'">'+addIns.house_no+'</td>'  : '<td class="house-info"></td>' ;
				addressHTML += (addIns.zip_code_7!= '' || addIns.po_box_zip_code_7!="" || addIns.zip_code_text !="") ? '<td class="zip-code-info">'+addIns.zip_code_7+addIns.po_box_zip_code_7+addIns.zip_code_text+'</td>'  : '<td class="zip-code-info"></td>' ;
				addressHTML += addIns.po_box!= ''? '<td class="pobox-info" data-po_box_id='+addIns.po_box_id+'>'+addIns.po_box+'</td>'  : '<td class="pobox-info"></td>' ;
				if(addIns.contact_id!="" || addIns.parties_type!=""){
					addressHTML += addIns.contact_id!="" ? '<td class="party-info" data-contact_id="contact_'+addIns.contact_id+'">'+addIns.full_name+'</td>':"";
					addressHTML += addIns.parties_type!= ''? '<td class="party-info">'+addIns.parties_type+'</td>'  : "";
				} else {
					addressHTML += '<td class="party-info"></td>';
				}
				addressHTML += '<td class="email-info">'+addIns.add_email+'</td>';
				addressHTML += '<td class="cell-info">'+addIns.add_cellular+'</td>';
				addressHTML += '<td class="phone-info">'+addIns.add_home_phone+'</td>';
				addressHTML += '<td class="fax-info">'+addIns.add_fax+'</td>';
				addressHTML += '<td><a href="#" class="incident-address" data-id="'+addIns.id+'" data-country_name="'+addIns.country_name+'" data-iso_cntry_code="'+addIns.iso_cntry_code+'" >'+getTranslation("Update")+'</a></td>' ;
				addressHTML += '<td><a href="#" class="incident-address-delete" data-id="'+addIns.id+'">'+getTranslation("Delete")+'</a></td>' ;
				addressHTML += '</tr>';
			}
		}
		$('#addressBody').html(addressHTML);
	} else {
		var addressHTML = '<tr><td colspan="'+(workspaceType== "Incident" ? '9' : '6')+'">No address found.</td></tr>';
		$('#addressBody').html(addressHTML);
	}
	if(workspaceType == "Contact"){
		if(constants.mktData != null){
			if(constants.mktData.MarketMailDetailsResponse != undefined && constants.mktData.MarketMailDetailsResponse.Response != undefined && constants.mktData.MarketMailDetailsResponse.Response.MarketMailDetails != undefined){
				$.each(constants.mktData.MarketMailDetailsResponse.Response.MarketMailDetails, function (key, permission) {
					if(permission.type == "INS" && permission.mail_confirm_marketing == "3" ){
						$("#checkInsurance").prop("checked", true);
					}
					if(permission.type == "PEN_GEMEL" && permission.mail_confirm_marketing == "3" ){
						$("#checkPension").prop("checked", true);
					}
					if(permission.type == "CROSS" && permission.mail_confirm_marketing == "3" ){
						$("#checkCross").prop("checked", true);
					}
				});
			}
		}
		$('#marketingInfoData').show();
		$('#marketing-info').show();
	}
	if(workspaceType == "Incident" || workspaceType == "Org"){
		$('#marketingInfoData').hide();
		$('#marketing-info').hide();
		$('#phoneCrossParent').hide();
		$('#cellularCrossParent').hide();
		$('#emailCrossParent').hide();
		$('#addressCrossParent').hide();
	}
	if(workspaceType == "Org"){
		$('#contact-info').find('div.row').removeClass('row').addClass('col-sm-6 col-md-4');
		$('#contact-info').find('div.form-group.col-md-8').addClass('col-md-12').removeClass('col-md-8');
		$('#contact-info').addClass('row').removeClass('col-sm-12 col-md-6');
		$('#contactInfoData').css('margin','0 auto');
		$('#address-type').hide();
	}
	if(workspaceType == "Incident"){
		$('#contact-info').show();
		$('#contact-info').find('div.row').removeClass('row').addClass('col-sm-6 col-md-4');
		$('#contact-info').find('div.form-group.col-md-8').addClass('col-md-12').removeClass('col-md-8');
		$('#contact-info').addClass('row').removeClass('col-sm-12 col-md-6');
		$('#contactInfoData').hide();
		$('#address-type').hide();
		if($('#party-header').length == 0){
			$('#address-header').append('<th id="party-header">'+getTranslation("Party Type")+'</th><th id="email-header">'+getTranslation("Email")+'</th><th id="cell-header">'+getTranslation("Cellular")+'</th><th id="phone-header">'+getTranslation("Phone")+'</th><th id="fax-header">'+getTranslation("Fax")+'</th><th></th><th></th>');
		}
	}
}

//Following function will load the extension.
function loadExtension() {
    ORACLE_SERVICE_CLOUD.extension_loader.load(appId, apiVersion).then(function (extensionProvider) {
        constants._extensionProvider = extensionProvider;
		//document.getElementById('open-popup').onclick = function () { renderDialog() };
		extensionProvider.getGlobalContext().then(function(globalContext) {
			constants.accountId = globalContext.getAccountId();
		});
		extensionProvider.registerWorkspaceExtension(function(workspaceRecord){
			workspaceRecord.addRecordSavedListener(function(){
				getAllData();
			});
			workspaceType = workspaceRecord.getWorkspaceRecordType();
			var fieldDetails;
			if(workspaceType == "Contact"){
				fieldDetails = ['Contact.c_id','Contact.co$id_number'];
			}
			if(workspaceType == "Incident"){
				fieldDetails = ['Incident.i_id','Incident.c_id','Incident.CO$related_contact'];
			}
			if(workspaceType == "Org"){
				fieldDetails = ['Org.org_id','Org.co$id_number'];
			}
			workspaceRecord.getFieldValues(fieldDetails).then(function(IFieldDetails){
				if(workspaceType == "Contact"){
					constants.recordId = IFieldDetails.getField('Contact.c_id').getLabel();
					constants.contactIdNumber = IFieldDetails.getField('Contact.co$id_number').getLabel();
				}
				if(workspaceType == "Incident"){
					constants.recordId = IFieldDetails.getField('Incident.i_id').getLabel();
					constants.incident_primary_id = IFieldDetails.getField('Incident.c_id').getValue();
					constants.incident_primary_name = IFieldDetails.getField('Incident.c_id').getLabel();
					constants.incident_related_id = IFieldDetails.getField('Incident.CO$related_contact').getValue();
					constants.incident_related_name = IFieldDetails.getField('Incident.CO$related_contact').getLabel();
				}
				if(workspaceType == "Org"){
					constants.recordId = IFieldDetails.getField('Org.org_id').getLabel();
					constants.contactIdNumber = IFieldDetails.getField('Org.co$id_number').getLabel();
				}
				IFieldDetails.getParent().parent.getExtensionProvider().getGlobalContext().then(function(globalContext) {
					globalContext.getSessionToken().then(function(sessionToken)
					{
						constants.sesToken = sessionToken;
						globalContext.getExtensionContext('ManageAddress').then(function(extensionContext) {
							extensionContext.getProperties(['hostURL','errorMsg','idNotFound','report_id','screen_labels','default_country_name','default_country_code']).then(function(collection) {
								constants.hostURL = (window.location.protocol+"//"+window.location.hostname)+(collection.get('hostURL').value);
								constants.errorMsg = collection.get('errorMsg').value;
								constants.idNotFound = collection.get('idNotFound').value;
								constants.report_id = collection.get('report_id').value;
								constants.default_country_name = collection.get('default_country_name').value;
								constants.default_country_code = collection.get('default_country_code').value;
								
								if(constants.recordId== null || constants.recordId.toString().trim() == "" || (constants.recordId < 0)){
									showError(constants.idNotFound);
									$('#updateAddress').hide();
									//$($('#'+window.frameElement.id,window.parent.document).parent()).height('100%');
									return;
								}
								
								var screenLabels = new Array();
								var explodedLabels = collection.get('screen_labels').value.split(',');
								
								for (var i = 0; i < explodedLabels.length; i++) {
									var labelIns = explodedLabels[i].split(":::");
									screenLabels[labelIns[0].toLowerCase()] = labelIns[1];
								}
								constants.labels = screenLabels;

								// if(constants.recordId== null || constants.recordId.toString().trim() == ""){
									// showError(constants.idNotFound);
									// return;
								// }
								$('#updateAddress').html(getTranslation("Manage Address"));
								if(constants.recordId != null && constants.recordId.toString().trim() != ""){
									var calls = [];
									var addressIns = getAddressData();
									calls.push(addressIns);
									if(workspaceType == "Contact" || workspaceType == "Org"){
										var contactIns = getContactInfo();
										calls.push(contactIns);
									}
									if(workspaceType == "Contact" && constants.contactIdNumber!=""){
										var mktIns = getMarketingPref();
										calls.push(mktIns);
									}
									$.when.apply($, calls).then(function(){
										$('div.overlay').removeClass('show');
										$('div.spanner').removeClass('show');
									});
								}
								
								$('.table-responsive').on("click", "a#updateAddress",function(e) {
									renderDialog();
								});
								
								// setTimeout(function(){
									// $($('#'+window.frameElement.id,window.parent.document).parent()).height('100%');
									// $('#nav-tabContent').height($('body').height()-$('#nav-tab').height());
								// }, 1000);
								// $( window ).resize(function() {
								  // $($('#'+window.frameElement.id,window.parent.document).parent()).height('100%');
								  // $('#nav-tabContent').height($('body').height()-$('#nav-tab').height());
								// });
							});
						});
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

//This function will fetch address details related to a record.
function getAddressData(){
	var formData = {method:"GetAddress"};
	formData["ws_type"] = workspaceType;
	formData["record_number"] = constants.recordId;
	formData["report_id"] = constants.report_id;
	formData["session_id"] = constants.sesToken;
	return $.ajax({
		url : constants.hostURL,
		type: "POST",
		data : formData,
		success: function(data, textStatus, jqXHR)
		{
			if(IsJsonString(data)){
				constants.addressData = JSON.parse(data);
			}
		},
		error: function (jqXHR, textStatus, errorThrown)
		{
			showError("<p>"+constants.errorMsg+"</p>");
			$('div.overlay').removeClass('show');
			$('div.spanner').removeClass('show');
		}
	});
}

function getContactInfo(){
	var formData = {method:"GetContactDetail"};
	formData["ws_type"] = workspaceType;
	if(workspaceType == 'Contact'){
		formData["c_id"] = constants.recordId;
	}
	if(workspaceType == 'Org'){
		formData["org_id"] = constants.recordId;
	}
	formData["session_id"] = constants.sesToken;
	return $.ajax({
		url : constants.hostURL,
		type: "POST",
		data : formData,
		success: function(data, textStatus, jqXHR)
		{
			if(IsJsonString(data)){
				constants.contactDetails = JSON.parse(data);
			}
		},
		error: function (jqXHR, textStatus, errorThrown)
		{
			showError("<p>"+constants.errorMsg+"</p>");
			$('div.overlay').removeClass('show');
			$('div.spanner').removeClass('show');
		}
	});
}

//Following function will bring marketing preference form MDM system.
function getMarketingPref(){
	var marketingReq = {method:"GetMarketingMailingPref",id:constants.contactIdNumber,session_id:constants.sesToken};
	return $.ajax({
		url : constants.hostURL,
		type: "POST",
		data : marketingReq,
		success: function(marketingData, textStatus, jqXHR)
		{
			constants.mktData = JSON.parse(marketingData);
		},
		error: function (jqXHR, textStatus, errorThrown)
		{
			showError("<p>"+constants.errorMsg+"</p>");
			$('div.overlay').removeClass('show');
			$('div.spanner').removeClass('show');
		}
	});
}

//Following function will render the modal popup Dialog.
function renderDialog() {
    constants._extensionProvider.registerUserInterfaceExtension(function (uiContext) {
        uiContext.getModalWindowContext().then(function (IModalWindowContext) {
            localStorage.setItem("ManageAddress", this.window.frameElement.id);
            var modalWindow = IModalWindowContext.createModalWindow();
            modalWindowID = modalWindow.getId();
            modalWindow.setContentUrl("../view/dialog.html");
            modalWindow.setWidth(Math.round(window.parent.innerWidth*0.8)+"px");
            modalWindow.setHeight(Math.round(window.parent.innerHeight*0.8)+"px");
            modalWindow.render().then(function(renderedWindow)
			{
				$('div.oj-dialog-header',window.parent.document).remove();
			});
        });
    });
}

//Following function will close the modal popup Dialog.
function collapseDialog() {
    constants._extensionProvider.registerUserInterfaceExtension(function (uiContext) {
        uiContext.getModalWindowContext().then(function (IModalWindowContext) {
            IModalWindowContext.getCurrentModalWindow().then(function (IModalWindow) {
                IModalWindow.close();
				console.log("Modal Dialog Closed.");
				// document.getElementById('list-parent').innerHTML = "";
				// document.getElementById('warning-msg').innerHTML = "";
				lastParent = null;
            });
        });
    });
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