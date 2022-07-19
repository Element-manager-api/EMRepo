var appId = "AgentAutoComplete";
var apiVersion = "1.0";
var constants = {
    sesToken: null,
    hostURL: null,
	idNotFound: null,
	recordId: null,
    _extensionProvider: null,
	wsRecordContext: null,
	TargetField: null,
	MenuReport: null,
	LookupField: null,
	ColumnsOrder: null,
	NoValue: null,
	PlaceHolder:null,
	WSFilter: null,
	FieldValues: null,
	LastField: null,
	LastSource: null,
	FirstLoad: false,
	AgentLabel:null
};
var ieFlag = window.ActiveXObject || "ActiveXObject" in window;
var workspaceType = "";
var intervalId = null;

//This function intialize the extension according the passed parameter whether it is main screen or dialog.
//Parameter: screen (Values: Dialog and Main)
function initialize(screen) {
    if (screen == "dialog") {
        loadDialog();
    } else {
        loadExtension();
    }
}

//This function is main function which loads the extension and its data.
//This assigns the configuration values to the constants and also fetch the record value.
function loadExtension() {
    ORACLE_SERVICE_CLOUD.extension_loader.load(appId, apiVersion).then(function (extensionProvider) {
        constants._extensionProvider = extensionProvider;
		extensionProvider.registerWorkspaceExtension(function(workspaceRecord){
			workspaceType = workspaceRecord.getWorkspaceRecordType();
			constants.wsRecordContext = workspaceRecord;
			constants._extensionProvider.getGlobalContext().then(function(globalContext) {
				globalContext.getSessionToken().then(function(sessionToken)
				{
					constants.sesToken = sessionToken;
					//Following section will get all the configuration values and assign it to constants variable.
					globalContext.getExtensionContext('AgentAutoComplete').then(function(extensionContext) {
						extensionContext.getProperties(['TargetField','MenuReport','LookupField','ColumnsOrder','NoValue','PlaceHolder','WSFilter','hostURL','AgentLabel']).then(function(collection) {
							constants.TargetField = collection.get('TargetField').value;
							constants.MenuReport = collection.get('MenuReport').value;
							constants.LookupField = collection.get('LookupField').value;
							constants.ColumnsOrder = collection.get('ColumnsOrder').value;
							constants.NoValue = collection.get('NoValue').value;
							constants.PlaceHolder = collection.get('PlaceHolder').value;
							constants.hostURL = (window.location.protocol+"//"+window.location.hostname)+(collection.get('hostURL').value);
							constants.WSFilter = getFilterList(collection.get('WSFilter').value);
							constants.AgentLabel = collection.get('AgentLabel').value;
							console.log(constants.AgentLabel);
							
							var fieldNames = [];
							fieldNames.push(constants.TargetField);
							
							if(constants.WSFilter != null && constants.WSFilter.length > 0){
								for (let i = 0; i < constants.WSFilter.length; i++) {
									if(constants.WSFilter[i]["field"]!=""){
										fieldNames.push(constants.WSFilter[i]["field"]);
										constants.wsRecordContext.addFieldValueListener(constants.WSFilter[i]["field"], updateFieldValue);
									}
								}
							}
							constants.FieldValues = [];
							$('#auto-complete-label').text(constants.AgentLabel);
							$("#agent-list").attr("placeholder", constants.PlaceHolder);
							$("#agent-list").autocomplete({
								minLength: 0,
								source: [],
								focus: function( event, ui ) {
									if(ui.item != null){
										$("#agent-list").val(ui.item.value);
									}
									return false;
								},
								select: function (event, ui) {
									if(ui.item != null){
										workspaceRecord.updateField(constants.TargetField, ui.item.value); 
									} else {
										workspaceRecord.updateField(constants.TargetField, "");
									}
									return false;
								},
								change: function( event, ui ) {
									if(ui.item != null){
										workspaceRecord.updateField(constants.TargetField, ui.item.value); 
									} else {
										$("#agent-list").val('');
										workspaceRecord.updateField(constants.TargetField, "");
									}
								},
								response: function(event, ui) {
									if (!ui.content.length) {
										var noResult = { value:"",label: constants.NoValue };
										ui.content.push(noResult);
									}
								}
							}).focus(function () {
								$(this).autocomplete("search");
							});
							
							constants.wsRecordContext.getFieldValues(fieldNames).then(function(IFieldDetails){
								for (let k = 0; k < fieldNames.length; k++) {
									constants.FieldValues[fieldNames[k]] = IFieldDetails.getField(fieldNames[k]).getValue();
								}
								updateSource();
								intervalId = setInterval(function(){
									if(constants.FirstLoad){
										clearInterval(intervalId);
									}
									if(constants.FirstLoad && constants.FieldValues[constants.TargetField] != undefined && constants.FieldValues[constants.TargetField] && constants.FieldValues[constants.TargetField] != ""){
										var targetFieldValue = constants.FieldValues[constants.TargetField];
										if(constants.LastSource != null && constants.LastSource.length > 0){
											for (let z = 0; z < constants.LastSource.length; z++) {
												var insData = constants.LastSource[z];
												if(insData["value"] == constants.FieldValues[constants.TargetField]){
													targetFieldValue = insData["value"];
												}
											}
										}
										setAutocompletCurrentValue('#agent-list',targetFieldValue);
										//$("#agent-list").trigger('keydown');
									}
								}, 2000);
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

//Following function will set autocomplete value on load.
function setAutocompletCurrentValue(id, value) {
   $(id).val(value);
   var textToShow = $(id).find(":selected").text();
   $(id).parent().find("span").find("input").val(textToShow);
}

//Following function will update the filter value.
function updateFieldValue(currentParam){
	constants.LastField = currentParam.event.field;
	constants.wsRecordContext.getFieldValues([currentParam.event.field]).then(function(IFieldDetails)
	{
		constants.FieldValues[constants.LastField] = IFieldDetails.getField(constants.LastField).getValue();
		updateSource();
	});
}

//Following function will update the source of the .
function updateSource(){
	var filterData = [];
	if(constants.WSFilter!=null && constants.WSFilter.length > 0 ){
		for (let i = 0; i < constants.WSFilter.length; i++) {
			var filterIns = {};
			filterIns["filterName"] = constants.WSFilter[i]["filter"];
			filterIns["filterValue"] = constants.FieldValues[constants.WSFilter[i]["field"]];
			filterData.push(filterIns);
		}
	}
	var formData = {method:"GetAgentList",report_id:constants.MenuReport, reportFilters: JSON.stringify(filterData)};
	formData["session_id"] = constants.sesToken;
	$.ajax({
		url : constants.hostURL,
		type: "POST",
		data : formData,
		success: function(agentResp, textStatus, jqXHR)
		{
			if(IsJsonString(agentResp)){
				var agentRespData = JSON.parse(agentResp);
				var colOrder = constants.ColumnsOrder.split(",");
				var agentListData = [];
				for(let i = 0; i < agentRespData.length; i++) {
					var insAgent = agentRespData[i];
					var insLabel = "";
					for(let k = 0; k < colOrder.length; k++) {
						var colName = colOrder[k].replace(";","");
						insLabel = insLabel+" "+insAgent[colName];
					}
					insLabel = $.trim(insLabel);
					agentListData.push({value: insAgent[constants.LookupField],label: insLabel});
				}
				$("#agent-list").autocomplete('option', 'source', agentListData);
				constants.LastSource = agentListData;
			}
			else {
				console.log(agentResp);
				constants.LastSource = [];
			}
			if(!constants.FirstLoad){
				constants.FirstLoad = true;
			}
		},
		error: function (jqXHR, textStatus, errorThrown)
		{
			showError("<p>"+constants.errorMsg+"</p>");
		}
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

//Following function will explode filters and their related values.
//Parameter: filterString - string filter
function getFilterList(filterString){
	var currentFilterLists = [];
	if($.trim(filterString)!=""){
		var tempFilters = filterString.split(";");
		for (let i = 0; i < tempFilters.length; i++) {
			if($.trim(tempFilters[i]) != ""){
			var tempFilter = tempFilters[i].split(",");
				var newFilter = [];
				newFilter["field"] = tempFilter[0];
				newFilter["filter"] = tempFilter[1];
				currentFilterLists.push(newFilter);
			}
		}
	}
	return currentFilterLists;
}

function click_auto_complete(){
	$( "#agent-list" ).focus();
}