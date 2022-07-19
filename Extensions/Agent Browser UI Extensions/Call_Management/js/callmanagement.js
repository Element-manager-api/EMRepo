var myAppId = 'Call Management';    // App Id

var extensibilityApiVersion = '1';// Extensibility Api Version
var extesnionload = "";
var Glb_WScontactdetails="";
var ph_colname = "";
var tabledataToMove = [];
var tabledataInitial = [];
var incidentID ="";
var id_number=0;
var incident_ref="";
var callmanage_label="";
var selection_lbl="";
var closecomplete = false;
var tablecolumns = [];
var configProperties = [];
var nodata = false;
var iids = [];
var counter = 0;
var phonecheckcount=0;
 
$( document ).ready(function() {
	//getAssetdetails();
	getconfigurations();
	getlist();
	getConfigProperties();

	//add workspaceRecord tab change event
	workspaceeventslistener();
	
	
	
	//Add new row
	$("#createrow").click(function(){
		
					
		
		var table = document.getElementById("myTableData");
		
		
		var rowCount = table.rows.length;
		if(nodata == true)
		{
			
		}
		else
		{
			rowCount--;
			
			
		}
		
	
		
		
		
		
		$rows = table.rows.length;
		
		//[0].innerText
		var arraycells = [];
		arraycells.push(table.rows[0].cells);
				
		var row = table.insertRow(rowCount);
		var selectlist = $('<select class="code" style="width: 100%;" id=callresult'+rowCount+'></select>');
		$(selectlist).append("<option value='0'>--"+selection_lbl+"--</option>");
		var callstatuschannel_name = [];
		var callstatuschannel_id= [];
		//list of menu field
		for(var i =0;i< Glb_WScontactdetails.length;i++)
		{
			callstatuschannel_name[i] = Glb_WScontactdetails[i].label;
			callstatuschannel_id[i] = Glb_WScontactdetails[i].id;
		}
		
				//var chanels = ["chanel1", "chanel2", "chanel3"]
				//
				//var chanelValue = ["1", "2", "3"]

				for(var i=0;i<callstatuschannel_name.length;i++){
				
				var option = $("<option/>");
				$(option).val(callstatuschannel_id[i]);
				$(option).html(callstatuschannel_name[i]);
				$(selectlist).append(option);
				}
				
			$.each(arraycells[0],function(index ) {
				var name = arraycells[0][index].innerText;
				name = name.split(' ').join('');
				//var name = table.rows[0].cells[index].innerText;
				//	name = name.split(' ').join('');
				
				if(index > 0)
					{
						if(index == 2)
						{
							row.insertCell(index).innerHTML= selectlist[0].outerHTML;
						}
						else if(index == 4)
						{
							row.insertCell(index).innerHTML='<input readonly style="display:none;"  type="text" class="code" id="'+table.rows[0].cells[index].innerText+rowCount+'" name="'+name+'" placeholder="" />';
						}
						else if(index == 3)
						{
							row.insertCell(index).innerHTML= '<input style="display:none;" type="text" value="create" />';
							
							//row.insertCell(index).innerHTML='<select disabled="true" name="custanswer" id="custanswer"><option value="0">Yes</option><option value="1">No</option></select>';
						}
						else
						{
							row.insertCell(index).innerHTML='<input type="text" onClick="javascript:callclickTodial(this.id)" class="code" id="'+table.rows[0].cells[index].innerText+rowCount+'" name="'+name+'" value=""  placeholder="'+table.rows[0].cells[index].innerText+'" />';
						}
						
					}
					else
					{
						
						row.insertCell(index).innerHTML=rowCount;
					}
				});
	});
	$('body').on('focusout', '#myTableData tr td input[type=text]', function(e) {
	
		if (e.which == 0)
		{
			if($(this)[0].name == ph_colname)
			{
				// 03/04/08/09 it is the beginning of the phone
				// About cell phone 054/050/052/058
				var cellphoneNummber =$(this)[0].value;
				intRegexCell = /^0([23489])[ -/]?\d{7}$/;
				intMobileRegex = /^05([01234895])[ -/]?\d{7}$/
				if((!intRegexCell.test(cellphoneNummber)) && (!intMobileRegex.test(cellphoneNummber)))
				{
					alert('מספר הטלפון אינו תקין');
					 phonecheckcount++;
				return false;
				} else {
						if (phonecheckcount > 0) {
							
							phonecheckcount--;
						}

				}					
				
				//alert($(this)[0].value);
			}
		}
	});
	
	$('body').on('click', 'a.phone', function() {
			//if($(this).closest("tr").prevObject[0].name == "PhoneNumber")
			if($(this)[0].name == ph_colname)
			{
		    	var selectedphone = $(this).text();  
				// var id = $(this).attr('id');
			 myAuthentication.then(function(result){

					var xhr = new XMLHttpRequest();
				xhr.withCredentials = true;
				
				xhr.addEventListener("readystatechange", function () {
				if (this.readyState === 4) {
					var incPhoneResult = JSON.parse(this.responseText);
				//	var config = JSON.parse(incPhoneResult.items[0].rows[0]);
					//var incPhoneID = config;
						var incPhoneID=0;
						
					if (incPhoneResult.items[0].count > 0) {
					
						var config = JSON.parse(incPhoneResult.items[0].rows[0]);
						incPhoneID = config;
					}
		
						if(selectedphone !="")
						{
							CallNumber(selectedphone,id_number,incidentID, incPhoneID);
							//var phone = $(this).text();
							//alert(row);
							//call click to dial function;
						}
					//if(assetIDexist)
					//{
					//	createAssetdetails(currentrecordId)
					//}
					//console.log(this.responseText);
				}
				});
				
				xhr.open("GET", result['restEndPoint'] + "/connect/latest/queryResults/?query=select ID from CO.IncPhones where phone='" + selectedphone + "' and related_incident=" + incidentID, true);
				xhr.setRequestHeader("Authorization", "Session " + result['sessionToken']);
				xhr.setRequestHeader("content-type", "application/json");
				xhr.setRequestHeader("OSvC-CREST-Application-Context", "This is a valid request for Asset.");
				xhr.setRequestHeader("cache-control", "no-cache");
				
				
				xhr.send();
			 			
		 });
			}
			//var val = row.cells[1].innerHTML;
		});
	//call BUI
	registerworkspace();
	
	});

						
	//call click to dial for new phones
	function callclickTodial(id)
	{
		if(document.getElementById(id).value !='')
		{
			 
			var phone_new = document.getElementById(id).value;
			 myAuthentication.then(function(result){

					var xhr = new XMLHttpRequest();
				xhr.withCredentials = true;
				
				xhr.addEventListener("readystatechange", function () {
				if (this.readyState === 4) {
					var incPhoneResult = JSON.parse(this.responseText);
					var incPhoneID=0;
					
				if (incPhoneResult.items[0].count > 0) {
				
					var config = JSON.parse(incPhoneResult.items[0].rows[0]);
					incPhoneID = config;
				}
				
			     	CallNumber(phone_new,id_number,incidentID, incPhoneID);
				}
				});
				
				xhr.open("GET", result['restEndPoint'] + "/connect/latest/queryResults/?query=select ID from CO.IncPhones where phone='" + phone_new + "' and related_incident=" + incidentID, true);
				xhr.setRequestHeader("Authorization", "Session " + result['sessionToken']);
				xhr.setRequestHeader("content-type", "application/json");
				xhr.setRequestHeader("OSvC-CREST-Application-Context", "This is a valid request for Asset.");
				xhr.setRequestHeader("cache-control", "no-cache");
				
				
				xhr.send();
			 			
		 });

		
			//alert(document.getElementById(id).value);
		}
			
	}
	
	//ORACLE_SERVICE_CLOUD.extension_loader.load("CUSTOM_APP_ID" , "1")
	//.then(function(extensionProvider)
	//{
	//extensionProvider.registerWorkspaceExtension(function(workspaceRecord)
	//	{
	//	workspaceRecord.addRecordSavingListener(savingdatatoCX);
	//	});
	//});
	
	
