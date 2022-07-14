/// <reference path = "../libs/osvcExtension.d.ts"/>
define(["require", "exports", "./enum/logErrorEnum"], function (require, exports, logErrorEnum_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UtilClass = void 0;
    class UtilClass {
        static addExtentionLog(errorMessage, errorType) {
            ORACLE_SERVICE_CLOUD.extension_loader.load('ContactBuilder').then((extensionProvider) => {
                const defaultLogger = extensionProvider.getLogger();
                switch (errorType) {
                    case logErrorEnum_1.LogErrorType.Error:
                        defaultLogger.error(errorMessage);
                        break;
                    case logErrorEnum_1.LogErrorType.Warn:
                        defaultLogger.warn(errorMessage);
                        break;
                    case logErrorEnum_1.LogErrorType.Debug:
                        defaultLogger.debug(errorMessage);
                        break;
                    case logErrorEnum_1.LogErrorType.Trace:
                        defaultLogger.trace(errorMessage);
                        break;
                    default:
                        defaultLogger.warn(errorMessage);
                }
            });
        }
        static handleError(errorMessage) {
            let errorMsg = '';
            if (errorMessage.getDesc) {
                errorMsg = errorMessage.getDesc();
                UtilClass.addExtentionLog(errorMessage.getDesc(), logErrorEnum_1.LogErrorType.Error);
            }
            else {
                errorMsg = errorMessage.message;
                UtilClass.addExtentionLog(errorMessage.message, logErrorEnum_1.LogErrorType.Error);
            }
            throw new Error(errorMsg);
        }
    }
    exports.UtilClass = UtilClass;
});
