var iconFont = "fa fa-users";
var createIcon = "font awesome";
var appName = "QueueAssignment";
var appVersion = "1.0";
var modalURL = ".././index.html";
var modalTitle = "Assign Queues to Acocunts";
var constants = {
    sesToken: null,
    hostURL: null,
    _extensionProvider: null,
	accountId: null,
	QUEUES_LABEL: "",
	AGENTS_LABEL: "",
	profileNotFound: "",
	errorMsg:"",
	queueReportId: "",
	assignedAgentReportId:"",
	noagentFound:"",
	reportingAgentReportId:"",
	AgentQueueReportId:"",
	noqueueFound:"",
	AGENTS_DEASSIGNMENT_BUTTON_LABEL:"",
	ERROR_MSG_DEASS_NO_ACCOUNT:"",
	AGENT_ASSIGNMENT_BUTTON_LABEL:"",
	ERROR_MSG_DEASS_NO_QEUES:"",
	QUEUES_DEASSIGNMENT_BUTTON_LABEL:"",
	ERROR_MSG_ASS_NO_ACCOUNT:"",
	ERROR_MSG_ASS_NO_QUEUES:"",
	QUEUES_ASSIGNMENT_BUTTON_LABEL:"",
	Menu_Title:"",
	ADD_QUEUES:"",
	ADD_AGENTS:"",
	NO_AGENT_TO_ASSIGN:"",
	NO_QUEUE_TO_ASSIGN:"",
	CANCEL:"",
	AMOUNT_OF_RELATED_AGENTS:"",
	AMOUNT_OF_QUEUES:"",
	_globalHeaderContext:null
};
var ieFlag = window.ActiveXObject || "ActiveXObject" in window;

function initialize(screen) {
    if (screen == "dialog") {
        loadDialog();
    } else {
        loadExtension();
    }
}

function loadDialog() {
	var parentFrameId = localStorage.getItem("queueassignment");
    if (parentFrameId) {
        if (ieFlag) {
            parentFrame = window.parent.frames[parentFrameId];
        } else {
            parentFrame = window.parent.frames[parentFrameId].contentWindow;
        }
        constants = parentFrame.constants;
        localStorage.removeItem("queueassignment");
		$('div.overlay').removeClass('show');
		$('div.spanner').removeClass('show');
    }
}

