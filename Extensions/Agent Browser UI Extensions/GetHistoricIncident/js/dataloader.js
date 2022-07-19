var appId = "GetHistoricIncident";
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
	showMore:"",
	clickedIncident:null,
	incidentDetails:"",
	messagesLbl:"",
	threeMonths:"",
	sixMonths:"",
	oneYear:"",
	processType:""
};
var ieFlag = window.ActiveXObject || "ActiveXObject" in window;
var workspaceType = "";
var daysBeforeToday = "";
var incidentData = null;
var lastInteraction = "";
var lastParent = null;

function initialize(screen) {
    if (screen == "dialog") {
        loadDialog();
    } else {
        loadExtension();
    }
}

function loadDialog() {
	var parentFrameId = localStorage.getItem("GetHistoricIncident");
    if (parentFrameId) {
        if (ieFlag) {
            parentFrame = window.parent.frames[parentFrameId];
        } else {
            parentFrame = window.parent.frames[parentFrameId].contentWindow;
        }
		constants = parentFrame.constants;
		lastInteraction = parentFrame.lastInteraction;
        //incidentData = parentFrame.incidentData;
        //loadData(incidentData);
		document.getElementById('close-popup').onclick = function () { collapseDialog() };
		showLines();
        localStorage.removeItem("GetHistoricIncident");
    }
}

