var appName = "Phone_Number_Validator";
var appVersion = "1.0"
var _extProvider, _globalContext, _wsRecord, constants;
var recordID, recordType;
var phHome, phOffice, phMobile, phFax, phAdditional;
var serverProps = [
    "Popup_Heading",
    "Home_Label",
    "Home_Phone_Area_Zones",
    "Home_Phone_Number_Of_Digits",
    "Mobile_Label",
    "Mobile_Phone_Area_Zones",
    "Mobile_Phone_Number_Of_Digits",
    "Fax_Label",
    "Fax_Phone_Area_Zones",
    "Fax_Phone_Number_Of_Digits",
    "Additional_Label",
    "Additional_Phone_Area_Zones",
    "Additional_Phone_Number_Of_Digits",
    "Office_Label",
    "Office_Phone_Area_Zones",
    "Office_Phone_Number_Of_Digits",
    "Msg_Wrong_Area_Code_Error",
    "Msg_Number_Of_Digits_Error",
    "Msg_Wrong_Format_Error",
    "Separator_For_AreaCode_and_Phone",
    "Validate_Home_Phone",
    "Validate_Office_Phone",
    "Validate_Mobile_Phone",
    "Validate_Additional_Phone",
    "Validate_Fax_Phone",
    "Bypass_Validations",
    "Bypass_Validations_Pattern",
    "Apply_RTL"
]
function init() {
    ORACLE_SERVICE_CLOUD.extension_loader.load(appName, appVersion).then(function (extensionProvider) {
        _extProvider = extensionProvider;
        extensionProvider.getGlobalContext().then(function (globalContext) {
            _globalContext = globalContext;
            initializeConstants(globalContext).then(function () {
                if (constants.Apply_RTL) document.dir = "rtl";
                extensionProvider.registerWorkspaceExtension(function (workspaceRecord) {
                    _wsRecord = workspaceRecord;
                    recordID = workspaceRecord.getWorkspaceRecordId();
                    recordType = workspaceRecord.getWorkspaceRecordType();
                    workspaceRecord.addRecordSavingListener(validatePhoneNumbers);
                });
            });
        });
    });
}

