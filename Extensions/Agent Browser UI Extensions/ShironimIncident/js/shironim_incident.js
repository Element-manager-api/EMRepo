var appId = "ShironimIncident";
var apiVersion = "1.0";
var constants = {
    sesToken: null,
    hostURL: null,
	idNotFound: null,
	recordId: null,
    _extensionProvider: null,
	columnConfigs: null,
	noRecordFound: "",
	noDetailsFound: "",
	errorMsg: "",
	report_id: "",
	defaultWorkspace:"",
	workspacesList:"",
	policyReportId:"",
	idNumberReportId:"",
	selectionDefault:"",
	documentViewerURL:"",
	lbl_show_by_lead_id : "",
	lbl_show_by_insured_id : "",
	lbl_show_by_policy_id : "",
	lblwsList : "",
	lblPolicyList : "",
	lblIdNumberList : "",
	lblStartDate : "",
	lblEndDate : "",
	search : ""	
};
var ieFlag = window.ActiveXObject || "ActiveXObject" in window;
var workspaceType = "";
var daysBeforeToday = "";
var incidentData = null;
var lastInteraction = "";
var lastParent = null;
var valdiateIns = null;

function initialize(screen) {
    if (screen == "dialog") {
        loadDialog();
    } else {
        loadExtension();
    }
}

function loadDialog() {
	var parentFrameId = localStorage.getItem("shironimIncident");
    if (parentFrameId) {
        if (ieFlag) {
            parentFrame = window.parent.frames[parentFrameId];
        } else {
            parentFrame = window.parent.frames[parentFrameId].contentWindow;
        }
        constants = parentFrame.constants;
		document.getElementById('close-popup').onclick = function () { collapseDialog(); };
		iframeContent = '<div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" src="'+constants.documentViewerURL+constants.documentUrl+'" style="height:300px;width:100%;" allowfullscreen></iframe></div>';
		$('#document-viewer').html(iframeContent);
        localStorage.removeItem("shironimIncident");
		$('div.overlay').removeClass('show');
		$('div.spanner').removeClass('show');
    }
}

