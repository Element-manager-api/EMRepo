var appId="OpenInterview";
var apiVersion="1.0";
var constants = {
    sesToken: null,
    startURL: null,
	resumeURL: null,
	recordId: null,
	processName: null,
    _extensionProvider: null
};
	
ORACLE_SERVICE_CLOUD.extension_loader.load(appId, apiVersion).then(function (extensionProvider) {
	constants._extensionProvider = extensionProvider;
	extensionProvider.registerWorkspaceExtension(function(workspaceRecord){
		workspaceType = workspaceRecord.getWorkspaceRecordType();
		var fieldDetails;
		console.log("open interview");
		if(workspaceType == "Incident"){
			fieldDetails = ['Incident.i_id'];
		} else {
			return;
		}
		
			console.log("open interview inside a function");
		workspaceRecord.getFieldValues(fieldDetails).then(function(IFieldDetails){
			if(workspaceType == "Incident"){
				constants.recordId = IFieldDetails.getField('Incident.i_id').getLabel();
			}
			IFieldDetails.getParent().parent.getExtensionProvider().getGlobalContext().then(function(globalContext) {
				globalContext.getSessionToken().then(function(sessionToken)
				{
						constants.sesToken = sessionToken;
						globalContext.getExtensionContext('OpenInterview').then(function(extensionContext) {
						extensionContext.getProperties(['startURL','resumeURL','processName','hostURL']).then(function(collection) {
							constants.startURL = collection.get('startURL').value;
							constants.resumeURL = collection.get('resumeURL').value;
							constants.processName = collection.get('processName').value;
							constants.hostURL = collection.get('hostURL').value;
							
							var url = constants.hostURL;

							var xhr = new XMLHttpRequest();
							xhr.open("POST", url, true);

							xhr.setRequestHeader("Accept", "application/json");
							xhr.setRequestHeader("Content-Type", "application/json");

							xhr.onreadystatechange = function () {
							   if (xhr.readyState === 4) {
								  console.log(xhr.status);
								  console.log(xhr.responseText);
							   }};

							// var data = `{
							  // "Id": 78912,
							  // "Customer": "Jason Sweet",
							  // "Quantity": 1,
							  // "Price": 18.00
							// }`;
							
							var params = { method: 'GetInterviewStatus',session_id: constants.sesToken, policy_model:constants.processName,incident_id:constants.recordId };
							console.log(params);

							xhr.send(params);
						});
					});
				});
			});
		});
		
	});
});