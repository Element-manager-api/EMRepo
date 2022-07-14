/// <reference path = "../libs/osvcExtension.d.ts" />
/// <reference path = "../libs/jquery/JQuery.d.ts"/>
import {UtilClass} from './utilClass';
import {IAccountInfo} from './interfaces/iAccountInfo';
import {IContactResponse} from './interfaces/iContactResponse';
import constants from './constants';
import {LogErrorType} from './enum/logErrorEnum';

class ContactBuilder {
  private extensionProvider: IExtensionProvider;
  private globalContext: IExtensionGlobalContext;

  constructor() {
    this.init();
  }

  private async loadExtensionProvider(): Promise<ORACLE_SERVICE_CLOUD.IExtensionProvider> {
    if (!this.extensionProvider) {
      this.extensionProvider = await ORACLE_SERVICE_CLOUD.extension_loader.load('ContactBuilder');
    }
    return this.extensionProvider;
  }

  private async getAccountDetails(accountId: number, sessionToken: string, restAPIBaseUrl: string): Promise<IAccountInfo> {
    const settings: JQueryAjaxSettings = {
      'url': `${restAPIBaseUrl}/connect/v1.4/queryResults?query=select Name.First,Name.Last,Emails.Address from accounts where ID=${accountId}`,
      'method': 'GET',
      'timeout': 0,
      'headers': {
        'OSvC-crest-application-context': constants.APP_NAME,
        'Authorization': `Session ${sessionToken}`
      }
    };

    const response: any = await $.ajax(settings);
    const accountInfoArray: string[] = response.items[0].rows[0];
    const accountInfo: IAccountInfo = {
      firstName: accountInfoArray[constants.FIRST_NAME_INDEX],
      lastName: accountInfoArray[constants.LAST_NAME_INDEX],
      email: accountInfoArray[constants.EMAIL_INDEX]
    };
    return accountInfo;
  }

  private async init(): Promise<void> {
    try {
      this.extensionProvider = await this.loadExtensionProvider();
      this.globalContext = await this.extensionProvider.getGlobalContext();
      this.extensionProvider.registerWorkspaceExtension(async (workspaceRecord: IWorkspaceRecord) => {
        const accountId: number = this.globalContext.getAccountId();
        const sessionToken: string = await this.globalContext.getSessionToken() as string;
        const restAPIBaseUrl: string = this.globalContext.getInterfaceServiceUrl('REST');
        const accountDetails: IAccountInfo = await this.getAccountDetails(accountId, sessionToken, restAPIBaseUrl);
        const contactId: number = await this.getContactId(accountDetails, sessionToken, restAPIBaseUrl);
        if (contactId !== null) {
          workspaceRecord.updateField('Incident.CId', contactId.toString());
          UtilClass.addExtentionLog(constants.INFO_LOG_MESSAGE_CONTACT_FIELD_UPDATE, LogErrorType.Info);
        } else {
          workspaceRecord.updateField('Incident.CId', null);
          UtilClass.addExtentionLog(constants.WARNING_LOG_MSG_CONTACT_FIELD_SET_TO_NULL, LogErrorType.Warn);
        }
      });
    } catch (error) {
      UtilClass.handleError(error);
    }
  }

  private async getContactId(accountDetails: IAccountInfo, sessionToken: string, restAPIBaseUrl: string): Promise<number> {
    const existingContactDetails: any = await this.getExistingContacts(accountDetails, sessionToken, restAPIBaseUrl);
    if (existingContactDetails.length === 0) {
      const contactId: number = await this.createContact(accountDetails, sessionToken, restAPIBaseUrl);
      UtilClass.addExtentionLog(constants.INFO_LOG_MSG_CONTACT_FIELD_SET_WITH_NEW_CONTACT, LogErrorType.Info);
      return contactId;
    } else if (existingContactDetails.length === 1) {
      UtilClass.addExtentionLog(constants.INFO_LOG_MSG_CONTACT_FIELD_SET_WITH_EXISTING_CONTACT, LogErrorType.Info);
      return existingContactDetails[0].id;
    } else {
      return null;
    }
  }

  private async createContact(accountDetails: IAccountInfo, sessionToken: string, restAPIBaseUrl: string): Promise<number> {
    const settings: JQueryAjaxSettings = {
      'url': `${restAPIBaseUrl}/connect/v1.4/contacts/`,
      'method': 'POST',
      'timeout': 0,
      'headers': {
        'OSvC-crest-application-context': constants.APP_NAME,
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

    const response: any = await $.ajax(settings);
    return response.id;
  }

  private async getExistingContacts(accountDetails: IAccountInfo, sessionToken: string, restAPIBaseUrl: string): Promise<any> {
    const settings: JQueryAjaxSettings = {
      'url': `${restAPIBaseUrl}/connect/v1.4/contacts/?q=emails.address='${accountDetails.email}'`,
      'method': 'GET',
      'timeout': 0,
      'headers': {
        'OSvC-crest-application-context': constants.APP_NAME,
        'Authorization': `Session ${sessionToken}`
      }
    };

    const response: any = await $.ajax(settings);
    const contactInfos: IContactResponse[] = response.items;
    return contactInfos;
  }
}

export const contactBuilderObject = new ContactBuilder();