function validatePhoneNumbers(wsParam) {
    clearWSErrorList();
    return new Promise(function (resolve, reject) {
        getPhoneNumbers().then(function () {
            var errMsg = [];
            var status = [];
            constants.Validate_Home_Phone ? status.push(validateNumber(phHome, constants.Home_Phone_Number_Of_Digits, constants.Home_Phone_Area_Zones, constants.Home_Label)) : null;
            constants.Validate_Office_Phone ? status.push(validateNumber(phOffice, constants.Office_Phone_Number_Of_Digits, constants.Office_Phone_Area_Zones, constants.Office_Label)) : null;
            constants.Validate_Mobile_Phone ? status.push(validateNumber(phMobile, constants.Mobile_Phone_Number_Of_Digits, constants.Mobile_Phone_Area_Zones, constants.Mobile_Label)) : null;
            constants.Validate_Additional_Phone ? status.push(validateNumber(phAdditional, constants.Additional_Phone_Number_Of_Digits, constants.Additional_Phone_Area_Zones, constants.Additional_Label)) : null;
            constants.Validate_Fax_Phone ? status.push(validateNumber(phFax, constants.Fax_Phone_Number_Of_Digits, constants.Fax_Phone_Area_Zones, constants.Fax_Label)) : null;
            if (status.length < 1) {
                resolve();
            } else {
                var errors = false;
                for (var i = 0; i < status.length; i++) {
                    if (!status[i].pass) {
                        errors = true;
                        errMsg.push(status[i].msg);
                    }
                }
                if (errors) {
                    wsParam.getCurrentEvent().cancel();
                    createPopup(errMsg);
                    resolve();
                } else {
                    resolve();
                    var updateFields = needSeparator();
                    if (updateFields) {
                        updateWSFields().then(function () {
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                }
            }
        });
    });
}

function getPhoneNumbers() {
    return new Promise(function (resolve, reject) {
        _wsRecord.getFieldValues(['Contact.PhOffice', 'Contact.PhMobile', 'Contact.PhHome', 'Contact.PhFax', 'Contact.PhAsst']).then(function (IFieldDetails) {
            phOffice = IFieldDetails.getField('Contact.PhOffice').getLabel() ? IFieldDetails.getField('Contact.PhOffice').getLabel().trim() : null;
            phMobile = IFieldDetails.getField('Contact.PhMobile').getLabel() ? IFieldDetails.getField('Contact.PhMobile').getLabel().trim() : null;
            phHome = IFieldDetails.getField('Contact.PhHome').getLabel() ? IFieldDetails.getField('Contact.PhHome').getLabel().trim() : null;
            phFax = IFieldDetails.getField('Contact.PhFax').getLabel() ? IFieldDetails.getField('Contact.PhFax').getLabel().trim() : null;
            phAdditional = IFieldDetails.getField('Contact.PhAsst').getLabel() ? IFieldDetails.getField('Contact.PhAsst').getLabel().trim() : null;
            resolve();
        });
    });
}

function updateWSFields() {
    return new Promise(function (resolve, reject) {
        phOffice ? _wsRecord.updateFieldByLabel('Contact.PhOffice', phOffice) : null;
        phMobile ? _wsRecord.updateFieldByLabel('Contact.PhMobile', phMobile) : null;
        phHome ? _wsRecord.updateFieldByLabel('Contact.PhHome', phHome) : null;
        phFax ? _wsRecord.updateFieldByLabel('Contact.PhFax', phFax) : null;
        phAdditional ? _wsRecord.updateFieldByLabel('Contact.PhAsst', phAdditional) : null;
        resolve();
    });
}

function validateNumber(phoneNumber, requiredPhoneLength, areaCodes, type) {
    var result = {
        pass: true,
        msg: ""
    }
    if (!phoneNumber || !areaCodes || !requiredPhoneLength) {
        return result;
    }
    if (constants.Bypass_Validations) {
        var possiblePatterns = constants.Bypass_Validations_Pattern.split(",");
        for (var i = 0; i < possiblePatterns.length; i++) {
            possiblePatterns[i] = possiblePatterns[i].trim();
        }
        if (inArray(phoneNumber, possiblePatterns)) {
            return result;
        }
    }
    var validCodes = areaCodes.split(",");
    var areaCodeRange = getAreaCodeRange(validCodes);
    if (phoneNumber.split(constants.Separator_For_AreaCode_and_Phone).length > 1) {
        var regexPattern = "^(\\d*)" + constants.Separator_For_AreaCode_and_Phone + "(\\d*)$";
        if (!(new RegExp(regexPattern).test(phoneNumber))) {
            result = {
                pass: false,
                msg: constants.Msg_Wrong_Format_Error.replace("[TYPE]", type).replace("[NUMBER]", requiredPhoneLength)
            }
            return result;
        }
        var givenCode = phoneNumber.split(constants.Separator_For_AreaCode_and_Phone)[0];
        var givenLength = phoneNumber.split(constants.Separator_For_AreaCode_and_Phone)[1].length;
        if (givenLength != requiredPhoneLength) {
            result = {
                pass: false,
                msg: constants.Msg_Number_Of_Digits_Error.replace("[NUMBER]", requiredPhoneLength).replace("[TYPE]", type)
            }
        } else {
            var regexPattern = "^(\\d{" + areaCodeRange + "})" + constants.Separator_For_AreaCode_and_Phone + "(\\d{" + requiredPhoneLength + "})$";
            if (new RegExp(regexPattern).test(phoneNumber)) {
                /* for (var i = 0; i < validCodes.length; i++) {
                    validCodes[i] = validCodes[i].trim();
                } */
                if (!inArray(givenCode, validCodes)) {
                    result = {
                        pass: false,
                        msg: constants.Msg_Wrong_Area_Code_Error.replace("[TYPE]", type)
                    }
                }
            } else {
                result = {
                    pass: false,
                    msg: constants.Msg_Wrong_Format_Error.replace("[TYPE]", type).replace("[NUMBER]", requiredPhoneLength)
                }
            }
        }
        return result;
    } else {
        var regexPattern = "^(\\d{" + areaCodeRange + "})(\\d{" + requiredPhoneLength + "})$";
        if (new RegExp(regexPattern).test(phoneNumber)) {
            phoneNumber = addSeparator(phoneNumber, type);
            console.log(phoneNumber);
            var givenCode = phoneNumber.split(constants.Separator_For_AreaCode_and_Phone)[0];
            var givenLength = phoneNumber.split(constants.Separator_For_AreaCode_and_Phone)[1].length;
            if (givenLength != requiredPhoneLength) {
                result = {
                    pass: false,
                    msg: constants.Msg_Number_Of_Digits_Error.replace("[NUMBER]", requiredPhoneLength).replace("[TYPE]", type)
                }
            } else {
                var regexPattern = "^(\\d{" + areaCodeRange + "})" + constants.Separator_For_AreaCode_and_Phone + "(\\d{" + requiredPhoneLength + "})$";
                if (new RegExp(regexPattern).test(phoneNumber)) {
                    /* for (var i = 0; i < validCodes.length; i++) {
                        validCodes[i] = validCodes[i].trim();
                    } */
                    if (!inArray(givenCode, validCodes)) {
                        result = {
                            pass: false,
                            msg: constants.Msg_Wrong_Area_Code_Error.replace("[TYPE]", type)
                        }
                    }
                } else {
                    result = {
                        pass: false,
                        msg: constants.Msg_Wrong_Format_Error.replace("[TYPE]", type).replace("[NUMBER]", requiredPhoneLength)
                    }
                }
            }
        } else {
            result = {
                pass: false,
                msg: constants.Msg_Wrong_Format_Error.replace("[TYPE]", type).replace("[NUMBER]", requiredPhoneLength)
            }
        }
        return result;
    }
    return result;
}

function createPopup(msg) {
    addtoWSErrorList(msg);
    return new Promise(function (resolve, reject) {
        _extProvider.registerUserInterfaceExtension(function (IUserInterfaceContext) {
            IUserInterfaceContext.getModalWindowContext().then(function (IModalWindowContext) {
                var dialogAttr = {
                    dir: (constants.Apply_RTL ? "rtl" : "ltr"),
                    msg: msg
                }
                localStorage.setItem("PhoneNumberValidator_modalInfo", JSON.stringify(dialogAttr));
                var modalWindow = IModalWindowContext.createModalWindow();
                modalWindow.setTitle(constants.Popup_Heading);
                modalWindow.setContentUrl("dialog.html");
                modalWindow.render();
                resolve();
            });
        });
    });
}

function addtoWSErrorList(msg) {
    if (recordID > 0) {
        var ele = parent.document.querySelector('div[data-recordtype="' + recordType + '"][data-recordid="' + recordID + '"]');
        if (ele) {
            ele = ele.querySelector('div[class="validationErrorsPanel"]');
            if (ele) {
                var list = ele.querySelector('ol[class="localValidationErrorList"]');
                if (list) {
                    for (var i = 0; i < msg.length; i++) {
                        var li = document.createElement('li');
                        li.setAttribute('name', recordType + '_li_' + appName + '_' + recordID + '_errMsg');
                        li.setAttribute('tabindex', '0');
                        li.setAttribute('class', 'validationErrorPanelMessage validationErrorPanelLink');
                        li.innerHTML = msg[i];
                        list.appendChild(li);
                        ele.style.display = "block";
                    }
                }
            }
        }
    }
}

function clearWSErrorList() {
    if (recordID > 0) {
        var ele = parent.document.querySelector('div[data-recordtype="' + recordType + '"][data-recordid="' + recordID + '"]');
        if (ele) {
            ele = ele.querySelector('div[class="validationErrorsPanel"]');
            if (ele) {
                var olNode = ele.querySelector('ol[class="localValidationErrorList"]');
                if (olNode && $('li[name="' + recordType + '_li_' + appName + '_' + recordID + '_errMsg"]', olNode).length > 0) {
                    $('li[name="' + recordType + '_li_' + appName + '_' + recordID + '_errMsg"]', olNode).remove();
                    if (olNode.childElementCount < 1) {
                        ele.style.display = "none";
                    }
                }
            }
        }
    }
}

function byPassValidation(phoneNumber) {
    if (constants.Bypass_Validations) {
        var possiblePatterns = constants.Bypass_Validations_Pattern.split(",");
        for (var i = 0; i < possiblePatterns.length; i++) {
            possiblePatterns[i] = possiblePatterns[i].trim();
        }
        if (inArray(phoneNumber, possiblePatterns)) {
            return true;
        }
    }
    return false;
}
function addSeparator(phoneNumber, type) {
    if (phoneNumber && phoneNumber.split(constants.Separator_For_AreaCode_and_Phone).length == 1 && !byPassValidation(phoneNumber)) {
        phoneNumber = phoneNumber.substr(0, phoneNumber.length - 7) + constants.Separator_For_AreaCode_and_Phone + phoneNumber.substr(phoneNumber.length - 7);
        switch (type) {
            case constants.Office_Label: phOffice = phoneNumber; _wsRecord.updateFieldByLabel('Contact.PhOffice', phoneNumber); break;
            case constants.Mobile_Label: phMobile = phoneNumber; _wsRecord.updateFieldByLabel('Contact.PhMobile', phoneNumber); break;
            case constants.Home_Label: phHome = phoneNumber; _wsRecord.updateFieldByLabel('Contact.PhHome', phoneNumber); break;
            case constants.Fax_Label: phFax = phoneNumber; _wsRecord.updateFieldByLabel('Contact.PhFax', phoneNumber); break;
            case constants.Additional_Label: phAdditional = phoneNumber; _wsRecord.updateFieldByLabel('Contact.PhAsst', phoneNumber); break;
        }
        return phoneNumber;
    } else {
        return phoneNumber;
    }
}

function needSeparator() {
    var separatorNeeded = false;
    if (phHome && phHome.split(constants.Separator_For_AreaCode_and_Phone).length == 1 && !byPassValidation(phHome)) {
        phHome = phHome.substr(0, phHome.length - 7) + constants.Separator_For_AreaCode_and_Phone + phHome.substr(phHome.length - 7)
        separatorNeeded = true;
    }
    if (phOffice && phOffice.split(constants.Separator_For_AreaCode_and_Phone).length == 1 && !byPassValidation(phOffice)) {
        phOffice = phOffice.substr(0, phOffice.length - 7) + constants.Separator_For_AreaCode_and_Phone + phOffice.substr(phOffice.length - 7)
        separatorNeeded = true;
    }
    if (phMobile && phMobile.split(constants.Separator_For_AreaCode_and_Phone).length == 1 && !byPassValidation(phMobile)) {
        phMobile = phMobile.substr(0, phMobile.length - 7) + constants.Separator_For_AreaCode_and_Phone + phMobile.substr(phMobile.length - 7)
        separatorNeeded = true;
    }
    if (phFax && phFax.split(constants.Separator_For_AreaCode_and_Phone).length == 1 && !byPassValidation(phFax)) {
        phFax = phFax.substr(0, phFax.length - 7) + constants.Separator_For_AreaCode_and_Phone + phFax.substr(phFax.length - 7)
        separatorNeeded = true;
    }
    if (phAdditional && phAdditional.split(constants.Separator_For_AreaCode_and_Phone).length == 1 && !byPassValidation(phAdditional)) {
        phAdditional = phAdditional.substr(0, phAdditional.length - 7) + constants.Separator_For_AreaCode_and_Phone + phAdditional.substr(phAdditional.length - 7)
        separatorNeeded = true;
    }
    return separatorNeeded;
}

function initializeConstants(globalContext) {
    return new Promise(function (resolve, reject) {
        globalContext.getExtensionContext(appName).then(function (extensionContext) {
            extensionContext.getProperties(serverProps).then(function (collection) {
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

function setConstants(collection) {
    var propertiesJSON = collection.extensionProperiesMap;
    constants = {};
    for (var key in propertiesJSON) {
        constants[key] = propertiesJSON[key].getValue();
    }
    return constants;
}

function getAreaCodeRange(array) {
    var min = Math.min.apply(Math, array.map(function (str) { return str.trim().length; }));
    var max = Math.max.apply(Math, array.map(function (str) { return str.trim().length; }));
    return min + "," + max;
}

function inArray(needle, haystack) {
    var length = haystack.length;
    for (var i = 0; i < length; i++) {
        if (haystack[i].trim() == needle) return true;
    }
    return false;
}