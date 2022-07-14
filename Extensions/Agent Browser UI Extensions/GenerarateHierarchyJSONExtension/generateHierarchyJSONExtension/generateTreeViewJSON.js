/* eslint-disable no-mixed-spaces-and-tabs */
let result = [];
let objId = null;
let objType = null;
const acctId = null;
let errorResult = null;
const refNo = null;
let contactId = null;
let globalContextPromise=null;
let eventBranchId = null;
let extensionProviderPromise;
let eventBranchName=null;

function getGlobalContext() {
  if (!globalContextPromise) {
    globalContextPromise = new ORACLE_SERVICE_CLOUD.ExtensionPromise();
    getExtensionProvider().then(function(extensionProvider) {
      extensionProvider.getGlobalContext().then(function(globalContext) {
        globalContextPromise.resolve(globalContext);
      });
    });
  }
  return globalContextPromise;
}


function selectQuery(query) {
  return new Promise((resolve, reject) => {
    getGlobalContext().then(function(globalContext) {
      const restUrl = globalContext.getInterfaceServiceUrl('REST');
      globalContext.getSessionToken().then(function(sessionToken) {
        $.ajax({
          beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', `Session ${sessionToken}`);
          },
          contentType: 'application/json',
          dataType: 'json',
          timeout: 10000,
          type: 'GET',
          url: `${restUrl}/connect/v1.3/queryResults/?query=${query}`,
        }).done(function(queryReponseItems) {
          resolve(queryReponseItems);
        });
      });
    });
  });
}


function getJSON() {
  return new Promise((resolve, reject) => {
    const currentUrl = new URL(location.href);
    objId = currentUrl.searchParams.get('objectId');
    objType = currentUrl.searchParams.get('objectType');
    wsRec = currentUrl.searchParams.get('wsRec');
    getExtensionProvider().then(function(extensionProvider) {
      extensionProvider.registerWorkspaceExtension(function(workspaceRecord) {
        workspaceRecord.getFieldValues([
          'Incident.Routing$AssignedBranch',
          'Incident.Assigned',
          'Incident.Routing$AssocAgentBranch', 'Incident.RefNo', 'Incident.CId',
        ]).then(function(iFieldDetails) {
          eventBranchId = iFieldDetails.getField('Incident.Routing$AssignedBranch').getValue();
          eventBranchName = iFieldDetails.getField('Incident.Routing$AssignedBranch').getLabel();
          contactId=iFieldDetails.getField('Incident.CId').getValue();
          getGlobalContext().then(function(globalContext) {
            let sessionID = null;
            globalContext.getSessionToken().then(function(sessionToken) {
              sessionID = sessionToken;
              const instanceURL = globalContext.getInterfaceUrl().split('cgi-bin')[0];
              const ajaxUrl = `${instanceURL}cc/api/v1/Account/${globalContext.getAccountId()}/Assignment?session=${sessionID}`;
              return $.ajax({
                type: 'GET',
                async: true,
                url: ajaxUrl,
                beforeSend: function(xhr) {
                  xhr.setRequestHeader('Authorization', `Session ${sessionID}`);
                },
                error: function() {
                  errorResult = `Error loading account service data : ${globalContext.getAccountId()}`;
                  createLogs('error', errorresult);
                },
                success: function(assignmentData, textStatus, jQxhr) {
                  const primaryBranch = assignmentData.primaryBranch.ID;
                  const branchGroup = assignmentData.branchGroup.ID;
                  const url=(eventBranchId == null) ? instanceURL + 'cc/api/v1/AssignmentHierarchy?agentAccount=' + globalContext.getAccountId() + '&assignedBranch=' + primaryBranch + '&limitToGroup=' + branchGroup : instanceURL + 'cc/api/v1/AssignmentHierarchy?agentAccount=' + acctId + '&assignedBranch=' + eventBranchId + '&limitToGroup=' + branchGroup;
                  return $.ajax({
                    type: 'GET',
                    async: true,
                    url: url,
                    beforeSend: function(xhr) {
                      xhr.setRequestHeader('Authorization', `Session ${sessionID}`);
                    },
                    error: function() {
                      errorResult = `Error loading assignment hierarchy service data : ${globalContext.getAccountId()}`;
                      createLogs('error', errorresult);
                    },
                    success: function(data, textStatus, jQxhr) {
                      const jsonParse = data;
                      jsonParse.assocBranches = assignmentData.assocBranches;
                      jsonParse.primaryBranch = assignmentData.primaryBranch;
                      jsonParse.group = assignmentData.branchGroup;
                      jsonParse.agentName = assignmentData.agentName;
                      resolve(jsonParse);
                    },
                  });
                },
              });
            });
          });
        });
      }, objType, objId);
    });
  });
}


