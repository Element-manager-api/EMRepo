/// <reference path = "../libs/osvcExtension.d.ts"/>

import {LogErrorType} from './enum/logErrorEnum';

type IErrorType = IErrorData & Error;


export class UtilClass {
  static addExtentionLog(errorMessage: string, errorType: LogErrorType): void {
    ORACLE_SERVICE_CLOUD.extension_loader.load('ContactBuilder').then((extensionProvider) => {
      const defaultLogger: IExtensionLogger = extensionProvider.getLogger();
      switch (errorType) {
        case LogErrorType.Error:
          defaultLogger.error(errorMessage);
          break;
        case LogErrorType.Warn:
          defaultLogger.warn(errorMessage);
          break;
        case LogErrorType.Debug:
          defaultLogger.debug(errorMessage);
          break;
        case LogErrorType.Trace:
          defaultLogger.trace(errorMessage);
          break;
        default:
          defaultLogger.warn(errorMessage);
      }
    });
  }

  static handleError(errorMessage: IErrorType): void {
    let errorMsg = '';
    if (errorMessage.getDesc) {
      errorMsg = errorMessage.getDesc();
      UtilClass.addExtentionLog(errorMessage.getDesc(), LogErrorType.Error);
    } else {
      errorMsg = errorMessage.message;
      UtilClass.addExtentionLog(errorMessage.message, LogErrorType.Error);
    }
    throw new Error(errorMsg);
  }
}
