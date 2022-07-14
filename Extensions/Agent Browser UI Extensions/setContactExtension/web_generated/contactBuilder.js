var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "./utilClass", "./constants", "./enum/logErrorEnum"], function (require, exports, utilClass_1, constants_1, logErrorEnum_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.contactBuilderObject = void 0;
    class ContactBuilder {
        constructor() {
            this.init();
        }
        loadExtensionProvider() {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.extensionProvider) {
                    this.extensionProvider = yield ORACLE_SERVICE_CLOUD.extension_loader.load('ContactBuilder');
                }
                return this.extensionProvider;
            });
        }
        getAccountDetails(accountId, sessionToken, restAPIBaseUrl) {
            return __awaiter(this, void 0, void 0, function* () {
                const settings = {
                    'url': `${restAPIBaseUrl}/connect/v1.4/queryResults?query=select Name.First,Name.Last,Emails.Address from accounts where ID=${accountId}`,
                    'method': 'GET',
                    'timeout': 0,
                    'headers': {
                        'OSvC-crest-application-context': constants_1.default.APP_NAME,
                        'Authorization': `Session ${sessionToken}`
                    }
                };
                const response = yield $.ajax(settings);
                const accountInfoArray = response.items[0].rows[0];
                const accountInfo = {
                    firstName: accountInfoArray[constants_1.default.FIRST_NAME_INDEX],
                    lastName: accountInfoArray[constants_1.default.LAST_NAME_INDEX],
                    email: accountInfoArray[constants_1.default.EMAIL_INDEX]
                };
                return accountInfo;
            });
        }
        init() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    this.extensionProvider = yield this.loadExtensionProvider();
                    this.globalContext = yield this.extensionProvider.getGlobalContext();
                    this.extensionProvider.registerWorkspaceExtension((workspaceRecord) => __awaiter(this, void 0, void 0, function* () {
                        const accountId = this.globalContext.getAccountId();
                        const sessionToken = yield this.globalContext.getSessionToken();
                        const restAPIBaseUrl = this.globalContext.getInterfaceServiceUrl('REST');
                        const accountDetails = yield this.getAccountDetails(accountId, sessionToken, restAPIBaseUrl);
                        const contactId = yield this.getContactId(accountDetails, sessionToken, restAPIBaseUrl);
                        if (contactId !== null) {
                            workspaceRecord.updateField('Incident.CId', contactId.toString());
                            utilClass_1.UtilClass.addExtentionLog(constants_1.default.INFO_LOG_MESSAGE_CONTACT_FIELD_UPDATE, logErrorEnum_1.LogErrorType.Info);
                        }
                        else {
                            workspaceRecord.updateField('Incident.CId', null);
                            utilClass_1.UtilClass.addExtentionLog(constants_1.default.WARNING_LOG_MSG_CONTACT_FIELD_SET_TO_NULL, logErrorEnum_1.LogErrorType.Warn);
                        }
                    }));
                }
                catch (error) {
                    utilClass_1.UtilClass.handleError(error);
                }
            });
        }
        getContactId(accountDetails, sessionToken, restAPIBaseUrl) {
            return __awaiter(this, void 0, void 0, function* () {
                const existingContactDetails = yield this.getExistingContacts(accountDetails, sessionToken, restAPIBaseUrl);
                if (existingContactDetails.length === 0) {
                    const contactId = yield this.createContact(accountDetails, sessionToken, restAPIBaseUrl);
                    utilClass_1.UtilClass.addExtentionLog(constants_1.default.INFO_LOG_MSG_CONTACT_FIELD_SET_WITH_NEW_CONTACT, logErrorEnum_1.LogErrorType.Info);
                    return contactId;
                }
                else if (existingContactDetails.length === 1) {
                    utilClass_1.UtilClass.addExtentionLog(constants_1.default.INFO_LOG_MSG_CONTACT_FIELD_SET_WITH_EXISTING_CONTACT, logErrorEnum_1.LogErrorType.Info);
                    return existingContactDetails[0].id;
                }
                else {
                    return null;
                }
            });
        }
        createContact(accountDetails, sessionToken, restAPIBaseUrl) {
            return __awaiter(this, void 0, void 0, function* () {
                const settings = {
                    'url': `${restAPIBaseUrl}/connect/v1.4/contacts/`,
                    'method': 'POST',
                    'timeout': 0,
                    'headers': {
                        'OSvC-crest-application-context': constants_1.default.APP_NAME,
                        'Authorization': `Session ${sessionToken}`,
                        'Content-Type': 'application/json'
                    },
                    'data': JSON.stringify({
                        'name': {
                            'first': `${accountDetails.firstName}`,
                            'last': `${accountDetails.lastName}`
                        },
                        'emails': [
                            {
                                'address': `${accountDetails.email}`,
                                'addressType': {
                                    'id': 0
                                }
                            }
                        ],
                        'login': `${accountDetails.email}`
                    })
                };
                const response = yield $.ajax(settings);
                return response.id;
            });
        }
        getExistingContacts(accountDetails, sessionToken, restAPIBaseUrl) {
            return __awaiter(this, void 0, void 0, function* () {
                const settings = {
                    'url': `${restAPIBaseUrl}/connect/v1.4/contacts/?q=emails.address='${accountDetails.email}'`,
                    'method': 'GET',
                    'timeout': 0,
                    'headers': {
                        'OSvC-crest-application-context': constants_1.default.APP_NAME,
                        'Authorization': `Session ${sessionToken}`
                    }
                };
                const response = yield $.ajax(settings);
                const contactInfos = response.items;
                return contactInfos;
            });
        }
    }
    exports.contactBuilderObject = new ContactBuilder();
});