function getExtensionProvider() {
  if (!extensionProviderPromise) {
    extensionProviderPromise = ORACLE_SERVICE_CLOUD.extension_loader.load('HierarchyAssignment');
  }
  return extensionProviderPromise;
}


getGlobalContext().then(function(globalContext) {
  globalContext.registerAction('populateDefaultValue', function(param) {
    getExtensionProvider().then(function(extensionProvider) {
      extensionProvider.registerWorkspaceExtension(function(incidentWorkspaceRecord) {
        const incidentId=incidentWorkspaceRecord.getWorkspaceRecordId();
        if (incidentId > 0) {
          const query =`select AssignedTo.account.lookupName as assignedto, CustomFields.Routing.AssocAgentBranch.lookupName as assoc  from incidents where id=${incidentId}`;
          selectQuery(query).then((incQueryResponse) => {
            globalContext.invokeAction(`capturedata${incidentId}${incidentWorkspaceRecord.getWorkspaceRecordType()}`, {
              branchName: incQueryResponse.items[0].rows[0][1],
              staffName: incQueryResponse.items[0].rows[0][0],
            });
          });
          incidentWorkspaceRecord.updateFieldByLabel('Incident.Assigned.AcctId', incQueryResponse.items[0].rows[0][0]);
          incidentWorkspaceRecord.updateFieldByLabel('Incident.Routing$AssocAgentBranch', incQueryResponse.items[0].rows[0][1]);
        } else {
          const acctId=globalContext.getAccountId();
          const query =`select CustomFields.Routing.PrimaryBranch.lookupName,CustomFields.Routing.PrimaryBranch,LookupName from Accounts where ID=${acctId} LIMIT 1`;
          selectQuery(query).then((primaryBranchNameResponse) => {
            if (primaryBranchNameResponse.items[0].rows.length >0) {
              primaryBranch = primaryBranchNameResponse.items[0].rows[0][0];
              globalContext.invokeAction(`capturedata${incidentId}${incidentWorkspaceRecord.getWorkspaceRecordType()}`, {
                branchName: primaryBranch,
                staffName: primaryBranchNameResponse.items[0].rows[0][2],
                // eslint-disable-next-line no-tabs
			    });
              incidentWorkspaceRecord.updateFieldByLabel('Incident.Assigned.AcctId', primaryBranchNameResponse.items[0].rows[0][2]);
              incidentWorkspaceRecord.updateFieldByLabel('Incident.Routing$AssocAgentBranch', primaryBranch);
            } else {
              getIncidentRefNo(incidentWorkspaceRecord).then((incRef) => {
                errorresult = `Agent : ${acctId} does not have primary branch for Incident Ref No: ${incRef}`;
                createLogs('error', errorResult );
              });
            }
          });
        }
      });
    });
  });
});

