var appId = "360Degree";
var apiVersion = "1.0";
var constants = {
    sesToken: null,
    hostURL: null,
	idNotFound: null,
	recordId: null,
    _extensionProvider: null,
	columnConfigs: null,
	noProductFound: "",
	noDetailsFound: "",
	errorMsg: "",
	LifeColumns: "",
	HealthColumns:"",
	PensiaColumns:"",
	GemelColumns:"",
	ElementarColumns:"",
	LifeFlag:null,
	HealthFlag:null,
	PensiaFlag:null,
	GemelFlag:null,
	ElementarFlag:null,
	LifeActiveCount: null,
	HealthActiveCount: null,
	PensiaActiveCount: null,
	GemelActiveCount: null,
	ElementarActiveCount: null,
	contactId:null,
	contactAlreadyOpen: "",
	contactNotExist:"",
	noClaimData:"",
	agentDetailColumns:null,
	alfonsoPopupTitle: "",
	showProducts:"",
	active:"",
	inactive:"",
	claimActive:"",
	claimInActive:"",
	visibleProduct:""
};
var contactData = {};
var ieFlag = window.ActiveXObject || "ActiveXObject" in window;
var workspaceType = "";
var productSequence = "";
var contactIdNumber = null;
var clickedUID = null;
var clickedAgentId = null;
var clickedProduct = null;

//This function intialize the extension according the passed parameter whether it is main screen or dialog.
//Parameter: screen (Values: Dialog and Main)
function initialize(screen) {
    if (screen == "dialog") {
        loadDialog();
    } else {
        loadExtension();
    }
}

