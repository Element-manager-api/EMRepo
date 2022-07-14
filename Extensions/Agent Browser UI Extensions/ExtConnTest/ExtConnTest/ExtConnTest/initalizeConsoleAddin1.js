/// <reference path = "../typings/globals/osvcExtension/index.d.ts"/>
var initalizeConsoleAddin = (function () {
    function initalizeConsoleAddin() {
    }
    initalizeConsoleAddin.prototype.initialize = function () {

        ORACLE_SERVICE_CLOUD.extension_loader.load("CUSTOM_APP_ID" , "1")
								.then(function(extensionProvider)
									{
									extensionProvider.registerUserInterfaceExtension(function(IUserInterfaceContext)
										{
											IUserInterfaceContext.getLeftSidePaneContext().then(function(sidePaneContext)
											{
											sidePaneContext.getSidePane('connections').then(function(sidePane)
												{
													sidePane.setContentUrl('./connection.html');
													sidePane.setWidth(600);
													sidePane.render();

												});
											});

										});

									});
 
    };
    return initalizeConsoleAddin;
}());
