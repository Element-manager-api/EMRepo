let sdk,
  interfaceUrl,
  globalContext,
  sessionToken,
  workspaceRecord,
  lastOnFocusType,
  accountId,
  id_Number_Outbound=0,
  current_agent_state='',
  lastOnFocusId;

let nextId = 0;

var customAMCEventManager;

ORACLE_SERVICE_CLOUD.extension_loader
  .load('Global Extension VIRU', '1')
  .then(function (extensionProvider) {
    sdk = extensionProvider;
    sdk.getGlobalContext().then(function (gc) {
      globalContext = gc;
      interfaceUrl = globalContext.getInterfaceUrl();
		accountId  = globalContext.getAccountId();
      globalContext.getSessionToken().then(function (token) {
        sessionToken = token;

        sdk.registerWorkspaceExtension(function (ws) {
          workspaceRecord = ws;
          initialize();
        });
      });
    });
  });

function initialize() {
  window.addEventListener(
    'message',
    function (event) {
		////console.log(event);
      const data = event.data;
      if (data.from === 'OracleCX-for-Davinci') {
        switch (data.type) {
			
			
          case 'CADScreenPop':
            getContacts(data.message.queryString).then((contacts) => {
              if (!data.message.isSearch) {
                if (contacts.length === 1) {
                  //single match
                  //pop(contacts[0].id);
                 }  else if (contacts.length === 0) {
                // no match
                } else {
                  // multi match
                }
              }
              event.source.postMessage(
                {
                  id: event.data.id,
                  from: 'OracleCX-for-Davinci',
                  isReply: true,
                  response: contacts,
                },
                event.origin
              );
            });
            break;
          case 'searchAndScreenpop':
            searchContact(data.message.queryString).then((contacts) => {
              if (!data.message.isSearch) {
                if (contacts.length === 1) {
                  //single match
                 // pop(contacts[0].id);
                } else if (contacts.length === 0) {
                  // no match
                 // createNewContact(data.message);
                } else {
                  // multi match
                }
              }

              event.source.postMessage(
                {
                  id: event.data.id,
                  from: 'OracleCX-for-Davinci',
                  isReply: true,
                  response: contacts,
                },
                event.origin
              );
            });
            break;
          case 'screenpop':
            screenpop(data.message, event);
            break;
			
			
          case 'expandSidePanel':
            expandSidePanel();
            break;
		 case 'clickToDialORACLE':
		   if (customAMCEventManager) {
			customAMCEventManager.clickToDialHandler(data.message.phoneNumber, data.message.entity, data.ContactIDNumber, data.incident_id); 
		   }
            break;
          case 'sendContactDetailsInfo':

            if (customAMCEventManager) {
              customAMCEventManager.sendContactDetailsInfo(data.message.contactDetails.messageToSend);
            }
            break;
          default:
            break;
        }
      }
    },
    false
  );

 $(document).ready(function(){
  const davinciWindow = document.querySelector('iframe');
  
  
  
 if(typeof davinciWindow != 'undefined' && typeof document.querySelector('iframe').contentWindow != 'undefined'){
		addListener();
}else{
	const myTimeout = setTimeout(addListener, 5000);	
}
 }); 
  
  
  

  
  
  
  
  
  
  
  
}


function addListener(){  

const davinciWindowN = document.querySelector('iframe').contentWindow; 
if(typeof davinciWindowN != 'undefined'){
	

  

  workspaceRecord.addCurrentEditorTabChangedListener((event) => {
    const { objectId, objectType } = event.newWorkspace;
    if (objectType !== lastOnFocusType || objectId !== lastOnFocusId) {
		
		//alert(objectType +' - '+ objectId);
		
		
		workspaceRecord.addNamedEventListener('PHONE_LIST_UPDATED',function(){
			//renderList(objectType, objectId);
		});
		
		//renderList(objectType, objectId);
		
      if (objectType === 'Contact') {
        getContacts('id = ' + objectId).then((contacts) => {
          davinciWindowN.postMessage(
            {
              id: nextId++,
              type: 'onFocus',
              from: 'OracleCX-for-Davinci',
              isReply: false,
              message: contacts,
            },
            '*'
          );
        });
      } else {
        davinciWindowN.postMessage(
          {
            id: nextId++,
            type: 'onFocus',
            from: 'OracleCX-for-Davinci',
            isReply: false,
            message: [],
          },
          '*'
        );
      }
    }
  });
  
  
}
  
} 

