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
	QUEUES_ASSIGNMENT_BUTTON_LABEL:"",
	QUEUES_DEASSIGNMENT_BUTTON_LABEL:"",
	ERROR_MSG_ASS_NO_ACCOUNT:"",
	ERROR_MSG_ASS_NO_QUEUES:"",
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
var lastAgentID = null;
var lastQueueID = null;
var ieFlag = window.ActiveXObject || "ActiveXObject" in window;

function initialize(screen) {
    if (screen == "dialog") {
        loadDialog();
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
		renderContent();
		$('#queue-tab').text(constants.QUEUES_LABEL);
		$('#lblQueue').text(constants.QUEUES_LABEL);
		$('#queueTitle').text(constants.QUEUES_LABEL);
		$('#queueCountTitle').text(constants.AMOUNT_OF_RELATED_AGENTS);
		$('#queueListTitle').text(constants.QUEUES_LABEL);
		$('#agent-tab').text(constants.AGENTS_LABEL);
		$('#agentListTitle').text(constants.AGENTS_LABEL);
		$('#lblAgent').text(constants.AGENTS_LABEL);
		$('#agentTitle').text(constants.AGENTS_LABEL);
		$('#agentCountTitle').text(constants.AMOUNT_OF_QUEUES);

		$('#assign-agents').text(constants.AGENT_ASSIGNMENT_BUTTON_LABEL);
		$('#deassign-agents').text(constants.AGENTS_DEASSIGNMENT_BUTTON_LABEL);
		
		$('#assign-queues').text(constants.QUEUES_ASSIGNMENT_BUTTON_LABEL);
		$('#deassign-queues').text(constants.QUEUES_DEASSIGNMENT_BUTTON_LABEL);
		$('#deassign-queues').text(constants.QUEUES_DEASSIGNMENT_BUTTON_LABEL);
		$('#modal-cancel').text(constants.CANCEL);
		
		getQueue();
		$('div.overlay').removeClass('show');
		$('div.spanner').removeClass('show');
    }
}

