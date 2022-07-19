var appId = "Multi_Select_BUI";
var apiVersion = "1.0";
var interfaceUrl;
var sesToken;
var _extensionProvider;
var _globalContext;
var recordType, storageRecordType;
var recordId;
var multiSelectParams = new Array();
var activeFlagName;
var activeCheckboxes = new Array();
var savedListenerAdded = false;
var ms_parameter;
var tabFocusNamedEvent, afterSaveNamedEvent;
var properties = ['MANDATORY_TEXT', 'SELECT_ALL_TEXT', 'DESELECT_ALL_TEXT', 'SEARCH_TEXT', 'PLACEHOLDER', 'SELECTED_TEXT', 'NO_OPTIONS', 'DD_SELECT_ALL', 'HIER_DD_checkWithParent', 'HIER_DD_titleWithParent', 'HIER_DD_notViewClickParentTitle', 'HIER_DD_EXPAND_ALL', 'HIER_DD_EXPAND_ALL_TEXT', 'HIER_DD_collapseAllText', 'test']; // Added one unknown property 'test' at the end as there is a bug in product cache logic which will be fixed in future
var s;
var wait_for_other_handler = false;
var recordSavedfromClose = false;
function addinInit() {
	ORACLE_SERVICE_CLOUD.extension_loader.load(appId, apiVersion).then(function (extensionProvider) {
		var rn = new RN();
		extensionProvider.getGlobalContext().then(function (globalContext) {
			_globalContext = globalContext;
			initializeConstants().then(function (constantsCollection) {
				console.log(constantsCollection);
				MultiSelectConstants = constantsCollection;
				interfaceUrl = globalContext.getInterfaceServiceUrl("REST");
				getParam().then(function (param) {
					console.log(param);
					if (!param) return;
					ms_parameter = param[0];
					if (!ms_parameter) return;
					tabFocusNamedEvent = param[1];
					afterSaveNamedEvent = param[2];
					globalContext.getSessionToken().then(function (sessionToken) {
						sesToken = sessionToken;
						console.log(sesToken);
						console.log(interfaceUrl);
						_extensionProvider = extensionProvider;
						var urlPrefix = interfaceUrl + "/connect/latest";
						var selectStatment = "Select * From MultiSelect.MultiSelect where Parameter='" + ms_parameter + "'";
						rn.executeQuery(selectStatment, rn.headers, sessionToken, urlPrefix).then(function (resp) {
							console.log(resp);
							var response = JSON.parse(resp);
							if (response && response.items && response.items.length > 0 && response.items[0].count < 1) {
								console.log("No multi-select setup has been found with parameter: " + ms_parameter);
								ORACLE_SERVICE_CLOUD.extensionResizeHandler.resize(0, 0);
								return;
							}
							var multiSelectData = response.items[0];
							for (var i = 0; i < multiSelectData.columnNames.length; i++) {
								multiSelectParams[multiSelectData.columnNames[i]] = multiSelectData.rows[0][i];
							}
							console.log(multiSelectParams);
							if (Number(multiSelectParams['Active'])) {
								_extensionProvider.registerWorkspaceExtension(function (workspaceRecord) {
									recordType = workspaceRecord.getWorkspaceRecordType();
									recordId = workspaceRecord.getWorkspaceRecordId();
									var viewType = Number(multiSelectParams['ViewType']);
									console.log(recordType);
									storageRecordType = multiSelectParams['TypeFieldName'];
									if (multiSelectParams['ObjectFieldName'] == recordType) {
										ORACLE_SERVICE_CLOUD.extensionResizeHandler.resize(200, 70);
										if (recordId > 0) {
											var objectField = multiSelectParams['ObjectFieldName'].split("$");
											var objectFieldName;
											if (objectField.length == 1) {
												objectFieldName = objectField[0];
											} else if (objectField.length == 2) {
												objectFieldName = objectField[1];
											}
											if (viewType == 3)
												selectStatment = "Select " + multiSelectParams['ActiveFlagName'] + ", " + multiSelectParams['MenuFieldName'] + ".ID as " + multiSelectParams['MenuFieldName'] + " From " + multiSelectParams['StorageCO'] + " where " + objectFieldName + "=" + recordId + " and " + storageRecordType + "='" + ms_parameter + "'";
											else
												selectStatment = "Select " + multiSelectParams['ActiveFlagName'] + ", " + multiSelectParams['MenuFieldName'] + ".LookupName as " + multiSelectParams['MenuFieldName'] + " From " + multiSelectParams['StorageCO'] + " where " + objectFieldName + "=" + recordId + " and " + storageRecordType + "='" + ms_parameter + "'";
											rn.executeQuery(selectStatment, rn.headers, sesToken, urlPrefix).then(function (resp) {
												console.log(resp);
												var response = JSON.parse(resp);
												var data = response.items[0];
												var storageData = new Array();
												var row;
												var activeFlagName = multiSelectParams['ActiveFlagName'];
												for (var i = 0; i < data.rows.length; i++) {
													row = new Array();
													for (var j = 0; j < data.columnNames.length; j++) {
														row[data.columnNames[j]] = data.rows[i][j];
													}
													storageData[i] = row;
												}
												console.log(storageData);

												if (storageData.length > 0) {
													for (var itr = 0; itr < storageData.length; itr++) {
														if (Number(storageData[itr][activeFlagName])) {
															activeCheckboxes.push(storageData[itr][multiSelectParams['MenuFieldName']]);
														}
													}
												}
												console.log(activeCheckboxes);
												selectRenderType(viewType, _globalContext, workspaceRecord, multiSelectParams, activeCheckboxes);
											});
										} else {
											selectRenderType(viewType, _globalContext, workspaceRecord, multiSelectParams, activeCheckboxes);
										}
										workspaceRecord.addRecordClosingListener(custom_close_handler);
										workspaceRecord.addNamedEventListener('closeHandlerAlert', handle_multiple_close_handlers);
										//workspaceRecord.addNamedEventListener('cancelCloseEvent', handle_cancel_close);
										workspaceRecord.addNamedEventListener('recordSavingfromClose', handle_record_saved_from_close);
										workspaceRecord.addNamedEventListener('saveCommandExecuted', handled_saveCommand);
										workspaceRecord.addRecordSavingListener(custom_saving_handler);
										//workspaceRecord.addRecordSavedListener(custom_save_handler);
									}
									else {
										console.log("addin is not in the required object workspace");
										ORACLE_SERVICE_CLOUD.extensionResizeHandler.resize(0, 0);
									}
								});
							} else {
								console.log("addin is not active");
								ORACLE_SERVICE_CLOUD.extensionResizeHandler.resize(0, 0);
							}
						}).catch(function (err) {
							console.log("failed to execute query with parameter: " + ms_parameter);
							console.log(err);
						});
					});
				});
			});
		});
	});
}
var wsConfigProperties = ['Parameter', 'focusNamedEvent', 'afterSave_NamedEvent'];
function getParam() {
	return new Promise(function (resolve, reject) {
		_globalContext.getContainerContext().then(function (containerContext) {
			console.log("inside getContainerContext then");
			containerContext.getProperties(wsConfigProperties).then(function (collection) {
				console.log("inside containerContext then");
				console.log(collection);
				var paramCol = collection.get('Parameter');
				console.log(paramCol);
				console.log(paramCol.getValue());
				var focusNamedEvent = collection.get('focusNamedEvent');
				var afterSave_NamedEvent = collection.get('afterSave_NamedEvent');
				var params_to_return = [];
				params_to_return.push(paramCol.getValue());
				params_to_return.push(focusNamedEvent.getValue());
				params_to_return.push(afterSave_NamedEvent.getValue());
				if (params_to_return && params_to_return.length > 0) {
					console.log("resolving from ws property");
					resolve(params_to_return);
				}
				else {
					resolve(null);
				}
			}).catch(function (err) {
				console.log("inside containerContext catch");
				console.log(err);
				reject(err);
			});
		}).catch(function (err) {
			console.log("inside getContainerContext catch");
			console.log(err);
			reject(err);
		});
	});
}

