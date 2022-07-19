var customAMCEventManager = {
  /**
   * This eventhandler is triggered each time an interaction event is received.
   *
   * A single interaction can raise multiple interaction events at any time. If
   * any action should only occur once per interaction, there must be logic which
   * prevents duplicate actions on interactions which have already been processed.
   *
   * An interaction is uniquely identified by its interactionId and scenarioId together.
   *
   * @param interaction Object which contains the following fields:
   *    messageType: <String> Should contain the string "Interaction"
   *    channelType: <String> Contains the channel through which interaction was received ("Telephony", "Email", etc.)
   *    state: <String> Contains the state of the interaction ("Alerting", "Connected", "OnHold", Etc.)
   *    details:
   *      fields: Contains a list of CAD for this interaction, indexable by the CAD key
   *    interactionId: <String> The interaction ID of the interaction
   *    scenarioId: <String> The scenario ID of the interaction
   *    direction: <String> Contains the direction of the interaction ("Inbound", "Outbound, "Internal")
   */
  sendContactDetailsInfo: function (interaction) {
    // TODO: Place custom code here
	console.log(interaction);
	
	current_agent_state = interaction.state;
	
	// Create an Interaction here EXT1 of interaction
	
	
	
	if(interaction.direction == 'Inbound' && interaction.state == 'Alerting'){
		// Call connected create the interaction.
		
					var interactionrec ={};
	
		var globalThis =this;



if(typeof interaction != 'undefined' && typeof interaction.details != 'undefined' && typeof interaction.details.fields != 'undefined' && typeof interaction.details.fields.Customerid != 'undefined'){
		var idint = interaction.details.fields.Customerid.Value;
		interactionrec["Contact_ID"] 		= idint;
		interactionrec["Contact_Identified"] 		= 1;
		
	}else if(typeof interaction != 'undefined' && typeof interaction.details != 'undefined' && typeof interaction.details.fields != 'undefined' && typeof interaction.details.fields.Phone != 'undefined'){
		var idint = interaction.details.fields.Phone.Value;
		interactionrec["Contact_ID"] 				= 0;
		interactionrec["Contact_Identified"] 		= 0;
	}
	
	
	var intName = "interaction_"+idint;




		
					
					var authed = (typeof interaction.details.fields.Auth !='undefined' && typeof interaction.details.fields.Auth.Value !='undefined')?interaction.details.fields.Auth.Value:0;
					
					
					interactionrec["authentic"] 		= authed;
					interactionrec["fieldsarray"]		= interaction.details.fields;
					//interactionrec["accountId"] 		= accountId;
					interactionrec["messageType"] 		= interaction.messageType;
					interactionrec["channelType"] 		= interaction.channelType;
					interactionrec["Numbercalled"] 	= interaction.details.fields.Phone.Value;
					interactionrec["state"] 		= interaction.state;
					interactionrec["interactionId"] 		= interaction.interactionId;
					interactionrec["direction"] 		= interaction.direction;
					
					var ajaxUrl = interfaceUrl + "/php/custom/interaction_middleware.php?psk=" + sessionToken + "&id_number=" + interactionrec["Contact_ID"] + "&accountId=" + accountId + "&apifunction=create_interaction_incoming_call";
					//console.log(ajaxUrl);
					//console.log(interactionrec);
					$.ajax({
					  type : "POST",
					  dataType: "json",
					  data: interactionrec,
					  url : ajaxUrl,
					  // Disable caching of AJAX responses
					  cache: false,
					  error: function (jqXHR, exception) {
						var msg = 'Error Accessing OSC Server - communication failed with status = ' + jqXHR.status 
						////console.log('Error Accessing OSC Server .\n' + jqXHR.responseText);
						alert(msg);
					  }
					}).done(
					  function(jsonData) {
						//results1 = jsonData;
						//jsonData = JSON.parse(jsonData);
						//console.log(jsonData.DATARET);
						////console.log(jsonData.ERROR);
						////console.log(jsonData.SUCCESS);
						// Check if its an error or successfully
						if(jsonData.ERROR !=''){
							alert(jsonData.ERROR);
							return Promise.resolve();
						}else if(jsonData.SUCCESS !=''){
							
						   interactionrec.interactionID 	= jsonData.DATARET.interactionID; // Interaction ID to be received from an AJAX Call. Relevant data to be sent to AJAX.
						   interactionrec.Contact_ID 	= jsonData.DATARET.Contact_ID; // Interaction ID to be received from an AJAX Call. Relevant data to be sent to AJAX.
						   
						   
						   sessionStorage.setItem(intName,JSON.stringify(interactionrec));
						   if(interaction.state == 'Alerting' && typeof interaction != 'undefined' && typeof interaction.details != 'undefined' && typeof interaction.details.fields != 'undefined' && typeof interaction.details.fields.Customerid != 'undefined' && typeof interaction.details.fields.Customerid.Value != 'undefined' && interaction.details.fields.Customerid.Value!=''){
								globalThis.identifyContact(interaction.details.fields.Customerid.Value);
	}
						   return Promise.resolve();
						}
						
						
						
						
					});
					
					
	}else if(interaction.direction == 'Inbound' && interaction.state == 'Disconnected'){
		// Interaction is disconnected and now End time need to be updated.
		
if(typeof interaction != 'undefined' && typeof interaction.details != 'undefined' && typeof interaction.details.fields != 'undefined' && typeof interaction.details.fields.Customerid != 'undefined'){
		var idint = interaction.details.fields.Customerid.Value;

		
	}else if(typeof interaction != 'undefined' && typeof interaction.details != 'undefined' && typeof interaction.details.fields != 'undefined' && typeof interaction.details.fields.Phone != 'undefined'){
		var idint = interaction.details.fields.Phone.Value;
	
	}
	
	
	var intName = "interaction_"+idint;
	
	//console.log(intName);
				var interact = sessionStorage.getItem(intName);
		//console.log(interact);		
				interact = JSON.parse(interact);
				var interactionIDtoEnd = interact.interactionID;
					
									
					var ajaxUrl = interfaceUrl + "/php/custom/interaction_middleware.php?psk=" + sessionToken + "&interaction=" + interactionIDtoEnd + "&accountId=" + accountId + "&apifunction=end_incoming_call";
					
						//console.log(ajaxUrl);
					$.ajax({
					  type : "POST",
					  dataType: "json",
					  data: interactionrec,
					  url : ajaxUrl,
					  // Disable caching of AJAX responses
					  cache: false,
					  error: function (jqXHR, exception) {
						var msg = 'Error Accessing OSC Server - communication failed with status = ' + jqXHR.status 
						////console.log('Error Accessing OSC Server .\n' + jqXHR.responseText);
						alert(msg);
					  }
					}).done(
					  function(jsonData) {
						//results1 = jsonData;
						//jsonData = JSON.parse(jsonData);
						////console.log(jsonData.DATARET);
						////console.log(jsonData.ERROR);
						////console.log(jsonData.SUCCESS);
						// Check if its an error or successfully
						if(jsonData.ERROR !=''){
							alert(jsonData.ERROR);
							return Promise.resolve();
						}else if(jsonData.SUCCESS !=''){
							
						   //interactionrec.interactionID 	= jsonData.DATARET.interactionID; // Interaction ID to be received from an AJAX Call. Relevant data to be sent to AJAX.
						  // interactionrec.Contact_ID 	= jsonData.DATARET.Contact_ID; // Interaction ID to be received from an AJAX Call. Relevant data to be sent to AJAX.
						   
						   
						   //sessionStorage.setItem(intName,JSON.stringify(interactionrec));
						   return Promise.resolve();
						}
						
						
						
						
					});
		
		
		
		
		
	}else if(interaction.direction == 'Outbound' && interaction.state == 'Connected'){
		
		
	//alert(id_Number_Outbound);
	var intName = "interaction_"+id_Number_Outbound;
	
	//if(interaction.direction == 'Outbound' && interaction.state == 'Connected'){
		// Call connected create the interaction.
	
					var interactionrec ={};
	
					
					
					var authed = 0;
					interactionrec["Contact_ID"] 		= id_Number_Outbound;
					interactionrec["incident_id_Outbound"] 		= incident_id_Outbound;
					
					interactionrec["authentic"] 		= authed;
					interactionrec["fieldsarray"]		= interaction.details.fields;
					//interactionrec["accountId"] 		= accountId;
					interactionrec["messageType"] 		= interaction.messageType;
					interactionrec["channelType"] 		= interaction.channelType;
					interactionrec["Numbercalled"] 	= interaction.details.fields.Phone.Value;
					interactionrec["state"] 		= interaction.state;
					interactionrec["interactionId"] 		= interaction.interactionId;
					interactionrec["direction"] 		= interaction.direction;
					
					var ajaxUrl = interfaceUrl + "/php/custom/interaction_middleware.php?psk=" + sessionToken + "&id_number=" + interactionrec["Contact_ID"] + "&accountId=" + accountId + "&apifunction=create_interaction_incoming_call";
					//console.log(ajaxUrl);
					//console.log(interactionrec);
					$.ajax({
					  type : "POST",
					  dataType: "json",
					  data: interactionrec,
					  url : ajaxUrl,
					  // Disable caching of AJAX responses
					  cache: false,
					  error: function (jqXHR, exception) {
						var msg = 'Error Accessing OSC Server - communication failed with status = ' + jqXHR.status 
						////console.log('Error Accessing OSC Server .\n' + jqXHR.responseText);
						alert(msg);
					  }
					}).done(
					  function(jsonData) {
						//results1 = jsonData;
						//jsonData = JSON.parse(jsonData);
						//console.log(jsonData.DATARET);
						////console.log(jsonData.ERROR);
						////console.log(jsonData.SUCCESS);
						// Check if its an error or successfully
						if(jsonData.ERROR !=''){
							alert(jsonData.ERROR);
							return Promise.resolve();
						}else if(jsonData.SUCCESS !=''){
							
						   interactionrec.interactionID 	= jsonData.DATARET.interactionID; // Interaction ID to be received from an AJAX Call. Relevant data to be sent to AJAX.
						   interactionrec.Contact_ID 	= jsonData.DATARET.Contact_ID; // Interaction ID to be received from an AJAX Call. Relevant data to be sent to AJAX.
						   
						   
						   sessionStorage.setItem(intName,JSON.stringify(interactionrec));
						   return Promise.resolve();
						}
						
						
						
						
					});
	//}
	
	
	}else if(interaction.state == 'Disconnected' && id_Number_Outbound > 0){
		// Interaction is disconnected and now End time need to be updated.
		
		var intName = "interaction_"+id_Number_Outbound;
	
	    //console.log(intName);
				var interact = sessionStorage.getItem(intName);
		//console.log(interact);		
				interact = JSON.parse(interact);
				var interactionIDtoEnd = interact.interactionID;
					
									
					var ajaxUrl = interfaceUrl + "/php/custom/interaction_middleware.php?psk=" + sessionToken + "&interaction=" + interactionIDtoEnd + "&accountId=" + accountId + "&apifunction=end_incoming_call";
					
						//console.log(ajaxUrl);
					$.ajax({
					  type : "POST",
					  dataType: "json",
					  data: interactionrec,
					  url : ajaxUrl,
					  // Disable caching of AJAX responses
					  cache: false,
					  error: function (jqXHR, exception) {
						var msg = 'Error Accessing OSC Server - communication failed with status = ' + jqXHR.status 
						////console.log('Error Accessing OSC Server .\n' + jqXHR.responseText);
						alert(msg);
					  }
					}).done(
					  function(jsonData) {
						//results1 = jsonData;
						//jsonData = JSON.parse(jsonData);
						////console.log(jsonData.DATARET);
						////console.log(jsonData.ERROR);
						//console.log(jsonData.SUCCESS);
						// Check if its an error or successfully
						if(jsonData.ERROR !=''){
							alert(jsonData.ERROR);
							return Promise.resolve();
						}else if(jsonData.SUCCESS !=''){
							
						   //interactionrec.interactionID 	= jsonData.DATARET.interactionID; // Interaction ID to be received from an AJAX Call. Relevant data to be sent to AJAX.
						  // interactionrec.Contact_ID 	= jsonData.DATARET.Contact_ID; // Interaction ID to be received from an AJAX Call. Relevant data to be sent to AJAX.
						   
						   
						   //sessionStorage.setItem(intName,JSON.stringify(interactionrec));
						   return Promise.resolve();
						}
						
						
						
						
					});
		
		
		
		
		
	}
					
					
					
					

	
	
	
	
	
	
	
	
  },

  /**
   * This function mainly exposes the 'Click To Dial' API to customization.js file. 
   * 
   * The business logic can be implemented here that will immediately allow 
   * 'Click To Dial' when any phone number is clicked in the CRM.
   * 
   * @param phoneNumber A number that needs to be passed as a parameter to this 
   * function to trigger an outbound call to the number when clicked in the CRM.
   * 
   * @param entity An array of objects which expects following fields
   * firstName?: string
   * lastName?: string
   * emails: string[]
   * phones:[{
   *          name: string,
   *          number: string
   *        }]
   
   
   if (customAMCEventManager) {
              customAMCEventManager.clickToDialHandler(data.message.contactDetails.messageToSend);
            }
   
   */
  clickToDialHandler: function (phoneNumber, entity = [], id_number=0, incident_id=0) {
if(current_agent_state != 'Alerting' && current_agent_state != 'Connected' && current_agent_state != 'OnHold'){	  
	  
	  
	  if(id_number > 0){
		id_Number_Outbound = id_number;
	  }
	  if(incident_id > 0){
		incident_id_Outbound = incident_id;
	  }
    const amcFrame = document.getElementById('amc-iframe');
      amcFrame.contentWindow.postMessage(
        {
          id: nextId++,
          type: 'clickToDial',
          from: 'OracleCX-for-Davinci',
          isReply: false,
          message: {
            phoneNumber,
            entity
          }
        },
        '*'
      ); 
}else{
	alert('שיחה בעיצומה.');
}
	  
  },
  
  
  identifyContact: function(id_Number=0){
	  
	  if(id_Number > 0){
	getContacts("contacts .CustomFields.CO.id_number = '" + id_Number+"'").then((contacts) => {
       //console.log(contacts);
	   
	   if(contacts.length == 1){
		   
		   var recFound = workspaceRecord.findAndFocus('Contact',contacts[0].id);
		   if(!recFound){
			  workspaceRecord.editWorkspaceRecord('Contact',contacts[0].id); 
		   }
			   
		   
	   }else{
		   	sdk.registerAnalyticsExtension(function(IAnalyticsContext)
		{
		IAnalyticsContext.createReport(101074).then(function(IExtensionReport)
			{
			var filterDetails = IExtensionReport.getReportFilters();
			filterDetails.setRowsPerPage(10);
			var filterList = filterDetails.getFilterList();
			var filterid = filterList[0];
			filterid.setValue(id_Number);
			//console.log(filterList);
			//console.log(IExtensionReport);
			
			
			IExtensionReport.executeReport();
			var rows = IExtensionReport.getReportData();
			//console.log(rows);
			
			},
			function(error)
				{
				// Custom error handling goes here.
				});
		});
	   }
	   
	   
	   
        });
	  }
	  
	  
	  /*
	  if(id_Number > 0){
	sdk.registerAnalyticsExtension(function(IAnalyticsContext)
		{
		IAnalyticsContext.createReport(100901).then(function(IExtensionReport)
			{
			var filterDetails = IExtensionReport.getReportFilters();
			filterDetails.setRowsPerPage(10);
			var filterList = filterDetails.getFilterList();
			var filterid = filterList[0];
			filterid.setValue(id_Number);
			//console.log(filterList);
			//console.log(IExtensionReport);
			
			
			IExtensionReport.executeReport();
			var rows = IExtensionReport.getReportData();
			//console.log(rows);
			
			},
			function(error)
				{
				// Custom error handling goes here.
				});
		});
	
	  }*/
  }
};
