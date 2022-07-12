let extensionProviderPromise = null;
const APPNAME = 'update_calendar_field';
/* eslint-disable-next-line no-unused-vars */
function closeModel() {
  getExtensionProvider().then(function(extensionProvider) {
    extensionProvider.registerUserInterfaceExtension(function(iUserInterfaceContext) {
      iUserInterfaceContext.getModalWindowContext().then(function(iModalWindowContext) {
        iModalWindowContext.getCurrentModalWindow().then(function(iModalWindow) {
          iModalWindow.close();
        });
      });
    });
  });
}

function getExtensionProvider() {
  if (!extensionProviderPromise) {
    extensionProviderPromise = ORACLE_SERVICE_CLOUD.extension_loader.load(APPNAME);
  }
  return extensionProviderPromise;
}