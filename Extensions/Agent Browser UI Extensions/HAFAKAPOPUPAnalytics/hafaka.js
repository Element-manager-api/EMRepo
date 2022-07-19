var paneFrameId = null, paneFrame = null;
var ieFlag = window.ActiveXObject || "ActiveXObject" in window;
var appName = "HAFAKAPOPUPAnalytics";
var serverProperties = [
    "hostURL",
	"oicURL",
	"Lead_reportId",
	"InctAssetElm_reportId",
	"LeadAttribute_reportId",
	"lead_attribute_filters",
	"mendatory_param_message",
	"Status_for_view"
];
var assetelm_id;
var modalWindow;
var poilcy_number;
var constants, rightPane, _extensionProvider, gContext, sessionToken, restUrl, interfaceurl ,incID, incType = "", catID;
var extensionProvider_n;
ORACLE_SERVICE_CLOUD.extension_loader.load(appName)
.then(function(extensionProvider)
	{ extensionProvider_n = extensionProvider;
		
		extensionProvider.getGlobalContext().then(function (globalContext) {
           // clearLocalStorage();
            //globalContext.addLoggingOutEventListener(clearLocalStorage);
            gContext = globalContext;
            initializeConstants(globalContext).then(function () {
                
                gContext.getSessionToken().then(function (session) {
                    sessionToken = session;
					interfaceurl = globalContext.getInterfaceUrl();
        extensionProvider.registerAnalyticsExtension(function(IAnalyticsContext)
		{
			
		// Create an icon for AgentBrowser Command.
		let agentBrowserCommandIcon = IAnalyticsContext.createIcon();
		agentBrowserCommandIcon.setIconClass('fa-plug');
		agentBrowserCommandIcon.setIconColor('red');

		// Create and set properties of AgentBrowser Command.
		let agentBrowserCommand = IAnalyticsContext.createRecordCommandContext('Hafaka Popup');
		agentBrowserCommand.setLabel('Hafaka popup');
		agentBrowserCommand.setTooltip('click to open Hafaka popup');
		agentBrowserCommand.setIcon(agentBrowserCommandIcon);
		
		agentBrowserCommand.addExecutorCallback(agentBrowserCommandExeCallback);
		agentBrowserCommand.addValidatorCallback(agentBrowserCommandValidationCallback);

	

		// Register the commands.
		IAnalyticsContext.registerRecordCommand(agentBrowserCommand);
		
		});
					
                    
                });
            });
        });
		
		

	});

function agentBrowserCommandExeCallback(reportRows)
	{
	console.log('Called the exe function for AgentBrowser Command');
	//alert(this.window.frameElement.id);
localStorage.setItem("HAFAKAPOPUPAnalytics_main", this.window.frameElement.id);
	/*extensionProvider_n.registerUserInterfaceExtension(function(IUserInterfaceContext)
		{
		IUserInterfaceContext.getPopupWindowContext().then(function(IPopupWindowContext)
			{
			let IPopupWindow = IPopupWindowContext.createPopupWindow('myFirstPopupWindow');
			IPopupWindow.setContentUrl("popup.html");
			IPopupWindow.render();
			});
		});
	*/
	
				for (var row of reportRows)
				{
				//console.log('Row Id : ' + row.getRowId());
				//console.log('Column Details');
				for (var column of row.getCells())
					{ 
					let cloumnname = column.getName();
						if(cloumnname=='ID'){
							assetelm_id = column.getValue();
						
						}
						
						
						if(cloumnname=="מס' הצעה/פוליסה"){
							poilcy_number = column.getValue();
						
						}
						
						if(cloumnname=="מזהה ליד"){
							incID = column.getValue();
						
						}
						
						
					
					//console.log('Column Name: ' + column.getName());
					//console.log('Column Value: ' + column.getValue());
					}
				console.log('Associated records');
				for (var record of row.getRecords())
					{
					//console.log('Record Type: ' + record.getRecordType());
					//console.log('Record Id: ' + record.getRecordId());
					}
				}
	

	extensionProvider_n.registerUserInterfaceExtension(function(IUserInterfaceContext)
		{
		IUserInterfaceContext.getModalWindowContext().then(function(IModalWindowContext)
			{
			modalWindow = IModalWindowContext.createModalWindow();
			modalWindow.setTitle("Hafaka Popup");
			modalWindow.setContentUrl("popup.html");
			modalWindow.setHeight('400px');
			modalWindow.setWidth('600px');
			modalWindow.render();
			
			});
		});
	

	
	
	
	
	
	console.log(reportRows);
	return true;
	}

function agentBrowserCommandValidationCallback(reportRows)
	{
	//console.log('Called the validation function for AgentBrowser Command');
	//console.log(reportRows.length);
	var returnval = true;
					for (var row of reportRows)
				{
				//console.log('Row Id : ' + row.getRowId());
				//console.log('Column Details');
				for (var column of row.getCells())
					{ 
					let cloumnname = column.getName();
					
						
					   var poilcy_number_v = "";
						if(cloumnname=="מס' הצעה/פוליסה"){
							poilcy_number_v = column.getValue();
							if( !poilcy_number_v ){
									returnval = false;
								}
								
						}

						var is_active = "";
						if(cloumnname=="is_active"){
							is_active = column.getValue();
							if(is_active == 0 ){
								returnval = false;
							}
							if(!is_active){
								returnval = false;
							}
						}
						
						
					
					//console.log('Column Name: ' + column.getName());
					//console.log('Column Value: ' + column.getValue());
					}
				//console.log('Associated records');
				for (var record of row.getRecords())
					{
					//console.log('Record Type: ' + record.getRecordType());
					//console.log('Record Id: ' + record.getRecordId());
					}
				}
	
	//return reportRows[0].getRowId() % 2 === 0;
	return returnval;
	};

function initializeConstants(globalContext) {
    return new Promise(function (resolve, reject) {
        globalContext.getExtensionContext(appName).then(function (extensionContext) {
            extensionContext.getProperties(serverProperties).then(function (collection) {
				//var email_config =  collection.get('email_tab_title');
				//console.log(email_config);
                resolve(setConstants(collection));
            }).catch(function (err) {
                console.log("inside extensionContext catch");
                console.log(err);
                reject(err);
            });
        }).catch(function (err) {
            console.log("inside getExtensionContext catch");
            console.log(err);
            reject(err);
        });
    });
}

function setConstants(collection) {
	
	
    var propertiesJSON = collection.extensionProperiesMap;
    constants = {};
    for (var key in propertiesJSON) {
        constants[key] = propertiesJSON[key].getValue();
		
    }
    return constants;
}

function closemodelwindow() {
	
	alert('to close model');
}