function getQueue(){
	$('#inputQueue').blur(function()
	{
		if(!$(this).val()) {
			resetQueueRadiobox();
			hidebtnsAndAgentList();
		}
	});
	$("#inputQueue").autocomplete({
		minLength: 0,
		source: [],
		focus: function( event, ui ) {
			if(ui.item != null){
				console.log(ui.item);
				$("#inputQueue").val(ui.item.label);
			} else {
				$("#inputQueue").val("");
				resetQueueRadiobox();
				hidebtnsAndAgentList();
			}
			return false;
		},
		select: function (event, ui) {
			if(ui.item != null){
				console.log(ui.item);
				$("#inputQueue").val(ui.item.label);
				hideOtherRadiobox(ui.item.value);				
				$('div.overlay').addClass('show');
				$('div.spanner').addClass('show');
				getAssignedAgent(ui.item.value);
			} else {
				$("#inputQueue").val("");
				resetQueueRadiobox();
				hidebtnsAndAgentList();
			}
			return false;
		},
		change: function( event, ui ) {
			if(ui.item != null){
				console.log(ui.item);
				$("#inputQueue").val(ui.item.label);
				hideOtherRadiobox(ui.item.value);
			} else {
				$("#inputQueue").val("");
				resetQueueRadiobox();
				hidebtnsAndAgentList();
			}
		}
	}).focus(function () {
		$(this).autocomplete("search");
	});
	
	// $('#inputFilter').keyup(function() {
		// if(){
			// companyList.autocomplete('option','change')
		// }
	// });
	
	$("#inputFilter").autocomplete({
		minLength: 0,
		source: [],
		focus: function( event, ui ) {
			if(ui.item != null){
				console.log(ui.item);
				$("#inputFilter").val(ui.item.label);
			} else {
				$("#inputFilter").val("");
				resetPopupItems();
			}
			return false;
		},
		select: function (event, ui) {
			if(ui.item != null){
				console.log(ui.item);
				$("#inputFilter").val(ui.item.label);
				hidePopupItems(ui.item.value);
				return false;
			} else {
				$("#inputFilter").val("");
				resetPopupItems();
			}
		},
		change: function( event, ui ) {
			if(ui.item != null){
				console.log(ui.item);
				hidePopupItems(ui.item.value);
				$("#inputFilter").val("");
			} else {
				$("#inputFilter").val("");
				resetPopupItems();
			}
		}
	}).focus(function () {
		$(this).autocomplete("search");
	});
	
	$(document).on('click', '#assign-agents', function() {
		$('#current-mode').val('agents');
		showSelectionList();
	});
	
	$(document).on('click', '#deassign-agents', function() {
		if($('input.current-assigned-agent:checked').length == 0){
			alert(constants.ERROR_MSG_DEASS_NO_ACCOUNT);
			return false;
		}
		$('div.overlay').addClass('show');
		$('div.spanner').addClass('show');
		
		var relationIds = "";
		$('input.current-assigned-agent:checked').each(function(){
			relationIds += ($(this).data('relation-id'))+",";
		});
		if(relationIds!=""){
			relationIds = relationIds.substring(0,relationIds.length - 1);
		}
		var agentData = {method:"DeassignAgentsFromQueue"};
		agentData["session_id"] = constants.sesToken;
		agentData["relationIds"] = relationIds;
		
		$.ajax({
			url : constants.hostURL,
			type: "POST",
			data : agentData,
			success: function(data, textStatus, jqXHR)
			{
				console.log(data);
				if(IsJsonString(data)){
					var resData = JSON.parse(data);
					if(resData["result"] == "success"){
						$('#element-list').modal('hide');
						getAssignedAgent($('input.queue-ins:checked').data('queue-id'));
						lastQueueID = $('input.queue-ins:checked').data('queue-id');
						getQueueAndAgentData();
					} else {
						alert(constants.errorMsg);
						$('div.overlay').removeClass('show');
						$('div.spanner').removeClass('show');
					}
				}
			},
			error: function (jqXHR, textStatus, errorThrown)
			{
				console.log(errorThrown);
				showError(errorThrown);
				$('div.overlay').removeClass('show');
				$('div.spanner').removeClass('show');
			}
		});
		
	});
	
	$(document).on('click', '#assign-queues', function() {
		$('#current-mode').val('queues');
		showSelectionList();
	});
	
	$(document).on('click', '#deassign-queues', function() {
		if($('input.current-assigned-queue:checked').length == 0){
			alert(constants.ERROR_MSG_DEASS_NO_QEUES);
			return false;
		}
		$('div.overlay').addClass('show');
		$('div.spanner').addClass('show');
		
		var relationIds = "";
		$('input.current-assigned-queue:checked').each(function(){
			relationIds += ($(this).data('relation-id'))+",";
		});
		if(relationIds!=""){
			relationIds = relationIds.substring(0,relationIds.length - 1);
		}
		var queueData = {method:"DeassignQueuesFromAgent"};
		queueData["session_id"] = constants.sesToken;
		queueData["relationIds"] = relationIds;
		
		$.ajax({
			url : constants.hostURL,
			type: "POST",
			data : queueData,
			success: function(data, textStatus, jqXHR)
			{
				console.log(data);
				if(IsJsonString(data)){
					var resData = JSON.parse(data);
					if(resData["result"] == "success"){
						$('#element-list').modal('hide');
						getAssignedQueues($('input.agent-ins:checked').data('agent-id'));
						lastAgentID = $('input.agent-ins:checked').data('agent-id');
						getQueueAndAgentData();
					} else {
						$('div.overlay').removeClass('show');
						$('div.spanner').removeClass('show');
						alert(constants.errorMsg);
					}
				}
				//$('div.overlay').removeClass('show');
				//$('div.spanner').removeClass('show');
			},
			error: function (jqXHR, textStatus, errorThrown)
			{
				console.log(errorThrown);
				showError(errorThrown);
				$('div.overlay').removeClass('show');
				$('div.spanner').removeClass('show');
			}
		});
	});
	
	$(document).on('change', 'input.queue-ins', function() {
		$('div.overlay').addClass('show');
		$('div.spanner').addClass('show');
		getAssignedAgent($(this).data('queue-id'));
	});
	
	$(document).on('click', '#submit-request', function() {
		if($('#current-mode').val() == "agents"){
			assignAgentsToQueue();
		}
		if($('#current-mode').val() == "queues"){
			assignQueuesToAgent();
		}
	});
	
	$('#inputAgent').blur(function()
	{
		if(!$(this).val()) {
			resetAgentRadiobox();
			hidebtnsAndQueueList();
		}
	});

	$("#inputAgent").autocomplete({
		minLength: 0,
		source: [],
		focus: function( event, ui ) {
			if(ui.item != null){
				console.log(ui.item);
				$("#inputAgent").val(ui.item.label);
			} else {
				$("#inputAgent").val("");
				resetAgentRadiobox();
				hidebtnsAndQueueList();
			}
			return false;
		},
		select: function (event, ui) {
			if(ui.item != null){
				console.log(ui.item);
				$("#inputAgent").val(ui.item.label);
				hideAgentRadiobox(ui.item.value);
				$('div.overlay').addClass('show');
				$('div.spanner').addClass('show');
				getAssignedQueues(ui.item.value);
			} else {
				$("#inputAgent").val("");
				resetAgentRadiobox();
				hidebtnsAndQueueList();
			}
			return false;
		},
		change: function( event, ui ) {
			if(ui.item != null){
				console.log(ui.item);
				$("#inputAgent").val(ui.item.label);
				hideAgentRadiobox(ui.item.value);
			} else {
				$("#inputAgent").val("");
				resetAgentRadiobox();
				hidebtnsAndQueueList();
			}
		}
	}).focus(function () {
		$(this).autocomplete("search");
	});
	
	$(document).on('change', 'input.agent-ins', function() {
		$('div.overlay').addClass('show');
		$('div.spanner').addClass('show');
		getAssignedQueues($(this).data('agent-id'));
	});

	getQueueAndAgentData();
}


