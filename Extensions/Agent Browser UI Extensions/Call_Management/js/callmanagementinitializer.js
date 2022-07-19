var myAppId = 'Call Management';  
ORACLE_SERVICE_CLOUD.extension_loader
  .load(myAppId, '1.0')
  .then(function (sdk) {
	 
    sdk.registerWorkspaceExtension(function (workspaceRecord) {
      var browserControlArray = workspaceRecord.getAllBrowserControls();
     
      // Perform some logic using browserControlArray.
    });

    sdk.registerUserInterfaceExtension(function (userInterfaceContext) {
      userInterfaceContext
        .getLeftSidePaneContext()
        .then(function (leftSidePaneContext) {
          //Use any unique identifier when creating the side pane.
          leftSidePaneContext
            .getSidePane('WCallManagementTab')
            .then(function (leftPanelMenu) {
              leftPanelMenu.setContentUrl('../wCallmanagementview.html');
              leftPanelMenu.setLabel('Call Management');
              leftPanelMenu.setVisible(false);
			  leftPanelMenu.setWidth(325);
              //Font awesome is not included by default, but you can use it as per this example
              var icon = leftPanelMenu.createIcon('font awesome');
              icon.setIconClass('fa-headphones');
			  icon.setIconColor("#259fed");
              leftPanelMenu.addIcon(icon);
              leftPanelMenu.render();
            });
        });
    });
  });
