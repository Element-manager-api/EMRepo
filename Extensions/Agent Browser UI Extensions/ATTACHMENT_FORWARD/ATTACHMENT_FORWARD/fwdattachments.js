var appName = "ATTACHMENT_FORWARD";
var appVersion = "1.0"
var _extProvider;




var _extProvider, _globalContext, _wsRecord, session="", constants, iid=0,cid, accountId, mainFlow, myModalWin,interfaceurl='',id_number='', sr_type='', recordID, recordType, FwdRecords=[], myModalWindow;
var serverProps = [
    "Apply_RTL",
	"hostURL",
	"show_extn_button",
	"trigger_event",
	"forward_complete_event",
	"report_filter",
	"Lead_reportId",
	"SR_reportId",
	"Task_reportId",
	"button_caption",
	"modal_title"
]


const urlParams = new URLSearchParams(window.location.search);
const param_x = urlParams.get('param_x');
//console.log(param_x);



if(typeof param_x =='undefined' || param_x == null)mainFlow=true;
else mainFlow = false;

 

//if(mainFlow){
    ORACLE_SERVICE_CLOUD.extension_loader.load(appName, appVersion).then(function (extensionProvider) {
        _extProvider = extensionProvider;
		//console.log(_extProvider);



        _extProvider.getGlobalContext().then(function (globalContext) {
            _globalContext = globalContext;
			 accountId = _globalContext.getAccountId();
			  _globalContext.getSessionToken().then(
              function (sessionToken) {
                session = sessionToken;  
				////console.log(session);
                
            });
			
 
			interfaceurl = globalContext.getInterfaceUrl();
            initializeConstants(globalContext).then(function () {
                if (constants.Apply_RTL) document.dir = "rtl";
                _extProvider.registerWorkspaceExtension(function (workspaceRecord) {
					_wsRecord = workspaceRecord;
                    recordID = workspaceRecord.getWorkspaceRecordId();
                    recordType = workspaceRecord.getWorkspaceRecordType();
			
								
					if(recordType == "Incident"){
						workspaceRecord.getFieldValues(['Incident.CId', 'Incident.IId', 'Contact.CO$id_number', 'Incident.c$object_type']).then(function(IFieldDetails)
						{								
							cid 			= IFieldDetails.getField('Incident.CId').getValue();
							iid 			= IFieldDetails.getField('Incident.IId').getValue();
							id_number       = IFieldDetails.getField('Contact.CO$id_number').getValue();
							sr_type         = IFieldDetails.getField('Incident.c$object_type').getLabel();
							
							if(!mainFlow){
								ShowAttachments();
								//workspaceRecord.addNamedEventListener('forward_sent',forwardSent2);
							}
							if(mainFlow){
								workspaceRecord.addNamedEventListener(constants.trigger_event,renderDialogAttachment);
								//workspaceRecord.addNamedEventListener(constants.forward_complete_event,forwardSent);
								workspaceRecord.addRecordSavingListener(clearForward);
								workspaceRecord.addRecordSavedListener(clearForward);
								workspaceRecord.addRecordClosingListener(clearForward);
								
								//setInterval(function () {renderAttachment}, 5000);
							}
						});
						


						
						
						
						
					}
									
				//resizeExtension();
					
					
					
                });
            });
        });
   

});
//}








	
	

	



		//_wsRecord.triggerNamedEvent(constants.loaded_event);
			
function clearForward(){
		var fwdSNamer =   'forward_'+iid;   
		sessionStorage.removeItem(fwdSNamer);
}
function forwardSent(){



return new Promise(function (resolve, reject) {
	
		fwdSName =   'forward_'+iid;   
		var attachments = sessionStorage.getItem(fwdSName);	
		
		
	console.log(attachments);
		clearForward();
		
		
		
		
		
		if(attachments){
			attachments = JSON.parse(attachments);
			//console.log(attachments);
			var data = {};
			data['attachments'] = attachments;
			if(attachments.length > 0){
				//constants.hostURL
					var ajaxUrl = interfaceurl +constants.hostURL+ "?psk=" + session + "&iid=" + iid +"&apifunction=markattachments";
					//console.log(ajaxUrl);
					
					$.ajax({
					  type : "POST",
					  dataType: "json",
					  data: data,
					  url : ajaxUrl,
					  // Disable caching of AJAX responses
					  cache: false,
					  error: function (jqXHR, exception) {
						var msg = 'Error Accessing OSC Server - communication failed with status = ' + jqXHR.status 
						//console.log('Error Accessing OSC Server .\n' + jqXHR.responseText);
						return reject(msg);
					  }
					}).done(
					  function(jsonData) {					
						if(jsonData.ERROR !=''){
							alert(jsonData.ERROR);
							return resolve();
						}else if(jsonData.SUCCESS !=''){
							
						   return resolve();
						}
					
					});
	
			}
			
		}
		return resolve();
});
}

