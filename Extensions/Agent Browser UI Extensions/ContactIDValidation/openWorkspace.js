function openContact(id, closePopUp) {
    ORACLE_SERVICE_CLOUD.extension_loader.load('openContactWS', '1.0').then(function (extensionProvider) {
        if (closePopUp) {
            extensionProvider.registerUserInterfaceExtension(function (IUserInterfaceContext) {
                IUserInterfaceContext.getModalWindowContext().then(function (IModalWindowContext) {
                    IModalWindowContext.getCurrentModalWindow().then(function (IModalWindow) {
                        extensionProvider.registerWorkspaceExtension(function (workspaceRecord) {
                            workspaceRecord.editWorkspaceRecord('Contact', id);
                            IModalWindow.close();
                        });
                    });
                });
            });
        } else {
            extensionProvider.registerWorkspaceExtension(function (workspaceRecord) {
                workspaceRecord.editWorkspaceRecord('Contact', id);
            });
        }
    });
}

function openOrg(id, closePopUp) {
    ORACLE_SERVICE_CLOUD.extension_loader.load('openOrgWS', '1.0').then(function (extensionProvider) {
        if (closePopUp) {
            extensionProvider.registerUserInterfaceExtension(function (IUserInterfaceContext) {
                IUserInterfaceContext.getModalWindowContext().then(function (IModalWindowContext) {
                    IModalWindowContext.getCurrentModalWindow().then(function (IModalWindow) {
                        extensionProvider.registerWorkspaceExtension(function (workspaceRecord) {
                            workspaceRecord.editWorkspaceRecord('Org', id);
                            IModalWindow.close();
                        });
                    });
                });
            });
        }
        else {
            extensionProvider.registerWorkspaceExtension(function (workspaceRecord) {
                workspaceRecord.editWorkspaceRecord('Org', id);
            });
        }
    });
}