//Following method will bring and update the queue and agent list.

function getQueueAndAgentData(){
	var queueData = {method:"GetQueuesAndAgents"};
	queueData["session_id"] = constants.sesToken;
	queueData["account_id"] = constants.accountId;
	queueData["profile_queue_report_id"] = constants.queueReportId;
	queueData["reportingAgentReportId"] = constants.reportingAgentReportId;
	
	$.ajax({
		url : constants.hostURL,
		type: "POST",
		data : queueData,
		success: function(data, textStatus, jqXHR)
		{
			console.log(data);
			if(IsJsonString(data)){
				var resData = JSON.parse(data);
				if(resData.queues != undefined && resData.queues.length > 0){
					var queueList = [];
					$('#queue-radio-list').html("");
					for (let i = 0; i < resData.queues.length; i++) {
						queueList.push({value: resData.queues[i].queue_id,label: resData.queues[i].queue_name,count:resData.queues[i].account_count});
						var checked = "";
						if(lastQueueID != null && lastQueueID == resData.queues[i].queue_id){
							checked = " checked ";
							lastQueueID = null;
						}
						$('#queue-radio-list').append('<div class="form-check"><input name="current-queue" data-queue-id="'+resData.queues[i].queue_id+'" class="form-check-input queue-ins" type="radio" '+checked+' /><div class="row"><label class="form-check-label col-md-4" >'+resData.queues[i].queue_name+'</label><label class="form-check-label col-md-7" >'+resData.queues[i].account_count+'</label></div></div>');
					}
					$("#inputQueue").autocomplete('option', 'source', queueList);
					constants.currentQueueList = queueList;
				}
				
				if(resData.agents != undefined && resData.agents.length > 0){
					var agentList = [];
					$('#agent-radio-list').html("");
					for (let i = 0; i < resData.agents.length; i++) {
						agentList.push({value: resData.agents[i].account_id,label: resData.agents[i].account_name,count:resData.agents[i].queue_count});
						var checked = "";
						if(lastAgentID != null && lastAgentID == resData.agents[i].account_id){
							checked = " checked ";
							lastAgentID = null;
						}
						$('#agent-radio-list').append('<div class="form-check"><input name="current-agent" data-agent-id="'+resData.agents[i].account_id+'" class="form-check-input agent-ins" type="radio" '+checked+' ><div class="row"><label class="form-check-label col-md-4" >'+resData.agents[i].account_name+'</label><label class="form-check-label col-md-7" >'+resData.agents[i].queue_count+'</label></div></div>');
					}
					$("#inputAgent").autocomplete('option', 'source', agentList);
					constants.currentAgentList = agentList;
				}
				console.log(resData);
			}
			//$('div.overlay').removeClass('show');
			//$('div.spanner').removeClass('show');
		},
		error: function (jqXHR, textStatus, errorThrown)
		{
			console.log(errorThrown);
			showError(errorThrown);
			$('div.overlay').removeClass('show');
			$('div.spanner').removeClass('show');
		}
	});
}