getGlobalContext().then(function(globalContext) {
  globalContext.registerAction('generateJSON', function(treeViewFilterParam) {
    const returnPromise=new ExtensionPromise();
    getJSON().then((response) => {
      const processedBranchData = new Map();
      let accounts = response.accounts;
      accounts = filterBy(accounts, {
        IsDisabled: false,
        IsAssignable: true,
      });
      let assocBranches = response.assocBranches;
      assocBranches = assocBranches.map((a) => a.ID);
      if (!assocBranches.includes(eventBranchId) && eventBranchId != null) {
        assocBranches.push('' + eventBranchId);
      }
      accounts = accounts.filter(function(accountData) {
        return assocBranches.includes(accountData.PrimaryBranchID + '');
      });
      for (const account of accounts) {
        if (account.PrimaryBranchID) {
          if (!processedBranchData.has(account.PrimaryBranchID)) {
            processedBranchData.set(account.PrimaryBranchID, {
              Name: account.PrimaryBranchName,
              children: new Map(),
            });
          }
          const branchInfoMap = processedBranchData.get(account.PrimaryBranchID).children;
          if (account.StaffGroupID) {
            if (!branchInfoMap.has(account.StaffGroupID)) {
              branchInfoMap.set(account.StaffGroupID, {
                Name: account.StaffGroupName,
                children: [],
              });
            }
          }
          const accountList = branchInfoMap.get(account.StaffGroupID).children;
          const minifiedAccount = {
            accountId: account.AccountID,
            accountName: account.AccountName,
            staffGroupID: account.StaffGroupID,
            staffGroupName: account.StaffGroupName,
            branchName: account.PrimaryBranchName,
          };
          accountList.push(minifiedAccount);
        }
      }
      objId=treeViewFilterParam.objId;
      objType=treeViewFilterParam.objType;
      const acctId=globalContext.getAccountId();
      if (processedBranchData.length == 0) {
        errorResult = `There are no branches available for assignment for this Event : ${objId}`;
        createLogs('error', errorResult);
        errorresult = `Assignment hierarchy for Event ID: ${objId} for Agent ${acctId} was empty`;
        createLogs('error', errorResult);
      } else {
        result = [];
        getGlobalContext().then(function(globalContext) {
          errorResult = `Assignment hierarchy for Event  ID: ${objId} for Agent ${acctId} is : ${getAssignmentDetails( response.primaryBranch, response.group, response.agentName, acctId)}, Map(${mapEntriesToString(processedBranchData.entries())})`;
          createLogs('info', errorResult);
          if (eventBranchId != null) {
            setAssignedAndPrimaryBranch({
              id: eventBranchId,
              Name: eventBranchName,
            }, result.length, processedBranchData);
          }
          if (eventBranchId != response.primaryBranch.ID) {
            setAssignedAndPrimaryBranch({
              id: response.primaryBranch.ID,
              Name: response.primaryBranch.Name,
            }, result.length, processedBranchData);
          }
          if (response.primaryBranch.ID != 1) {
            setAssignedAndPrimaryBranch({
              id: 1,
              Name: 'Corporate',
            }, result.length, processedBranchData);
          }
          let branchCount = result.length;

          for (const branchItem of processedBranchData.keys()) {
            if (branchItem != response.primaryBranch.ID && branchItem != eventBranchId && branchItem != 1) {
              let groupCount = 0;
              result.push({
                id: branchItem,
                Name: processedBranchData.get(branchItem).Name,
              });
              const branchId = branchItem;
              result[branchCount].children = [];

              for (const staffGroupItem of processedBranchData.get(branchItem).children) {
                const staffGroupId = staffGroupItem[0];
                const staffGroupName = staffGroupItem[1].Name;
                result[branchCount].children.push({
                  id: `${staffGroupId}-${branchId}`,
                  Name: staffGroupName,
                });
                result[branchCount].children[groupCount].children = [];
                for (const staffAccountItem of staffGroupItem[1].children) {
                  result[branchCount].children[groupCount].children.push({
                    id: `${staffAccountItem.accountId}-${branchId}`,
                    Name: staffAccountItem.accountName,
                  });
                }
                groupCount++;
              }
              result[branchCount].children.sort(dynamicsort('Name', 'asc'));
              for (let i = 0; i < result[branchCount].children.length; i++) {
                if (typeof result[branchCount].children[i].children != 'undefined') {
                  result[branchCount].children[i].children.sort(dynamicsort('Name', 'asc') );
                }
              }
              branchCount++;
            }
          }
          let childList = [];
          if (eventBranchId != null && eventBranchId != response.primaryBranch.ID) {
            let restBranches = result.slice(3, result.length);
            restBranches = restBranches.sort(dynamicsort('Name', 'asc'));
            result = [result[0]].concat(result[1], result[2], restBranches);
          } else {
            let restBranches = result.slice(2, result.length);
            restBranches = restBranches.sort(dynamicsort('Name', 'asc'));
            result = [result[0]].concat(result[1], restBranches);
          }

          if (eventBranchId == result[0].id) {
            const assignedBranchArr = filterBy(result, {
              id: result[0].id,
            });
            childList = [result[0].id];
            for (const assignedElem of assignedBranchArr[0].children) {
              childList.push(assignedElem.id);
            }
          }
          const renderTreeArr=[];
          renderTreeArr.push({childList: childList, result: result, eventBranchId: eventBranchId});
          returnPromise.resolve(renderTreeArr);
        });
      }
    });
    return returnPromise;
  });

  globalContext.registerAction('populateValue', function(selectedContact) {
    const contactValue=selectedContact.selectedValue;
    getExtensionProvider().then(function(extensionProvider) {
      extensionProvider.registerWorkspaceExtension(function(workspaceRecord) {
        wsRec = workspaceRecord;
        if (contactValue==null) {
          wsRec.updateField('Incident.Routing$AssignedBranch', '');
        } else {
          getPrimaryBranch().then((primaryBranchResponse) => {
            primaryBranch = primaryBranchResponse.branchId;
            branchGroup = primaryBranchResponse.branchGroup;
            const contactId = contactValue;
            const contactQuery =`SELECT CustomFields.Routing.DefaultBranch, Address.PostalCode, CustomFields.CPM.EventUpdateToggle FROM Contacts where ID =${contactId}`;
            selectQuery(contactQuery).then((queryResponse) => {
              const toggleFlag = !(queryResponse.items[0].rows[0][2] == 1);
              getGlobalContext().then(function(globalContext) {
                const restURL = globalContext.getInterfaceServiceUrl('REST');
                globalContext.getSessionToken().then(function(sessionToken) {
                  const url = `${restURL}/connect/v1.4/contacts/${contactId}`;
                  const xhr = new XMLHttpRequest();
                  xhr.open('PATCH', url, true);
                  xhr.setRequestHeader('Accept', 'application/json');
                  xhr.setRequestHeader('Authorization', `Session ${sessionToken}`);
                  xhr.setRequestHeader('Content-Type', 'application/json');
                  xhr.setRequestHeader('OSvC-CREST-Application-Context', 'HierarchyAssignment');
                  const data = {
                    customFields: {
                      CPM: {
                        EventUpdateToggle: toggleFlag,
                      },
                    },
                  };
                  xhr.send(JSON.stringify(data));
                  xhr.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                      const query =`SELECT CustomFields.Routing.DefaultBranch FROM Contacts where ID = ${contactId}`;
                      selectQuery(query).then((response) => {
                        branch = response.items[0].rows[0][0];
                        getIncidentRefNo(wsRec).then((incRef) => {
                          errorResult = `Setting default branch {branch} from Contact ${contactId} on Event ID:${wsRec.getCurrentWorkspace().objectId} and Reference No: ${incRef}`;
                          createLogs('debug', errorResult );
                        });
                        if (branch!=null && branch!='') {
                          if (primaryBranch != 1 && branchGroup != 1) {
                            isValidAgentBranch(branch, primaryBranch, branchGroup, wsRec);
                          } else {
                            wsRec.updateField('Incident.Routing$AssignedBranch', branch);
                          }
                        } else {
                          getIncidentRefNo(wsRec).then((incRef) => {
                            errorResult = `Error retrieving default branch for Contact ${contactId} from Event ID: ${wsRec.getCurrentWorkspace().objectId} and Reference No: ${incRef}`;
                            createLogs('error', errorResult);
                          });
                        }
                      });
                    }
                  };
                });
              });
            });
          });
        }
      });
    });
  });


  function getIncidentRefNo(wsRec) {
    const extPromise =new ExtensionPromise();
    wsRec.getFieldValues('Incident.RefNo').then(function(fieldDetails) {
      const referenceNumber = fieldDetails.getField('Incident.RefNo').getValue();
      extPromise.resolve(referenceNumber);
    });
    return extPromise;
  }


  function getPrimaryBranch() {
    return new Promise((resolve, reject) => {
      getGlobalContext().then(function(globalContext) {
        const acctId = globalContext.getAccountId();
        restUrl = globalContext.getInterfaceServiceUrl('REST');
        const query =`select CustomFields.Routing.PrimaryBranch.lookupName,CustomFields.Routing.PrimaryBranch,CustomFields.Routing.BranchGroup   from Accounts where ID=${acctId} LIMIT 1`;

        selectQuery(query).then((primaryBranchQueryresponse) => {
          if ( primaryBranchQueryresponse.items[0].rows.length == 1) {
            resolve(
                {branchName: primaryBranchQueryresponse.items[0].rows[0][0], branchId: primaryBranchQueryresponse.items[0].rows[0][1], branchGroup: primaryBranchQueryresponse.items[0].rows[0][2]},
            );
          }
        });
      });
    });
  }


  globalContext.registerAction('selectionChanged', function(selectedStaffAccount) {
    const selectedAcct = selectedStaffAccount.selectedAcct;
    const returnPromise=new ExtensionPromise();
    getExtensionProvider().then(function(extensionProvider) {
      extensionProvider.registerWorkspaceExtension(function(workspaceRecord) {
        if (workspaceRecord.getWorkspaceRecordId() == parseInt(selectedStaffAccount.objId) && workspaceRecord.getWorkspaceRecordType() == selectedStaffAccount.objType) {
          const staffAcctName = selectedStaffAccount.treeObj;
          const branchObj = filterBy(result, {
            id: selectedAcct.split('-')[1],
          });
			if(staffAcctName.children==undefined){
		  workspaceRecord.updateFieldByLabel('Incident.Assigned.AcctId',staffAcctName.Name );
          workspaceRecord.updateFieldByLabel('Incident.Routing$AssocAgentBranch', branchObj[0].Name);
		  workspaceRecord.triggerNamedEvent('OnAssignmentAgent');
          const selectedArr=[];
          selectedArr.push({branchName: branchObj[0].Name, staffName: staffAcctName.Name});
          
          returnPromise.resolve(selectedArr);
			}
		  
        }
      });
    });


    return returnPromise;
  });
});