function renderDialogAttachment() {
	
	var reportID = (sr_type == 'Lead')?constants.Lead_reportId:((sr_type == 'SR')?constants.SR_reportId:((sr_type == 'Task')?constants.Task_reportId:0));
	var attachmentCount = 0;
	
	//console.log(sr_type);console.log(iid);console.log(reportID);
    const searchUrl =
      window.location.origin +
      '/services/rest/connect/v1.3/analyticsReportResults';






    var settings = {
      url: searchUrl,
      method: 'POST',
      headers: {
        'osvc-crest-application-context': 'Attachment Count',
        authorization: 'Session ' + session,
        'cache-control': 'no-cache'
      },  
	  "data": '{"id":'+reportID+',"filters":[{"name":"'+constants.report_filter+'","values":"'+iid+'"}]}',
    };
	
	
	
	
	///{"id":101047,"filters":[{"name":"related_incident","values":"1391"}]}
	//console.log(settings);

    $.ajax(settings).done(function (response) {
      try {
		  //console.log(response);
       attachmentCount = response.count;
	   if(attachmentCount == 0){
		   _wsRecord.executeEditorCommand('Forward').then(function(){
										//_wsRecord.triggerNamedEvent('SUBMIT_COMPLETE');
										//alert('Opening Standard Forward');
								  });
	   }else{
		   	    _extProvider.registerUserInterfaceExtension(function (uiContext) {
        uiContext.getModalWindowContext().then(function (IModalWindowContext) {
			
            var modalWindow = IModalWindowContext.createModalWindow();
			
			
			modalWindow.setTitle(constants.modal_title);
            modalWindowID = modalWindow.getId();
            modalWindow.setContentUrl("init.html?param_x=render_attachment");
			
            modalWindow.setWidth(Math.round(window.parent.innerWidth*0.5)+"px");
            modalWindow.setHeight(Math.round(window.parent.innerHeight*0.85)+"px");
			
				
			modalWindow.render();
			myModalWindow = modalWindow;
			
			
		
			
        });
    });
	   }
      } catch (e) {
        console.error(e);
      }
    });
	
	
	
	
	
	
	
	
	
	
	
	
	
	//console.log(sr_type);//console.log(iid);

	

}
function ShowAttachments(){
	
	
	var reportID = (sr_type == 'Lead')?constants.Lead_reportId:((sr_type == 'SR')?constants.SR_reportId:((sr_type == 'Task')?constants.Task_reportId:0));
	
	//console.log(sr_type);//console.log(iid);//console.log(reportID);
	
	
	
	
	
	if(iid > 0 && reportID > 0){
					var ajaxUrl = interfaceurl + constants.hostURL+"?psk=" + session + "&iid=" + iid + "&reportID=" + reportID + "&report_filter="+constants.report_filter+"&apifunction=getattachments";
					//console.log(ajaxUrl);
					
					$.ajax({
					  type : "POST",
					  dataType: "json",
					  data: reportID,
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
						  ////console.log(jsonData);
						  var attachCount = 0;
						  if(typeof jsonData != 'undefined' && typeof jsonData.DATARET != 'undefined' && typeof jsonData.DATARET.ATTACHMENTS != 'undefined'){
							  if(typeof jsonData.DATARET.ATTACHMENTS.DATALINES != 'undefined'){
								  attachCount = jsonData.DATARET.ATTACHMENTS.DATALINES.length;
							  }
							  
						  }
						  if(attachCount > 0){
							  
							  var dataString='<table class="table">';
									dataString+='<thead><tr>';
									for(var h=0;h<jsonData.DATARET.ATTACHMENTS.HEADERS.length;h++){
										
										dataString+='<th>';
										if(jsonData.DATARET.ATTACHMENTS.HEADERS[h] == 'ID'){dataString+='בחר';}else{dataString+=jsonData.DATARET.ATTACHMENTS.HEADERS[h];}
										
										dataString+='</th>';
									}
									
									
									dataString+='</tr></thead><tbody>';
							  
							  
								for(var i=0; i < attachCount; i++){
									dataString+='<tr>';
									
									//dataString+=jsonData.DATARET.ATTACHMENTS.DATALINES[i];
									for(var head in jsonData.DATARET.ATTACHMENTS.DATALINES[i]){
										
										if(head == 'ID'){
										dataString+='<td>';
										dataString+='<input type="checkbox" id="attachments_'+jsonData.DATARET.ATTACHMENTS.DATALINES[i][head]+'" name="attachments" value="'+jsonData.DATARET.ATTACHMENTS.DATALINES[i][head]+'">';
										dataString+='</td>';
									}else{
										
										dataString+='<td>';
										dataString+=jsonData.DATARET.ATTACHMENTS.DATALINES[i][head];
										dataString+='</td>';
									}
									}
									
									dataString+='</tr>';
								}
							dataString+='<tr><td colspan="5"><input id="ContinueButton" type="button" value="'+constants.button_caption+'" onclick="continueFWD();"/></td></tr></tbody></table>';
								
						  }
						  
						  
						  $(document).ready(function(){
						 // console.log(dataString);
						  document.getElementById('LoadingData').innerHTML = dataString;
						  
						  });
						  
						  
						////console.log(jsonData.DATARET);//console.log(dataString);
						if(jsonData.ERROR !=''){
							alert(jsonData.ERROR);
							return Promise.resolve();
						}else if(jsonData.SUCCESS !=''){
							
						   return Promise.resolve();
						}
					
					});
	}
	
	
}
function continueFWD(){

			var fwdSNamer =   'forward_'+iid;   
				sessionStorage.removeItem(fwdSNamer);	
	   $(document).ready(function() {
       // $("#ContinueButton").click(function(){
           // var selectedAttachments = [];
            $.each($("input[name='attachments']:checked"), function(){
                FwdRecords.push($(this).val());
            });
			
	if(FwdRecords.length > 0){		
		fwdSName =   'forward_'+iid;   
		sessionStorage.setItem(fwdSName,JSON.stringify(FwdRecords));
	}
	
	FwdRecords = FwdRecords;
	
	
	
		forwardSent().then(function(){



	
			
	_extProvider.registerUserInterfaceExtension(function(IUserInterfaceContext)
		{
		IUserInterfaceContext.getModalWindowContext().then(function(IModalWindowContext)
			{
			IModalWindowContext.getCurrentModalWindow().then(function(IModalWindow)
				{
				 IModalWindow.close();
				 //console.log(FwdRecords);
				// Perform some operations on IModalWindow.
				 _wsRecord.executeEditorCommand('Forward').then(function(){
										//_wsRecord.triggerNamedEvent('SUBMIT_COMPLETE');
										//alert('Opening Standard Forward');
								  });
				
				});
			});
		});
			
			
			//console.log(FwdRecords);
			
	
	
	
	
	
		
			
			
        //});
    });
	
	
	});
	
	
	


}
function closeDialogSMSEM(){
	$('#ExtensibilityModalWindowViewModel_layer .oj-dialog',window.parent.document).parent().animate({right: -1592});
	//console.log(myModalWin);
	setTimeout(function(){ myModalWin.close(); }, 500);
			
}

								function resizeExtension() {
						
									var minWidth = 80;
									var minHeight = 80;
									
									ORACLE_SERVICE_CLOUD.extensionResizeHandler.resize(minWidth,minHeight);
								}


