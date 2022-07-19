var appId = "ShironimContact";
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
	documentViewerURL:"",
	docIDCol:"",
	wsList:"",
	startDate:"",
	endDate:"",
	search:""
};
var ieFlag = window.ActiveXObject || "ActiveXObject" in window;
var workspaceType = "";
var daysBeforeToday = "";
var incidentData = null;
var lastInteraction = "";
var lastParent = null;
var isOnClickDefine = false;
var valdiateIns = null;

function initialize(screen) {
    if (screen == "dialog") {
        loadDialog();
    } else {
        loadExtension();
    }
}

function loadDialog() {
	var parentFrameId = localStorage.getItem("shironimContcat");
    if (parentFrameId) {
        if (ieFlag) {
            parentFrame = window.parent.frames[parentFrameId];
        } else {
            parentFrame = window.parent.frames[parentFrameId].contentWindow;
        }
        constants = parentFrame.constants;
		document.getElementById('close-popup').onclick = function () { collapseDialog(); };
		
		$('#form-parent').show();
		$('#button-parent').show();
		$('#document-list-parent').show();
		if(constants.recordId == null || constants.recordId.toString().trim() == ""){
			showError(constants.idNotFound);
			$('#form-parent').hide();
			$('#button-parent').hide();
			$('#document-list-parent').hide();
			$($('#'+window.frameElement.id,window.parent.document).parent()).height('100%');
			return;
		}
		var today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
		var oneMonthBack = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
		oneMonthBack.setDate(today.getDate() - 30);
		
		var startDatePicker = $('#startdate').datepicker({
			format: 'dd/mm/yyyy',
			autoclose: true
		});
		$('#startdate').datepicker('setDate', oneMonthBack);
		$('#startdate').datepicker('setEndDate', today);
		//startDatePicker.setDate();
		var endDatePicker = $('#enddate').datepicker({
			format: 'dd/mm/yyyy',
			autoclose: true
		});
		$('#enddate').datepicker('setDate', today);
		$('#enddate').datepicker('setEndDate', today);
		//endDatePicker.setDate();
		
		
		if(!isOnClickDefine){
			isOnClickDefine = false;
			
			var wsLists = constants.workspacesList.split(',');
		
			$.each(wsLists, function( key, value ) {
				var isSelected = (constants.defaultWorkspace == value) ? "selected" : "";
				$('#workspacelist').append('<option value="'+value+'" '+isSelected+'>'+value+'</option>');
			});
			
			document.getElementById('get-document').onclick = function () {
				if(!($("#shironim-from").valid())){
					return false;
				}
				loadDocumentData($('#startdate').val(), $('#enddate').val(), $('#workspacelist').val()); 
				$('div.overlay').addClass('show');
				$('div.spanner').addClass('show');
			};
			
			$("#document-list-parent").on('click','a.open-document', function(event){
				event.stopPropagation();
				event.stopImmediatePropagation();
				var documentUrl = $(this).data('url');
				var iframeContent = '<div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" src="'+constants.documentViewerURL+documentUrl+'" style="height:300px;width:100%;" allowfullscreen></iframe></div>';
				$('#document-viewer').html(iframeContent);
				$('#modalDocument').modal('show');
			});
			document.getElementById('closeModelDocument').onclick = function () { $('#modalDocument').modal('hide');$('#document-viewer').html(""); };
			
			$.validator.addMethod("dateFormat",function(value, element) {
				return value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
			},"Please enter a date in the format dd/mm/yyyy.");
			
			var validateRules = {
				startdate: {required: true,dateFormat: true},
				enddate: {required: true,dateFormat: true},
				workspacelist: {required: true}
			};
			
			var messagesList = {
				startdate: {required: "Start Date is required."},
				enddate: {required: "End Date is required."},
				workspacelist: {required: "Workspace id is required."}
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
		}
		
		$('#get-document').text(constants.search);
		$('#lblwsList').text(constants.wsList);
		$('#lblStartDate').text(constants.startDate);
		$('#lblEndDate').text(constants.endDate);
		
		loadDocumentData($('#startdate').val(), $('#enddate').val(), $('#workspacelist').val());
		
        localStorage.removeItem("shironimContcat");
    }
}

function loadExtension() {
    ORACLE_SERVICE_CLOUD.extension_loader.load(appId, apiVersion).then(function (extensionProvider) {
        constants._extensionProvider = extensionProvider;
		document.getElementById('open-shironim-popup').onclick = function () { renderDialog() };
		extensionProvider.registerWorkspaceExtension(function(workspaceRecord){
			workspaceType = workspaceRecord.getWorkspaceRecordType();
			var fieldDetails;
			if(workspaceType == "Contact"){
				fieldDetails = ['Contact.co$id_number'];
			}
			workspaceRecord.getFieldValues(fieldDetails).then(function(IFieldDetails){
				if(workspaceType == "Contact"){
					constants.recordId = IFieldDetails.getField('Contact.co$id_number').getLabel();
				}
				IFieldDetails.getParent().parent.getExtensionProvider().getGlobalContext().then(function(globalContext) {
					constants.accountId = globalContext.getAccountId();
					globalContext.getSessionToken().then(function(sessionToken)
					{
						constants.sesToken = sessionToken;
						globalContext.getExtensionContext('ShironimContact').then(function(extensionContext) {
							extensionContext.getProperties(['daysBeforeToday','coulmnConfig','hostURL','idNotFound','reportId','noRecordFound','noDetailsFound','errorMsg','workspacesList','defaultWorkspace','documentViewerURL','docIDCol','wsList','startDate','endDate','search','iconURL']).then(function(collection) {
								constants.columnConfigs = collection.get('coulmnConfig').value;
								constants.hostURL = (window.location.protocol+"//"+window.location.hostname)+(collection.get('hostURL').value);
								constants.idNotFound = collection.get('idNotFound').value;
								constants.report_id = collection.get('reportId').value;
								constants.noRecordFound = collection.get('noRecordFound').value;
								constants.errorMsg = collection.get('errorMsg').value;
								constants.workspacesList = collection.get('workspacesList').value;
								constants.defaultWorkspace = collection.get('defaultWorkspace').value;
								constants.documentViewerURL = collection.get('documentViewerURL').value;
								constants.docIDCol = collection.get('docIDCol').value;
								constants.wsList = collection.get('wsList').value;
								constants.startDate = collection.get('startDate').value;
								constants.endDate = collection.get('endDate').value;
								constants.search = collection.get('search').value;
								
								var iconURL = collection.get('iconURL').value;
								
								$("#iconButton").attr("src",iconURL);
								
								if(constants.recordId == null || constants.recordId.toString().trim() == ""){
									showError(constants.idNotFound);
									$($('#'+window.frameElement.id,window.parent.document).parent()).height('100%');
									return;
								}
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


//Following function will load the document data.
function loadDocumentData(startDate, endDate, workspaceId){
	var formData = {method:"GetShironimDataContact",id_number: constants.recordId};
	formData["session_id"] = constants.sesToken;
	formData["workspace_id"] = workspaceId;
	formData["start_date"] = startDate;
	formData["end_date"] = endDate;
	formData["account_id"] = constants.accountId;
	formData["doc_id_col"] = constants.docIDCol;
	
	$('#info-msg').html("");
	$('#warning-msg').html("");
	$('#info-msg').hide();
	$('#warning-msg').hide();
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
		}
	});
}

//Following funciton will render the document data
function renderData(rowData){
	var tableCols = getMainColumnStruct(constants.columnConfigs);
	var tableHtml = generateTableData(rowData, tableCols);
	$('#document-list-parent').html(tableHtml);
}

//Following function will render Dialog when method is called.
function renderDialog() {
    constants._extensionProvider.registerUserInterfaceExtension(function (uiContext) {
        uiContext.getModalWindowContext().then(function (IModalWindowContext) {
            localStorage.setItem("shironimContcat", this.window.frameElement.id);
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
				console.log("Modal Dialog Closed.");
				document.getElementById('warning-msg').innerHTML = "";
				incidentData = null;
				lastInteraction = "";
				lastParent = null;
            });
        });
    });
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
				cellData = '<a href="#" class="open-document" data-url="'+record["DocURL"]+'">'+cellData+'</a>';
			}
			tableData += '<td>'+cellData+"</td>";
		});
		tableData +='</tr>';
	});
	tableData += '</tbody></table>';
	return tableData;
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

function showError(msg){
	$('#document-list-parent').css('display','none');
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