let myAuthentication = new Promise(function(resolve, reject){
    ORACLE_SERVICE_CLOUD.extension_loader.load(myAppId,extensibilityApiVersion).then(function(extensionProvider){
		extensionProvider.getGlobalContext().then(function(globalContext){
                _urlrest = globalContext.getInterfaceServiceUrl("REST");
                _accountId = globalContext.getAccountId();
				_interfaceURL= globalContext.interfaceUrl;
				globalContext.getSessionToken().then(
				   function(sessionToken){
                    resolve({'sessionToken': sessionToken,'restEndPoint': _urlrest, 'accountId': _accountId,'interfaceurl':_interfaceURL});
                });
                				
			});
		});
});

function getConfigProperties()
{
	ORACLE_SERVICE_CLOUD.extension_loader.load("CUSTOM_APP_ID", "1")
.then(function(extensionProvider)
  {
	var rowvalues1 = "";
  extensionProvider.getGlobalContext().then(function(globalContext) {
	 	globalContext.getContainerContext().then(function(containerContext) {
	
			containerContext.getProperties(['parentLeadSourceRptID','PhoneStatusID','Condition1DispID','Condition1StatusID','Condition1ElseStatusID','Condition2DispID','Condition2StatusID','Condition3DispID','Condition3StatusID','Condition3ElseDispID','Condition3ElseStatusID']).then(function(collection) {
			   rowvalues1  += collection.get('parentLeadSourceRptID').getValue() + "|";
			    rowvalues1  += collection.get('PhoneStatusID').getValue() + "|";
				 rowvalues1  += collection.get('Condition1DispID').getValue() + "|";
			    rowvalues1  += collection.get('Condition1StatusID').getValue() + "|";
			    rowvalues1  += collection.get('Condition1ElseStatusID').getValue() + "|";
				 rowvalues1  += collection.get('Condition2DispID').getValue() + "|";
				  rowvalues1  += collection.get('Condition2StatusID').getValue() + "|";
			    rowvalues1  += collection.get('Condition3DispID').getValue() + "|";
				 rowvalues1  += collection.get('Condition3StatusID').getValue() + "|";
				  rowvalues1  += collection.get('Condition3ElseDispID').getValue() + "|";
			    rowvalues1  += collection.get('Condition3ElseStatusID').getValue();
			 
			configProperties.push(rowvalues1.split('|'));
    });
  });
});
  });
}

