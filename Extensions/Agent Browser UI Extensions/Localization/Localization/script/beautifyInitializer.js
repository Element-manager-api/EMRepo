var beautifyInitializer = (function () {
    class beautifyInitializer {
        constructor() {
            this.addinId = 'BUI_JAJ_BEAUTIFY';
            this.addinVersion = '1.0';
            this.iconType = 'font awesome';
            this.iconClass = 'localization-ext fa fa-magic';
            this.menuItemLabel = 'Active Localization';
            this.configUrl = '../html/jajBeautify.html';
        }
        renderBeautifyIcon() {
            var _this = this;
            ORACLE_SERVICE_CLOUD.extension_loader.load(_this.addinId, _this.addinVersion).then(function (sdk) {
                sdk.registerUserInterfaceExtension(function (IUserInterfaceContext) {
                    IUserInterfaceContext.getGlobalHeaderContext().then(function (IGlobalHeaderContext) {
                        IGlobalHeaderContext.getMenu('').then(function (IGlobalHeaderMenu) {
                            let IGlobalHeaderMenuItem = IGlobalHeaderMenu.createMenuItem();
                            IGlobalHeaderMenuItem.setLabel(_this.menuItemLabel);
                            // Loading font awesome and setting up an icon.
                            var icon = IGlobalHeaderMenu.createIcon(_this.iconType);
                            icon.setIconClass(_this.iconClass);
                            IGlobalHeaderMenu.addIcon(icon);
                            // Handling the action when agent clicks in the menu item.
                            IGlobalHeaderMenuItem.setHandler(function (IGlobalHeaderMenuItem) {
                               alert('Localization_OK');
                            });
                            IGlobalHeaderMenu.addMenuItem(IGlobalHeaderMenuItem);
                            IGlobalHeaderMenu.render();
                        });
                    });
                });
            });
        }
    }
    return beautifyInitializer;
}());
new beautifyInitializer().renderBeautifyIcon();

//load JS File
//window.parent.ORACLE_SERVICE_CLOUD.scriptLoader.loadScript([document.URL.replace('beautifyInitializer','beautifyLoader')]);

//load CSS File
var head = window.parent.document.getElementsByTagName('head')[0];
var link = window.parent.document.createElement('link');
link.rel = 'stylesheet';
link.type = 'text/css';
link.href = document.URL.replace('script/beautifyInitializer.js?mainFile=true', 'styles/beautify.css?r=' + Math.random());
head.appendChild(link);
