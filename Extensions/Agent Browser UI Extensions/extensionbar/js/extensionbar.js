var appName = "ExtensionBarGreetings";
var appVersion = "1.0";
var extensionBarURL = ".././view.html";

function createExtentionBar(){
    ORACLE_SERVICE_CLOUD.extension_loader.load(appName , appVersion).then(function(sdk) {
        sdk.getGlobalContext().then(function(globalContext) {
			globalContext.getExtensionContext('extensionbar').then(function(extensionContext) {
                extensionContext.getProperties(['Height']).then(function(collection) {
                    var hei = collection.get("Height").getValue() ? collection.get("Height").getValue() : 30;
                    sdk.registerUserInterfaceExtension(function(userInterfaceContext) {
                        userInterfaceContext.getExtensionBarContext().then(function(IExtensionBarContext) {
                            IExtensionBarContext.getExtensionBarItem("greetings").then(function(IExtensionBarItem) {
                                IExtensionBarItem.setContentUrl(extensionBarURL);
                                IExtensionBarItem.render();                                
                            });
                            IExtensionBarContext.setDefaultDockingPosition("Top");
                            IExtensionBarContext.setDockingPosition("Top");
                            IExtensionBarContext.dockingPosition = "Top";
                            IExtensionBarContext.setDockable(false);
                            IExtensionBarContext.setMaxHeight(hei);
                            IExtensionBarContext.render();
                        });
                    });
                }); 
            });
        });
    });   
}

createExtentionBar();