function getlist()
{
	ORACLE_SERVICE_CLOUD.extension_loader.load("CUSTOM_APP_ID", "1")
.then(function(extensionProvider)
  {
  extensionProvider.getGlobalContext().then(function(globalContext) {
    globalContext.getOptListContext().then(function(optListContext) {
      var optListRequest = optListContext.createOptListRequest();
      optListRequest.setOptListId(10158);
      optListRequest.setLimit(100);
      optListContext.getOptList(optListRequest).then(function(optListItem) {
        var currentOptListRequest = optListItem.getOptListRequest();
		if(currentOptListRequest.parent.loadedOptListChildren.length > 0)
		{
			Glb_WScontactdetails = currentOptListRequest.parent.loadedOptListChildren;
			//currentOptListRequest.parent.loadedOptListChildren[0].label
		}
		
		         
        });
      });
    });
  });
}

function registerworkspace()
{
	ORACLE_SERVICE_CLOUD.extension_loader.load(

            myAppId,   

            extensibilityApiVersion            

        ).then(

            //Once your app is registered below logic executes

            function(extensionProvider){

                extensionProvider.registerWorkspaceExtension(

                    function(workspaceRecord){
						try
						{
							var currentWorkspaceObj = workspaceRecord.getCurrentWorkspace();
							
							if(currentWorkspaceObj.objectType == "Incident")
							{
								 incidentID = currentWorkspaceObj.objectId;
								if(incidentID)
								{
									displaytable(incidentID);
																		
																		
								}
								
							}
						}
						catch(err)
						{
							console.log(err.message);
						}
							
											
                    
                        
                    }
					

                );

            }

        );
}
function displaytable(incidentID)
{
	getReportdata(incidentID);

	
}
function getconfigurations()
{
	
	myAuthentication.then(function(result){
		querycsv = "SELECT Value FROM configurations WHERE name ='CUSTOM_CFG_CALLMANGEMENT_LABELS'";

		var xhr = new XMLHttpRequest();
		xhr.withCredentials = true;
		
		xhr.addEventListener("readystatechange", function () {
		if (this.readyState === 4) {
			assetIDexist= JSON.parse(this.responseText);
			var config = JSON.parse(assetIDexist.items[0].rows[0]);
			var phonelable = config.Addphonelbl;
			
			$("#createrow").attr('value', phonelable);
			callmanage_label = config.Callmanagementlbl;
			selection_lbl = config.Selectlbl;
			//if(assetIDexist)
			//{
			//	createAssetdetails(currentrecordId)
			//}
			//console.log(this.responseText);
		}
		});
		
		xhr.open("GET", result['restEndPoint'] + "/connect/latest/queryResults/?query=" + querycsv , true);
		xhr.setRequestHeader("Authorization", "Session " + result['sessionToken']);
		xhr.setRequestHeader("content-type", "application/json");
		xhr.setRequestHeader("OSvC-CREST-Application-Context", "This is a valid request for Asset.");
		xhr.setRequestHeader("cache-control", "no-cache");
		
		
		xhr.send();
	});

}