function renderList(recType, rec_ID) {
	var PhoneListSessionName = recType+"_PHONELIST_"+rec_ID;
	
	
	var PhoneListParser = sessionStorage.getItem(PhoneListSessionName);
			
			if(PhoneListParser){
				 PList = JSON.parse(PhoneListParser);
				 //console.log(PList);
				 var ID_NUMBER_ENTITY=0;		
									
									for(var phone in PList){
										//console.log(PList[phone]);
										if(phone == 'ID_NUMBER'){
											ID_NUMBER_ENTITY = PList[phone];
										}
									}
		var PhoneTable='';
										PhoneTable+='<table><tr><th>Type</th><th>#</th></tr>';
										
										
										
									
									for(var phone in PList){
										//console.log(PList[phone]);
										if(phone == 'ID_NUMBER'){
											
										}else{										
										PhoneTable+='<tr>';
										if(ID_NUMBER_ENTITY > 0){
											PhoneTable+='<td>'+phone+'</td><td><a href="javascript:CallNumber(\''+PList[phone]+'\',\''+ ID_NUMBER_ENTITY +'\')">'+PList[phone]+'</a></td>';
										}else{
											PhoneTable+='<td>'+phone+'</td><td>'+PList[phone]+'</td>';
										}
										PhoneTable+='</tr>';
										}
									}
									PhoneTable+='</table>';
									//console.log(PhoneTable);
									document.getElementById('DialList').innerHTML = PhoneTable;
									
									//ORACLE_SERVICE_CLOUD.extensionResizeHandler.resize(300,400);
									
				
				 
				 
				 
				 
				}
	
	
	//PHONE_LIST_UPDATED
	
	
		
	/*

					
					var ajaxUrl = interfaceUrl + "/php/custom/interaction_middleware.php?psk=" + sessionToken + "&recordID=" + rec_ID + "&recordType=" + recType + "&apifunction=get_phones_list";
					
					//console.log(ajaxUrl);
					$.ajax({
					  type : "POST",
					  dataType: "json",
					  data: rec_ID,
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
						////console.log(jsonData);
						if(jsonData.DATARET.ERROR == ''){
							alert(jsonData.DATARET.ERROR);
						}else{
							if(typeof jsonData.DATARET.PhoneList != 'undefined'){
								if(jsonData.DATARET.PhoneList.length > 0){
									
									var PhoneTable='';
										PhoneTable+='<table><tr><th>Type</th><th>#</th></tr>';
									
									for(var phone in jsonData.DATARET.PhoneList){
										//console.log(jsonData.DATARET.PhoneList[phone]);
										
										PhoneTable+='<tr>';
										
										for(var phoneNum in jsonData.DATARET.PhoneList[phone]){
											PhoneTable+='<td>'+phoneNum+'</td><td><a href="javascript:CallNumber(\''+jsonData.DATARET.PhoneList[phone][phoneNum]+'\')">'+jsonData.DATARET.PhoneList[phone][phoneNum]+'</a></td>';
										}
										PhoneTable+='</tr>';
									}
									PhoneTable+='</table>';
									//console.log(PhoneTable);
									document.getElementById('DialList').innerHTML = PhoneTable;
									
									//ORACLE_SERVICE_CLOUD.extensionResizeHandler.resize(300,400);
									
								}
							}
						}
						
						////console.log(jsonData.ERROR);
						////console.log(jsonData.SUCCESS);
						// Check if its an error or successfully
						if(jsonData.ERROR !=''){
							alert(jsonData.ERROR);
							return Promise.resolve();
						}else if(jsonData.SUCCESS !=''){
							
						
						   return Promise.resolve();
						}
						
						
						
						
					});
					
				
					

			
			return Promise.resolve();
			*/
			
			////console.log(contactInteraction);		
			


}

