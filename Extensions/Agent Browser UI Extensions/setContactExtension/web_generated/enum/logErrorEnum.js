define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LogErrorType = void 0;
    var LogErrorType;
    (function (LogErrorType) {
        LogErrorType["Error"] = "Error";
        LogErrorType["Warn"] = "Warn";
        LogErrorType["Debug"] = "Debug";
        LogErrorType["Trace"] = "Trace";
        LogErrorType["Info"] = "Info";
    })(LogErrorType = exports.LogErrorType || (exports.LogErrorType = {}));
});