function initializeConstants() {
	return new Promise(function (resolve, reject) {
		_globalContext.getExtensionContext('MultiSelect').then(function (extensionContext) {
			console.log("inside getExtensionContext then");
			console.log(extensionContext);
			extensionContext.getProperties(properties).then(function (collection) {
				console.log("inside extensionContext then");
				console.log(collection);
				resolve(setConstants(collection));
			}).catch(function (err) {
				console.log("inside extensionContext catch");
				console.log(err);
				reject(err);
			});
		}).catch(function (err) {
			console.log("inside getExtensionContext catch");
			console.log(err);
			reject(err);
		});
	});
}

function selectRenderType(viewType, _globalContext, workspaceRecord, multiSelectParams, activeCheckboxes) {
	if (viewType == 1) {
		renderListView(_globalContext, workspaceRecord, multiSelectParams, activeCheckboxes);
	}
	if (viewType == 2) {
		renderDropdownView(_globalContext, workspaceRecord, multiSelectParams, activeCheckboxes);
	}
	if (viewType == 3) {
		renderHierarchialDropdownView(_globalContext, workspaceRecord, multiSelectParams, activeCheckboxes);
	}
}

function renderListView(_globalContext, workspaceRecord, multiSelectParams, activeCheckboxes) {
	var labelVal = multiSelectParams['FieldLabel'];
	var excludeValues = multiSelectParams['ExcludeValues'] != null ? multiSelectParams['ExcludeValues'].split(",") : new Array();
	var mandatory = Number(multiSelectParams['Mandatory']);
	var viewType = Number(multiSelectParams['ViewType']);
	var menuID = Number(multiSelectParams['MenuID']);
	var menuSource = Number(multiSelectParams['MenuSource']);
	var reportID = Number(multiSelectParams['ReportID']);
	var filterName = multiSelectParams['FilterName'];
	var searchOption = Number(multiSelectParams['SearchOption']);
	var listColumns = Number(multiSelectParams['ListColumns']);
	var dir = Number(multiSelectParams['Direction']);
	activeFlagName = multiSelectParams['ActiveFlagName'];
	setDirection(dir);
	document.body.setAttribute('class', 'listView');
	getOptions(_globalContext, menuID, menuSource, reportID, filterName).then(function (optListItems) {
		console.log(optListItems);
		var lg = document.createElement('legend');
		if (mandatory)
			lg.innerHTML = labelVal + '&nbsp;&nbsp;<span class="oj-label-required-icon oj-component-icon" role="img" title="Required" aria-label="Required"></span>';
		else
			lg.innerHTML = labelVal;
		var fs = document.createElement('fieldset');
		fs.setAttribute('id', 'fsEl');
		fs.appendChild(lg);
		var selectAllNode = document.createElement('a');
		selectAllNode.setAttribute('href', '#');
		selectAllNode.setAttribute('class', 'ms-selectall global');
		selectAllNode.innerText = MultiSelectConstants.SELECT_ALL_TEXT;
		fs.append(selectAllNode);
		var opt, label;
		var counter = 1;
		var megadiv = document.createElement('div');
		if (listColumns > 1) {
			megadiv.style = "display:flex";
		}
		var optCounter = 0;
		var optCheckedCounter = 0;
		for (var i = 0; i < optListItems.length; i++) {
			if (!(inArray(optListItems[i]['LookupName'], excludeValues)) || (inArray(optListItems[i]['LookupName'], activeCheckboxes))) {

				opt = document.createElement('input');
				opt.setAttribute('type', 'checkbox');
				opt.setAttribute('id', optListItems[i]['ID']);
				opt.setAttribute('value', optListItems[i]['LookupName']);
				if (inArray(optListItems[i]['LookupName'], activeCheckboxes)) {
					opt.setAttribute('checked', true);
					opt.setAttribute('class', 'listViewCB selected');
					optCheckedCounter++;
				}
				else {
					opt.setAttribute('class', 'listViewCB');
				}
				label = document.createElement('label');
				label.setAttribute('for', optListItems[i]['ID']);
				label.innerText = optListItems[i]['LookupName'];
				var div = document.createElement('div');
				div.appendChild(opt);
				div.appendChild(label);
				megadiv.appendChild(div);
				if (counter % listColumns == 0) {
					fs.appendChild(megadiv);
					megadiv = document.createElement('div');
					if (listColumns > 1) {
						megadiv.style = "display:flex";
					}
				}
				fs.appendChild(megadiv);
				counter++;
				optCounter++;
			}
		}
		document.getElementById('multiSelectDiv').appendChild(fs);
		if (optCounter == optCheckedCounter) {
			selectAllNode.innerText = MultiSelectConstants.DESELECT_ALL_TEXT;
		}
		resizeExt(300, $('#multiSelectDiv').height() + $('#multiSelectError').height() + 50);
		$('.listViewCB').on('change', function () {
			console.log($(this));
			if ($(this)[0].checked) {
				$(this).addClass('selected');
			}
			else {
				$(this).removeClass('selected');
			}
		});
		$('.ms-selectall').on('click', function () {
			var optionsList = $('#fsEl input[type="checkbox"]');
			if ($(this).hasClass('global')) {
				// check if any selected if so then select them
				if (optionsList.filter(':not(.selected)').length) {
					optionsList.filter(':not(.selected)').trigger('click');
					$(this).html(MultiSelectConstants.DESELECT_ALL_TEXT);
				}
				// deselect everything
				else {
					optionsList.trigger('click');
					$(this).html(MultiSelectConstants.SELECT_ALL_TEXT);
				}
			}
		});
	});
}