function loadExtension() {
    ORACLE_SERVICE_CLOUD.extension_loader.load(appId, apiVersion).then(function (extensionProvider) {
        constants._extensionProvider = extensionProvider;
		//document.getElementById('open-popup').onclick = function () { renderDialog() };
		$("#period").change(function() {
			$('div.overlay').addClass('show');
			$('div.spanner').addClass('show');
			$('#warning-msg').hide();
			$('#info-msg').hide();
			$('#list-parent').css('display','none');
			requestData($('option:selected', this).val());
		});
		$('#list-body').on("click", "a.show-detail",function(e) {
			$('div.overlay').addClass('show');
			$('div.spanner').addClass('show');
			handleInteraction(this, e);
			e.preventDefault();
		});								  
		extensionProvider.registerWorkspaceExtension(function(workspaceRecord){
			workspaceType = workspaceRecord.getWorkspaceRecordType();
			var fieldDetails;
			if(workspaceType == "Contact"){
				fieldDetails = ['Contact.co$id_number'];
			}
			if(workspaceType == "Incident"){
				fieldDetails = ['Incident.i_id'];
			}
			workspaceRecord.getFieldValues(fieldDetails).then(function(IFieldDetails){
				if(workspaceType == "Contact"){
					recordId = IFieldDetails.getField('Contact.co$id_number').getLabel();
				}
				if(workspaceType == "Incident"){
					recordId = IFieldDetails.getField('Incident.i_id').getLabel();
				}
				IFieldDetails.getParent().parent.getExtensionProvider().getGlobalContext().then(function(globalContext) {
					globalContext.getSessionToken().then(function(sessionToken)
					{
						constants.sesToken = sessionToken;
						globalContext.getExtensionContext('GetHistoricIncident').then(function(extensionContext) {
							extensionContext.getProperties(['daysBeforeToday','coulmnConfig','hostURL','idNotFound','reportId','noRecordFound','noDetailsFound','errorMsg','showMore','incidentDetails','messagesLbl','threeMonths','sixMonths','oneYear',"Process_Type"]).then(function(collection) {
								daysBeforeToday = collection.get('daysBeforeToday').value;
								constants.columnConfigs = collection.get('coulmnConfig').value;
								constants.hostURL = (window.location.protocol+"//"+window.location.hostname)+(collection.get('hostURL').value);
								constants.idNotFound = collection.get('idNotFound').value;
								constants.report_id = collection.get('reportId').value;
								constants.noRecordFound = collection.get('noRecordFound').value;
								constants.noDetailsFound = collection.get('noDetailsFound').value;
								constants.showMore = collection.get('showMore').value;
								constants.errorMsg = collection.get('errorMsg').value;
								constants.incidentDetails = collection.get('incidentDetails').value;
								constants.messagesLbl = collection.get('messagesLbl').value;
								constants.threeMonths = collection.get('threeMonths').value;
								constants.sixMonths = collection.get('sixMonths').value;
								constants.oneYear = collection.get('oneYear').value;
								constants.processType = collection.get('Process_Type').value;
								
								
								$('#threeMonths').html(constants.threeMonths);
								$('#sixMonths').html(constants.sixMonths);
								$('#oneYear').html(constants.oneYear);
								
								if(recordId== null || recordId.toString().trim() == ""){
									showError(constants.idNotFound);
									$($('#'+window.frameElement.id,window.parent.document).parent()).height('100%');
									return;
								}
								requestData(daysBeforeToday);
								setTimeout(function(){
									$($('#'+window.frameElement.id,window.parent.document).parent()).height('100%');
								}, 1000);
								
								$( window ).resize(function() {
								  $($('#'+window.frameElement.id,window.parent.document).parent()).height('100%');
								});
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

function requestData(periodData){
	var formData = {method:"GetInteractionHistory",ws_type:workspaceType,id_number: recordId,date_diff: periodData};
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
				incidentData = data;
				loadData();
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

function loadData(){
	var interactions = JSON.parse(incidentData);
	if(interactions.hasOwnProperty("GetInteractionHistoryResponse") && interactions.GetInteractionHistoryResponse.hasOwnProperty("Response") && interactions.GetInteractionHistoryResponse.Response.hasOwnProperty("ET_INTERACTION_RECORDS") && interactions.GetInteractionHistoryResponse.Response.ET_INTERACTION_RECORDS.length > 0){
		cols = constants.columnConfigs.split(";");
		var columnNames = [];
		for (col in cols){
			var colTemp = cols[col].split(",");
			if(colTemp[2] == "Y" && colTemp[5] == "M"){
				var isLink = colTemp[4] == "Y" ? true : false;;
				var tempCol = {order:colTemp[3],title:colTemp[1],field:colTemp[0], linkDis: isLink};
				columnNames.push(tempCol);
			}
		}
		//columnNames = sort_by_key(columnNames,'order');
		columnNames = columnNames.sort(function(a, b){ return a.order - b.order; });
		var columnLists = [];
		
		var headers = "<tr>";
		$.each(columnNames, function(key,value) {
			headers +="<th>"+value.title+"</th>";
		});
		headers +="<th></th></tr>";
		
		$('#list-header').html(headers);
		$('div.overlay').removeClass('show');
		$('div.spanner').removeClass('show');
		
		var recordList = "";
		
		var processArr = constants.processType.split(",").map(function(item) {
		  return item.trim();
		});
		
		$.each(interactions.GetInteractionHistoryResponse.Response.ET_INTERACTION_RECORDS, function(index, record){
			var rowData = '<tr>';
			$.each(columnNames, function(key,value) {
				var cellData = record[value.field];
				// if(value.linkDis){
					// cellData = '<p href="#/" class="show-detail" data-guid="'+record["GUID"]+'">'+record[value.field]+'</p>';
				// }
				rowData += "<td>"+cellData+"</td>";
			});
			//recordList +='<td><p class="show-detail" data-guid="'+record["GUID"]+'"><i class="fa fa-plus-circle" aria-hidden="true"></i><i class="fa fa-minus-circle d-none" aria-hidden="true"></i></p><td>';
			rowData +='<td><a class="show-detail" data-guid="'+record["GUID"]+'">'+constants.showMore+'</a><td>';
			rowData +='</tr>';
			if(processArr != null && processArr.length > 0 && record["PROCESS_TYPE"]!="" && processArr.includes(record["PROCESS_TYPE"])){
				recordList += rowData;
			}
		});
		$('#list-body').html(recordList);
		$('#list-parent').show();
	} else if(interactions.hasOwnProperty("GetInteractionHistoryResponse") && interactions.GetInteractionHistoryResponse.hasOwnProperty("Response") && interactions.GetInteractionHistoryResponse.Response.hasOwnProperty("Status") && interactions.GetInteractionHistoryResponse.Response.Message == "Success") {
		$('#info-msg').show();
		$('#info-msg').html(constants.noRecordFound);
		$('#list-header').html('');
		$('#list-body').html('');			
		$('#list-parent').css('display','none');
		$('div.overlay').removeClass('show');
		$('div.spanner').removeClass('show');
	} else {
		showError("<p>"+constants.errorMsg+"</p>");
	}
}

function handleInteraction(elem, eve){
	var btn = elem;
	// if($(btn).closest('tr').find("i.fa-plus-circle").hasClass('d-none')){
		// $(btn).closest('tr').find("i.fa-minus-circle").toggleClass('d-none');
		// $(btn).closest('tr').find("i.fa-plus-circle").toggleClass('d-none');
		// $(btn).closest('tbody').find("#tr-"+$(btn).data('guid')).remove();
	// } else {
		// $($($(btn).closest('tr')).find("i.fa-minus-circle")[0]).toggleClass('d-none');
		// $($($(btn).closest('tr')).find("i.fa-plus-circle")[0]).toggleClass('d-none');
		// $('div.overlay').addClass('show');
		// $('div.spanner').addClass('show');
		// lastParent = $(btn).closest('tr')[0];
		// lastInteraction = $(btn).data('guid');
		// getInteraction();
	// }
	lastInteraction = $(btn).data('guid');
	constants.clickedIncident = null;
	constants.clickedIncident = findIncident(lastInteraction);
	getInteraction();
	return false;
}

function getInteraction(){
	if(lastInteraction !=""){
		if(sessionStorage.getItem(lastInteraction)!=null){
			renderDialog();
			$('div.overlay').removeClass('show');
			$('div.spanner').removeClass('show');
		} else {
			$.ajax({
				url : constants.hostURL,
				type: "POST",
				data : {method:"GetText",guid: lastInteraction, session_id: constants.sesToken},
				success: function(data, textStatus, jqXHR)
				{
					sessionStorage.setItem(lastInteraction,data);
					renderDialog();
					$('div.overlay').removeClass('show');
					$('div.spanner').removeClass('show');
				},
				error: function (jqXHR, textStatus, errorThrown)
				{
					$('#warning-msg').show();
					$('#warning-msg').html(data);
					$('div.overlay').removeClass('show');
					$('div.spanner').removeClass('show');
				}
			});
		}
	}
}

function renderDialog() {
    constants._extensionProvider.registerUserInterfaceExtension(function (uiContext) {
        uiContext.getModalWindowContext().then(function (IModalWindowContext) {
            localStorage.setItem("GetHistoricIncident", this.window.frameElement.id);
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

function collapseDialog() {
    constants._extensionProvider.registerUserInterfaceExtension(function (uiContext) {
        uiContext.getModalWindowContext().then(function (IModalWindowContext) {
            IModalWindowContext.getCurrentModalWindow().then(function (IModalWindow) {
                IModalWindow.close();
				console.log("Modal Dialog Closed.");
				document.getElementById('warning-msg').innerHTML = "";
				lastInteraction = "";
				lastParent = null;
            });
        });
    });
}

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

function showLines(){
	$("#list-parent").html();
	var recordList = '<h4 style="text-align:center;background-color:#f2f2f3;" >'+constants.incidentDetails+'</h4>';
	
	if(constants.clickedIncident != null){
		var dialogCols = constants.columnConfigs.split(";");
		var columnNames = [];
		for (col in dialogCols){
			var colTemp = dialogCols[col].split(",");
			if(colTemp[2] == "Y"){
				var isLink = colTemp[4] == "Y" ? true : false;;
				var tempCol = {order:colTemp[3],title:colTemp[1],field:colTemp[0], linkDis: isLink};
				columnNames.push(tempCol);
			}
		}
		
		columnNames = columnNames.sort(function(a, b){ return a.order - b.order; });
		//columnNames.reverse();
		$.each(columnNames, function(key,value) {
			recordList += '<div class="col-md-4" style="margin-bottom:10px;"><div class="row"><div class="col-md-6" style="font-weight:700;">'+value.title+'</div><div class="col-md-6">'+constants.clickedIncident[value.field]+'</div></div></div>';
		});
	}
	
	recordList += '<h5 style="text-align:center;background-color:#f2f2f3;" >'+constants.messagesLbl+'</h5>';
	if(IsJsonString(sessionStorage.getItem(lastInteraction))){
		var lineData = JSON.parse(sessionStorage.getItem(lastInteraction));
		if(lineData.hasOwnProperty("GetTextResponse") && lineData.GetTextResponse.hasOwnProperty("Response") && lineData.GetTextResponse.Response.hasOwnProperty("ET_OUTBOUND") && lineData.GetTextResponse.Response.ET_OUTBOUND.length > 0){
			recordList += '<div class="row"  style="height: 200px;overflow: auto;direction: ltr;margin-right: 0px;"><div class="col-md-12 col-sm-12 col-lg-12" style="direction: rtl;text-align: right;">';
			$.each(lineData.GetTextResponse.Response.ET_OUTBOUND, function (key, line) {
				$.each(line.LINES, function(k, para){
					recordList += para+"<br/>";
				});
			});
			recordList += "</div></div>";
		} else if(lineData.hasOwnProperty("GetTextResponse") && lineData.GetTextResponse.hasOwnProperty("Response") && (!lineData.GetTextResponse.Response.hasOwnProperty("ET_OUTBOUND"))){
			recordList += '<div class="row"><div class="col-md-12 col-sm-12 col-lg-12">'+constants.noDetailsFound+'</div></div>';
		}
	}
	
	$("#list-parent").html(recordList);
	$('div.overlay').removeClass('show');
	$('div.spanner').removeClass('show');
}
function showError(msg){
	$('#list-parent').css('display','none');
	$('#warning-msg').show();
	$('#warning-msg').html(msg);
	$('div.overlay').removeClass('show');
	$('div.spanner').removeClass('show');
}

function findIncident(guid){
	var foundIncident = null;
	var interactions = JSON.parse(incidentData);
	if(interactions.hasOwnProperty("GetInteractionHistoryResponse") && interactions.GetInteractionHistoryResponse.hasOwnProperty("Response") && interactions.GetInteractionHistoryResponse.Response.hasOwnProperty("ET_INTERACTION_RECORDS") && interactions.GetInteractionHistoryResponse.Response.ET_INTERACTION_RECORDS.length > 0){
		$.each(interactions.GetInteractionHistoryResponse.Response.ET_INTERACTION_RECORDS, function(index, record){
			if(record.GUID == guid ){
				foundIncident = record;
				return false;
			}
		});
	}
	return foundIncident;
}
function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
function sort_by_key(array, key)
{
	return array.sort(function(a, b)
	{
		var x = a[key]; var y = b[key];
		return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	});
}