function getReportdata(incidentID)
{
	//var COactionitem = workspaceRecordEventParameter.event.value;
	myAuthentication.then(function(result){
		//var incidentID = incidentID.toString();
		var data = JSON.stringify({
				"lookupName": "callmanagement",
				"filters": [
					{
					"name": "IncidentID",
					"values": String(incidentID)
					}
				]
				});
		var xhr = new XMLHttpRequest();
		xhr.withCredentials = true;
		xhr.addEventListener("readystatechange", function () {
		if (this.readyState === 4) {
				//console.log(this.responseText);
				var resu=JSON.parse(this.responseText);
				
				//if(resu.columnNames.length > 0)
				//{
				//	while(tablecolumns.length > 0)
				//	{
				//		tablecolumns.pop();
				//	}	
				//	tablecolumns = resu.columnNames;
				//}
				
				var col_row = "<thead><tr>";
					for(var headers = 0;headers < resu.columnNames.length;headers++)
					{
						 if (headers != resu.columnNames.length - 1)
						 {
							var widthVar = resu.columnNames[headers].trim() == "תוצאת השיחה" ? ' style="width:110px;" ' : "";
							col_row += '<th '+widthVar+'> '+ resu.columnNames[headers]+'</th>';
													
						 }
						 else
						 {
							 
							 col_row += '<th style="display:none;"> '+ resu.columnNames[headers]+'</th>';	
						 }
							 
					
							
       
						
					}
					col_row +="</tr></thead><tbody></tbody>";
					$('#myTableData').append(col_row);
				if(resu.rows.length > 0)
				{
					nodata = false;					
					//$('#LeftSidePanel_Call_Management_Tab').css('display','none');
					displaysidepane(true);
					
					//$("#mydata").show();
					
					var table = document.getElementById("myTableData");
					var tableBody = document.getElementById("myTableData").getElementsByTagName('tbody')[0];
					
 
					var rowCount = tableBody.rows.length;
					//rowCount = rowCount - 1;
					var cloumCount = table.rows[0].cells.length;
					
					//var arr = [];				
					//	
					//arr.push(["","9701391669", "Call", "C call result", "good"]);
					//arr.push(["","972548004988", "Email", "C call result", "good"]);
					
					var row = tableBody.insertRow(rowCount);
					rowCount++;
					//var selectlist = $('<select name="options" class="optionscall" style="width: 100%;" id=callresult'+rowCount+'></select>');
					var callstatuschannel_name = [];
					var callstatuschannel_id= [];
					for(var i =0;i< Glb_WScontactdetails.length;i++)
					{
						
						callstatuschannel_name[i] = Glb_WScontactdetails[i].label;
						callstatuschannel_id[i] = Glb_WScontactdetails[i].id;
					}
					rowCount--;
					
				
						var k = 0;
						$.each(resu.rows, function( index, value ) {
							rowCount = rowCount + 1;
							$.each(value, function( index, value1){
								var name = table.rows[0].cells[index].innerText;
								name = name.split(' ').join('');
								
								if(index > 0)
								{
									if(index == 1)
									{
										
										//ID_NumberofCustomer = 12589756;
										
										ph_colname = name;//table.rows[0].cells[index].innerText;
										//row.insertCell(index).innerHTML='<a href="javascript:CallNumber(\''+value1+'\', '+id_number+')" class="phone" id="'+table.rows[0].cells[index].innerText+rowCount+'" name="'+name+'" >'+value1+'</a>'
										row.insertCell(index).innerHTML='<a href="javascript:void(0);" class="phone" id="'+table.rows[0].cells[index].innerText+rowCount+'" name="'+name+'" >'+value1+'</a>'
										
									}
									
									else if(index == 2)
									{
										
										var selectlist = $('<select  name="options" class="optionscall" style="width: 100%;" id=callresult'+k+'></select>');
										$(selectlist).append("<option value='0'> --"+selection_lbl+"--</option>");
										for(var i=0;i<callstatuschannel_name.length;i++){
										
										var option = $("<option/>");
										$(option).val(callstatuschannel_id[i]);
										$(option).html(callstatuschannel_name[i]);
										if(callstatuschannel_name[i] == value1)
										{
											$(option).attr('selected', 'selected');
										}
										
										$(selectlist).append(option);
										}
										row.insertCell(index).innerHTML= selectlist[0].outerHTML;
										k++;
									}
									else if(index == 4)
									{
										row.insertCell(index).innerHTML='<input readonly style="display:none;"  type="text" class="code" id="'+table.rows[0].cells[index].innerText+rowCount+'" name="'+name+'" value="'+value1+'"  placeholder="" />';
									}
									else if(index == 3)
									{
										//row.insertCell(index).innerHTML='<select disabled="true" name="custanswer" id="custanswer"><option value="0">Yes</option><option value="1">No</option></select>';
										if(value1 !="" && value1 !=null )
										{
											row.insertCell(index).innerHTML='<img src="SuccessfullCall.png" style="display: block;width: 25px;width: o auto;margin: 0 auto;height: 25px;">';
										}
										else
										{
											row.insertCell(index).innerHTML='<input readonly style="display:none;"  type="text" />';
										}
										
									}
									else
									{
										row.insertCell(index).innerHTML='<input readonly  type="text" class="code" id="'+table.rows[0].cells[index].innerText+rowCount+'" name="'+name+'" value="'+value1+'"  placeholder="" />';
									}
										
								
									
									
								}
								else
								{
									//row.insertCell(index).innerHTML='<input readonly  type="text" class="code" id="'+table.rows[0].cells[index].innerText+rowCount+'" name="'+name+'" value="'+value1+'"  placeholder="" />';
									row.insertCell(index).innerHTML= value1;//rowCount;
								}
							});
							row = tableBody.insertRow(rowCount);
						});
						//$("#myTableData > tbody").empty();
						
					$("#myTableData").closest("tr").remove();
				}else
				{
					 getallconditionsData(incidentID); 
					//displaytable(incidentID);
					//displaysidepane(false);
					//$("#mydata").hide();
					console.log(resu);
				}
			loadData();
			}
		});
		xhr.open("POST", result['restEndPoint'] +"/connect/v1.4/analyticsReportResults");
		xhr.setRequestHeader("Authorization", "Session " + result['sessionToken']);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.setRequestHeader("OSvC-CREST-Application-Context", "Run report");
		xhr.send(data);
	
	});

}

