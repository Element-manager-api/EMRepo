ORACLE_SERVICE_CLOUD.extension_loader.load("WS_Heading_Extension" , "1").then(function(extensionProvider){
	extensionProvider.registerWorkspaceExtension(function(workspaceRecord){
        var recordType = workspaceRecord.getWorkspaceRecordType();
        var recordID = workspaceRecord.getWorkspaceRecordId();
		if(recordType == "Incident" && recordID > 0){
			extensionProvider.getGlobalContext().then(function(globalContext) {
				globalContext.getExtensionContext('WS_Heading_Extension').then(function(extensionContext) {
					extensionContext.getProperties(['Translation_For_Incident','Translation_For_Task','Translation_For_Lead']).then(function(collection) {
						console.log(collection);
						workspaceRecord.getFieldValues(['Incident.C$ObjectType']).then(function(IFieldDetails){
							var objType = IFieldDetails.getField('Incident.C$ObjectType').getValue();
							var title = getObjectType(objType, collection);
							var tabs = parent.document.querySelectorAll('ul[role="tablist"] li[data-recordtype="' + recordType + '"][data-recordid="' + recordID + '"]');
							if(title && tabs && tabs.length > 0){
								for(var i=0;i<tabs.length;i++){
									var spanEles = tabs[i].querySelectorAll('span[class="tab-text"]');
									if(spanEles && spanEles.length > 0){
										for(var j=0;j<spanEles.length;j++){
											spanEles[j].innerHTML += " " + title;
										}
									}
								}
							}
						});
					});
				});
			});
		}
	});
});

function getObjectType(objType, collection){
	switch(objType){
		case 2: return collection.get('Translation_For_Incident').value;
		case 3: return collection.get('Translation_For_Task').value;
		case 1: return collection.get('Translation_For_Lead').value;
		default: return null;
	}
	/*for(var i=0;i<translations.length;i++){
		var translation = translations[i].trim();
		if(translation.split(":")[0].trim() == objType) return translation.split(":")[1].trim();
	}
	return null;*/
}