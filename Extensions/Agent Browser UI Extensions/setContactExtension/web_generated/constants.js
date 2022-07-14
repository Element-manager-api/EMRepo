define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Constants {
    }
    Constants.FIRST_NAME_INDEX = 0;
    Constants.LAST_NAME_INDEX = 1;
    Constants.EMAIL_INDEX = 2;
    Constants.APP_NAME = 'setContactExtension';
    Constants.INFO_LOG_MESSAGE_CONTACT_FIELD_UPDATE = 'Contact field is updated with logged-in account details';
    Constants.INFO_LOG_MSG_CONTACT_FIELD_SET_WITH_EXISTING_CONTACT = 'Existing contact has been found for account';
    Constants.INFO_LOG_MSG_CONTACT_FIELD_SET_WITH_NEW_CONTACT = 'New contact created for account';
    Constants.WARNING_LOG_MSG_CONTACT_FIELD_SET_TO_NULL = 'Contact field is set to Null';
    exports.default = Constants;
});