function getallconditionsData(incidentID)
{
	//var COactionitem = workspaceRecordEventParameter.event.value;
	myAuthentication.then(function(result){
		//var incidentID = incidentID.toString();
		var data = JSON.stringify({
				"lookupName": "callmanagementwithoutcondition",
				"filters": [
					{
					"name": "IncidentID",
					"values": String(incidentID)
					}
				]
				});
		var xhr = new XMLHttpRequest();
		xhr.withCredentials = true;
		xhr.addEventListener("readystatechange", function () {
		if (this.readyState === 4) {
				//console.log(this.responseText);
				var resu=JSON.parse(this.responseText);
				//if(resu.columnNames.length > 0)
				//{
				//	while(tablecolumns.length > 0)
				//	{
				//		tablecolumns.pop();
				//	}	
				//	tablecolumns = resu.columnNames;
				//}
				
				
				if(resu.rows.length > 0)
				{	
					//$('#LeftSidePanel_Call_Management_Tab').css('display','none');
					nodata = false;
					displaysidepane(false);
					closecomplete = false;
					var col_row = "<thead><tr>";
					//for(var headers = 0;headers < resu.columnNames.length;headers++)
					//{
					//	 if (headers != resu.columnNames.length - 1)
					//	 {
					//		var widthVar = resu.columnNames[headers].trim() == "תוצאת השיחה" ? ' style="width:110px;" ' : "";
					//		col_row += '<th '+widthVar+'> '+ resu.columnNames[headers]+'</th>';
					//								
					//	 }
					//	 else
					//	 {
					//		 
					//		 col_row += '<th style="display:none;"> '+ resu.columnNames[headers]+'</th>';	
					//	 }
					//		 
					//
					//		
					//
					//	
					//}
					//col_row +="</tr></thead><tbody></tbody>";					
					//$('#myTableData').append(col_row);
					
					var table = document.getElementById("myTableData");
					var tableBody = document.getElementById("myTableData").getElementsByTagName('tbody')[0];
					
 
					var rowCount = tableBody.rows.length;
					//rowCount = rowCount - 1;
					var cloumCount = table.rows[0].cells.length;
					
					//var arr = [];				
					//	
					//arr.push(["","9701391669", "Call", "C call result", "good"]);
					//arr.push(["","972548004988", "Email", "C call result", "good"]);
					
					var row = tableBody.insertRow(rowCount);
					rowCount++;
					//var selectlist = $('<select name="options" class="optionscall" style="width: 100%;" id=callresult'+rowCount+'></select>');
					var callstatuschannel_name = [];
					var callstatuschannel_id= [];
					for(var i =0;i< Glb_WScontactdetails.length;i++)
					{
						
						callstatuschannel_name[i] = Glb_WScontactdetails[i].label;
						callstatuschannel_id[i] = Glb_WScontactdetails[i].id;
					}
					rowCount--;
					
				
						var k = 0;
						$.each(resu.rows, function( index, value ) {
							rowCount = rowCount + 1;
							$.each(value, function( index, value1){
								var name = table.rows[0].cells[index].innerText;
								name = name.split(' ').join('');
								
								if(index > 0)
								{
									if(index == 1)
									{
										
										//ID_NumberofCustomer = 12589756;
										
										ph_colname = name;//table.rows[0].cells[index].innerText;
										//row.insertCell(index).innerHTML='<a href="javascript:CallNumber(\''+value1+'\', '+id_number+')" class="phone" id="'+table.rows[0].cells[index].innerText+rowCount+'" name="'+name+'" >'+value1+'</a>'
										row.insertCell(index).innerHTML='<a href="javascript:void(0);" class="phone" id="'+table.rows[0].cells[index].innerText+rowCount+'" name="'+name+'" >'+value1+'</a>'
										
									}
									
									else if(index == 2)
									{
										
										var selectlist = $('<select  name="options" class="optionscall" style="width: 100%;" id=callresult'+k+'></select>');
										$(selectlist).append("<option value='0'> --"+selection_lbl+"--</option>");
										for(var i=0;i<callstatuschannel_name.length;i++){
										
										var option = $("<option/>");
										$(option).val(callstatuschannel_id[i]);
										$(option).html(callstatuschannel_name[i]);
										if(callstatuschannel_name[i] == value1)
										{
											$(option).attr('selected', 'selected');
										}
										
										$(selectlist).append(option);
										}
										row.insertCell(index).innerHTML= selectlist[0].outerHTML;
										k++;
									}
									else if(index == 4)
									{
										row.insertCell(index).innerHTML='<input readonly style="display:none;"  type="text" class="code" id="'+table.rows[0].cells[index].innerText+rowCount+'" name="'+name+'" value="'+value1+'"  placeholder="" />';
									}
									else if(index == 3)
									{
										if(value1 !="" && value1 !=null )
										{
											row.insertCell(index).innerHTML='<img src="SuccessfullCall.png" style="display: block;width: 25px;width: o auto;margin: 0 auto;height: 25px;">';
										}
										else
										{
											row.insertCell(index).innerHTML='<input readonly style="display:none;"  type="text" />';
										}
										
										//row.insertCell(index).innerHTML='<select disabled="true" name="custanswer" id="custanswer"><option value="0">Yes</option><option value="1">No</option></select>';
										//row.insertCell(index).innerHTML='<span class="fa fa-star"></span>';
									}
									else
									{
										row.insertCell(index).innerHTML='<input readonly  type="text" class="code" id="'+table.rows[0].cells[index].innerText+rowCount+'" name="'+name+'" value="'+value1+'"  placeholder="" />';
									}
										
								
									
									
								}
								else
								{
									//row.insertCell(index).innerHTML='<input readonly  type="text" class="code" id="'+table.rows[0].cells[index].innerText+rowCount+'" name="'+name+'" value="'+value1+'"  placeholder="" />';
									row.insertCell(index).innerHTML= value1;//rowCount;
								}
							});
							row = tableBody.insertRow(rowCount);
						});
						//$("#myTableData > tbody").empty();
						
					$("#myTableData").closest("tr").remove();
				}else
				{
					//displaytable(incidentID);
					nodata = true;
					displaysidepane(false);
					closecomplete = false;
					//$("#mydata").hide();
					
					console.log(resu);
				}
			
			}
		});
		xhr.open("POST", result['restEndPoint'] +"/connect/v1.4/analyticsReportResults");
		xhr.setRequestHeader("Authorization", "Session " + result['sessionToken']);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.setRequestHeader("OSvC-CREST-Application-Context", "Run report");
		xhr.send(data);
	
	});
}

