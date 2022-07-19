function setConstants(collection){
	console.log("inside setConstants function");
	console.log(collection);
	var MultiSelectConstants = {};
	var propertiesJSON = collection.extensionProperiesMap;
    for (var key in propertiesJSON) {
		MultiSelectConstants[key] = propertiesJSON[key].getValue() ? propertiesJSON[key].getValue() : null;
    }
    console.log(MultiSelectConstants);
    return MultiSelectConstants;
	/*var MANDATORY_TEXT = collection.get('MANDATORY_TEXT') ? collection.get('MANDATORY_TEXT').getValue() : null;
	var SELECT_ALL_TEXT = collection.get('SELECT_ALL_TEXT') ? collection.get('SELECT_ALL_TEXT').getValue() : null;
	var DESELECT_ALL_TEXT = collection.get('DESELECT_ALL_TEXT') ? collection.get('DESELECT_ALL_TEXT').getValue() : null;
	var SEARCH_TEXT = collection.get('SEARCH_TEXT') ? collection.get('SEARCH_TEXT').getValue() : null;
	var PLACEHOLDER = collection.get('PLACEHOLDER') ? collection.get('PLACEHOLDER').getValue() : null;
	var SELECTED_TEXT = collection.get('SELECTED_TEXT') ? collection.get('SELECTED_TEXT').getValue() : null;
	var NO_OPTIONS = collection.get('NO_OPTIONS') ? collection.get('NO_OPTIONS').getValue() : null;
	var DD_SELECT_ALL = collection.get('DD_SELECT_ALL') ? collection.get('DD_SELECT_ALL').getValue() : null;
	var HIER_DD_checkWithParent = collection.get('HIER_DD_checkWithParent') ? collection.get('HIER_DD_checkWithParent').getValue() : null;
	var HIER_DD_titleWithParent = collection.get('HIER_DD_titleWithParent') ? collection.get('HIER_DD_titleWithParent').getValue() : null;
	var HIER_DD_notViewClickParentTitle = collection.get('HIER_DD_notViewClickParentTitle') ? collection.get('HIER_DD_notViewClickParentTitle').getValue() : null;
	var HIER_DD_EXPAND_ALL = collection.get('HIER_DD_EXPAND_ALL') ? collection.get('HIER_DD_EXPAND_ALL').getValue() : null;
	var HIER_DD_EXPAND_ALL_TEXT = collection.get('HIER_DD_EXPAND_ALL_TEXT') ? collection.get('HIER_DD_EXPAND_ALL_TEXT').getValue() : null;
	var HIER_DD_collapseAllText = collection.get('HIER_DD_collapseAllText') ? collection.get('HIER_DD_collapseAllText').getValue() : null;
	const MultiSelectConstants = {
		'MANDATORY_TEXT' : MANDATORY_TEXT,
		'LV_SELECT_ALL_TEXT' : SELECT_ALL_TEXT,
		'LV_DESELECT_ALL_TEXT' : DESELECT_ALL_TEXT,
		'DD_SEARCH_TEXT' : SEARCH_TEXT,
		'DD_SELECT_ALL_TEXT' : SELECT_ALL_TEXT,
		'DD_DESELECT_ALL_TEXT' : DESELECT_ALL_TEXT,
		'DD_PLACEHOLDER' : PLACEHOLDER,
		'DD_SELECT_ALL' : DD_SELECT_ALL,
		'DD_SELECTED_TEXT' : SELECTED_TEXT,
		'DD_MIN_HEIGHT' : 100,
		'HIER_DD_SEARCH_TEXT' : SEARCH_TEXT,
		'HIER_DD_PLACEHOLDER' : PLACEHOLDER,
		'HIER_DD_SELECTED_TEXT' : SELECTED_TEXT,
		'HIER_DD_NO_OPTIONS' : NO_OPTIONS,
		'HIER_DD_MIN_HEIGHT' : 200,
		'HIER_DD_checkWithParent' : HIER_DD_checkWithParent,
		'HIER_DD_titleWithParent' : HIER_DD_titleWithParent,
		'HIER_DD_notViewClickParentTitle' : HIER_DD_notViewClickParentTitle,
		'HIER_DD_EXPAND_ALL' : HIER_DD_EXPAND_ALL,
		'HIER_DD_EXPAND_ALL_TEXT' : HIER_DD_EXPAND_ALL_TEXT,
		'collapseAllText' : HIER_DD_collapseAllText
	};
	return MultiSelectConstants;*/
}

function getModalHTML(ms_param, fieldLabel){
	var modalWindowHTML = '<div id="'+ms_param+'_div-modal" style="display:none"><div class="header"><span>Data Modified</span><a href="javascript:void(0);" title="Close" class="modal-close">x</a></div><div class="message">Do you wish to save your changes for '+fieldLabel+'?</div><div class="buttons"><div class="cancel simplemodal-close">Cancel</div><div class="no">No</div><div class="yes">Yes</div></div></div>';
	return modalWindowHTML;
}

function getModalCSS(ms_param){
	var modalWindowCSS = "<div id='"+ms_param+"_overlayCSS'><style>" +
		"#"+ms_param+"_div-modal {direction: rtl;}" +
		"#"+ms_param+"_confirm-overlay {background: hsl(0, 0%, 0%);}" +
		"#"+ms_param+"_confirm-container {overflow: hidden; min-width: 200px; height:auto!important; width:auto!important; text-align:right; box-shadow: 1px 1px 10px 0 hsla(0, 0%, 0%,0.45); background: #fcfcfd; border: 1px solid #cbcccd; border-radius: 1px;}" +
		"#"+ms_param+"_confirm-container .header {border-width: 0 0 1px 0; border-style: solid; position: relative; display: flex; justify-content: space-between; padding: 0.85714rem 0.85714rem 0.85714rem; background-color: #f2f2f3; background-image: none; border-bottom-color: #cbcccd; font-size: 1.42857rem; font-weight: normal; min-height: 2rem;}" +
		"#"+ms_param+"_confirm-container .header span {color: black!important}" +
		"#"+ms_param+"_confirm-container .message { min-height:40px; margin:0 0 12px 0;}" +
		"#"+ms_param+"_confirm-container .buttons {display: flex; flex-direction: row-reverse; justify-content: flex-end; line-height:26px; width:160px; float:right; padding: 0.85714rem;} " +
		"#"+ms_param+"_confirm-container .buttons div {float:right; margin-left:4px; width:70px; height:26px; text-align:center; border:1px solid; border-radius: 2px; cursor:pointer; background-color: #ededee; background-image: none; border-color: #cbcccd; color: black; box-shadow: none; text-shadow: none; margin-bottom: 4px; font-size: 1rem;} " +
		"#"+ms_param+"_confirm-container a.modal-close, #confirm-container a.modal-close:link, #confirm-container a.modal-close:active, #confirm-container a.modal-close:visited {text-decoration:none; font-weight:normal; color:#8a8d8f; padding:0 4px 2px 4px; border-color: transparent; border: 1px solid transparent;}" +
		"#"+ms_param+"_confirm-container a.modal-close:hover {color:#02629f; background-color: #f7f7f8; border-color: #cbcccd; box-shadow:none; border: 1px solid #cbcccd;}" +
		"</style></div>";
	return modalWindowCSS;
}