function renderDropdownView(_globalContext, workspaceRecord, multiSelectParams, activeCheckboxes) {
	var labelVal = multiSelectParams['FieldLabel'];
	var excludeValues = multiSelectParams['ExcludeValues'] != null ? multiSelectParams['ExcludeValues'].split(",") : new Array();
	var mandatory = Number(multiSelectParams['Mandatory']);
	var viewType = Number(multiSelectParams['ViewType']);
	var menuID = Number(multiSelectParams['MenuID']);
	var menuSource = Number(multiSelectParams['MenuSource']);
	var reportID = Number(multiSelectParams['ReportID']);
	var filterName = multiSelectParams['FilterName'];
	var searchOption = Number(multiSelectParams['SearchOption']);
	var dir = Number(multiSelectParams['Direction']);
	activeFlagName = multiSelectParams['ActiveFlagName'];
	setDirection(dir);
	document.body.setAttribute('class', 'dropdownView');
	getOptions(_globalContext, menuID, menuSource, reportID, filterName).then(function (optListItems) {
		console.log(optListItems);
		var label = document.createElement('label');
		if (mandatory)
			label.innerHTML = labelVal + '&nbsp;&nbsp;<span class="oj-label-required-icon oj-component-icon" role="img" title="Required" aria-label="Required"></span>';
		else
			label.innerHTML = labelVal;
		var select1 = document.createElement('select');
		select1.setAttribute('id', 'selectEl');
		select1.setAttribute('multiple', true);
		var opt;
		for (var i = 0; i < optListItems.length; i++) {
			if (!(inArray(optListItems[i]['LookupName'], excludeValues)) || (inArray(optListItems[i]['LookupName'], activeCheckboxes))) {
				opt = document.createElement('option');
				opt.setAttribute('value', optListItems[i]['LookupName']);
				if (inArray(optListItems[i]['LookupName'], activeCheckboxes)) {
					opt.setAttribute('selected', true);
				}
				opt.innerText = optListItems[i]['LookupName'];
				select1.appendChild(opt);
			}
		}
		document.getElementById('multiSelectDiv').appendChild(label);
		document.getElementById('multiSelectDiv').appendChild(select1);
		if (searchOption) {
			$('#selectEl').multiselect({
				placeholder: MultiSelectConstants.PLACEHOLDER ? MultiSelectConstants.PLACEHOLDER : 'Select options',
				selectAll: MultiSelectConstants.DD_SELECT_ALL ? MultiSelectConstants.DD_SELECT_ALL : false,
				selectAllText: MultiSelectConstants.SELECT_ALL_TEXT ? MultiSelectConstants.SELECT_ALL_TEXT : 'Select All',
				deselectAllText: MultiSelectConstants.DESELECT_ALL_TEXT ? MultiSelectConstants.DESELECT_ALL_TEXT : 'Clear All',
				selectedText: MultiSelectConstants.SELECTED_TEXT ? MultiSelectConstants.SELECTED_TEXT : ' selected',
				search: true,
				searchOptions: {
					'default': MultiSelectConstants.SEARCH_TEXT ? MultiSelectConstants.SEARCH_TEXT : 'Search',
					showOptGroups: false,
					onSearch: function (element) { }
				}
			});
		}
		else {
			$('#selectEl').multiselect({
				placeholder: MultiSelectConstants.PLACEHOLDER ? MultiSelectConstants.PLACEHOLDER : 'Select options',
				selectAll: MultiSelectConstants.DD_SELECT_ALL ? MultiSelectConstants.DD_SELECT_ALL : false,
				selectAllText: MultiSelectConstants.SELECT_ALL_TEXT ? MultiSelectConstants.SELECT_ALL_TEXT : 'Select All',
				deselectAllText: MultiSelectConstants.DESELECT_ALL_TEXT ? MultiSelectConstants.DESELECT_ALL_TEXT : 'Clear All',
				selectedText: MultiSelectConstants.SELECTED_TEXT ? MultiSelectConstants.SELECTED_TEXT : ' selected'
			});
		}
		$('#multiSelectDiv button').on('click', function () {
			var height = 70;
			if ($('.ms-options-wrap > .ms-options:visible').length > 0) {
				height += $('.ms-options-wrap > .ms-options').height();
				if ($('#multiSelectError').html().length > 0) height += $('#multiSelectError').height();
			}
			else {
				if ($('#multiSelectError').html().length > 0) height += $('#multiSelectError').height();
			}
			resizeExt(200, height);
		});

		$(document).off('click.ms-hideopts').on('click.ms-hideopts', function (event) {
			if (!$(event.target).closest('.ms-options-wrap').length) {
				$('.ms-options-wrap > .ms-options:visible').hide();
				var height = 70;
				if ($('#multiSelectError').html().length > 0) height += $('#multiSelectError').height();
				resizeExt(200, height);
			}
		});

		$(window).on('blur', function (event) {
			if (!$(event.target).closest('.ms-options-wrap').length) {
				$('.ms-options-wrap > .ms-options:visible').hide();
				var height = 70;
				if ($('#multiSelectError').html().length > 0) height += $('#multiSelectError').height();
				resizeExt(200, height);
			}
		});

	});
}