function isValidAgentBranch(branch, primaryBranch, branchGroup, wsRecord) {
  if (branch == primaryBranch) {
    wsRecord.triggerNamedEvent('ValidAssignedBranchForAgent');
  } else if (isAgentAllowed(branch, branchGroup)) {
    wsRecord.triggerNamedEvent('ValidAssignedBranchForAgent');
  } else {
    wsRecord.triggerNamedEvent('InvalidAssignedBranchForAgent');
  }
  wsRecord.updateField('Incident.Routing$AssignedBranch', branch);
}

function isAgentAllowed(branchId, branchGroup) {
  const query = `select Branch, BranchGroup,BranchGroup.LookupName as GroupName from Routing.AssocBranch WHERE BranchGroup =${branchGroup} Order by Branch`;
  const branchArray = [];
  selectQuery(query).then((assocBranchQueryResponse) => {
    for (const assocBranchItem of assocBranchQueryResponse) {
      branchArray[i] = assocBranchItem.rows[i][0];
    }
    const branchExists = branchArray.includes(branchId);
    return branchExists;
  });
}

function getAssignmentDetails(primaryBranch, group, agentName, acctId) {
  const logStringArr = [];
  if (objType == 'Incident') {
    if (objId > 0) {
      logStringArr.push(`Existing Event: ${refNo} (ID: ${objId})`);
    } else {
      logStringArr.push(`New Event (ID: ${objId})`);
    }
  } else {
    logStringArr.push(`No Event`);
  }


  if (eventBranchId != null) {
    logStringArr.push(`Event's assigned Branch: ${eventBranchName} (ID:${eventBranchId})`);
  } else {
    if (primaryBranch != null) {
      logStringArr.push(`Event's currently assigned Branch: ${primaryBranch.Name} (ID: ${primaryBranch.ID})`);
    } else {
      logStringArr.push(`Event is not assigned to a Branch`);
    }
  }

  if (group != null) {
    logStringArr.push(`Event is assigned to Staff Group : ${group.Name}`);
  }

  if (agentName != null) {
    logStringArr.push(`Event is assigned to Agent: ${agentName}`);
  } else {
    logStringArr.push(`Event is not assigned to an Agent`);
  }

  logStringArr.push();

  // contact details
  if (objType == 'Incident') {
    if (contactId != null) {
      if (contactId > 0) {
        logStringArr.push(`Event belongs to an existing Contact (ID: ${contactId})`);
      } else {
        logStringArr.push(`Event belongs to a new Contact (ID: ${contactId})`);
      }
    } else {
      logStringArr.push('Event does not have a Primary Contact');
    }
    logStringArr.push();
  }

  // account & assignment details

  logStringArr.push(`Agent's Account ID: ${acctId}`);
  if (agentName != null) {
    if (primaryBranch != null) {
      logStringArr.push(`Agent's Primary Branch: ${primaryBranch.Name} (ID: ${primaryBranch.ID})`);
    } else {
      logStringArr.push(`Agent does not have a Primary Branch`);
    }

    if (group.Name != null) {
      logStringArr.push(`Agent's Branch Group: ${group.Name} (ID: ${group.ID})`);
    } else {
      logStringArr.push(`Agent does not have a Branch Group`);
    }
  } else {
    logStringArr.push(`Agent's Primary Branch and Branch Group details are not available`);
  }

  return logStringArr;
}


