var appId = "FillInbox";
var apiVersion = "1.0";
var constants = {
    sesToken: null,
    hostURL: null,
	buttonTitle: null,
    _extensionProvider: null,
	report_id:null,
	ASSIGNED_LEAD_NUM: null,
	ERROR_MSG_MAX_ASSIGN: null,
	accountId: null,
	currentReportID: null,
	analyticsContext: null
};
var contactData = {};
var ieFlag = window.ActiveXObject || "ActiveXObject" in window;
var workspaceType = "";

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
		globalContext.getExtensionContext('FillInbox').then(function(extensionContext) {
			extensionContext.getProperties(['hostURL','reportId','buttonTitle','ASSIGNED_LEAD_NUM','ERROR_MSG_MAX_ASSIGN']).then(function(collection) {
				constants.buttonTitle = collection.get('buttonTitle').value;
				constants.hostURL = (window.location.protocol+"//"+window.location.hostname)+(collection.get('hostURL').value);
				constants.ASSIGNED_LEAD_NUM = collection.get('ASSIGNED_LEAD_NUM').value;
				constants.report_ids = collection.get('reportId').value;
				constants.ERROR_MSG_MAX_ASSIGN = collection.get('ERROR_MSG_MAX_ASSIGN').value;
				
				registerCommand(constants.report_ids.split(","), constants._extensionProvider);
			});
		});
	});
});

function registerCommand(reportIds, extProvider){
	for (let i = 0; i < reportIds.length; i++) {
		extProvider.registerAnalyticsExtension(function(IAnalyticsContext)
		{
			constants.analyticsContext = IAnalyticsContext;
			var sampleCommandIcon = IAnalyticsContext.createIcon();
			sampleCommandIcon.setIconClass('fa-refresh');
			sampleCommandIcon.setIconColor('green');
			var sampleCommand = IAnalyticsContext.createRecordCommandContext('Fill Inbox1');
			sampleCommand.setLabel(constants.buttonTitle);
			sampleCommand.setTooltip(constants.buttonTitle);
			sampleCommand.setRecordId(reportIds[i]);
			sampleCommand.setIcon(sampleCommandIcon);
			sampleCommand.showAsLink(false);
			sampleCommand.addInjectionValidatorCallback(function(data)
			{
				constants.currentReportID = data.getReportId();
				return true;
			});
			sampleCommand.addValidatorCallback(function(rows)
			{
				return true;
			});
			sampleCommand.addExecutorCallback(function(rows)
			{
				var formData = {method:"FillInbox"};
				formData["session_id"] = constants.sesToken;
				formData["ASSIGNED_LEAD_NUM"] = constants.ASSIGNED_LEAD_NUM;
				formData["account_id"] = constants.accountId;
				//constants.currentReportID = rows[0].records[0].parent.parent.reportId;
					
				$.ajax({
					url : constants.hostURL,
					type: "POST",
					data : formData,
					success: function(data, textStatus, jqXHR)
					{
						console.log(data);
						if(IsJsonString(data)){
							var resData = JSON.parse(data);
							if(resData["is_success"] == "1"){
								constants.analyticsContext.createReport(constants.currentReportID).then(function(IExtensionReport){
									IExtensionReport.executeReport();
								}, function(error){
									//Custom error handling goes here.
								});
							} else {
								if(resData["max_assignment"] == "1"){
									alert(constants.ERROR_MSG_MAX_ASSIGN);
								}
								if(resData["error"]){
									alert(resData["error"]);
								}
							}
						}
					},
					error: function (jqXHR, textStatus, errorThrown)
					{
						console.log(errorThrown);
					}
				});
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