function renderHierarchialDropdownView(_globalContext, workspaceRecord, multiSelectParams, activeCheckboxes) {
	var hierarchy = multiSelectParams['HierarchyType'];
	if (hierarchy == null) {
		return;
	}
	hierarchy = Number(hierarchy);
	var hierarchyText;
	if (hierarchy == 1) {
		hierarchyText = 'serviceProducts';
	} else if (hierarchy == 2) {
		hierarchyText = 'serviceCategories';
	} else if (hierarchy == 3) {
		hierarchyText = 'serviceDispositions';
	}
	var labelVal = multiSelectParams['FieldLabel'];
	var excludeValues = multiSelectParams['ExcludeValues'] != null ? multiSelectParams['ExcludeValues'].split(",") : new Array();
	var mandatory = Number(multiSelectParams['Mandatory']);
	var viewType = Number(multiSelectParams['ViewType']);
	var menuID = Number(multiSelectParams['MenuID']);
	var menuSource = Number(multiSelectParams['MenuSource']);
	var reportID = Number(multiSelectParams['ReportID']);
	var filterName = multiSelectParams['FilterName'];
	var searchOption = Number(multiSelectParams['SearchOption']);
	var listColumns = Number(multiSelectParams['ListColumns']);
	var dir = Number(multiSelectParams['Direction']);
	activeFlagName = multiSelectParams['ActiveFlagName'];
	setDirection(dir);
	document.body.setAttribute('class', 'hierDropdownView');
	console.log(excludeValues);
	getHierarchyOptions(hierarchyText, reportID, filterName, excludeValues).then(function (resp) {
		console.log(resp);
		var label = document.createElement('label');
		if (mandatory)
			label.innerHTML = labelVal + '&nbsp;&nbsp;<span class="oj-label-required-icon oj-component-icon" role="img" title="Required" aria-label="Required"></span>';
		else
			label.innerHTML = labelVal;
		document.getElementById('multiSelectDiv').appendChild(label);
		var div1 = document.createElement('div');
		div1.setAttribute('id', 'treeSelectorDiv');
		document.getElementById('multiSelectDiv').appendChild(div1);
		var treeOptions = {};
		if (searchOption) {
			treeOptions['search'] = true;
		}
		$('#treeSelectorDiv').treeSelector(resp, activeCheckboxes, function (e, values) {
			console.info('onChange', e, values);
		},
			treeOptions);
		var $inputBox = $('div.treeSelector-input-box:first');
		var height = $inputBox.length > 0 ? $inputBox.height() + 50 : 75;
		resizeExt(200, height);
		/* if (activeCheckboxes.length > 0 && activeCheckboxes.length < 4) {
			resizeExt(200, 120);
		}
		else {
			resizeExt(200, 75);
		} */
	});
}

function inArray(needle, haystack) {
	var length = haystack.length;
	for (var i = 0; i < length; i++) {
		if (haystack[i].trim() == needle) return true;
	}
	return false;
}

function getOptions(_globalContext, menuID, menuSource, reportID, filterName) {
	return new Promise(function (resolve, reject) {
		if (menuSource == 1) {
			_globalContext.getOptListContext().then(function (optListContext) {
				var optListRequest = optListContext.createOptListRequest();
				optListRequest.setOptListId(menuID);
				optListContext.getOptList(optListRequest).then(function (optListItem) {
					console.log(optListItem);
					var rootOptListItemId = optListItem.getId();
					var optListItems = optListItem.getOptListChildren();
					var optList = new Array();
					for (var i = 0; i < optListItems.length; i++) {
						var opti = new Array();
						opti['LookupName'] = optListItems[i].getLabel();
						opti['ID'] = optListItems[i].getId();
						optList[i] = opti;
					}
					resolve(optList);
				}).catch(function (error) {
					reject(error);
					console.log(error);
				});
			});
		}
		else if (menuSource == 2) {
			var rn = new RN();
			rn.getReport(reportID, filterName, "" + menuID + "").then(function (response) {
				console.log(response);
				var data = response.returnJson;
				var returnData = new Array();
				var row;
				for (var i = 0; i < data.rows.length; i++) {
					row = new Array();
					for (var j = 0; j < data.columnNames.length; j++) {
						row[data.columnNames[j]] = data.rows[i][j];
					}
					returnData[i] = row;
				}
				console.log(returnData);
				resolve(returnData);
			}).catch(function (error) {
				reject(error);
				console.log(error);
			});
		}
	});
}

function getHierarchyOptions(hierarchy, reportID, filterName, excludeValues) {
	return new Promise(function (resolve, reject) {
		var rn = new RN();
		rn.getReport(reportID, filterName, excludeValues).then(function (response) {
			console.log(response);
			var data = response.returnJson;
			var optsData = new Array();
			var row;
			for (var i = 0; i < data.rows.length; i++) {
				row = new Array();
				for (var j = 0; j < data.columnNames.length; j++) {
					row[data.columnNames[j]] = data.rows[i][j];
				}
				optsData[i] = row;
			}
			console.log(optsData);
			var returnData = list_to_tree(optsData);
			console.log(returnData);
			resolve(returnData);
		}).catch(function (error) {
			reject(error);
			console.log(error);
		});
	});
}