function loadExtension() {
    ORACLE_SERVICE_CLOUD.extension_loader.load(appId, apiVersion).then(function (extensionProvider) {
        constants._extensionProvider = extensionProvider;
		
		extensionProvider.registerWorkspaceExtension(function(workspaceRecord){
			workspaceType = workspaceRecord.getWorkspaceRecordType();
			var fieldDetails;
			if(workspaceType == "Incident"){
				fieldDetails = ['Incident.i_id'];
			}
			workspaceRecord.getFieldValues(fieldDetails).then(function(IFieldDetails){
				if(workspaceType == "Incident"){
					constants.recordId = IFieldDetails.getField('Incident.i_id').getLabel();
				}
				IFieldDetails.getParent().parent.getExtensionProvider().getGlobalContext().then(function(globalContext) {
					constants.accountId = globalContext.getAccountId();
					globalContext.getSessionToken().then(function(sessionToken)
					{
						constants.sesToken = sessionToken;
						globalContext.getExtensionContext('ShironimIncident').then(function(extensionContext) {
							extensionContext.getProperties(['coulmnConfig','hostURL','idNotFound','reportId','noRecordFound','noDetailsFound','errorMsg','workspacesList','defaultWorkspace','policyReportId','idNumberReportId','selectionDefault','documentViewerURL','lbl_show_by_lead_id','lbl_show_by_insured_id','lbl_show_by_policy_id','lblwsList','lblPolicyList','lblIdNumberList','lblStartDate','lblEndDate','search']).then(function(collection) {
								constants.columnConfigs = collection.get('coulmnConfig').value;
								constants.hostURL = (window.location.protocol+"//"+window.location.hostname)+(collection.get('hostURL').value);
								constants.idNotFound = collection.get('idNotFound').value;
								constants.report_id = collection.get('reportId').value;
								constants.noRecordFound = collection.get('noRecordFound').value;
								constants.errorMsg = collection.get('errorMsg').value;
								constants.workspacesList = collection.get('workspacesList').value;
								constants.defaultWorkspace = collection.get('defaultWorkspace').value;
								constants.policyReportId = collection.get('policyReportId').value;
								constants.idNumberReportId = collection.get('idNumberReportId').value;
								constants.selectionDefault = collection.get('selectionDefault').value;
								constants.documentViewerURL = collection.get('documentViewerURL').value;
								
								constants.lbl_show_by_lead_id = collection.get('lbl_show_by_lead_id').value;
								constants.lbl_show_by_insured_id = collection.get('lbl_show_by_insured_id').value;
								constants.lbl_show_by_policy_id = collection.get('lbl_show_by_policy_id').value;
								constants.lblwsList = collection.get('lblwsList').value;
								constants.lblPolicyList = collection.get('lblPolicyList').value;
								constants.lblIdNumberList = collection.get('lblIdNumberList').value;
								constants.lblStartDate = collection.get('lblStartDate').value;
								constants.lblEndDate = collection.get('lblEndDate').value;
								constants.search = collection.get('search').value;
								
								if(constants.recordId== null || constants.recordId.toString().trim() == ""){
									showError(constants.idNotFound);
									$($('#'+window.frameElement.id,window.parent.document).parent()).height('100%');
									return;
								}
								
								$("#policyParent").hide();
								$("#idNumberParent").hide();
								$('#show_by_lead_id').prop('checked',true);
								if(constants.selectionDefault == "policyNumber"){
									$("#policyParent").show();	
									$('#show_by_policy_id').prop('checked',true);
								}
								
								if(constants.selectionDefault == "id_number"){
									$("#idNumberParent").show();
									$('#show_by_insured_id').prop('checked',true);
								}
								
								$('input[type=radio][name=show_by]').change(function(){
									$("#policyParent").hide();
									$("#idNumberParent").hide();
									
									if($(this).val() == "show_by_insured_id"){
										$("#idNumberParent").show();
									}
									if($(this).val() == "show_by_policy_id"){
										$("#policyParent").show();
									}
								});
								
								
								
								document.getElementById('get-document').onclick = function () {
									if(!($("#shironim-from").valid())){
										return false;
									}
									$('div.overlay').addClass('show');
									$('div.spanner').addClass('show');
									loadDocumentData(); 
								};
								
								var wsLists = constants.workspacesList.split(',');
								
								$.each(wsLists, function( key, value ) {
									var isSelected = (constants.defaultWorkspace == value) ? "selected" : "";
									$('#workspacelist').append('<option value="'+value+'" '+isSelected+'>'+value+'</option>');
								});
								
								var today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
								var oneMonthBack = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
								oneMonthBack.setDate(today.getDate() - 30);
								
								var startDatePicker = $('#startdate').datepicker({
									format: 'dd/mm/yyyy',
									autoclose: true
								});
								$('#startdate').datepicker('setDate', oneMonthBack);
								//$('#startdate').datepicker('setEndDate', today);
								//startDatePicker.setDate();
								var endDatePicker = $('#enddate').datepicker({
									format: 'dd/mm/yyyy',
									autoclose: true
								});
								$('#enddate').datepicker('setDate', today);
								//$('#enddate').datepicker('setEndDate', today);
								
								$("#document-list-parent").on('click','a.open-document', function(event){
									event.stopPropagation();
									event.stopImmediatePropagation();
									//var documentUrl = 
									
									renderDialog();
									// var iframeContent = '<div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" src="'+constants.documentViewerURL+documentUrl+'" style="height:300px;width:100%;" allowfullscreen></iframe></div>';
									// $('#document-viewer').html(iframeContent);
									constants.documentUrl = $(this).data('url');
									$('#modalDocument').modal('show');
								});
								
								$.validator.addMethod("dateFormat",function(value, element) {
									return value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
								},"Please enter a date in the format dd/mm/yyyy.");
								
								var validateRules = {
									startdate: {required: true,dateFormat: true},
									enddate: {required: true,dateFormat: true},
									workspacelist: {required: true},
									policylist: {required:{
										depends: function(element) {
										  return $('input[type=radio][name=show_by]:checked').val() == "show_by_policy_id" ? true : false;
										}
									}},
									idnumberlist: {required:{
										depends: function(element) {
										  return $('input[type=radio][name=show_by]:checked').val() == "show_by_insured_id" ? true : false;
										}
									}}
								};
								
								var messagesList = {
									startdate: {required: "Start Date is required."},
									enddate: {required: "End Date is required."},
									idnumberlist: {required: "Id Number is required."},
									workspacelist: {required: "Workspace id is required."},
									policylist: {required: "Policy Number is required."},
								};
								
								valdiateIns = $("#shironim-from").validate({
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
								
								$('#get-document').text(constants.search);
								$('#lbl_show_by_lead_id').text(constants.lbl_show_by_lead_id);
								$('#lbl_show_by_insured_id').text(constants.lbl_show_by_insured_id);
								$('#lbl_show_by_policy_id').text(constants.lbl_show_by_policy_id);
								$('#lblwsList').text(constants.lblwsList);
								$('#lblPolicyList').text(constants.lblPolicyList);
								$('#lblIdNumberList').text(constants.lblIdNumberList);
								$('#lblStartDate').text(constants.lblStartDate);
								$('#lblEndDate').text(constants.lblEndDate);
								
								getpolicyIdNumber();
								
								setTimeout(function(){
									$($('#'+window.frameElement.id,window.parent.document).parent()).height('100%');
								}, 1000);
							});
						});
					});
				});
			});
		});
    });
}

function getpolicyIdNumber(){
	var formData = {method:"GetShironimIncidentData"};
	formData["session_id"] = constants.sesToken;
	formData["record_number"] = constants.recordId;
	formData["id_number_report"] = constants.idNumberReportId;
	formData["policy_report"] = constants.policyReportId;
	
	$.ajax({
		url : constants.hostURL,
		type: "POST",
		data : formData,
		success: function(data, textStatus, jqXHR)
		{
			console.log(data);
			if(IsJsonString(data)){
				var resData = JSON.parse(data);
				if(resData.Contact1_ID != ""){
					$('#idnumberlist').append('<option value="'+resData.Contact1_ID+'" >'+resData.Contact1_ID+'</option>');
				}
				if(resData.Contact2_ID != ""){
					$('#idnumberlist').append('<option value="'+resData.Contact2_ID+'" >'+resData.Contact2_ID+'</option>');
				}
				if(resData.Contact3_ID != ""){
					$('#idnumberlist').append('<option value="'+resData.Contact3_ID+'" >'+resData.Contact3_ID+'</option>');
				}
				if(resData.policy_num != ""){
					$('#policylist').append('<option value="'+resData.policy_num+'" >'+resData.policy_num+'</option>');
				}
			}
			$('div.overlay').removeClass('show');
			$('div.spanner').removeClass('show');
		},
		error: function (jqXHR, textStatus, errorThrown)
		{
			console.log(errorThrown);
			showError(errorThrown);
			$('div.overlay').removeClass('show');
			$('div.spanner').removeClass('show');
		}
	});
}

//Following function will load the document data.
function loadDocumentData(){
	var formData = {method:"GetShironimIncidentList"};
	if($('input[type=radio][name=show_by]:checked').val() == "show_by_lead_id"){
		formData["mode"] = "lead_id";
		formData["record_id"] = constants.recordId;
	}
	if($('input[type=radio][name=show_by]:checked').val() == "show_by_insured_id"){
		formData["mode"] = "id_number";
		formData["record_id"] = $('#idnumberlist').val();
	}
	if($('input[type=radio][name=show_by]:checked').val() == "show_by_policy_id"){
		formData["mode"] = "policy_id";
		formData["record_id"] = $('#policylist').val();
	}
	formData["session_id"] = constants.sesToken;
	formData["workspace_id"] = $('#workspacelist').val();
	formData["start_date"] = $('#startdate').val();
	formData["end_date"] = $('#enddate').val();
	formData["account_id"] = constants.accountId;
	
	$.ajax({
		url : constants.hostURL,
		type: "POST",
		data : formData,
		success: function(data, textStatus, jqXHR)
		{
			console.log(data);
			$('#document-list-parent').html("");
			if(IsJsonString(data)){
				var responseData = JSON.parse(data);
				if(responseData['is_success']=="1"){
					if(responseData["number_of_rows"] > 0){
						renderData(responseData["rows"]);
					} else {
						$('#info-msg').html(constants.noRecordFound);
						$('#info-msg').show();
					}
				} else {
					showError(responseData["error"]);
				}
			} else {
				showError(agentResp);
			}
			$('div.overlay').removeClass('show');
			$('div.spanner').removeClass('show');
		},
		error: function (jqXHR, textStatus, errorThrown)
		{
			console.log(errorThrown);
			showError(errorThrown);
			$('div.overlay').removeClass('show');
			$('div.spanner').removeClass('show');
		}
	});
}

//Following function will render Dialog when method is called.
function renderDialog() {
    constants._extensionProvider.registerUserInterfaceExtension(function (uiContext) {
        uiContext.getModalWindowContext().then(function (IModalWindowContext) {
            localStorage.setItem("shironimIncident", this.window.frameElement.id);
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

//Following will close the Dialog
function collapseDialog() {
    constants._extensionProvider.registerUserInterfaceExtension(function (uiContext) {
        uiContext.getModalWindowContext().then(function (IModalWindowContext) {
            IModalWindowContext.getCurrentModalWindow().then(function (IModalWindow) {
                IModalWindow.close();
				constants.documentUrl =  "";
				console.log("Modal Dialog Closed.");
				$('#document-viewer').html('');
				document.getElementById('warning-msg').innerHTML = "";
				incidentData = null;
				lastInteraction = "";
				lastParent = null;
            });
        });
    });
}

//Following funciton will render the document data
function renderData(rowData){
	var tableCols = getMainColumnStruct(constants.columnConfigs);
	var tableHtml = generateTableData(rowData, tableCols);
	$('#document-list-parent').html(tableHtml);
}

//Following function return the maim columns for the product.
//Parameter: colDef - Product Column Definition
function getMainColumnStruct(colDef){
	var cols = colDef.split(";");
	var columnNames = [];
	for (col in cols){
		var colTemp = cols[col].split(",");
		var isLink = colTemp[4] == "Y" ? true : false;;
		var tempCol = {order:colTemp[3],title:colTemp[1],field:colTemp[0], linkDis: isLink};
		columnNames.push(tempCol);
	}
	//columnNames = sort_by_key(columnNames,'order');
	columnNames = columnNames.sort(function(a, b){ return a.order - b.order; });
	return columnNames;
}

//Following code will generate table from response.
//Parameter: respData - Response Data of the product
//Parameter: productColDef - Column Definition for the product
function generateTableData(respData, productColDef){
	var tableData = '<table class="table"><thead class="table-light sticky-header"><tr>';
	$.each(productColDef, function(key,value) {
		tableData +="<th class='text-nowrap'>"+value.title+"</th>";
	});
	tableData += '</tr></thead><tbody>';
	$.each(respData, function(index, record){
		tableData += '<tr>';
		$.each(productColDef, function(key,value) {
			var cellData = record[value.field] != undefined ? record[value.field]  : "";
			if(value.linkDis){
				cellData = '<a href="#" class="open-document" data-normalURL="'+record["DocURLNormal"]+'" data-url="'+record["DocURL"]+'">'+cellData+'</a>';
			}
			tableData += '<td>'+cellData+"</td>";
		});
		tableData +='</tr>';
	});
	tableData += '</tbody></table>';
	return tableData;
}

//Following method will check whether a key exist in Array or not.
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

function showError(msg){
	$('#list-parent').css('display','none');
	$('#warning-msg').show();
	$('#warning-msg').html(msg);
	$('div.overlay').removeClass('show');
	$('div.spanner').removeClass('show');
}

//Following method will verify whether a string is json or not.
function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

//Following method will sort Array by given key.
// param: array - Object array
// param: key - key by which we suppose to order the object
function sort_by_key(array, key)
{
	return array.sort(function(a, b)
	{
		var x = a[key]; var y = b[key];
		return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	});
}