function mapEntriesToString(entries) {
  return Array
      .from(entries, ([k, v]) => `\n  ${k}: ${Object.entries(v)}`)
      .join('') + '\n';
}

function dynamicsort(property, order) {
  let sortOrder = 1;
  if (order === 'desc') {
    sortOrder = -1;
  }
  return function(a, b) {
    if (a[property] < b[property]) {
      return -1 * sortOrder;
    } else if (a[property] > b[property]) {
      return sortOrder;
    } else {
      return 0;
    }
  };
}

function filterBy(accountList, criteria) {
  return accountList.filter((account) =>
    Object.keys(criteria).every((key) => account[key] == criteria[key]),
  );
}


function setAssignedAndPrimaryBranch(branchIdName, count, processedBranchData) {
  let groupCount = 0;
  if (processedBranchData.get(branchIdName.id) != undefined) {
    result.push({
      id: branchIdName.id,
      Name: branchIdName.Name,
    });
    const branchId = branchIdName.id;
    result[count].children = [];


    for (const staffGroupItem of processedBranchData.get(branchIdName.id).children) {
      result[count].children.push({
        id: `${staffGroupItem[0]}-${branchId}`,
        Name: staffGroupItem[1].Name,
      });

      result[count].children[groupCount].children = [];
      for (const staffAccountItem of staffGroupItem[1].children) {
        result[count].children[groupCount].children.push({
          id: `${staffAccountItem.accountId}-${branchId}`,
          Name: staffAccountItem.accountName,
        });
      }
      groupCount++;
    }
    result[count].children.sort(dynamicsort('Name', 'asc'));
    for (let i = 0; i < result[count].children.length; i++) {
      if (typeof result[count].children[i].children != 'undefined') {
        result[count].children[i].children.sort(dynamicsort('Name', 'asc'));
      }
    }
  }
}

function getExtensionProvider() {
  if (!extensionProviderPromise) {
    extensionProviderPromise = ORACLE_SERVICE_CLOUD.extension_loader.load('HierarchyAssignment');

    return extensionProviderPromise;
  }
  return extensionProviderPromise;
}

function createLogs(type, message, name) {
  getExtensionProvider().then(function(extensionProvider) {
    const namedLogger = extensionProvider.getLogger(name);
    namedLogger.info(message);
  });
}