function list_to_tree(list) {
	var root = [];
	var checkLvl1Array = checkLvl2Array = checkLvl3Array = checkLvl4Array = checkLvl5Array = checkLvl6Array = [];
	for (var i = 0; i < list.length; i++) {
		if (!(inArray(list[i]['level1_ID'], checkLvl1Array))) {
			checkLvl1Array.push(list[i]['level1_ID']);
			var level1_prod = {
				"id": list[i]['level1_ID'],
				"title": list[i]['level1_LookupName'],
				"value": list[i]['level1_ID'],
			};
			level1_prod['children'] = new Array();
			for (var j = 0; j < list.length; j++) {
				if (level1_prod['id'] == list[j]['level1_ID']) {
					if (list[j]['level2_ID'] && (!inArray(list[j]['level2_ID'], checkLvl2Array))) {
						checkLvl2Array.push(list[j]['level2_ID']);
						var level2_prod = {
							"id": list[j]['level2_ID'],
							"title": list[j]['level2_LookupName'],
							"value": list[j]['level2_ID'],
						};
						level2_prod['children'] = new Array();
						for (var k = 0; k < list.length; k++) {
							if (level2_prod['id'] == list[k]['level2_ID']) {
								if (list[k]['level3_ID'] && (!inArray(list[k]['level3_ID'], checkLvl3Array))) {
									checkLvl3Array.push(list[k]['level3_ID']);
									var level3_prod = {
										"id": list[k]['level3_ID'],
										"title": list[k]['level3_LookupName'],
										"value": list[k]['level3_ID'],
									};
									level3_prod['children'] = new Array();
									for (var z = 0; z < list.length; z++) {
										if (level3_prod['id'] == list[z]['level3_ID']) {
											if (list[z]['level4_ID'] && (!inArray(list[z]['level4_ID'], checkLvl4Array))) {
												checkLvl4Array.push(list[z]['level4_ID']);
												var level4_prod = {
													"id": list[z]['level4_ID'],
													"title": list[z]['level4_LookupName'],
													"value": list[z]['level4_ID'],
												};
												level4_prod['children'] = new Array();
												for (var y = 0; y < list.length; y++) {
													if (level4_prod['id'] == list[y]['level4_ID']) {
														if (list[y]['level5_ID'] && (!inArray(list[y]['level5_ID'], checkLvl5Array))) {
															checkLvl5Array.push(list[y]['level5_ID']);
															var level5_prod = {
																"id": list[y]['level5_ID'],
																"title": list[y]['level5_LookupName'],
																"value": list[y]['level5_ID'],
															};
															level5_prod['children'] = new Array();
															for (var x = 0; x < list.length; x++) {
																if (level5_prod['id'] == list[x]['level5_ID']) {
																	if (list[x]['level6_ID'] && (!inArray(list[x]['level6_ID'], checkLvl6Array))) {
																		checkLvl6Array.push(list[x]['level6_ID']);
																		var level6_prod = {
																			"id": list[x]['level6_ID'],
																			"title": list[x]['level6_LookupName'],
																			"value": list[x]['level6_ID'],
																		};
																		level5_prod['children'].push(level6_prod);
																	}
																}
															}
															level4_prod['children'].push(level5_prod);
														}
													}
												}
												level3_prod['children'].push(level4_prod);
											}
										}
									}
									level2_prod['children'].push(level3_prod);
								}
							}
						}
						level1_prod['children'].push(level2_prod);
					}
				}
			}
			root.push(level1_prod);
		}
	}
	return root;
}

function setDirection(dir) {
	if (dir == 1) {
		document.body.setAttribute('dir', 'ltr');
	}
	else {
		document.body.setAttribute('dir', 'rtl');
	}
}