function CallNumber(phoneNumber='', ID_NUMBER_ENTITY){
	
	if (customAMCEventManager) {
			customAMCEventManager.clickToDialHandler(phoneNumber, [], ID_NUMBER_ENTITY); 
}
	 
}
function expandSidePanel() {
  sdk.registerUserInterfaceExtension(function (userInterfaceContext) {
    userInterfaceContext
      .getLeftSidePaneContext()
      .then(function (sidePaneContext) {
        sidePaneContext
          .getSidePane('AMC-Technology-DaVinci')
          .then(function (sidePane) {
            sidePane.expand();
            sidePane.render();
          });
      });
  });
}

function getContacts(whereStatement) {
  return new Promise((resolve, reject) => {
    const query =
      'select ID, Emails.EmailList.Address, Phones.PhoneList.PhoneType.Name, Phones.PhoneList.Number, Name.First, Name.Last' +
      ' from contacts where ' +
      whereStatement;

    const searchUrl =
      window.location.origin +
      '/services/rest/connect/latest/queryResults?query=' +
      encodeURIComponent(query);

    var settings = {
      async: true,
      crossDomain: true,
      url: searchUrl,
      method: 'GET',
      headers: {
        'osvc-crest-application-context': 'Accounts metadata',
        authorization: 'Session ' + sessionToken,
        'cache-control': 'no-cache',
        'postman-token': '93f08543-550b-0886-4a58-90a9b7b765bf',
      },
    };

    $.ajax(settings).done(function (response) {
      try {
        const contacts = formatContacts(response.items) || [];
        resolve(contacts);
      } catch (e) {
        console.error(e);
      }
    });
  });
}

function searchContact(input) {
  try {
    let searchString = input;
    let searchField;
    if (searchString.includes('@')) {
      //email
      searchField = 'Emails.EmailList.Address';
      searchString = "'" + searchString + "'";
    } else {
      //phone
      searchString = searchString.replace(/[^0-9]/g, '');
      searchField = 'Phones.PhoneList.RawNumber';
      searchString = "'" + searchString + "'";
    }

    return getContacts(searchField + ' like ' + searchString);
  } catch (e) {
    console.error(e);
  }
}

function screenpop(record, event) {
  pop(record.id, record.type);
}

function formatContacts(items) {
  const contacts = items.reduce((contacts, item) => {
    const indexes = {}; // change to key-index pairs
    for (const i in item.columnNames) {
      indexes[item.columnNames[i]] = i;
    }

    for (const row of item.rows) {
      if (!contacts.hasOwnProperty(row[indexes['id']])) {
        contacts[row[indexes['id']]] = {
          id: row[indexes['id']],
          firstName: null,
          lastName: null,
          emails: [],
          phones: [],
        };
      }
      const contact = contacts[row[indexes['id']]];
      contact.firstName = contact.firstName || row[indexes['first']];
      contact.lastName = contact.lastName || row[indexes['last']];
      if (row[indexes['address']]) {
        contact.emails.push(row[indexes['address']]);
      }
      if (
        row[indexes['number']] &&
        contact.phones.find(
          (phone) => phone.number === row[indexes['number']]
        ) == null
      ) {
        contact.phones.push({
          name: row[indexes['name']], // name of phone(e.g. office, home, etc...)
          number: row[indexes['number']], // phone number
        });
      }
    }
    return contacts;
  }, {});
  return Object.values(contacts);
}

function pop(contactId, type = 'Contact') {
  workspaceRecord.editWorkspaceRecord(type, contactId, function (
    closeHandler
  ) {});
}

function createNewContact(searchString) {
  workspaceRecord.createWorkspaceRecord('Contact', function (closeHandler) {
    if (searchString.includes('@')) {
      //email
      workspaceRecord.updateField('Contact.Email.Addr', searchString);
    } else {
      //phone
      workspaceRecord.updateField('Contact.PhOffice', searchString);
    }
  });
}
