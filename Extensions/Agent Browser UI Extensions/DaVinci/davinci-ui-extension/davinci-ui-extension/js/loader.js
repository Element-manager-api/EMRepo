ORACLE_SERVICE_CLOUD.extension_loader
  .load('cti_extension_viru', '1.0')
  .then(function (sdk) {
    sdk.registerWorkspaceExtension(function (workspaceRecord) {
      var browserControlArray = workspaceRecord.getAllBrowserControls();
      for (const control in browserControlArray) {
        control.setUrl(
          'https://clalins--tst3.custhelp.com/AgentWeb/#/Contact/422'
        );
      }
      // Perform some logic using browserControlArray.
    });

    sdk.registerUserInterfaceExtension(function (userInterfaceContext) {
      userInterfaceContext
        .getLeftSidePaneContext()
        .then(function (leftSidePaneContext) {
          //Use any unique identifier when creating the side pane.
          leftSidePaneContext
            .getSidePane('AMC-Technology-DaVinci')
            .then(function (leftPanelMenu) {
              leftPanelMenu.setContentUrl('../index.html');
              leftPanelMenu.setLabel('DaVinci');
              leftPanelMenu.setVisible(true);
              //Font awesome is not included by default, but you can use it as per this example
              var icon = leftPanelMenu.createIcon('font awesome');
              icon.setIconClass('fa-phone-square');
              leftPanelMenu.addIcon(icon);
              leftPanelMenu.render();
            });
        });
    });
  });