function resizeExt(width, height) {
	ORACLE_SERVICE_CLOUD.extensionResizeHandler.resize(width, height);
	ORACLE_SERVICE_CLOUD.ExtensionSizeProvider.resizeExtension();
}
var warningMsg = false;
var frameHei;
var saveCommandExecuted = false;
var recordSavingInvoked = false;
function custom_saving_handler(parameter) {
	console.log(parameter);
	console.log(multiSelectParams);
	var mandatory = Number(multiSelectParams['Mandatory']);
	var viewType = Number(multiSelectParams['ViewType']);
	var validateSuccess = false;
	if (viewType == 1) {
		validateSuccess = validateListView(mandatory);
		if (validateSuccess) {
			recordSavingInvoked = true;
			afterSaveEventFired = false;
			$('#multiSelectError').html('');
			if ($('#multiSelectDiv fieldset').hasClass("validationfail")) {
				$('#multiSelectDiv fieldset').removeClass('validationfail')
			};
			if (warningMsg) {
				resizeExt(300, frameHei - 5);
				warningMsg = false;
			}
			frameHei = parseFloat(window.frameElement.parentElement.style.height);
			if (!savedListenerAdded) {
				parameter.workspaceRecord.addRecordSavedListener(custom_save_handler);
				savedListenerAdded = true;
			}
			if (recordSavedfromClose && !saveCommandExecuted) {
				//saveCommandExecuted=true;
				parameter.workspaceRecord.triggerNamedEvent('saveCommandExecuted');
				parameter.workspaceRecord.executeEditorCommand('Save');
			}
		}
		else {
			if (!$('#multiSelectDiv fieldset').hasClass("validationfail")) {
				$('#multiSelectDiv fieldset').addClass('validationfail')
			};
			var el = '<div id="oj-message-error" class="oj-message oj-message-error"><i class="fa fa-exclamation-circle" aria-hidden="true" style="color: red;"></i><span class="oj-message-content"><div class="oj-message-summary">' + multiSelectParams['FieldLabel'] + MultiSelectConstants.MANDATORY_TEXT + '</div></span></div>';
			$('#multiSelectError').html(el);
			warningMsg = true;
			frameHei = parseFloat(window.frameElement.parentElement.style.height);
			ORACLE_SERVICE_CLOUD.ExtensionSizeProvider.resizeExtension();
			parameter.getCurrentEvent().cancel();
			if (tabFocusNamedEvent) parameter.workspaceRecord.triggerNamedEvent(tabFocusNamedEvent);
		}
	}
	if (viewType == 2) {
		validateSuccess = validateDropdownView(mandatory);
		if (validateSuccess) {
			recordSavingInvoked = true;
			afterSaveEventFired = false;
			if ($('#multiSelectDiv button').hasClass("validationfail")) {
				$('#multiSelectDiv button').removeClass('validationfail')
			};
			$('#multiSelectError').html('');
			resizeExt(200, 70);
			if (!savedListenerAdded) {
				parameter.workspaceRecord.addRecordSavedListener(custom_save_handler);
				savedListenerAdded = true;
			}
			if (recordSavedfromClose && !saveCommandExecuted) {
				//saveCommandExecuted=true;
				parameter.workspaceRecord.triggerNamedEvent('saveCommandExecuted');
				parameter.workspaceRecord.executeEditorCommand('Save');
			}
		}
		else {
			if (!$('#multiSelectDiv button').hasClass("validationfail")) {
				$('#multiSelectDiv button').addClass('validationfail')
			};
			var el = '<div id="oj-message-error" class="oj-message oj-message-error"><i class="fa fa-exclamation-circle" aria-hidden="true" style="color: red;"></i><span class="oj-message-content"><div class="oj-message-summary">' + multiSelectParams['FieldLabel'] + MultiSelectConstants.MANDATORY_TEXT + '</div></span></div>';
			$('#multiSelectError').html(el);
			resizeExt(200, 100);
			parameter.getCurrentEvent().cancel();
			if (tabFocusNamedEvent) parameter.workspaceRecord.triggerNamedEvent(tabFocusNamedEvent);
		}
	}
	if (viewType == 3) {
		validateSuccess = validateHierarchyDropdownView(mandatory);
		if (validateSuccess) {
			recordSavingInvoked = true;
			afterSaveEventFired = false;
			if ($('#multiSelectDiv .treeSelector-input-box').hasClass("validationfail")) {
				$('#multiSelectDiv .treeSelector-input-box').removeClass('validationfail')
			};
			$('#multiSelectError').html('');
			if (!savedListenerAdded) {
				parameter.workspaceRecord.addRecordSavedListener(custom_save_handler);
				savedListenerAdded = true;
			}
			if (recordSavedfromClose && !saveCommandExecuted) {
				//saveCommandExecuted=true;
				parameter.workspaceRecord.triggerNamedEvent('saveCommandExecuted');
				parameter.workspaceRecord.executeEditorCommand('Save');
			}
		}
		else {
			if (!$('#multiSelectDiv .treeSelector-input-box').hasClass("validationfail")) {
				$('#multiSelectDiv .treeSelector-input-box').addClass('validationfail')
			};
			var el = '<div id="oj-message-error" class="oj-message oj-message-error"><i class="fa fa-exclamation-circle" aria-hidden="true" style="color: red;"></i><span class="oj-message-content"><div class="oj-message-summary">' + multiSelectParams['FieldLabel'] + MultiSelectConstants.MANDATORY_TEXT + '</div></span></div>';
			$('#multiSelectError').html(el);
			ORACLE_SERVICE_CLOUD.ExtensionSizeProvider.resizeExtension();
			parameter.getCurrentEvent().cancel();
			if (tabFocusNamedEvent) parameter.workspaceRecord.triggerNamedEvent(tabFocusNamedEvent);
		}
	}
}
var numberOfOptions, processedOptions, wsRecord;
function custom_save_handler(parameter) {
	console.log(parameter);
	console.log(multiSelectParams);
	recordId = parameter.workspaceRecord.getWorkspaceRecordId();
	wsRecord = parameter.workspaceRecord;
	var rn = new RN();
	var obj = multiSelectParams['StorageCO'];
	var objRelated = multiSelectParams['ObjectFieldName'].split("$").length == 2 ? multiSelectParams['ObjectFieldName'].split("$")[1] : multiSelectParams['ObjectFieldName'];
	var objMenu = multiSelectParams['MenuFieldName'];
	var queryParams = [];
	var urlPrefix = interfaceUrl + "/connect/latest";
	var data;
	var mandatory = Number(multiSelectParams['Mandatory']);
	var viewType = Number(multiSelectParams['ViewType']);
	if (viewType == 1) {
		if (recordId > 0) {
			var uncheckAction = Number(multiSelectParams['UncheckAction']);
			numberOfOptions = $('#multiSelectDiv input[type="checkbox"]').length;
			processedOptions = 0;
			$('#multiSelectDiv input[type="checkbox"]').each(function () {
				var checkBoxValue = $(this).val();
				var checked = $(this)[0].checked;
				if (inArray(checkBoxValue, activeCheckboxes)) {
					if (!checked) {
						console.log("checkbox with id " + checkBoxValue + " was initially checked but set to false, hence uncheckAction will take place");
						//doUncheckAction
						uncheckActiveCheckbox(viewType, uncheckAction, obj, objRelated, objMenu, urlPrefix, recordId, checkBoxValue, queryParams).then(function (response) {
							console.log(response);
							//processedOptions++;
							//checkForSaveCompletion(processedOptions, numberOfOptions, parameter.workspaceRecord);
						});
					} else {
						console.log("checkbox with id " + checkBoxValue + " was initially checked but set to true only again, hence no action");
						processedOptions++;
						checkForSaveCompletion(processedOptions, numberOfOptions);
					}
				} else {
					if (checked) {
						//insertObj
						console.log("checkbox with id " + checkBoxValue + " was initially NOT checked but set to true, hence insert new record action");
						setCheckBoxActive(viewType, obj, objMenu, urlPrefix, objRelated, recordId, checkBoxValue, queryParams).then(function (response) {
							console.log(response);
							//processedOptions++;
							//checkForSaveCompletion(processedOptions, numberOfOptions, parameter.workspaceRecord);
						});
					} else {
						console.log("checkbox with id " + checkBoxValue + " was initially NOT checked but set to false only, hence no action");
						processedOptions++;
						checkForSaveCompletion(processedOptions, numberOfOptions);
					}
				}
				console.log(activeCheckboxes);
			});
		}
		else {
			if (!savedListenerAdded) {
				parameter.workspaceRecord.addRecordSavedListener(custom_save_handler);
				savedListenerAdded = true;
			}
		}
		if (recordSavedfromClose) {
			recordSavingInvoked = false;
			parameter.workspaceRecord.closeEditor();
		}
	}
	if (viewType == 2) {
		if (recordId > 0) {
			var uncheckAction = Number(multiSelectParams['UncheckAction']);
			numberOfOptions = $('#multiSelectDiv li').length;
			processedOptions = 0;
			$('#multiSelectDiv li').each(function () {
				var checkBoxValue = $(this).children().children().val();
				var checked = $(this).children().children()[0].checked;
				if (inArray(checkBoxValue, activeCheckboxes)) {
					if (!checked) {
						console.log("checkbox with id " + checkBoxValue + " was initially checked but set to false, hence uncheckAction will take place");
						//doUncheckAction
						uncheckActiveCheckbox(viewType, uncheckAction, obj, objRelated, objMenu, urlPrefix, recordId, checkBoxValue, queryParams).then(function (response) {
							console.log(response);
							//processedOptions++;
							//checkForSaveCompletion(processedOptions, numberOfOptions, parameter.workspaceRecord);
						});
					} else {
						console.log("checkbox with id " + checkBoxValue + " was initially checked but set to true only again, hence no action");
						processedOptions++;
						checkForSaveCompletion(processedOptions, numberOfOptions);
					}
				} else {
					if (checked) {
						//insertObj
						console.log("checkbox with id " + checkBoxValue + " was initially NOT checked but set to true, hence insert new record action");
						setCheckBoxActive(viewType, obj, objMenu, urlPrefix, objRelated, recordId, checkBoxValue, queryParams).then(function (response) {
							console.log(response);
							//processedOptions++;
							//checkForSaveCompletion(processedOptions, numberOfOptions, parameter.workspaceRecord);
						});
					} else {
						console.log("checkbox with id " + checkBoxValue + " was initially NOT checked but set to false only, hence no action");
						processedOptions++;
						checkForSaveCompletion(processedOptions, numberOfOptions);
					}
				}
				console.log(activeCheckboxes);
			});
		}
		else {
			if (!savedListenerAdded) {
				parameter.workspaceRecord.addRecordSavedListener(custom_save_handler);
				savedListenerAdded = true;
			}
		}
		if (recordSavedfromClose) {
			recordSavingInvoked = false;
			parameter.workspaceRecord.closeEditor();
		}
	}
	if (viewType == 3) {
		if (recordId > 0) {
			var uncheckAction = Number(multiSelectParams['UncheckAction']);
			numberOfOptions = $('#multiSelectDiv input[type="checkbox"]').length;
			processedOptions = 0;
			$('#multiSelectDiv input[type="checkbox"]').each(function () {
				var checkBoxValue = $(this)[0].getAttribute('data-value');
				var checked = $(this)[0].checked;
				if (inArray(checkBoxValue, activeCheckboxes)) {
					if (!checked) {
						console.log("checkbox with id " + checkBoxValue + " was initially checked but set to false, hence uncheckAction will take place");
						//doUncheckAction
						uncheckActiveCheckbox(viewType, uncheckAction, obj, objRelated, objMenu, urlPrefix, recordId, checkBoxValue, queryParams).then(function (response) {
							console.log(response);
							//processedOptions++;
							//checkForSaveCompletion(processedOptions, numberOfOptions, parameter.workspaceRecord);
						});
					} else {
						console.log("checkbox with id " + checkBoxValue + " was initially checked but set to true only again, hence no action");
						processedOptions++;
						checkForSaveCompletion(processedOptions, numberOfOptions);
					}
				} else {
					if (checked) {
						//insertObj
						console.log("checkbox with id " + checkBoxValue + " was initially NOT checked but set to true, hence insert new record action");
						setCheckBoxActive(viewType, obj, objMenu, urlPrefix, objRelated, recordId, checkBoxValue, queryParams).then(function (response) {
							console.log(response);
							//processedOptions++;
							//checkForSaveCompletion(processedOptions, numberOfOptions, parameter.workspaceRecord);
						});
					} else {
						console.log("checkbox with id " + checkBoxValue + " was initially NOT checked but set to false only, hence no action");
						processedOptions++;
						checkForSaveCompletion(processedOptions, numberOfOptions);
					}
				}
				console.log(activeCheckboxes);
			});
		}
		else {
			if (!savedListenerAdded) {
				parameter.workspaceRecord.addRecordSavedListener(custom_save_handler);
				savedListenerAdded = true;
			}
		}
		if (recordSavedfromClose) {
			recordSavingInvoked = false;
			parameter.workspaceRecord.closeEditor();
		}
	}
}