function savingdatatoCX(workspaceRecordEventParameter)
	{
		//console.log(arr1.sort().toString());
		//console.log(arr2.sort().toString());
 
	 if (phonecheckcount == 0) {
		while(tabledataToMove.length > 0)
		{
			tabledataToMove.pop();
		}				
		
		
		var recordId = workspaceRecordEventParameter.workspaceRecord.getWorkspaceRecordId();
		
		//var ar = $('#myTableData').DataTable().rows().data().toArray();
		var rowvalues = "";
		
		
		
		var $selectors = $("#myTableData tr").each(function(index) {
			
				var dialorder = $(this).find("td:eq(0)").text();
				if(typeof dialorder !== 'undefined' && dialorder !=="")
				{
					rowvalues +=dialorder+'|';
				}
				
				var phoneNumber = $(this).find("td:eq(1) a").text();  //[0].innerText
				if(phoneNumber =="")
				{
					phoneNumber = $(this).find("td:eq(1) input[type='text']").val();
					if($(this).find("td:eq(1) a").length >0)
					{
						phoneNumber = $(this).find("td:eq(1) a")[0].innerText;
					}
					
				}
				if(typeof phoneNumber !== 'undefined' && phoneNumber !=="")
				{
					rowvalues +=phoneNumber+'|';
				}
			
				var selected = $(":selected", this);
				var callresult = selected.val();
				if(typeof callresult !== 'undefined')
				{
					rowvalues +=callresult+'|';
					
				}
				
		
				var CustomerAns = $(this).find("td:eq(3) input[type='text']").val();
				
				if(typeof CustomerAns !== 'undefined')
				{
					//rowvalues +=CustomerAns+'|';
					
				}
				
				var IncphoneID = $(this).find("td:eq(4) input[type='text']").val();
				
				
				if(typeof IncphoneID !== 'undefined')
				{
					if(IncphoneID =='')
					{
						IncphoneID ="create";
					}
					rowvalues +=IncphoneID;
					
						
					
				}
				if(rowvalues.trim()!="")
				{
					//Clear the array
					
					//dialorder|phone|dialstatus|customeranswer|IncphoneID
					tabledataToMove.push(rowvalues.split('|'));
				}
				if(rowvalues.trim())
				{
						rowvalues = "";
				}
				
				rowvalues = "";
		});
			if(tabledataInitial.length > 0) {
   if (tabledataInitial.sort().toString() != tabledataToMove.sort().toString())
	 	{
		if(tabledataToMove.length > 0)
		{
			callFMAPI(tabledataToMove,recordId,workspaceRecordEventParameter);
		}
	 } else {
			 callFMAPI(tabledataToMove,recordId, workspaceRecordEventParameter,1);
	 }
			} else {

			if (tabledataToMove.length > 0)
				{
				   callFMAPI(tabledataToMove,recordId, workspaceRecordEventParameter);
				   
				 
				  
				} else if (tabledataInitial.length > 0 && tabledataInitial.sort().toString() != tabledataToMove.sort().toString())
				{
					 callFMAPI(tabledataToMove,recordId, workspaceRecordEventParameter,1);
				}
			}
				
		} else {
			alert('מספר הטלפון אינו תקין');

		}
	}
	 
	 
	