function initializeConstants(globalContext) {
    return new Promise(function (resolve, reject) {
        globalContext.getExtensionContext(appName).then(function (extensionContext) {
            extensionContext.getProperties(serverProps).then(function (collection) {
                resolve(setConstants(collection));
            }).catch(function (err) {
                ////console.log("inside extensionContext catch");
                ////console.log(err);
                reject(err);
            });
        }).catch(function (err) {
           // //console.log("inside getExtensionContext catch");
           // //console.log(err);
            reject(err);
        });
    });
}

function setConstants(collection) {
    var propertiesJSON = collection.extensionProperiesMap;
    constants = {};
    for (var key in propertiesJSON) {
        constants[key] = propertiesJSON[key].getValue();
    }
    return constants;
}

function inArray(needle, haystack) {
    var length = haystack.length;
    for (var i = 0; i < length; i++) {
        if (haystack[i].trim() == needle) return true;
    }
    return false;
}
function getAreaCodeRange(array) {
    var min = Math.min.apply(Math, array.map(function (str) { return str.trim().length; }));
    var max = Math.max.apply(Math, array.map(function (str) { return str.trim().length; }));
    return min + "," + max;
}
function addSeparator(phoneNumber, type) {
    if (phoneNumber && phoneNumber.split("-").length == 1) {
        phoneNumber = phoneNumber.substr(0, phoneNumber.length - 7) + "-" + phoneNumber.substr(phoneNumber.length - 7);
        document.getElementById('mobile_number').value= phoneNumber;
        return phoneNumber;
    } else {
        return phoneNumber;
    }
}