var afterSaveEventFired = false;

function checkForSaveCompletion(processed, total) {
	console.log("processed so far: " + processed);
	console.log("total to process: " + total);
	if (processed == total) {
		console.log("processed equals total");
		if (afterSaveNamedEvent != '' && afterSaveNamedEvent != null && !afterSaveEventFired) {
			afterSaveEventFired = true;
			console.log("afterSaveNamedEvent is set as " + afterSaveNamedEvent + " and will be triggered");
			wsRecord.triggerNamedEvent(afterSaveNamedEvent);
			return;
		} else {
			return;
		}
	} else {
		return;
	}
}

function custom_close_handler(parameter) {
	console.log(ms_parameter + ": inside custom_close_handler");
	console.log(parameter);
	console.log(multiSelectParams);
	recordId = parameter.workspaceRecord.getWorkspaceRecordId();
	console.log(ms_parameter + ": " + recordId);
	console.log(ms_parameter + ": " + wait_for_other_handler);
	if (!wait_for_other_handler) {
		console.log(ms_parameter + ": recordid > 0 and wait_for_other_handler is false, need to check if data changed");
		if (recordSavingInvoked) {
			parameter.getCurrentEvent().cancel();
			parameter.workspaceRecord.triggerNamedEvent('closeHandlerAlert');
			parameter.workspaceRecord.triggerNamedEvent('recordSavingfromClose');
			parameter.workspaceRecord.executeEditorCommand('Save');
		}
	}
}