function callFMAPI(tabledataToMove,recordId, workspaceRecordEventParameter,sameData=0)
{
	myAuthentication.then(function(result){
			$filemanagerpath= result['interfaceurl']+"/php/custom/createincphone.php";
			//https://rnowgse00581.rightnowdemo.com/cgi-bin/rnowgse00581.cfg/php/custom/trainingfm.php?sessionID=$p_sid&contid=$contact.c_id
			var uniqueNames = [];
				tabledataToMove = tabledataToMove.filter((item,index) => tabledataToMove.indexOf(item) === index);
				data = {
						p_sid : result['sessionToken'],
						incidentID : String(recordId),
						Tabledata : tabledataToMove,
						ConfigProperties: configProperties,
						sameDataFlag: sameData
						};	
				$.ajax({  
							type:"POST",  
							url:$filemanagerpath, 
							async:false,
							
							//data:"calculation=yes&feecomponentID="+arr_clone[0]+"&adddisc1="+arr_clone[1]+"&adddisc2="+arr_clone[2], 
										
							data:data,   
							success:function(data)
								{  
 							 var returndata = data;
 							
 							 if (returndata.length > 0 && returndata != "NA" && returndata == "יש לתעד תגובה לכל מספרי הטלפון")
 							 {
								 workspaceRecordEventParameter.getCurrentEvent().cancel();
 							 	alert(returndata);
							    
 							 }
									//Clear the array
									while(tabledataToMove.length > 0)
									{
										tabledataToMove.pop();
									}
									$('#myTableData').empty();
									displaytable(incidentID);									
									
								},
							error: function (jqXHR, exception) {
								//Clear the array
								while(tabledataToMove.length > 0)
								{
									tabledataToMove.pop();
								}	
								alert(jqXHR);
							}	
						});	
		});
}
function workspaceeventslistener()
{ 

		ORACLE_SERVICE_CLOUD.extension_loader.load("CUSTOM_APP_ID" , "1")
	.then(function(extensionProvider)
		{
		extensionProvider.registerWorkspaceExtension(function(workspaceRecord)
			{
				
				//New workspace tab changed 

				//  workspaceRecord.addDataLoadedListener(loadData);
				 
				workspaceRecord.addCurrentEditorTabChangedListener(workspacelaodingevent);
				//Saving workspace
				//workspaceRecord.addRecordSavingListener(savingdatatoCX);
				//Closing current workspace
				//workspaceRecord.addRecordClosingListener(closedevent);
			
			}
		);
		}
	);

}

function workspacelaodingevent(workspaceRecordEventParameter)
{
	var currentWorkspaceObj = workspaceRecordEventParameter.getWorkspaceRecord();
	iids.push(currentWorkspaceObj.getWorkspaceRecordId);

	ORACLE_SERVICE_CLOUD.extension_loader.load("CUSTOM_APP_ID" , "1")
	.then(function(extensionProvider)
		{
		extensionProvider.registerWorkspaceExtension(function(workspaceRecord)
			{
				try
						{
							var currentWorkspaceObj = workspaceRecord.getCurrentWorkspace();
							
							if(currentWorkspaceObj.objectType == "Incident")
							{
								//dataloading Workpace

						  
								
								
								//Saving workspace
								workspaceRecord.addRecordSavingListener(savingdatatoCX);
								//Closing current workspace
								workspaceRecord.addRecordClosingListener(closedevent);
				
								 incidentID = currentWorkspaceObj.objectId;
								if(incidentID)
								{
									workspaceRecord.getFieldValues(['Incident.RefNo','Contact.CO$id_number']).then(function(IFieldDetails)
									{
										incident_ref = 	IFieldDetails.getField('Incident.RefNo').getValue();			
										//$('#lblinc').html(incident_ref);
										id_number = IFieldDetails.getField('Contact.CO$id_number').getValue()
										
										
									});
									
									
									
									
									$('#myTableData').empty();
 
									// 
									
									 myAuthentication.then(function(result){

					var xhr = new XMLHttpRequest();
				xhr.withCredentials = true;
				
				xhr.addEventListener("readystatechange", function () {
				if (this.readyState === 4) {
					var objectType = JSON.parse(this.responseText);
					var objectTypeResult="";
					if (objectType.items[0].count > 0)
					{
						objectTypeResult = objectType.items[0].rows[0][0];
					}
					
					if (objectTypeResult == "Task")
					{
					 ORACLE_SERVICE_CLOUD.extension_loader.load("CUSTOM_APP_ID", "1")
						.then(function(extensionProvider)
							{
							extensionProvider.registerUserInterfaceExtension(function(userInterfaceContext)
								{
								userInterfaceContext.getLeftSidePaneContext().then(function(sidePaneContext)
									{
									sidePaneContext.getSidePane('WCallManagementTab').then(function(sidePane)
										{
											
											sidePane.setLabel(callmanage_label+"\n"+incident_ref);
											
											//sidePane.setVisible(true);
											sidePane.setResizeEnabled(true);
											 sidePane.setVisible(false);
											sidePane.render();
										});
									});
								});
							});
					   
				    }
					else {
						 displaytable(incidentID);
					}
				}
				});
			 
					
				
				xhr.open("GET", result['restEndPoint'] + "/connect/latest/queryResults/?query=select customFields.c.object_type.lookupName from Incidents where id=" + incidentID, true);
				xhr.setRequestHeader("Authorization", "Session " + result['sessionToken']);
				xhr.setRequestHeader("content-type", "application/json");
				xhr.setRequestHeader("OSvC-CREST-Application-Context", "This is a valid request for Asset.");
				xhr.setRequestHeader("cache-control", "no-cache");
				
				
				xhr.send();
			 			
		 });
								
																		
																		
								}
							}
							else
							{
								closecomplete = true;
								displaysidepane(false);
							}
						}
						catch(err)
						{
							console.log(err.message);
						}
			}
		);
		}
	);
	
}