//Following method will populate selection list and show the modal popup.
function showSelectionList(){
	$('#list-body').html("");
	$('#list-title').text("");
	var itemTodisplay = [];
	if($('#current-mode').val() == "agents"){
		var currentAgents = [];
		$('input.current-assigned-agent').each(function( index ) {
			currentAgents.push($(this).val().trim());
		});
		var remainingCount = 0;
		for (let i = 0; i < constants.currentAgentList.length; ++i) {
			var currentAgentIns = constants.currentAgentList[i];
			if($.inArray(currentAgentIns.label, currentAgents) === -1){
				$('#list-body').append('<div class="form-check"><input class="form-check-input agent-to-be-assigned" type="checkbox" data-agent-name="'+currentAgentIns.label+'" data-agent-id="'+currentAgentIns.value+'" ><label class="form-check-label" >'+currentAgentIns.label+'</label></div>');
				itemTodisplay.push({value: currentAgentIns.value,label: currentAgentIns.label});
				++remainingCount;
			}
		}
		if(remainingCount == 0){
			$('#list-body').html(constants.NO_AGENT_TO_ASSIGN);
		}
		$('#list-title').text(constants.AGENTS_LABEL);
		$('#submit-request').text(constants.ADD_AGENTS);
	}
	if($('#current-mode').val() == "queues"){
		var currentQueues = [];
		$('input.current-assigned-queue').each(function( index ) {
			currentQueues.push($(this).val().trim());
		});
		var remainingCount = 0;
		for (let i = 0; i < constants.currentQueueList.length; ++i) {
			var currentQueueIns = constants.currentQueueList[i];
			if($.inArray(currentQueueIns.label, currentQueues) === -1){
				$('#list-body').append('<div class="form-check"><input class="form-check-input queue-to-be-assigned" type="checkbox" data-queue-name="'+currentQueueIns.label+'" data-queue-id="'+currentQueueIns.value+'" ><label class="form-check-label" >'+currentQueueIns.label+'</label></div>');
				itemTodisplay.push({value: currentQueueIns.value,label: currentQueueIns.label});
				++remainingCount;
			}
		}
		if(remainingCount == 0){
			$('#list-body').html(constants.NO_QUEUE_TO_ASSIGN);
		}
		$('#list-title').text(constants.QUEUES_LABEL);
		$('#submit-request').text(constants.ADD_QUEUES);
	}
	$('#element-list').modal('show');
	
	$("#inputFilter").autocomplete('option', 'source', itemTodisplay);
	$("#inputFilter").autocomplete("option", "appendTo", ".modal-body");
}

//Following function will assign selected queue to the agents.
function assignAgentsToQueue(){
	if($('input.agent-to-be-assigned:checked').length == 0){
		alert(constants.ERROR_MSG_ASS_NO_ACCOUNT);
		return false;
	}
	var selectedQueueId = $('input.queue-ins:checked').data('queue-id');
	var selectedAgents = "";
	$('input.agent-to-be-assigned:checked').each(function(){
		selectedAgents += ($(this).data('agent-id'))+",";
	});
	if(selectedAgents!=""){
		selectedAgents = selectedAgents.substring(0,selectedAgents.length - 1);
	}
	var agentData = {method:"AssignAgentsToQueue"};
	agentData["session_id"] = constants.sesToken;
	agentData["queue_id"] = selectedQueueId;
	agentData["selected_agent_ids"] = selectedAgents;
	
	$('div.overlay').addClass('show');
	$('div.spanner').addClass('show');
	$.ajax({
		url : constants.hostURL,
		type: "POST",
		data : agentData,
		success: function(data, textStatus, jqXHR)
		{
			console.log(data);
			if(IsJsonString(data)){
				var resData = JSON.parse(data);
				if(resData["result"] == "success"){
					$('#element-list').modal('hide');
					lastQueueID = $('input.queue-ins:checked').data('queue-id');
					getQueueAndAgentData();
					getAssignedAgent($('input.queue-ins:checked').data('queue-id'));
					
				} else {
					alert(constants.errorMsg);
					$('div.overlay').removeClass('show');
					$('div.spanner').removeClass('show');
				}
			}
			//$('div.overlay').removeClass('show');
			//$('div.spanner').removeClass('show');
		},
		error: function (jqXHR, textStatus, errorThrown)
		{
			console.log(errorThrown);
			showError(errorThrown);
			$('div.overlay').removeClass('show');
			$('div.spanner').removeClass('show');
		}
	});
}