//This function will open the dialog and assign constant values to the dialog.
function loadDialog() {
	var parentFrameId = localStorage.getItem("360Degree");
    if (parentFrameId) {
        if (ieFlag) {
            parentFrame = window.parent.frames[parentFrameId];
        } else {
            parentFrame = window.parent.frames[parentFrameId].contentWindow;
        }
        constants = parentFrame.constants;
		clickedUID = parentFrame.clickedUID;
		clickedProduct = parentFrame.clickedProduct;
		contactData = parentFrame.contactData;
		clickedAgentId = parentFrame.clickedAgentId;
		document.getElementById('close-popup').onclick = function () { collapseDialog() };
		//Below code will open the contact on click on client id in Elementar product.
		if(clickedUID != null){
			$(document).on("click", "a.show-agent-details",function(e) {
				$('div.overlay').addClass('show');
				$('div.spanner').addClass('show');
				showAgentDetailPopup($(this).text(),$(this).data('product'));
			});
			$(document).on("click", "a.show-contact",function(e) {
				var clickedClientId = $(this).data("client-id");
				console.log("clickedClientId:"+clickedClientId);
				var formData = {method:"GetContactIdByClientID",client_id:clickedClientId};
				
				formData["session_id"] = constants.sesToken;
				$.ajax({
					url : constants.hostURL,
					type: "POST",
					data : formData,
					success: function(data, textStatus, jqXHR)
					{
						if(IsJsonString(data)){
							var contactFields = JSON.parse(data);
							if(contactFields.contact_id != "" && constants.contactId != null && contactFields.contact_id != constants.contactId ){
								constants._extensionProvider.registerWorkspaceExtension(function(workspaceRecord)
								{
									workspaceRecord.editWorkspaceRecord('Contact',contactFields.contact_id,function(workspaceRecord)
									{
										console.log("Workspace loaded.");
									}); 
								});
							} else if(contactFields.contact_id != "" && constants.contactId != null && contactFields.contact_id == constants.contactId){
								alert(constants.contactAlreadyOpen);
							} else if(contactFields.contact_id == ""){
								alert(constants.contactNotExist);
							} else if(constants.contactId == null && contactFields.contact_id!=""){
								constants._extensionProvider.registerWorkspaceExtension(function(workspaceRecord)
								{
									workspaceRecord.editWorkspaceRecord('Contact',contactFields.contact_id,function(workspaceRecord)
									{
										console.log("Workspace loaded.");
									}); 
								});
							}
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
			});
			localStorage.removeItem("360Degree");
			showProductDetails();
		}
		if(clickedAgentId != null){
			showAgentDetail(clickedAgentId, clickedProduct);
		}
    }
}

//Following function will show details of each policy or product when the link in clicked in product list records.
function showProductDetails(){
	$('#list-body').html("");
	var columnDefination = constants[clickedProduct+"Columns"];
	var recordData = JSON.parse(contactData[clickedProduct]);
	var record = null;
	var productNodes = {};
	//Following code define node array which comes in response, so we can easily traverse the response dynamically.
	productNodes["Life"] = ["GetTmlCrmLfResponse","GetTmlCrmLfOutput"];
	productNodes["Health"] = ["GetTmlCrmBrResponse","GetTmlCrmBrOutput"];
	productNodes["Gemel"] = ["GetTmlCrmGmlResponse","GetTmlCrmGmlOutput"];
	productNodes["Pensia"] = ["GetTmlCrmPnResponse","GetTmlCrmPnOutput"];
	productNodes["Elementar"] = ["GetTmlCrmElResponse","GetTmlCrmEl_Output"];
	productNodes["ElementarClaim"] = ["GetTmlCrmTvElResponse","GetTmlCrmTvElOutput"];
	var attributeName = (clickedProduct == "Elementar" || clickedProduct == "ElementarClaim") ? "OutputData" : "DATA";
	var records = recordData[productNodes[clickedProduct][0]][productNodes[clickedProduct][1]][attributeName];
	for (let i = 0; i < records.length; i++) {
		var currentrecord = records[i];
		//Following code define unique key for each product. For elementar it is 'POLISA' and for other it is 'KISUI'.
		var uniqueKey = clickedProduct == "Elementar" ? "POLISA" : "KISUI";
		if(currentrecord[uniqueKey]==clickedUID){
			record = currentrecord;
			break;
		}
	}
	var productTitles = {};
	//Following array contains title of modal popup for each particular product.
	productTitles["Life"] = "פרטי הפוליסה";
	productTitles["Health"] = "פרטי הפוליסה";
	productTitles["Gemel"] = "פרטי הפוליסה";
	productTitles["Pensia"] = "פרטי הפוליסה";
	productTitles["Elementar"] = "פרטי הפוליסה";
	productTitles["ElementarClaim"] = "פרטי התביעה";
	//Following array contains titles of each section like Role, Coverage etc.
	var secHeadings = {};
	secHeadings["R"] = 'בעלי תפקידים';
	secHeadings["C"] = 'כיסויים';
	secHeadings["PL"] = 'מסלולים';
	
	var productColmunSeq = {};
	//Following array defines sequence of columns for each product. 'M' stands for Mail columns.
	//'A' stands for Additional details columns.
	//'R' stands for Role Columns.
	//'C' stands for Claim Columns.
	//'PL' stands for Plan Columns.
	productColmunSeq["Life"] = ['M','A','R','C'];
	productColmunSeq["Health"] =  ['M','A','R','C'];
	productColmunSeq["Gemel"] = ['M','A','R','PL'];
	productColmunSeq["Pensia"] = ['M','A','R','PL'];
	productColmunSeq["Elementar"] = ['M','A','R','C'];
	productColmunSeq["ElementarClaim"] = ['M','A','R','C'];
	//Following code will create content of modal popup.
	var htmlData = '<div class="row" id="policy-section">';
	var cols = columnDefination.split(";");
	for(let i = 0; i < productColmunSeq[clickedProduct].length; i++){
		var sectionHeading="";
		if(productColmunSeq[clickedProduct][i] == "M"){
			sectionHeading = '<h4 style="text-align:center;background-color:#f2f2f3;" >'+productTitles[clickedProduct]+'</h4>';
		} else if(secHeadings[productColmunSeq[clickedProduct][i]]!=undefined) {
			sectionHeading = '<h4 style="text-align:center;background-color:#f2f2f3;">'+secHeadings[productColmunSeq[clickedProduct][i]]+'</h4>';
		}
		
		var titleAdded = false;
		for (col in cols){
			var colTemp = cols[col].split(",");
			var showExtraFields = true;
			if(productColmunSeq[clickedProduct][i] != "M" && (!constants[clickedProduct+"Flag"])){
				showExtraFields = false;
			}
			if(clickedProduct == "Elementar" && productColmunSeq[clickedProduct][i] != "M" && productColmunSeq[clickedProduct][i] != "A"){
				showExtraFields = false;
			}
			if(colTemp[2] == productColmunSeq[clickedProduct][i] && showExtraFields){
				var cellValue = formatCellValue(record, colTemp[0], colTemp[5]);
				if(!titleAdded){
					if(productColmunSeq[clickedProduct][i] == "M"){
						htmlData += sectionHeading;
					} else if(constants[clickedProduct+"Flag"]) {
						htmlData += sectionHeading;
					}
				}
				titleAdded = true;
				if(colTemp[0].toLowerCase() == "m_sochen"){
					cellValue = '<a href="#" class="show-agent-details" data-product="'+clickedProduct+'">'+cellValue+'</a>';
				}
				var htmlNode = '<div class="col-md-4 row" style="margin-bottom:10px;"><div class="col-md-6" style="font-weight:700;">'+colTemp[1]+'</div><div class="col-md-6">'+cellValue+'</div></div>';
				var carFields = ["EL_M_RECHEV","EL_TEUR_SUG_KISUI_RECHEV"];
				var apartmentFields = ["EL_SCHUM_MIVNE_1","EL_SCHUM_MIVNE_2","EL_SCHUM_TCHULA_1","EL_MISPAR_BAIT_DIRA_1||EL_SHEM_RECHOV_DIRA_1||EL_SHEM_YESHUV_DIRA_1","EL_MISPAR_BAIT_DIRA_2||EL_SHEM_RECHOV_DIRA_2||EL_SHEM_YESHUV_DIRA_2","EL_MISPAR_BAIT_TCHULA_1||EL_SHEM_RECHOV_TCHULA_1||EL_SHEM_YESHUV_TCHULA_1"];
				if(clickedProduct == "Elementar"){
					if(record["MUTZAR_MERAKEZ"] == "ביטוחי רכב" && apartmentFields.includes(colTemp[0])){
						htmlNode = "";
					}
					if(record["MUTZAR_MERAKEZ"] == "ביטוחי דירה" && carFields.includes(colTemp[0])){
						htmlNode = "";
					}
				}
				htmlData += htmlNode;
			}
		}
	}
	htmlData += '</div>';
	var elementerRoles = "";
	var elementerCoverage = "";
	if(clickedProduct == "Elementar" && constants[clickedProduct+"Flag"]){
		if(IsJsonString(constants.elementarRoleData)){
			var tableData = "";
			var roleParsedData = JSON.parse(constants.elementarRoleData);
			if(roleParsedData.hasOwnProperty("GetTmlCrmElTafkidimResponse") && roleParsedData.GetTmlCrmElTafkidimResponse.hasOwnProperty("GetTmlCrmElTafkidim_Output") && roleParsedData.GetTmlCrmElTafkidimResponse.GetTmlCrmElTafkidim_Output.hasOwnProperty("OutputData") && roleParsedData.GetTmlCrmElTafkidimResponse.GetTmlCrmElTafkidim_Output.OutputData.length > 0){
				var roleData = roleParsedData.GetTmlCrmElTafkidimResponse.GetTmlCrmElTafkidim_Output.OutputData;
				var header = "";
				var roleFieldNames = [];
				for (col in cols){
					var colTemp = cols[col].split(",");
					if(colTemp[2] == "R"){
						header += '<th>'+colTemp[1]+'</th>';
						roleFieldNames.push(colTemp);
					}
				}
				for(let j = 0; j < roleData.length; j++){
					tableData += '<tr>';
					for(let k = 0; k < roleFieldNames.length; k++){
						var roleReocrd = roleData[j];
						var cellValue = formatCellValue(roleReocrd, roleFieldNames[k][0], roleFieldNames[k][5]);
						if(roleFieldNames[k][0] == "CLIENT_ID" && cellValue!=""){
							cellValue = '<a class="show-contact" data-client-id="'+roleReocrd[roleFieldNames[k][0]]+'" href="#" >'+roleReocrd[roleFieldNames[k][0]]+'</a>';
						}
						tableData += '<td>'+cellValue+'</td>';
					}
					tableData += '</tr>';
				}
			}
			if(tableData != ""){
				elementerRoles = '<div class="col-md-6 col-sm-12"><h4 style="text-align:center;background-color:#f2f2f3;">בעלי תפקידים</h4><div id="ele-roles" style="overflow:auto;"><table class="table table-sm" style="margin:0 auto;"><thead class="table-light sticky-header">'+header+'</thead><tbody>'+tableData+'</tbody></table></div></div>';
			}
		}
		if(IsJsonString(constants.elementarCoverData)){
			var tableData = "";
			var roleParsedData = JSON.parse(constants.elementarCoverData);
			if(roleParsedData.hasOwnProperty("GetTmlCrmElKisuiResponse") && roleParsedData.GetTmlCrmElKisuiResponse.hasOwnProperty("GetTmlCrmElKisui_Output") && roleParsedData.GetTmlCrmElKisuiResponse.GetTmlCrmElKisui_Output.hasOwnProperty("OutputData") && roleParsedData.GetTmlCrmElKisuiResponse.GetTmlCrmElKisui_Output.OutputData.length > 0){
				var roleData = roleParsedData.GetTmlCrmElKisuiResponse.GetTmlCrmElKisui_Output.OutputData;
				var header = "";
				var roleFieldNames = [];
				for (col in cols){
					var colTemp = cols[col].split(",");
					if(colTemp[2] == "C"){
						header += '<th>'+colTemp[1]+'</th>';
						roleFieldNames.push(colTemp[0]);
					}
				}
				for(let j = 0; j < roleData.length; j++){
					tableData += '<tr>';
					for(let k = 0; k < roleFieldNames.length; k++){
						var roleReocrd = roleData[j];
						var cellValue = roleReocrd[roleFieldNames[k]]!=undefined ? roleReocrd[roleFieldNames[k]] :"";
						if(colTemp[0].indexOf("&&")>0){
							var fieldNames = colTemp[0].split("&&");
							var fieldOne = roleReocrd[fieldNames[0]]!=undefined ? roleReocrd[fieldNames[0]] : "";
							var fieldTwo = (roleReocrd[fieldNames[1]]!=undefined && roleReocrd[fieldNames[1]]!=undefined != null && roleReocrd[fieldNames[1]]!="") ? "("+roleReocrd[fieldNames[1]]+")" : "";
							cellValue = fieldOne + fieldTwo;
						}
						tableData += '<td>'+cellValue+'</td>';
					}
					tableData += '</tr>';
				}
			}
			if(tableData != ""){
				elementerCoverage = '<div class="col-md-6 col-sm-12"><h4 style="text-align:center;background-color:#f2f2f3;">כיסויים</h4><div id="ele-coverages" style="overflow:auto;"><table class="table table-sm" style="margin:0 auto;"><thead class="table-light sticky-header">'+header+'</thead><tbody>'+tableData+'</tbody></table></div></div>';
			}
		}
	}
	htmlData += '<div class="row">'+elementerRoles+elementerCoverage+'</div>';
	$('#list-parent').html(htmlData);
	try {
		var heightDiff = ($('body').height()-$('#policy-section').height()-40 > 70)? $('body').height()-$('#policy-section').height()-40 : '250px';
		$('#ele-roles').height(heightDiff);
		$('#ele-coverages').height(heightDiff);
	}
	catch(err) {
		console.log('1');
	}
	$('div.overlay').removeClass('show');
	$('div.spanner').removeClass('show');
}

//This function is main function which loads the extension and its data.
//This assigns the configuration values to the constants and also fetch the record value.
function loadExtension() {
    ORACLE_SERVICE_CLOUD.extension_loader.load(appId, apiVersion).then(function (extensionProvider) {
        constants._extensionProvider = extensionProvider;
		//document.getElementById('open-popup').onclick = function () { renderDialog() };
		extensionProvider.registerWorkspaceExtension(function(workspaceRecord){
			workspaceType = workspaceRecord.getWorkspaceRecordType();
			var fieldDetails;
			if(workspaceType == "Contact"){
				fieldDetails = ['Contact.co$id_number','Contact.c_id'];
			}
			if(workspaceType == "Incident"){
				fieldDetails = ['Incident.i_id'];
			}
			workspaceRecord.addRecordClosingListener(function (workspaceRecordEventParameter) {
				if(contactIdNumber != ""){
					sessionStorage.removeItem(contactIdNumber+"_"+workspaceRecordEventParameter.newWorkspace.objectType);
					var workspaceCount = 0;
					if(sessionStorage.getItem(contactIdNumber+"_Contact")!=undefined){
						workspaceCount++;
					}
					if(sessionStorage.getItem(contactIdNumber+"_Incident")!=undefined){
						workspaceCount++;
					}
					if(workspaceCount == 0){
						sessionStorage.removeItem(contactIdNumber);
					}
				}
			});
			workspaceRecord.getFieldValues(fieldDetails).then(function(IFieldDetails){
				if(workspaceType == "Contact"){
					constants.recordId = IFieldDetails.getField('Contact.co$id_number').getLabel();
					constants.contactId = IFieldDetails.getField('Contact.c_id').getLabel();
					contactIdNumber = constants.recordId;
				}
				if(workspaceType == "Incident"){
					constants.recordId = IFieldDetails.getField('Incident.i_id').getLabel();
				}
				IFieldDetails.getParent().parent.getExtensionProvider().getGlobalContext().then(function(globalContext) {
					globalContext.getSessionToken().then(function(sessionToken)
					{
						constants.sesToken = sessionToken;
						//Following section will get all the configuration values and assign it to constants variable.
						globalContext.getExtensionContext('360Degree').then(function(extensionContext) {
							extensionContext.getProperties(['productSequence','hostURL','noProductFound','errorMsg','idNotFound','reportId','lifeColumns','healthColumns','pensiaColumns','gemelColumns','elementarColumns','lifeShowMore','healthShowMore','pensiaShowMore','gemelShowMore','elementarShowMore','elementarClaimColumns','elementarClaimShowMore','showProducts','contactAlreadyOpen','contactNotExist','noClaimData','agentDetailColumns','alfonsoPopupTitle','active','inactive','claimActive','claimInActive','visibleProduct']).then(function(collection) {
								productSequence = collection.get('productSequence').value;
								constants.hostURL = (window.location.protocol+"//"+window.location.hostname)+(collection.get('hostURL').value);
								constants.noProductFound = collection.get('noProductFound').value;
								constants.errorMsg = collection.get('errorMsg').value;
								constants.idNotFound = collection.get('idNotFound').value;
								constants.report_id = collection.get('reportId').value;
								constants.LifeColumns = collection.get('lifeColumns').value;
								constants.HealthColumns = collection.get('healthColumns').value;
								constants.PensiaColumns = collection.get('pensiaColumns').value;
								constants.GemelColumns = collection.get('gemelColumns').value;
								constants.ElementarColumns = collection.get('elementarColumns').value;
								constants.ElementarClaimColumns = collection.get('elementarClaimColumns').value;
								constants.LifeFlag = collection.get('lifeShowMore').value;
								constants.HealthFlag = collection.get('healthShowMore').value;
								constants.PensiaFlag = collection.get('pensiaShowMore').value;
								constants.GemelFlag = collection.get('gemelShowMore').value;
								constants.ElementarFlag = collection.get('elementarShowMore').value;
								constants.ElementarClaimFlag = collection.get('elementarClaimShowMore').value;
								constants.showProducts = collection.get('showProducts').value;
								constants.contactAlreadyOpen = collection.get('contactAlreadyOpen').value;
								constants.contactNotExist = collection.get('contactNotExist').value;
								constants.noClaimData = collection.get('noClaimData').value;
								constants.agentDetailColumns = collection.get('agentDetailColumns').value;
								constants.alfonsoPopupTitle = collection.get('alfonsoPopupTitle').value;
								constants.active = collection.get('active').value;
								constants.inactive = collection.get('inactive').value;
								constants.claimActive = collection.get('claimActive').value;
								constants.claimInActive = collection.get('claimInActive').value;
								constants.visibleProduct = collection.get('visibleProduct').value;
								
								
								if(constants.recordId== null || constants.recordId.toString().trim() == ""){
									showError(constants.idNotFound);
									$($('#'+window.frameElement.id,window.parent.document).parent()).height('100%');
									return;
								}
								if(workspaceType == "Incident"){
									var formData = {method:"GetIdNumber",report_id:constants.report_id,incident_id: constants.recordId};
									formData["session_id"] = constants.sesToken;
									$.ajax({
										url : constants.hostURL,
										type: "POST",
										data : formData,
										success: function(incidentResp, textStatus, jqXHR)
										{
											if(IsJsonString(incidentResp)){
												var respId = JSON.parse(incidentResp); 
												if(respId["id_number"] != ""){
													contactIdNumber = respId["id_number"];
													sessionStorage.setItem(contactIdNumber+"_"+workspaceType,contactIdNumber);
													callIndication();
												} else {
													showError(constants.idNotFound);
												}
											}
											else {
												showError(incidentResp);
											}
										},
										error: function (jqXHR, textStatus, errorThrown)
										{
											showError("<p>"+constants.errorMsg+"</p>");
										}
									});
								} else {
									callIndication();
									sessionStorage.setItem(contactIdNumber+"_"+workspaceType,contactIdNumber);
								}
								// var is_chrome = (typeof window.chrome === "object" && navigator.appVersion.indexOf('Edge') === -1);
								// if(!is_chrome){
									
								// }
								$('input[type=radio][name=showRecords]').change(function(){
									//var display = $(this).is(':checked');
									showProducts($(this).val());
								});
								//Following function define event which happens on 'View more' button click.
								$('#nav-tabContent').on("click", "a.show-agent-data",function(e) {
									clickedAgentId = $(this).text();
									clickedProduct = $(this).data('product');
									clickedUID = null;
									renderDialog();
								});
								
								if($('#nav-elementar-claim-tab') != undefined && $('#nav-elementar-claim-tab').hasClass('active')){
									$("div.form-check-inline").hide();
								}
								
								$('body').on("click", "li.nav-item",function(e) {
									if($(this).find('a').length > 0 && $($(this).find('a')[0]).attr('id') == "nav-elementar-claim-tab"){
										$("div.form-check-inline").hide();
									} else {
										$("div.form-check-inline").show();
									}
									
								});
								
								$('#nav-tabContent').on("click", "a.show-detail",function(e) {
									clickedUID = $(this).data('id');
									clickedProduct = $(this).data('product');
									clickedAgentId = null;
									if(clickedProduct == "Elementar" && constants[clickedProduct+"Flag"]){
										$('div.overlay').addClass('show');
										$('div.spanner').addClass('show');
										var eleCalls = [];
										var eleRoleIns = getElementerRoles($(this).data('client_id'),$(this).data('m_tosefet'));
										var eleCoverIns = getElementerCoverage($(this).data('client_id'),$(this).data('polis'));
										eleCalls.push(eleRoleIns);
										eleCalls.push(eleCoverIns);
										constants.elementarCoverData = null;
										constants.elementarRoleData = null;
										$.when.apply($, eleCalls).then(function(){
											$('div.overlay').removeClass('show');
											$('div.spanner').removeClass('show');
											renderDialog();
										});
									} else {
										renderDialog();
									}
								});
								
								$(document).on('show.bs.tab', '#nav-tab a[data-bs-toggle="tab"]', function (e) {
									var target = $(e.target).attr("href"); // activated tab
									if($($(e.target).data("bs-target")).find('div.tab-content').length !== 0){
										$('#show-inactive-parent').css('top',52);
									} else {
										$('#show-inactive-parent').css('top',14);
									}
									// $($('#'+window.frameElement.id,window.parent.document).parent()).height('100%');
									// $('#nav-tabContent').height($('body').height()-$('#nav-tab').height());
									// $('#elementar-sub-tab').height($('body').height()-($('#nav-tab').height()+40));
									// ORACLE_SERVICE_CLOUD.extensionResizeHandler.resize();
								});
								
								//Following function will resize the extension according to the screen size.
								
								// interval(function(){
									// $($('#'+window.frameElement.id,window.parent.document).parent()).height('100%');
									// $('#nav-tabContent').height($('body').height()-$('#nav-tab').height());
									// $('#elementar-sub-tab').height($('body').height()-($('#nav-tab').height()+40));
								// },100,15);
								interval(function(){
									$($('#'+window.frameElement.id,window.parent.document).parent()).height('100%');
									//$('#nav-tabContent').height($('body').height()-$('#nav-tab').height());
									//$('#elementar-sub-tab').height($('body').height()-($('#nav-tab').height()+40));
								},2000,10);
								// setTimeout(function(){
									// $($('#'+window.frameElement.id,window.parent.document).parent()).height('100%');
									// $('#nav-tabContent').height($('body').height()-$('#nav-tab').height());
									// $('#elementar-sub-tab').height($('body').height()-($('#nav-tab').height()+40));
								// }, 2000);
								//Following function will resize the extension according to the screen size when the window size changes.
								$( window ).resize(function() {
								  $($('#'+window.frameElement.id,window.parent.document).parent()).height('100%');
								  //$('#nav-tabContent').height($('body').height()-$('#nav-tab').height());
								  //$('#elementar-sub-tab').height($('body').height()-($('#nav-tab').height()+40));
								  //ORACLE_SERVICE_CLOUD.extensionResizeHandler.resize();
								});
							});
						});
					});
				});
			});
		});
    });
	//Following function will clear the session storage when Agent logs out of the BUI.
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

//Following function hide or show the inactive products in product record Grid.
//Param: displayFlag: Boolean
function showProducts(displayValue){
	if(displayValue == "both"){
		$('tr.record-inactive').show();
		$('tr.record-active').show();
	} else if(displayValue == "active"){
		$('tr.record-inactive').hide();
		$('tr.record-active').show();
	} else if(displayValue == "inactive"){
		$('tr.record-inactive').show();
		$('tr.record-active').hide();
	}
}

//Following function calls Indication API to get the indication.
function callIndication(){
	if(sessionStorage.getItem(contactIdNumber)!=null){
		contactData = JSON.parse(sessionStorage.getItem(contactIdNumber));
		loadData(contactData["indication"]);
	} else {
		var formData = {method:"Indication",ws_type:workspaceType,id_number: constants.recordId};
		formData["session_id"] = constants.sesToken;
		if(workspaceType =="Incident"){
			formData["report_id"] = constants.report_id;
		}
		$.ajax({
			url : constants.hostURL,
			type: "POST",
			data : formData,
			success: function(data, textStatus, jqXHR)
			{
				if(IsJsonString(data)){
					contactData["indication"] = data;
					sessionStorage.setItem(contactIdNumber,JSON.stringify(contactData));
					loadData(data);
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

//This function will get Elementar Roles data.
//Parameter : varClientId - CLIENT_ID
//Parameter : varClientId - M_TOSEFET
function getElementerRoles(varClientId,m_tossfet_id){
	var formData = {method:'ElementarRole',ws_type:'Contact',id_number: varClientId,m_tosefet:m_tossfet_id};
	formData["session_id"] = constants.sesToken;
	return $.ajax({
		url : constants.hostURL,
		type: "POST",
		data : formData,
		success: function(data, textStatus, jqXHR)
		{
			constants.elementarRoleData = data;
		},
		error: function (jqXHR, textStatus, errorThrown)
		{
			console.log(errorThrown);
		}
	}); 
}

//This function will get Elementar Coverage data.
//Parameter : varClientId - CLIENT_ID
//Parameter : m_polisa_id - M_POLISA
function getElementerCoverage(varClientId,m_polisa_id){
	var formData = {method:'ElementarCoverage',ws_type:'Contact',id_number: varClientId,m_polisa:m_polisa_id};
	formData["session_id"] = constants.sesToken;
	return $.ajax({
		url : constants.hostURL,
		type: "POST",
		data : formData,
		success: function(data, textStatus, jqXHR)
		{
			constants.elementarCoverData = data;
		},
		error: function (jqXHR, textStatus, errorThrown)
		{
			console.log(errorThrown);
		}
	}); 
}

//This function will get product of each product.
//Parameter: methodName - Name of the product
function callProduct(methodName){
	var formData = {method:methodName,ws_type:workspaceType,id_number: constants.recordId};
	formData["session_id"] = constants.sesToken;
	if(workspaceType =="Incident"){
		formData["report_id"] = constants.report_id;
	}
	return $.ajax({
		url : constants.hostURL,
		type: "POST",
		data : formData,
		success: function(data, textStatus, jqXHR)
		{
			if(IsJsonString(data)){
				var convertedData = JSON.parse(data);
				//Following code will store product data in contactData variable for global usage.
				if(convertedData.hasOwnProperty('GetTmlCrmGmlResponse')){
					contactData["Gemel"] = data;
				} else if(convertedData.hasOwnProperty('GetTmlCrmLfResponse')){
					contactData["Life"] = data;
				} else if(convertedData.hasOwnProperty('GetTmlCrmPnResponse')){
					contactData["Pensia"] = data;
				} else if(convertedData.hasOwnProperty('GetTmlCrmBrResponse')){
					contactData["Health"] = data;
				} else if(convertedData.hasOwnProperty('GetTmlCrmElResponse')){
					contactData["Elementar"] = data;
				} else if(convertedData.hasOwnProperty('GetTmlCrmTvElResponse')){
					contactData["ElementarClaim"] = data;
				}
				sessionStorage.setItem(contactIdNumber,JSON.stringify(contactData));
			}
		},
		error: function (jqXHR, textStatus, errorThrown)
		{
			console.log(errorThrown);
		}
	}); 
}

//This function will process the indication data and call product which are available for the customer.
//Parameter: respData - Indication Data
function loadData(respData){
	//console.log(resp);
	var resp = JSON.parse(respData);
	if(resp.hasOwnProperty("GetTmlCrmCustomerResponse") && resp.GetTmlCrmCustomerResponse.hasOwnProperty("GetTmlCrmCustomer_Output") && resp.GetTmlCrmCustomerResponse.GetTmlCrmCustomer_Output.hasOwnProperty("Message") && resp.GetTmlCrmCustomerResponse.GetTmlCrmCustomer_Output.Message == "Success") {
		var noProducts = true;
		var onlyClaims = true;
		var customerProducts = [];
		
		var productArr = constants.visibleProduct.split(",").map(function(item) {
		  return item.trim();
		});
		
		if(resp.GetTmlCrmCustomerResponse.GetTmlCrmCustomer_Output.OutputData["PN_FLG_PAIL"]!="" && parseInt(resp.GetTmlCrmCustomerResponse.GetTmlCrmCustomer_Output.OutputData["PN_FLG_PAIL"]) >0){
			//Pension
			constants.PensiaActiveCount = resp.GetTmlCrmCustomerResponse.GetTmlCrmCustomer_Output.OutputData["PN_KAMUT_MUTZRIM_PEILIM"];
			if(productArr.includes('Pensia')){
				customerProducts.push('Pensia');
				noProducts = false;
				onlyClaims = false;
			}
		}
		if(resp.GetTmlCrmCustomerResponse.GetTmlCrmCustomer_Output.OutputData["EL_FLG_PAIL"]!="" && parseInt(resp.GetTmlCrmCustomerResponse.GetTmlCrmCustomer_Output.OutputData["EL_FLG_PAIL"]) >0){
			//Elementar
			constants.ElementarActiveCount = resp.GetTmlCrmCustomerResponse.GetTmlCrmCustomer_Output.OutputData["EL_KAMUT_MUTZRIM_PEILIM"];
			if(productArr.includes('Elementar')){
				customerProducts.push('Elementar');
				noProducts = false;
				onlyClaims = false;
			}
		}
		if((resp.GetTmlCrmCustomerResponse.GetTmlCrmCustomer_Output.OutputData["CAMUT_TVIOT_CLOSE"]!="" && parseInt(resp.GetTmlCrmCustomerResponse.GetTmlCrmCustomer_Output.OutputData["CAMUT_TVIOT_CLOSE"]) >0) || (resp.GetTmlCrmCustomerResponse.GetTmlCrmCustomer_Output.OutputData["CAMUT_TVIOT_OPEN"]!="" && parseInt(resp.GetTmlCrmCustomerResponse.GetTmlCrmCustomer_Output.OutputData["CAMUT_TVIOT_OPEN"]) >0)){
			if(productArr.includes('Elementar')){
				customerProducts.push('ElementarClaim');
				noProducts = false;
			}
		}
		if(resp.GetTmlCrmCustomerResponse.GetTmlCrmCustomer_Output.OutputData["LF_FLG_PAIL"]!="" && parseInt(resp.GetTmlCrmCustomerResponse.GetTmlCrmCustomer_Output.OutputData["LF_FLG_PAIL"]) >0){
			//Life
			constants.LifeActiveCount = resp.GetTmlCrmCustomerResponse.GetTmlCrmCustomer_Output.OutputData["LF_KAMUT_MUTZRIM_PEILIM"];
			if(productArr.includes('Life')){
				customerProducts.push('Life');
				noProducts = false;
				onlyClaims = false;
			}
		}
		if(resp.GetTmlCrmCustomerResponse.GetTmlCrmCustomer_Output.OutputData["GML_FLG_PAIL"]!="" && parseInt(resp.GetTmlCrmCustomerResponse.GetTmlCrmCustomer_Output.OutputData["GML_FLG_PAIL"]) >0){
			//Gemel
			constants.GemelActiveCount = resp.GetTmlCrmCustomerResponse.GetTmlCrmCustomer_Output.OutputData["GML_KAMUT_MUTZRIM_PEILIM"];
			if(productArr.includes('Gemel')){
				customerProducts.push('Gemel');
				noProducts = false;
				onlyClaims = false;
			}
		}
		if(resp.GetTmlCrmCustomerResponse.GetTmlCrmCustomer_Output.OutputData["BR_FLG_PAIL"]!="" && parseInt(resp.GetTmlCrmCustomerResponse.GetTmlCrmCustomer_Output.OutputData["BR_FLG_PAIL"]) >0){
			//Health
			constants.HealthActiveCount = resp.GetTmlCrmCustomerResponse.GetTmlCrmCustomer_Output.OutputData["BR_KAMUT_MUTZRIM_PEILIM"];
			if(productArr.includes('Health')){
				customerProducts.push('Health');
				noProducts = false;
				onlyClaims = false;
			}
		}
		
		//Following code will hide show non active product checkbox.
		if(onlyClaims){
			$('#show-inactive-parent').hide();
		}
		
		//If No product is available then following code will execute.
		// if(noProducts){
			// $('#info-msg').show();
			// $('#info-msg').html(constants.noProductFound);
			// $('#list-parent').css('display','none');
			// $('div.overlay').removeClass('show');
			// $('div.spanner').removeClass('show');
		// } else {
			//Following code will call all available product parallerly.
		
		var AllProducts = productSequence.split(",");;
		var firstTab = true;
		var productNames = {};
		productNames["Life"] = 'חיים';
		productNames["Health"] = 'בריאות';
		productNames["Gemel"] = 'גמל';
		productNames["Pensia"] = 'פנסיה';
		productNames["Elementar"] = 'אלמנטר';
		for (let i = 0; i < AllProducts.length; i++) {
			var isActive = firstTab ? 'active' : '';
			firstTab = false;
			var activeCount = (constants[AllProducts[i]+"ActiveCount"]!= null && parseFloat(constants[AllProducts[i]+"ActiveCount"]) > 0) ? '('+constants[AllProducts[i]+"ActiveCount"]+')' : "";
			tabButton = '<li class="nav-item"><a class="nav-link '+isActive+'" id="nav-'+i+'-tab" data-bs-toggle="tab" data-bs-target="#nav-'+i+'" type="button" role="tab" aria-controls="nav-'+i+'" aria-current="page" href="#">'+productNames[AllProducts[i]]+activeCount+'</a></li>';
			//var rtlAlignment = customerProducts[i] != "Elementar" ? 'style="direction:rtl;"' : "";
			//tabData = '<div class="tab-pane fade show '+isActive+'" id="nav-'+i+'" '+rtlAlignment+' role="tabpanel" aria-labelledby="nav-'+i+'-tab">';
			$("#nav-tab").append(tabButton);
		}
		
		if(contactData != null && Object.keys(contactData).length >1){
			showTabs();
		} else {
			var productCalls = [];
			for (let i = 0; i < customerProducts.length; i++) {
				var insProduct = callProduct(customerProducts[i]);
				productCalls.push(insProduct);
			}
			$.when.apply($, productCalls).then(function(){
				showTabs();
			});
		}
		//}
	} else {
		showError(constants.errorMsg);
	}
}

//Following code will prepare tab data and records.
function showTabs(){
	var customerProducts =  productSequence.split(",");
	var firstTab = true;
	var productNodes = {};
	//Following code define node array which comes in response, so we can easily traverse the response dynamically.
	productNodes["Life"] = ["GetTmlCrmLfResponse","GetTmlCrmLfOutput"];
	productNodes["Health"] = ["GetTmlCrmBrResponse","GetTmlCrmBrOutput"];
	productNodes["Gemel"] = ["GetTmlCrmGmlResponse","GetTmlCrmGmlOutput"];
	productNodes["Pensia"] = ["GetTmlCrmPnResponse","GetTmlCrmPnOutput"];
	productNodes["Elementar"] = ["GetTmlCrmElResponse","GetTmlCrmEl_Output"];
	productNodes["ElementarClaim"] = ["GetTmlCrmTvElResponse","GetTmlCrmTvElOutput"];
	
	//Following code define titles of each tab.
	var productNames = {};
	productNames["Life"] = 'חיים';
	productNames["Health"] = 'בריאות';
	productNames["Gemel"] = 'גמל';
	productNames["Pensia"] = 'פנסיה';
	productNames["Elementar"] = 'אלמנטר';
	
	//Following code define, by which field product records will be sorted.
	var orderFields = {};
	orderFields["Life"] = 'LF_FLAG_PAIL';
	orderFields["Health"] = 'BR_FLG_PAIL';
	orderFields["Gemel"] = 'GML_FLG_PAIL';
	orderFields["Pensia"] = 'PN_FLG_PAIL';
	orderFields["Elementar"] = 'EL_FLG_PAIL';
	
	for (let i = 0; i < customerProducts.length; i++) {
		var attributeName = customerProducts[i] == "Elementar" ? "OutputData" : "DATA";
		var parsedData = (contactData[customerProducts[i]]!=undefined && contactData[customerProducts[i]]!="") ? JSON.parse(contactData[customerProducts[i]]) : null;
		var tabDataExist = false;
		var productData = null;
		if(parsedData != null && parsedData.hasOwnProperty(productNodes[customerProducts[i]][0])&& parsedData[productNodes[customerProducts[i]][0]].hasOwnProperty(productNodes[customerProducts[i]][1]) && parsedData[productNodes[customerProducts[i]][0]][productNodes[customerProducts[i]][1]].hasOwnProperty(attributeName) && parsedData[productNodes[customerProducts[i]][0]][productNodes[customerProducts[i]][1]][attributeName].length > 0){
			tabDataExist = true;
			productData = sort_by_key(parsedData[productNodes[customerProducts[i]][0]][productNodes[customerProducts[i]][1]][attributeName],orderFields[customerProducts[i]]);
			productData.reverse();
			if(customerProducts[i] == "Elementar"){
				var activeProducts = [];
				var inactiveProducts = [];
				$.each(productData, function(i, prodItem) {
					if(prodItem.EL_FLG_PAIL == "1"){
						activeProducts.push(prodItem);
					}
					if(prodItem.EL_FLG_PAIL == "0"){
						inactiveProducts.push(prodItem);
					}
				});
				activeProducts.sort(sort_elementar_date);
				activeProducts.reverse();
				inactiveProducts.sort(sort_elementar_date);
				inactiveProducts.reverse();
				var newData =[];
				$.each(activeProducts, function(i, prodItem) {
					newData.push(prodItem);
				});
				$.each(inactiveProducts, function(i, prodItem) {
					newData.push(prodItem);
				});
				productData = newData;
			}
		}
		var tabButton = "";
		var tabData = "";
		// if(tabDataExist){

		// }
		var isActive = firstTab ? 'active' : '';
		firstTab = false;
		// var activeCount = (constants[customerProducts[i]+"ActiveCount"]!= null && parseFloat(constants[customerProducts[i]+"ActiveCount"]) > 0) ? '('+constants[customerProducts[i]+"ActiveCount"]+')' : "";
		// tabButton = '<li class="nav-item"><a class="nav-link '+isActive+'" id="nav-'+i+'-tab" data-bs-toggle="tab" data-bs-target="#nav-'+i+'" type="button" role="tab" aria-controls="nav-'+i+'" aria-current="page" href="#">'+productNames[customerProducts[i]]+activeCount+'</a></li>';
		var rtlAlignment = customerProducts[i] != "Elementar" ? 'style="direction:rtl;"' : "";
		tabData = '<div class="tab-pane fade show '+isActive+'" id="nav-'+i+'" '+rtlAlignment+' role="tabpanel" aria-labelledby="nav-'+i+'-tab">';
		
		if(customerProducts[i]== 'Elementar'){
			var isClaimData = contactData["ElementarClaim"] != undefined? true : false;
			var claimResp = isClaimData ? JSON.parse(contactData["ElementarClaim"]) : null;
			if((!tabDataExist) && isClaimData && claimResp["GetTmlCrmTvElResponse"]["GetTmlCrmTvElOutput"]["RecordsCount"] > 0){
				var isActive = firstTab ? 'active' : '';
				firstTab = false;
				var activeCount = (constants[customerProducts[i]+"ActiveCount"]!= null && parseFloat(constants[customerProducts[i]+"ActiveCount"]) > 0) ? '('+constants[customerProducts[i]+"ActiveCount"]+')' : "";
				tabButton = '<li class="nav-item"><a class="nav-link '+isActive+'" id="nav-'+i+'-tab" data-bs-toggle="tab" data-bs-target="#nav-'+i+'" type="button" role="tab" aria-controls="nav-'+i+'" aria-current="page" href="#">'+productNames[customerProducts[i]]+activeCount+'</a></li>';
				tabData = '<div class="tab-pane fade show '+isActive+'" id="nav-'+i+'" role="tabpanel" aria-labelledby="nav-'+i+'-tab">';
				
			}
			var subtabButtons = "";
			var subtabData = "";
			var subtabActiveFlag = true;
			if(tabDataExist && parsedData[productNodes[customerProducts[i]][0]][productNodes[customerProducts[i]][1]]["RecordsCount"] > 0){
				var sabTubActive = subtabActiveFlag ? 'active' : '' ;
				subtabActiveFlag = false;
				subtabButtons += '<li class="nav-item"><a class="nav-link '+sabTubActive+'" id="nav-elementar-product-tab" data-bs-toggle="tab" data-bs-target="#nav-elementar-product" type="button" role="tab" aria-controls="nav-elementar-product" aria-current="page" href="#">מוצרים</a></li>';
				var columnDef = getMainColumnStruct(constants[customerProducts[i]+"Columns"]);
				subtabData += '<div class="tab-pane fade show '+sabTubActive+'" id="nav-elementar-product" role="tabpanel" aria-labelledby="nav-elementar-product-tab" style="direction:rtl;">';
				subtabData += generateTableData(productData, columnDef, customerProducts[i],orderFields[customerProducts[i]]);
				subtabData += '</div>';
			}
			if(isClaimData && claimResp["GetTmlCrmTvElResponse"]["GetTmlCrmTvElOutput"]["RecordsCount"] > 0){
				var claimData = claimResp["GetTmlCrmTvElResponse"]["GetTmlCrmTvElOutput"]["OutputData"];
				
				var activeProducts = [];
				var inactiveProducts = [];
				var commonProducts = [];
				var claimActiveStatuses = [];
				var claimInActiveStatuses = [];
				if(constants.claimActive != ""){
					claimActiveStatuses = constants.claimActive.text().split(',');
				}
				if(constants.claimInActive != ""){
					claimInActiveStatuses = constants.claimInActive.text().split(',');
				}
				
				$.each(claimData, function(i, prodItem) {
					if(claimActiveStatuses.includes(prodItem["TEUR_STATUS"])){
						activeProducts.push(prodItem);
					} else if(claimInActiveStatuses.includes(prodItem["TEUR_STATUS"])){
						inactiveProducts.push(prodItem);
					} else {
						commonProducts.push(prodItem);
					}
				});
				
				activeProducts.sort(sort_elementar_claim_date);
				activeProducts.reverse();
				inactiveProducts.sort(sort_elementar_claim_date);
				inactiveProducts.reverse();
				commonProducts.sort(sort_elementar_claim_date);
				commonProducts.reverse();
				var newData =[];
				$.each(activeProducts, function(i, prodItem) {
					newData.push(prodItem);
				});
				$.each(inactiveProducts, function(i, prodItem) {
					newData.push(prodItem);
				});
				$.each(commonProducts, function(i, prodItem) {
					newData.push(prodItem);
				});
				claimData = newData;
				var sabTubActive = subtabActiveFlag ? 'active' : '' ;
				subtabActiveFlag = false;
				subtabButtons += '<li class="nav-item"><a class="nav-link '+sabTubActive+'" id="nav-elementar-claim-tab" data-bs-toggle="tab" data-bs-target="#nav-elementar-claim" type="button" role="tab" aria-controls="nav-elementar-claim" aria-current="page" href="#">תביעות</a></li>';
				var claimDef = getMainColumnStruct(constants["ElementarClaimColumns"]);
				subtabData += '<div class="tab-pane fade show '+sabTubActive+'" id="nav-elementar-claim" role="tabpanel" aria-labelledby="nav-elementar-claim-tab" style="direction:rtl;">';
				subtabData += generateTableData(claimData, claimDef, "ElementarClaim","");
				subtabData += '</div>';
			}
			subtabButtons = subtabButtons != "" ? '<div class="bd-example"><ul style="direction:rtl;" class="nav justify-content-center" id="nav-claim-tab" >'+subtabButtons+'<ul></div>'  : "";
			//subtabData = subtabData != "" ? '<div class="tab-content" id="elementar-sub-tab" style="width:100%;overflow:auto;">'+subtabData+'</div>' : "" ;
			subtabData = subtabData != "" ? '<div class="tab-content" id="elementar-sub-tab" style="width:100%;">'+subtabData+'</div>' : "" ;
			if(subtabButtons != ""){
				tabData +=subtabButtons+subtabData;
			}
		} else {
			if(tabDataExist && parsedData[productNodes[customerProducts[i]][0]][productNodes[customerProducts[i]][1]]["RecordsCount"] > 0){
				var columnDef = getMainColumnStruct(constants[customerProducts[i]+"Columns"]);
				tabData += generateTableData(productData, columnDef, customerProducts[i],orderFields[customerProducts[i]]);
			}
			
		}
		tabData += '</div>';
		
		//$("#nav-tab").append(tabButton);
		$("#nav-tabContent").append(tabData);
	}
	showProducts(constants.showProducts);
	if(constants.showProducts!=""){
		if(constants.showProducts=="all"){
			$('#showAll').attr('checked', true);
		} else if(constants.showProducts=="active"){
			$('#showActive').attr('checked', true);
		} else if(constants.showProducts=="inactive"){
			$('#showInactive').attr('checked', true);
		}
	}
	
	if($('#nav-tabContent').find('div.tab-pane.active').length !== 0 && $($('#nav-tabContent').find('div.tab-pane.active')[0]).find('div.tab-content').length !==0){
		$('#show-inactive-parent').css('top',52);
	}
	
	$($('#'+window.frameElement.id,window.parent.document).parent()).height('100%');
	//$('#nav-tabContent').height($('body').height()-$('#nav-tab').height());
	//$('#elementar-sub-tab').height($('body').height()-($('#nav-tab').height()+40));
	$('div.overlay').removeClass('show');
	$('div.spanner').removeClass('show');
}

//Following code will generate table from response.
//Parameter: respData - Response Data of the product
//Parameter: productColDef - Column Definition for the product
//Parameter: productName - Name of the product
//Parameter: activeField - Name of the field, which will indicate whether the product is active or not. 
function generateTableData(respData, productColDef, productName, activeField){
	var tableData = '<table class="table"><thead class="table-light sticky-header"><tr>';
	$.each(productColDef, function(key,value) {
		tableData +="<th class='text-nowrap'>"+value.title+"</th>";
	});
	tableData += '<th></th></tr></thead><tbody>';
	$.each(respData, function(index, record){
		var activeVar = "";
		// if(activeField != "" && record[activeField] == constants.active){
			// activeVar = "record-active";
		// }
		// if(activeField != "" && record[activeField] == constants.inactive){
			// activeVar = "record-inactive";
		// }
		if(activeField != "" && record[activeField] == 1){
			activeVar = "record-active";
		}
		if(activeField != "" && record[activeField] == 0){
			activeVar = "record-inactive";
		}
		if(productName == "ElementarClaim"){
			activeVar = "";
			var claimActiveStatuses = [];
			var claimInActiveStatuses = [];
			if(constants.claimActive != ""){
				claimActiveStatuses = constants.claimActive.text().split(',');
			}
			if(constants.claimInActive != ""){
				claimInActiveStatuses = constants.claimInActive.text().split(',');
			}
			if(claimActiveStatuses.includes(record["TEUR_STATUS"])){
				activeVar = "record-active";
			}
			if(claimInActiveStatuses.includes(record["TEUR_STATUS"])){
				activeVar = "record-inactive";
			}
		}
		tableData += '<tr class="'+activeVar+'">';
		var m_polis = record["POLISA"]!=undefined ? record["POLISA"] :"" ;
		var m_tosefet = record["M_TOSEFET_ACHRONA"]!=undefined ? record["M_TOSEFET_ACHRONA"] :"" ;
		var dataClientId = record["CLIENT_ID"]!=undefined ? record["CLIENT_ID"] :"" ;
		$.each(productColDef, function(key,value) {
			var cellData = formatCellValue(record, value.field, value.dataType);
			var uniqueKey = productName=="Elementar" ? "POLISA" : "KISUI";
			if(value.linkDis){ 
				cellData = '<a href="#" class="show-detail" data-client_id="'+dataClientId+'" data-polis="'+m_polis+'" data-m_tosefet="'+m_tosefet+'" data-id="'+record[uniqueKey]+'" data-product="'+productName+'">'+cellData+'</a>';
			}
			if(value.field.toLowerCase() == "m_sochen"){
				cellData = '<a href="#" class="show-agent-data" data-product="'+productName+'">'+cellData+'</a>';
			}
			if(productName=="Elementar"){
				if(value.field.toLowerCase() == "mutzar_merakez"){
					if(record["MUTZAR_MERAKEZ"] == "ביטוחי רכב"){
						cellData = ""+record["MUTZAR_MERAKEZ"]+"<br/>"+record["EL_M_RECHEV"];
					}
					if(record["MUTZAR_MERAKEZ"] == "ביטוחי דירה"){
						cellData = ""+record["MUTZAR_MERAKEZ"]+'<br/><span>'+record["EL_SHEM_RECHOV_DIRA_1"]+" "+record["EL_MISPAR_BAIT_DIRA_1"]+" "+record["EL_SHEM_YESHUV_DIRA_1"]+"</span>";

					}
					if(record["MUTZAR_MERAKEZ"] == "סייבר"){
						cellData = ""+record["MUTZAR_MERAKEZ"]+'<br/><span>'+record["EL_SHEM_RECHOV_DIRA_1"]+" "+record["EL_MISPAR_BAIT_DIRA_1"]+" "+record["EL_SHEM_YESHUV_DIRA_1"]+"</span>";
					}
				}
			}
			tableData += '<td>'+cellData+"</td>";
		});
		var uniqueKey = productName=="Elementar" ? "POLISA" : "KISUI";
		tableData +='<td><a href="#" class="show-detail" data-client_id="'+dataClientId+'" data-polis="'+m_polis+'" data-m_tosefet="'+m_tosefet+'" data-id="'+record[uniqueKey]+'" data-product="'+productName+'">הצג עוד</a></td></tr>';
	});
	tableData += '</tbody></table>';
	return tableData;
}

//This function will format the cell according to the datatype.
//Parameter: currentRec - Collection of fields
//Parameter: fieldName - Field Name
//Parameter: dataType - Data type of the field
function formatCellValue(currentRec, fieldName, dataType){
	var cellData = currentRec[fieldName]!=undefined ? currentRec[fieldName] : "";
	if(dataType.startsWith("ana") && dataType.includes("|") && currentRec[fieldName]!=undefined && currentRec[fieldName]!="" && $.inArray(currentRec[fieldName], ["0","1"]) !== -1){
		var datatypeParts =  dataType.split("|");
		cellData = currentRec[fieldName] == "1" ? datatypeParts[1]  : datatypeParts[2];
	}
	if(dataType.startsWith("yn") && dataType.includes("|") && currentRec[fieldName]!=undefined && currentRec[fieldName]!="" && $.inArray(currentRec[fieldName], ["0","1"]) !== -1){
		var datatypeParts =  dataType.split("|");
		cellData = currentRec[fieldName] == "1" ? datatypeParts[1]  : datatypeParts[2];
	}
	if(dataType == "ana" && currentRec[fieldName]!=undefined && currentRec[fieldName]!="" && $.inArray(currentRec[fieldName], ["0","1"]) !== -1){
		cellData = currentRec[fieldName] == "1" ? "פעיל" : "לא פעיל";
	}
	if(dataType == "yn" && currentRec[fieldName]!=undefined && currentRec[fieldName]!="" && $.inArray(currentRec[fieldName], ["0","1"]) !== -1){
		cellData = currentRec[fieldName] == "1" ? "כן" : "לא";
	}
	if(dataType == "ynu" && currentRec[fieldName]!=undefined && currentRec[fieldName]!="" && $.inArray(currentRec[fieldName], ["1","2","3"]) !== -1){
		var dataValues = [];
		dataValues["1"] = "כן";
		dataValues["2"] = "לא";
		dataValues["3"] = "לא ידוע";
		cellData = dataValues[currentRec[fieldName]];
	}
	if(dataType == "date"){
		var oldValue = cellData;
		if(cellData.indexOf("-") > -1){
			cellData = (cellData.trim().split(" "))[0];
			var datePart = cellData.split("-");
			cellData = datePart[2]+"/"+datePart[1]+"/"+datePart[0];
		} else if (cellData.length == 8) {
			cellData = cellData.substr(6, 2)+"/"+cellData.substr(4, 2)+"/"+cellData.substr(0, 4);
		}
		//cellData = '<span class="text-left" dir="ltr">old value:'+oldValue+"current:"+cellData+'</span>';
		cellData = '<span class="text-left" dir="ltr">'+cellData+'</span>';
	}
	if(dataType == "number"){
		if(cellData.toString().indexOf(".") > -1){
			try {
				cellData = parseFloat(cellData).toFixed(2);
			} catch (e) {
				console.log("parsing failed");
			}
		}
		cellData = '<span class="text-left" dir="ltr">'+cellData+'</span>';
	}
	if(dataType == "int"){
		if(cellData.toString().indexOf(".") > -1){
			try {
				cellData = parseInt(cellData);
			} catch (e) {
				console.log("parsing failed");
			}
		}
		cellData = '<span class="text-left" dir="ltr">'+cellData+'</span>';
	}
	if(fieldName.indexOf("&&")>0){
		var fieldNames = fieldName.split("&&");
		var fieldOne = currentRec[fieldNames[0]]!=undefined ? currentRec[fieldNames[0]] : "";
		var fieldTwo = (currentRec[fieldNames[1]]!=undefined && currentRec[fieldNames[1]]!=undefined != null && currentRec[fieldNames[1]]!="") ? "("+currentRec[fieldNames[1]]+")" : "";
		cellData = fieldOne + fieldTwo;
	}
	if(fieldName.indexOf("||")>0){
		var fieldNames = fieldName.split("||");
		var newCellValue = "";
		for (let i = 0; i < fieldNames.length; i++) {
			if(currentRec[fieldNames[i]] != undefined){
				newCellValue += currentRec[fieldNames[i]]+" ";
			}
		}
		cellData = newCellValue!="" ? newCellValue : cellData;
	}
	return cellData;
}

//Following function return the maim columns for the product.
//Parameter: colDef - Product Column Definition
function getMainColumnStruct(colDef){
	var cols = colDef.split(";");
	var columnNames = [];
	for (col in cols){
		var colTemp = cols[col].split(",");
		if(colTemp[2] == "M"){
			var isLink = colTemp[4] == "Y" ? true : false;;
			var tempCol = {order:colTemp[3],title:colTemp[1],field:colTemp[0], linkDis: isLink, dataType: colTemp[5]};
			columnNames.push(tempCol);
		}
	}
	//columnNames = sort_by_key(columnNames,'order');
	columnNames = columnNames.sort(function(a, b){ return a.order - b.order; });
	return columnNames;
}

//Following function will render the modal popup Dialog.
function renderDialog() {
    constants._extensionProvider.registerUserInterfaceExtension(function (uiContext) {
        uiContext.getModalWindowContext().then(function (IModalWindowContext) {
            localStorage.setItem("360Degree", this.window.frameElement.id);
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
				document.getElementById('list-parent').innerHTML = "";
				document.getElementById('warning-msg').innerHTML = "";
				clickedUID = null;
				clickedProduct = null;
				clickedAgentId = null;
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
	$('#list-parent').css('display','none');
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

//Following function will sort collection of elementer records by start date.
//Parameter: a - elementar record
//Parameter: b - elementar record
function sort_elementar_date(a, b) {
    return new Date(a.EL_TR_TCHILAT_POLISA).getTime() - new Date(b.EL_TR_TCHILAT_POLISA).getTime();
}

//Following function will sort collection of elementer claim records by start date.
//Parameter: a - elementar claim record
//Parameter: b - elementar claim record
function sort_elementar_claim_date(a, b) {
    return new Date(a.TR_PTICHA).getTime() - new Date(b.TR_PTICHA).getTime();
}

//Following function will execute a code funciton after interval for given number of time.
//Parameter: func - funciton
//Parameter: wait - wait for number of seconds(milliseconds)
//Parameter: times - number of times
function interval(func, wait, times){
    var interv = function(w, t){
        return function(){
            if(typeof t === "undefined" || t-- > 0){
                setTimeout(interv, w);
                try{
                    func.call(null);
                }
                catch(e){
                    t = 0;
                    throw e.toString();
                }
            }
        };
    }(wait, times);

    setTimeout(interv, wait);
}


//Following funciton will open agent detail in modal screen.
//Parameter: agentId - selected agent Id
//Parameter: selectedProduct - selected product name
function showAgentDetail(agentId,selectedProduct){
	var formData = {method:"GetAgentData",m_sochen:agentId,product: selectedProduct};
	formData["session_id"] = constants.sesToken;
	$.ajax({
		url : constants.hostURL,
		type: "POST",
		data : formData,
		success: function(agentResp, textStatus, jqXHR)
		{
			if(IsJsonString(agentResp) && JSON.parse(agentResp).CRMAlfonsoResponse != undefined && JSON.parse(agentResp).CRMAlfonsoResponse.CRMAlfonso_Output != undefined){
				$('#list-parent').html("");
				if(JSON.parse(agentResp).CRMAlfonsoResponse.CRMAlfonso_Output.RecordsCount > 0){
					var agentDetails = JSON.parse(agentResp).CRMAlfonsoResponse.CRMAlfonso_Output.OutputData;
					var agentTableHTML = '<table class="table table-sm" style="margin: 20px auto;width: 50%;"><thead class="table-light sticky-header"><tr style="text-align:center;"><th colspan="2">'+constants.alfonsoPopupTitle+'</th></tr></thead><tbody>'+prepareAgentDetails(agentDetails)+'</tbody></table>';
					console.log(agentDetails);
					$('#list-parent').html(agentTableHTML);
				} else {
					$('#warning-msg').html("Agent details not found.");
				}
				
			} else {
				showError(agentResp);
			}
			$('div.overlay').removeClass('show');
			$('div.spanner').removeClass('show');
		},
		error: function (jqXHR, textStatus, errorThrown)
		{
			showError("<p>"+constants.errorMsg+"</p>");
			$('div.overlay').removeClass('show');
			$('div.spanner').removeClass('show');
		}
	});
}


//Following funciton will open agent detail in popup screen.
//Parameter: agentId - selected agent Id
//Parameter: selectedProduct - selected product name
function showAgentDetailPopup(agentId,selectedProduct){
	var formData = {method:"GetAgentData",m_sochen:agentId,product: selectedProduct};
	formData["session_id"] = constants.sesToken;
	$.ajax({
		url : constants.hostURL,
		type: "POST",
		data : formData,
		success: function(agentResp, textStatus, jqXHR)
		{
			if(IsJsonString(agentResp) && JSON.parse(agentResp).CRMAlfonsoResponse != undefined && JSON.parse(agentResp).CRMAlfonsoResponse.CRMAlfonso_Output != undefined){
				$('#modalBody').html("");
				if(JSON.parse(agentResp).CRMAlfonsoResponse.CRMAlfonso_Output.RecordsCount > 0){
					var agentDetails = JSON.parse(agentResp).CRMAlfonsoResponse.CRMAlfonso_Output.OutputData;
					var agentTableHTML = '<table class="table table-sm" style="margin: 0px auto;width: 50%;"><thead class="table-light sticky-header"><tr style="text-align:center;"><th colspan="2">'+constants.alfonsoPopupTitle+'</th></tr></thead><tbody>'+prepareAgentDetails(agentDetails)+'</tbody></table>';
					console.log(agentDetails);
					$('#closeAgentDetails').on('click',function(){
						$('#agentDetails').modal('hide');
					});
					$('#modalBody').html(agentTableHTML);
				} else {
					$('#modalBody').html("Agent details not found.");
				}
				$('#agentDetails').modal('show');
			} 
			$('div.overlay').removeClass('show');
			$('div.spanner').removeClass('show');
		},
		error: function (jqXHR, textStatus, errorThrown)
		{
			showError("<p>"+constants.errorMsg+"</p>");
			$('div.overlay').removeClass('show');
			$('div.spanner').removeClass('show');
		}
	});
}

//Following function will prepare agent details.
//Parameter: agentData - agent's data in array format
function prepareAgentDetails(agentData){
	var agentTemp = constants.agentDetailColumns.split(";");
	var agentHtml = "";
	for(let i = 0; i < agentTemp.length; i++){
		var colIns = agentTemp[i].split(",");
		if(colIns[2] == "Y"){
			var cellText = agentData[colIns[0]];
			if(colIns[0] == "ID_SUG_SOCHEN_SOCHNUT"){
				if(agentData[colIns[0]] == 4){
					cellText = "בסוכן ישיר";
				}
				if(agentData[colIns[0]] == 3){
					cellText = "חברת ביטוח";
				}
			}
			var lefttoRigthCols = ["TEL_AVODA","TEL_BAIT","CELL_PHONE"];
			if(lefttoRigthCols.includes(colIns[0])){
				cellText = '<span class="text-left" dir="ltr">'+cellText+'</span>';
			}
			agentHtml += "<tr><td>"+colIns[1]+"</td><td>"+cellText+"</td></tr>";
		}
	}
	return agentHtml;
}