function loadExtension() {
	ORACLE_SERVICE_CLOUD.extension_loader.load(appName, appVersion).then(function(sdk){
		constants._extensionProvider = sdk;
		sdk.registerUserInterfaceExtension(function(IUserInterfaceContext){
			IUserInterfaceContext.getGlobalHeaderContext().then(function(IGlobalHeaderContext){
				constants._globalHeaderContext = IGlobalHeaderContext;
				constants._extensionProvider.getGlobalContext().then(function(globalContext) {
					constants.accountId = globalContext.getAccountId();
					globalContext.getSessionToken().then(function(sessionToken)
					{
							constants.sesToken = sessionToken;
							globalContext.getExtensionContext('QueueAssignment').then(function(extensionContext) {
								extensionContext.getProperties(['QUEUES_LABEL','hostURL','AGENTS_LABEL','profileNotFound','errorMsg','queueReportId','assignedAgentReportId','noagentFound','reportingAgentReportId','AgentQueueReportId','noqueueFound','ERROR_MSG_DEASS_NO_ACCOUNT','AGENTS_DEASSIGNMENT_BUTTON_LABEL','AGENT_ASSIGNMENT_BUTTON_LABEL','ERROR_MSG_ASS_NO_ACCOUNT','ERROR_MSG_DEASS_NO_QEUES','QUEUES_DEASSIGNMENT_BUTTON_LABEL','ERROR_MSG_ASS_NO_QUEUES','Menu_Title','QUEUES_ASSIGNMENT_BUTTON_LABEL','ADD_AGENTS','ADD_QUEUES','CANCEL','NO_QUEUE_TO_ASSIGN','NO_AGENT_TO_ASSIGN','AMOUNT_OF_RELATED_AGENTS','AMOUNT_OF_QUEUES']).then(function(collection) {
									constants.Menu_Title = collection.get('Menu_Title').value;
									constants.QUEUES_LABEL = collection.get('QUEUES_LABEL').value;
									constants.hostURL = (window.location.protocol+"//"+window.location.hostname)+(collection.get('hostURL').value);
									constants.AGENTS_LABEL = collection.get('AGENTS_LABEL').value;
									constants.profileNotFound = collection.get('profileNotFound').value;
									constants.errorMsg = collection.get('errorMsg').value;
									constants.queueReportId = collection.get('queueReportId').value;
									constants.assignedAgentReportId = collection.get('assignedAgentReportId').value;
									constants.noagentFound = collection.get('noagentFound').value;
									constants.reportingAgentReportId = collection.get('reportingAgentReportId').value;
									constants.AgentQueueReportId = collection.get('AgentQueueReportId').value;
									constants.noqueueFound = collection.get('noqueueFound').value;
									constants.AGENTS_DEASSIGNMENT_BUTTON_LABEL = collection.get('AGENTS_DEASSIGNMENT_BUTTON_LABEL').value;
									constants.ERROR_MSG_DEASS_NO_ACCOUNT = collection.get('ERROR_MSG_DEASS_NO_ACCOUNT').value;
									constants.AGENT_ASSIGNMENT_BUTTON_LABEL = collection.get('AGENT_ASSIGNMENT_BUTTON_LABEL').value;
									constants.ERROR_MSG_ASS_NO_ACCOUNT = collection.get('ERROR_MSG_ASS_NO_ACCOUNT').value;
									constants.ERROR_MSG_DEASS_NO_QEUES = collection.get('ERROR_MSG_DEASS_NO_QEUES').value;
									constants.QUEUES_ASSIGNMENT_BUTTON_LABEL = collection.get('QUEUES_ASSIGNMENT_BUTTON_LABEL').value;
									constants.QUEUES_DEASSIGNMENT_BUTTON_LABEL = collection.get('QUEUES_DEASSIGNMENT_BUTTON_LABEL').value;
									constants.ERROR_MSG_ASS_NO_QUEUES = collection.get('ERROR_MSG_ASS_NO_QUEUES').value;
									constants.ADD_AGENTS = collection.get('ADD_AGENTS').value;
									constants.ADD_QUEUES = collection.get('ADD_QUEUES').value;
									constants.CANCEL = collection.get('CANCEL').value;
									constants.NO_AGENT_TO_ASSIGN = collection.get('NO_AGENT_TO_ASSIGN').value;
									constants.NO_QUEUE_TO_ASSIGN = collection.get('NO_QUEUE_TO_ASSIGN').value;
									constants.AMOUNT_OF_RELATED_AGENTS = collection.get('AMOUNT_OF_RELATED_AGENTS').value;
									constants.AMOUNT_OF_QUEUES = collection.get('AMOUNT_OF_QUEUES').value;
									
									constants._globalHeaderContext.getMenu().then(function(IGlobalHeaderMenu){
										let IGlobalHeaderMenuItem = IGlobalHeaderMenu.createMenuItem();
										IGlobalHeaderMenuItem.setLabel(constants.Menu_Title);

										// Loading font awesome and setting up an icon.
										var icon = IGlobalHeaderMenu.createIcon(createIcon);
										icon.setIconClass(iconFont);
										IGlobalHeaderMenu.addIcon(icon);

										// Handling the action when agent clicks in the menu item.
										IGlobalHeaderMenuItem.setHandler(function(IGlobalHeaderMenuItem)
										{												
											renderDialog();							
										});
										IGlobalHeaderMenu.addMenuItem(IGlobalHeaderMenuItem);
										IGlobalHeaderMenu.render();
									});
								});
							});
					});
				});
			});
		});
	});	
}

function renderDialog(){
	ORACLE_SERVICE_CLOUD.extension_loader.load(appName , appVersion).then(function(extensionProvider)
	{
		extensionProvider.registerUserInterfaceExtension(function(IUserInterfaceContext){
			IUserInterfaceContext.getModalWindowContext().then(function(IModalWindowContext)
			{
				var modalWindow = IModalWindowContext.createModalWindow();
				modalWindow.setTitle(constants.Menu_Title);
				modalWindow.setContentUrl(modalURL);
				localStorage.setItem("queueassignment", this.window.frameElement.id);
				modalWindow.setWidth(Math.round(screen.width*0.8)+'px');
				modalWindow.setHeight(Math.round(screen.height*0.6)+'px');
				modalWindow.render();
			});
		});
	});
}

new initialize("");