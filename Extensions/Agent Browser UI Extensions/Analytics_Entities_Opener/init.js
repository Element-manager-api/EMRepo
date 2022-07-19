var _extensionProvider, reportInfo;
var iconClass;
var properties = ['ICON_CLASS'];

function addTableHandler() {
	ORACLE_SERVICE_CLOUD.extension_loader.load("analyticsCommandsHandler", "1.0").then(function (extensionProvider) {
		_extensionProvider = extensionProvider;
		extensionProvider.getGlobalContext().then(function(globalContext) {
			globalContext.getExtensionContext('Analytics_Entities_Opener').then(function(extensionContext) {
				extensionContext.getProperties(properties).then(function(collection) {
					iconClass = collection.get('ICON_CLASS').getValue();
					var propertiesJSON = collection.extensionProperiesMap;
					//var reportCommandsArr = [];
					reportInfo = [];
					for (var key in propertiesJSON) {
						if(key.startsWith('COMMAND_')){
							if(propertiesJSON[key].getValue() != ""){
								reportInfo.push(JSON.parse(propertiesJSON[key].getValue()));
							}
						}
					}
					console.log("Analytics_Entities_Opener: ",reportInfo);
					if(reportInfo.length > 1) {
						extensionProvider.registerAnalyticsExtension(function (analyticsContext) {
							//console.log(reportInfo);
							for(var i=0;i<reportInfo.length;i++){
								var newCommandInfo = reportInfo[i];
								var commands = newCommandInfo.commands;
								if(commands && commands.length > 0){
									for(var j=0;j<commands.length;j++){
										var commandItem = commands[j];
										//console.log(commandItem);
										/**
										* Open Command
										*/
										var command = analyticsContext.createRecordCommandContext(commandItem.command);
										command.setLabel(commandItem.label);
										command.setTooltip(commandItem.tooltip);
										if(iconClass){
											var commandIcon = analyticsContext.createIcon();
											commandIcon.setIconClass(iconClass);
											command.setIcon(commandIcon);
										}
										
										command.setRecordId(newCommandInfo.reportID);
										command.showAsLink(true);
										command.showLinkAsIcon(false);
										
										// should the record command be enabled into the report or workspace?
										command.addInjectionValidatorCallback(function (reportInfo) {
											return true;
										});
										
										// should the record command be enabled for the specific row?
										command.addValidatorCallback(function (reportRow) {
											return validatorCallBack(reportRow);
										});
										
										// once invoked by user, action for executing the report command logic for the specific row
										command.addExecutorCallback(function (reportRow) {
											return executorCallBack(reportRow);
										});
										
										//console.log(command);
										analyticsContext.registerRecordCommand(command);
										command = null;
									}
								}
							}
						}); // registerAnalyticsExtension
					}
				}); // properties collection
			}); // extensionContext
		}); //globalContext
	}); // extension_loader
} // addTableHandler

function validatorCallBack(reportRow) {
	if(reportRow.length > 0) {
		var report = reportRow[0].parent.reportId;
		var command = reportRow[0].parent.commandName;
		var commandInfo = getCommandsInfo(report, command);
		if(commandInfo){
			var rowCells = reportRow[0].getCells();  // ExtensionReportCells array
			var reportCell = isNaN(commandInfo.reportCell) ? getReportCell(reportRow[0].cells, commandInfo.reportCell) : parseInt(commandInfo.reportCell);
			var cellValue = rowCells[reportCell].getValue();  // specific ExtensionReportCell @ idx=0
			// enable the record command for this row if this condition is true
			if (!isEmpty(cellValue)) {
				return true;
			}
		}
	}
	// otherwise, disable the record command for this row
	return false;
}

function executorCallBack(reportRow) {
	//console.log(reportRow);
	if(reportRow.length > 0) {
		var report = reportRow[0].parent.reportId;
		var command = reportRow[0].parent.commandName;
		var commandInfo = getCommandsInfo(report, command);
		if(commandInfo){
			var rowCells = reportRow[0].getCells();
			var reportCell = isNaN(commandInfo.reportCell) ? getReportCell(reportRow[0].cells, commandInfo.reportCell) : parseInt(commandInfo.reportCell);
			var cellValue = rowCells[reportCell].getValue();
			var id = parseInt(cellValue);
			_extensionProvider.registerWorkspaceExtension(function (workspaceRecord) {
				if(useSubTab(report)){
					var currentWorkspaceObj = workspaceRecord.getCurrentWorkspace();
					if(currentWorkspaceObj.objectType != "analytics"){
						workspaceRecord.getWorkGroupContext().then(function (workgroupContext) {
							var workspaceConfig = workgroupContext.createWorkspaceConfig();
							workspaceConfig.setRenderInUI(true);
							workspaceConfig.setUnfocused(false);
							workgroupContext.editWorkGroupEntity(commandInfo.editObject, id, workspaceConfig).then(function (newEntity) {
								// any logic to run after opening ws record
							});
						});
					}
					else{
						workspaceRecord.editWorkspaceRecord(commandInfo.editObject, id, function () {
							// any logic to run after opening ws record
						});
					}
				}
				else{
					workspaceRecord.editWorkspaceRecord(commandInfo.editObject, id, function () {
						// any logic to run after opening ws record
					});
				}
			});
			return true;
		}
	}
	return false;
}

function getCommandsInfo(report, command) {
	for(var i=0;i<reportInfo.length;i++){
		var item = reportInfo[i];
		if(item.reportID == report){
			for(var j=0;j<item.commands.length;j++){
				if(item.commands[j].command == command){
					return item.commands[j];
				}
			}
		}
	}
	return false;
}

function getReportCell(reportCells, cellName) {
	for(var i=0;i<reportCells.length;i++){
		var cell = reportCells[i];
		if(cell.name == cellName){
			return i;
		}
	}
	return 0;
}

function useSubTab(report) {
	for(var i=0;i<reportInfo.length;i++){
		var item = reportInfo[i];
		if(item.reportID == report){
			if(item.hasOwnProperty('useSubTab') && item.useSubTab) return true;
		}
	}
	return false;
}

function isEmpty(str) {
    return (!str || 0 === str.length || str === undefined);
}

function getCommandProps() {
	for(var i=1;i<=50;i++){
		properties.push('COMMAND_' + i);
	}
	addTableHandler();
}
// initialize
getCommandProps();