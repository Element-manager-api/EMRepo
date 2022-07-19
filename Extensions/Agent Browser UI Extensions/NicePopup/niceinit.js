var appId = "NicePopup";
var apiVersion = "1.0";
var constants = {
    sesToken: null,
    hostURL: null,
	idNotFound: null,
	recordId: null,
    _extensionProvider: null,
	errorMsg: "",
	ciscoIdError:"",
	urlNotFound:"",
	report_id:null,
	IDColumnName:"",
	analyticsExtension: null,
	interacitonIdError: null
};
var contactData = {};
var ieFlag = window.ActiveXObject || "ActiveXObject" in window;
var workspaceType = "";

var rowId = null;

//ORACLE_SERVICE_CLOUD.extension_loader.load('ReportCommandApp')
ORACLE_SERVICE_CLOUD.extension_loader.load(appId, apiVersion).then(function(IExtensionProvider)
{
	constants._extensionProvider = IExtensionProvider;
	IExtensionProvider.getGlobalContext().then(function(globalContext) {
		constants.accountId = globalContext.getAccountId();
		globalContext.getSessionToken().then(function(sessionToken)
		{
			constants.sesToken = sessionToken;
		});
		globalContext.getExtensionContext('NicePopup').then(function(extensionContext) {
			extensionContext.getProperties(['hostURL','reportId','columnTitle','channelColumnName','ciscoIdError','urlNotFound','IDColumnName','interacitonIdError']).then(function(collection) {
				constants.columnTitle = collection.get('columnTitle').value;
				constants.hostURL = (window.location.protocol+"//"+window.location.hostname)+(collection.get('hostURL').value);
				constants.channelColumnName = collection.get('channelColumnName').value;
				constants.report_ids = collection.get('reportId').value;
				constants.ciscoIdError = collection.get('ciscoIdError').value;
				constants.urlNotFound = collection.get('urlNotFound').value;
				constants.IDColumnName = collection.get('IDColumnName').value;
				constants.interacitonIdError = collection.get('interacitonIdError').value;
				
				registerCommand(constants.report_ids.split(","), constants._extensionProvider);
			});
		});
	});
});

function registerCommand(reportIds, extProvider){
	for (let i = 0; i < reportIds.length; i++) {
		extProvider.registerAnalyticsExtension(function(IAnalyticsContext)
		{
			var sampleCommand = IAnalyticsContext.createRecordCommandContext('הקלטת נייס');
			sampleCommand.setLabel('הקלטת נייס');
			sampleCommand.setTooltip('הקלטת נייס');
			//sampleCommand.setRecordId();
			//sampleCommand.setRecordId(100444);
			sampleCommand.setRecordId(reportIds[i]);
			sampleCommand.showAsLink(true);
			sampleCommand.addInjectionValidatorCallback(function(data)
			{
				return true;
			});
			sampleCommand.addValidatorCallback(function(rows)
			{
				var flagLink = false;
				for (var row of rows){
					for (var column of row.getCells())
					{
						if(column.getName() == 'ערוץ'){
							if(column.getValue() == 'טלפון'){
								flagLink = true;
							}
						}
					}
				}
				return flagLink;
			});
			sampleCommand.addExecutorCallback(function(rows)
			{
				if(rows.length > 0) {
					var interaction_id = null;
					var start_date = "";
					var end_date = "";
					var currentRowId = null;
					for (var row of rows){
						currentRowId = row.rowId;
						for (var column of row.getCells())
						{
							if(column.getName() == constants.IDColumnName && column.getValue() != null  && column.getValue()!="" ){
								interaction_id = column.getValue();
							}
						}
					}
					
					if(interaction_id == null || interaction_id == ""){
						alert(constants.interacitonIdError);
						return true;
					}
					var formData = {method:"GetNiceURL",interactionID: interaction_id};
					formData["session_id"] = constants.sesToken;
					$.ajax({
						url : constants.hostURL,
						type: "POST",
						data : formData,
						success: function(data, textStatus, jqXHR)
						{
							console.log(data);
							if(IsJsonString(data)){
								var responseData = JSON.parse(data);
								if(responseData['URL'] != undefined && responseData['URL']!=""){
									window.open(responseData['URL'], '_blank');
								} else {
									alert(constants.urlNotFound);
								}
							} else {
								alert("Error happened.");
							}
						},
						error: function (jqXHR, textStatus, errorThrown)
						{
							console.log(errorThrown);
						}
					});
				}
			});
			IAnalyticsContext.registerRecordCommand(sampleCommand);
			sampleCommand = null;
		});
	}
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
	
function getFormattedDate(selectedDate){
	var mm = selectedDate.getMonth() + 1;
	var yyyy = selectedDate.getFullYear();
	var dd = selectedDate.getDate();
	if (dd < 10) {
		dd = '0' + dd;
	}
	if (mm < 10) {
		mm = '0' + mm;
	}
	return dd + '/' + mm + '/' + yyyy;
}