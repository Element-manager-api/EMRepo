function getConnections() {

            var extensionName = $("#extensionName:text").val();

			var connectionsDropDown = document.getElementById("ConnectionsList");
			ORACLE_SERVICE_CLOUD.extension_loader.load('ExtensionConnUITest', '34').then(function (extensionProvider) {
		        extensionProvider.getGlobalContext().then(function (globalContext) {
		            globalContext.getExtensionContext(extensionName).then(function (extensionContext) {
		                extensionContext.getConnections().then(function (extensionConnections) {
                            if(extensionConnections && extensionConnections.extensionConnectionsMap) {
                            	var extensionMap = extensionConnections.extensionConnectionsMap;
                            	var connectionNames = Object.keys(extensionMap);
                            	if (connectionNames && connectionNames.length > 0) {
                            		for (conneName of connectionNames) {
                            			var option1 = document.createElement("option");
										option1.text = conneName;
										connectionsDropDown.add(option1);
                            		}
                            	}
                            }
		                });
		            });
		        });
		    });
		}


		function executeRequest() {
		    var connection = $("#ConnectionsList :selected").text();
		    var methodName = $("#HttpMethodsList :selected").text();
		    var extensionName = $("#extensionName:text").val();
		    var relativeUrl = $("#relativeUrl:text").val();
		    var contentType = $("#contentType:text").val(); 
		    var resonseType = $("#resonseType:text").val();
		    var payLoad = $("#payLoad:text").val();
		    var headers = {};

		    var table = $("#myTableBody");
		    var headerTRs = table.find('tr');
		    if (headerTRs) {
		    	var headerTds = table.find('tr').find('td');
		    	if (headerTds) {
		    		var headerInputs = table.find('tr').find('td').find('input');
		    		if (headerInputs) {
		    			headerInputs.each(function(id, elem) {
						  console.log($(this).val());
						  console.log($(this).attr('type'));
						  if ($(this).attr('type') == 'text') {
						  	var controlName = $(this).attr('name');
						  	var headerValues = [];
						  	var index;
                            if (controlName.indexOf('headerName') > -1) {
								index = controlName.replace('headerName', '');
                            } else if(controlName.indexOf('headerValue') > -1) {
                            	index = controlName.replace('headerValue', '');
                            	headerValues = headers[index];
                            }

						  	var controlValue = $(this).val();
						  	if (controlValue) {
						  		headerValues.push(controlValue);
						  	}
						  	

						  	headers[index] = headerValues;

						  }
						})
		    		}

		    	}
		    }


            var headerValuePairs = {};
		    var headerIndexes = Object.keys(headers);
		    if (headerIndexes) {
		   	  for (headerIndex of headerIndexes) {
		   		var headValuesArr = headers[headerIndex];
		   		headerValuePairs[headValuesArr[0]] = headValuesArr[1];
    		  }
		    }
		    console.log(headerValuePairs);

		    if (connection) {

		    	ORACLE_SERVICE_CLOUD.extension_loader.load('ExtensionConnUITest', '34').then(function (extensionProvider) {
			        extensionProvider.getGlobalContext().then(function (globalContext) {
			            globalContext.getExtensionContext(extensionName).then(function (extensionContext) {
			                extensionContext.getConnections(connection).then(function (extensionConnections) {
			                    console.log(extensionConnections);
			                    var extConnRequest = extensionConnections.get(connection);
			                    extConnRequest.open(methodName, relativeUrl);
			                    extConnRequest.setContentType(contentType);
			                    extConnRequest.setResponseType(resonseType);

			                    var headerIndexes = Object.keys(headers);
							    if (headerIndexes) {
							   	  for (headerIndex of headerIndexes) {
							   		var headValuesResultArr = headers[headerIndex];
							   		if (headValuesResultArr.length > 0) {
							   			extConnRequest.addRequestHeader(headValuesResultArr[0],  headValuesResultArr[1]);
							   		}
					    		  }
							    }
							    // var payLoadData;
							    // if (payLoad) {
							    // 	payLoadData = JSON.stringify(payLoad);
							    // }
			                    extConnRequest.send(payLoad).then((response) => {
			                    	console.log(response);
			                    	$("#result").val("");
			                    	$("#result").val(JSON.stringify(response));
			                    }).catch((error) => {
			                    	$("#result").val("");
			                    	console.log(error);
			                    	$("#result").val(JSON.stringify(error));
			                    });
			                });
			            });
			        });
			    });

		    }

		   } 