function loadData()
{
//var ar = $('#myTableData').DataTable().rows().data().toArray();
		var rowvalues = "";
			while(tabledataInitial.length > 0)
								{
									tabledataInitial.pop();
								}	
		
		
		var $selectors = $("#myTableData tr").each(function(index) {
			
				var dialorder = $(this).find("td:eq(0)").text();
				if(typeof dialorder !== 'undefined' && dialorder !=="")
				{
					rowvalues +=dialorder+'|';
				}
				
				var phoneNumber = $(this).find("td:eq(1) a").text();  //[0].innerText
				if(phoneNumber =="")
				{
					phoneNumber = $(this).find("td:eq(1) input[type='text']").val();
					if($(this).find("td:eq(1) a").length >0)
					{
						phoneNumber = $(this).find("td:eq(1) a")[0].innerText;
					}
					
				}
				if(typeof phoneNumber !== 'undefined' && phoneNumber !=="")
				{
					rowvalues +=phoneNumber+'|';
				}
			
				var selected = $(":selected", this);
				var callresult = selected.val();
				if(typeof callresult !== 'undefined')
				{
					rowvalues +=callresult+'|';
					
				}
				
		
				var CustomerAns = $(this).find("td:eq(3) input[type='text']").val();
				
				if(typeof CustomerAns !== 'undefined')
				{
					//rowvalues +=CustomerAns+'|';
					
				}
				
				var IncphoneID = $(this).find("td:eq(4) input[type='text']").val();
				
				
				if(typeof IncphoneID !== 'undefined')
				{
					if(IncphoneID =='')
					{
						IncphoneID ="create";
					}
					rowvalues +=IncphoneID;
					
						
					
				}
				if(rowvalues.trim()!="")
				{
					//Clear the array
					
					//dialorder|phone|dialstatus|customeranswer|IncphoneID
					tabledataInitial.push(rowvalues.split('|'));
				}
				if(rowvalues.trim())
				{
						rowvalues = "";
				}
				
				rowvalues = "";
		});

}
function displaysidepane(isDisplay)
{
		 myAuthentication.then(function(result){

					var xhr = new XMLHttpRequest();
				xhr.withCredentials = true;
				
				xhr.addEventListener("readystatechange", function () {
				if (this.readyState === 4) {
					var objectType = JSON.parse(this.responseText);
					var objectTypeResult="";
					if (objectType.items[0].count > 0)
					{
						objectTypeResult = objectType.items[0].rows[0][0];
					}
					
					if (objectTypeResult != "Task")
					{
						ORACLE_SERVICE_CLOUD.extension_loader.load("CUSTOM_APP_ID", "1")
						.then(function(extensionProvider)
							{
							extensionProvider.registerUserInterfaceExtension(function(userInterfaceContext)
								{
								userInterfaceContext.getLeftSidePaneContext().then(function(sidePaneContext)
									{
									sidePaneContext.getSidePane('WCallManagementTab').then(function(sidePane)
										{
											
											sidePane.setLabel(callmanage_label+"\n"+incident_ref);
											
											//sidePane.setVisible(true);
											sidePane.setResizeEnabled(true);
											
											if(isDisplay)
											{
												sidePane.setVisible(isDisplay);
												sidePane.expand();
													
												
											}
											else
											{
												if(closecomplete)
												{
													sidePane.setVisible(isDisplay);
												}
												else
												{
													sidePane.setVisible(true);
												}
												sidePane.collapse();
											}
											
											sidePane.render();
										});
									});
								});
							});
				}
				}
				});
			 
					
				
				xhr.open("GET", result['restEndPoint'] + "/connect/latest/queryResults/?query=select customFields.c.object_type.lookupName from Incidents where id=" + incidentID, true);
				xhr.setRequestHeader("Authorization", "Session " + result['sessionToken']);
				xhr.setRequestHeader("content-type", "application/json");
				xhr.setRequestHeader("OSvC-CREST-Application-Context", "This is a valid request for Asset.");
				xhr.setRequestHeader("cache-control", "no-cache");
				
				
				xhr.send();
			 			
		 });
	
}
function closedevent(param)
{
	var currentWorkspaceObj = param.getWorkspaceRecord();
	//iids.push(currentWorkspaceObj.getWorkspaceRecordId);
	const index = iids.indexOf(currentWorkspaceObj.getWorkspaceRecordId());
if (index > -1) {
  iids.splice(index, 1); // 2nd parameter means remove one item only
}
	closecomplete = true;
	iids = iids.filter((item,index) => iids.indexOf(item) === index);
	if (iids.length == 0)
	{
		displaysidepane(false);
	}
	
}

	
	





		
		