//Following function will assign selected agent to the queues.
function assignQueuesToAgent(){
	if($('input.queue-to-be-assigned:checked').length == 0){
		alert(constants.ERROR_MSG_ASS_NO_QUEUES);
		return false;
	}
	var selectedAgentId = $('input.agent-ins:checked').data('agent-id');
	var selectedQueues = "";
	$('input.queue-to-be-assigned:checked').each(function(){
		selectedQueues += ($(this).data('queue-id'))+",";
	});
	if(selectedQueues!=""){
		selectedQueues = selectedQueues.substring(0,selectedQueues.length - 1);
	}
	var queueData = {method:"AssignQueuesToAgent"};
	queueData["session_id"] = constants.sesToken;
	queueData["agent_id"] = selectedAgentId;
	queueData["selected_queue_ids"] = selectedQueues;
	
	$('div.overlay').addClass('show');
	$('div.spanner').addClass('show');
	$.ajax({
		url : constants.hostURL,
		type: "POST",
		data : queueData,
		success: function(data, textStatus, jqXHR)
		{
			console.log(data);
			if(IsJsonString(data)){
				var resData = JSON.parse(data);
				if(resData["result"] == "success"){
					$('#element-list').modal('hide');
					lastAgentID = $('input.agent-ins:checked').data('agent-id');
					getQueueAndAgentData();
					getAssignedQueues($('input.agent-ins:checked').data('agent-id'));
				} else {
					$('div.overlay').removeClass('show');
					$('div.spanner').removeClass('show');
					alert(constants.errorMsg);
				}
			}
			//$('div.overlay').removeClass('show');
			//$('div.spanner').removeClass('show');
		},
		error: function (jqXHR, textStatus, errorThrown)
		{
			console.log(errorThrown);
			showError(errorThrown);
			$('div.overlay').removeClass('show');
			$('div.spanner').removeClass('show');
		}
	});
}

function renderContent(){
	//$("#tabs").tabs();
	$('#myTab a').on('click', function (e) {
	  e.preventDefault()
	  $(this).tab('show');
	});
}

function getAssignedAgent(queueId){
	var queueData = {method:"GetAssignedAgents"};
	queueData["session_id"] = constants.sesToken;
	queueData["assignedAgentReportId"] = constants.assignedAgentReportId;
	queueData["queue_id"] = queueId;
	
	$('#assignedAgents').html("");
	$('#agentAssignmentBtn').hide();
	$('#assignedAgentParent').hide();
	$.ajax({
		url : constants.hostURL,
		type: "POST",
		data : queueData,
		success: function(data, textStatus, jqXHR)
		{
			console.log(data);
			if(IsJsonString(data)){
				var resData = JSON.parse(data);
				$('#assignedAgentParent').show();
				$('#agentAssignmentBtn').show();
				if(resData.agents != undefined && resData.agents.length > 0){
					var queueList = [];
					for (let i = 0; i < resData.agents.length; i++) {
						$('#assignedAgents').append('<div class="form-check"><input class="form-check-input current-assigned-agent" type="checkbox" value="'+resData.agents[i].agent_name+'" data-relation-id="'+resData.agents[i].relation_id+'"><label class="form-check-label" >'+resData.agents[i].agent_name+'</label></div>');
					}
				} else {
					$('#assignedAgents').html(constants.noagentFound);
				}
				console.log(resData);
			}
			$('div.overlay').removeClass('show');
			$('div.spanner').removeClass('show');
		},
		error: function (jqXHR, textStatus, errorThrown)
		{
			console.log(errorThrown);
			showError(errorThrown);
			$('div.overlay').removeClass('show');
			$('div.spanner').removeClass('show');
		}
	});
}