function handle_multiple_close_handlers(parameter) {
	console.log(ms_parameter + ": inside handle_multiple_close_handlers, setting wait_for_other_handler to true for " + ms_parameter);
	wait_for_other_handler = true;
}

function handle_cancel_close(parameter) {
	console.log(ms_parameter + ": inside handle_cancel_close, setting wait_for_other_handler to false for " + ms_parameter);
	wait_for_other_handler = false;
}

function handle_record_saved_from_close(parameter) {
	console.log(ms_parameter + ": inside handle_record_saved_from_close, setting recordSavedfromClose to true for " + ms_parameter);
	recordSavedfromClose = true;
}

function handled_saveCommand(parameter) {
	console.log(ms_parameter + ": inside handled_saveCommand, setting saveCommandExecuted to true for " + ms_parameter);
	saveCommandExecuted = true;
}

function validateListView(mandatory) {
	if (mandatory) {
		if ($('#multiSelectDiv input[type="checkbox"].selected').length > 0) {
			return true;
		}
		else {
			return false;
		}
	} else {
		return true;
	}
}

function validateDropdownView(mandatory) {
	if (mandatory) {
		if ($('#multiSelectDiv li.selected').length > 0) {
			return true;
		}
		else {
			return false;
		}
	} else {
		return true;
	}
}

function validateHierarchyDropdownView(mandatory) {
	if (mandatory) {
		if ($('#multiSelectDiv input[type="checkbox"].selected').length > 0) {
			return true;
		}
		else {
			return false;
		}
	} else {
		return true;
	}
}

function uncheckActiveCheckbox(viewType, uncheckAction, obj, objRelated, objMenu, urlPrefix, recordId, checkBoxValue, queryParams) {
	return new Promise(function (resolve, reject) {
		var rn = new RN();
		if (viewType == 3)
			var url = urlPrefix + "/" + obj + "?q=" + objRelated + "=" + recordId + " and " + objMenu + ".ID=" + checkBoxValue + " and " + storageRecordType + "='" + ms_parameter + "'";
		else
			var url = urlPrefix + "/" + obj + "?q=" + objRelated + "=" + recordId + " and " + objMenu + ".LookupName='" + checkBoxValue + "' and " + storageRecordType + "='" + ms_parameter + "'";
		performGET(rn.headers, sesToken, url, queryParams).then(function (result) {
			result = JSON.parse(result);
			if (result.items.length > 0) {
				var storageRecordID = result.items[0].id;
				if (uncheckAction == 1) {
					rn.deleteObject(obj, storageRecordID, rn.headers, sesToken, urlPrefix).then(function (response) {
						console.log(response);
						var index = activeCheckboxes.indexOf(checkBoxValue);
						if (index > -1) {
							activeCheckboxes.splice(index, 1);
						}
						processedOptions++;
						checkForSaveCompletion(processedOptions, numberOfOptions);
					}).catch(function (error) {
						reject(error);
						console.log(error);
					});
				}
				else if (uncheckAction == 2) {
					data = {};
					data[activeFlagName] = false;
					rn.updateObject(obj, storageRecordID, data, rn.headers, sesToken, urlPrefix, queryParams).then(function (response) {
						console.log(response);
						var index = activeCheckboxes.indexOf(checkBoxValue);
						if (index > -1) {
							activeCheckboxes.splice(index, 1);
						}
						processedOptions++;
						checkForSaveCompletion(processedOptions, numberOfOptions);
					}).catch(function (error) {
						reject(error);
						console.log(error);
					});
				}
			}

			resolve(activeCheckboxes);
		}).catch(function (error) {
			reject(error);
			console.log(error);
		});
	});
}

function setCheckBoxActive(viewType, obj, objMenu, urlPrefix, objRelated, recordId, checkBoxValue, queryParams) {
	return new Promise(function (resolve, reject) {
		var rn = new RN();
		if (viewType == 3)
			var url = urlPrefix + "/" + obj + "?q=" + objRelated + "=" + recordId + " and " + objMenu + ".ID=" + checkBoxValue + " and " + storageRecordType + "='" + ms_parameter + "'";
		else
			var url = urlPrefix + "/" + obj + "?q=" + objRelated + "=" + recordId + " and " + objMenu + ".LookupName='" + checkBoxValue + "' and " + storageRecordType + "='" + ms_parameter + "'";
		performGET(rn.headers, sesToken, url, queryParams).then(function (result) {
			result = JSON.parse(result);
			if (result.items.length > 0) {
				var storageRecordID = result.items[0].id;
				data = {};
				data[activeFlagName] = true;
				data[storageRecordType] = ms_parameter;
				rn.updateObject(obj, storageRecordID, data, rn.headers, sesToken, urlPrefix, queryParams).then(function (response) {
					console.log(response);
					activeCheckboxes.push(checkBoxValue);
					processedOptions++;
					checkForSaveCompletion(processedOptions, numberOfOptions);
				}).catch(function (error) {
					reject(error);
					console.log(error);
				});
			} else {
				data = {};
				data[activeFlagName] = true;
				data[storageRecordType] = ms_parameter;
				data[objRelated] = { "id": recordId };
				if (viewType == 3)
					data[objMenu] = { "id": Number(checkBoxValue) };
				else
					data[objMenu] = { "lookupName": checkBoxValue };
				rn.insertObject(obj, data, rn.headers, sesToken, urlPrefix, queryParams).then(function (response) {
					console.log(response);
					activeCheckboxes.push(checkBoxValue);
					processedOptions++;
					checkForSaveCompletion(processedOptions, numberOfOptions);
				}).catch(function (error) {
					reject(error);
					console.log(error);
				});
			}
		});
	});
}