//Following function will get all the assigned queues to an agent.
function getAssignedQueues(selectedAccountId){
	var queueData = {method:"GetAssignedQueues"};
	queueData["session_id"] = constants.sesToken;
	queueData["AgentQueueReportId"] = constants.AgentQueueReportId;
	queueData["account_id"] = selectedAccountId;
	
	$('#assignedQueues').html("");
	$('#queueAssignmentBtn').hide();
	$('#assignedQueueParent').hide();
	$.ajax({
		url : constants.hostURL,
		type: "POST",
		data : queueData,
		success: function(data, textStatus, jqXHR)
		{
			console.log(data);
			if(IsJsonString(data)){
				var resData = JSON.parse(data);
				$('#assignedQueueParent').show();
				$('#queueAssignmentBtn').show();
				if(resData.queues != undefined && resData.queues.length > 0){
					var queueList = [];
					for (let i = 0; i < resData.queues.length; i++) {
						$('#assignedQueues').append('<div class="form-check"><input class="form-check-input current-assigned-queue" type="checkbox" value="'+resData.queues[i].queue_name+'" data-relation-id="'+resData.queues[i].relation_id+'"><label class="form-check-label" >'+resData.queues[i].queue_name+'</label></div>');
					}
				} else {
					$('#assignedQueues').html(constants.noqueueFound);
				}
				console.log(resData);
			}
			$('div.overlay').removeClass('show');
			$('div.spanner').removeClass('show');
		},
		error: function (jqXHR, textStatus, errorThrown)
		{
			console.log(errorThrown);
			showError(errorThrown);
			$('div.overlay').removeClass('show');
			$('div.spanner').removeClass('show');
		}
	});
}

//Following method will check whether a key exist in Array or not.
function inArray(needle, haystack) {
    var length = haystack.length;
    for (var i = 0; i < length; i++) {
        if (isNaN(haystack[i])) {
            if (haystack[i].trim() == needle) return true;
        } else {
            if (haystack[i] == needle) return true;
        }
    }
    return false;
}

//Following function will empty the agent list for queue and hide the buttons.
function hidebtnsAndAgentList(){
	$('#assignedAgents').html("");
	$('#agentAssignmentBtn').hide();
	$('#assignedAgentParent').hide();
}

//Following function will empty the agent list for queue and hide the buttons.
function hidebtnsAndQueueList(){
	$('#assignedQueues').html("");
	$('#queueAssignmentBtn').hide();
	$('#assignedQueueParent').hide();
}

function showError(msg){
	$('#list-parent').css('display','none');
	$('#warning-msg').show();
	$('#warning-msg').html(msg);
	$('div.overlay').removeClass('show');
	$('div.spanner').removeClass('show');
}

//Following method will verify whether a string is json or not.
function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

//Following method will sort Array by given key.
// param: array - Object array
// param: key - key by which we suppose to order the object
function sort_by_key(array, key)
{
	return array.sort(function(a, b)
	{
		var x = a[key]; var y = b[key];
		return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	});
}

//Following funciton will hide other radio boxes which are not selected.
//param: filter string

function hideOtherRadiobox(filterString){
	$('#queue-radio-list input.form-check-input').each(function () {
		$(this).parent().removeClass('d-none');
	});
	$('#queue-radio-list input.form-check-input').each(function () {
		if($(this).data('queue-id') != filterString){
			$(this).parent().addClass('d-none');
		} else {
			$(this).prop('checked', true);
		}
	});
}

//Following function will reset all queue radioboxes.

function resetQueueRadiobox(){
	$('#queue-radio-list input.form-check-input').each(function () {
		$(this).parent().removeClass('d-none');
		$(this).prop('checked', false);
	});
}


//Following funciton will hide other radio boxes which are not selected.
//param: filter string

function hideAgentRadiobox(filterString){
	$('#agent-radio-list input.form-check-input').each(function () {
		$(this).parent().removeClass('d-none');
	});
	$('#agent-radio-list input.form-check-input').each(function () {
		if($(this).data('agent-id') != filterString){
			$(this).parent().addClass('d-none');
		} else {
			$(this).prop('checked', true);
		}
	});
}

//Following function will reset all agent radioboxes.
function resetAgentRadiobox(){
	$('#agent-radio-list input.form-check-input').each(function () {
		$(this).parent().removeClass('d-none');
		$(this).prop('checked', false);
	});
}

//Following funciton will hide other check boxes which are not selected.
//param: filter string

function hidePopupItems(filterString){
	// $('#list-body input.form-check-input').each(function () {
		// $(this).parent().removeClass('d-none');
	// });
	$('#list-body input.form-check-input').each(function () {
		//if($(this).data('agent-id') != filterString){
		if($(this).data(Object.keys($(this).data())[0]) != filterString){
			// if(!$(this).prop('checked')){
				// $(this).parent().addClass('d-none');
			// }
		} else {
			$(this).prop('checked', true);
		}
	});
}

//Following function will reset all agent check boxes.
function resetPopupItems(){
	$('#list-body input.form-check-input').each(function () {
		$(this).parent().removeClass('d-none');
	});
}