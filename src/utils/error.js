"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationError = exports.StorageError = exports.LLMError = exports.UserError = exports.TrayLiteError = void 0;
var TrayLiteError = /** @class */ (function (_super) {
    __extends(TrayLiteError, _super);
    function TrayLiteError(message, code, details, originalError) {
        var _this = _super.call(this, message) || this;
        _this.code = code;
        _this.details = details;
        _this.originalError = originalError;
        _this.name = 'TrayLiteError';
        _this.timestamp = new Date().toISOString();
        // Maintain prototype chain for instanceof checks
        Object.setPrototypeOf(_this, TrayLiteError.prototype);
        return _this;
    }
    return TrayLiteError;
}(Error));
exports.TrayLiteError = TrayLiteError;
var UserError = /** @class */ (function (_super) {
    __extends(UserError, _super);
    function UserError(message, code, details) {
        if (code === void 0) { code = 'INIT_FAILED'; }
        var _this = _super.call(this, message, code, details) || this;
        _this.name = 'UserError';
        Object.setPrototypeOf(_this, UserError.prototype);
        return _this;
    }
    return UserError;
}(TrayLiteError));
exports.UserError = UserError;
var LLMError = /** @class */ (function (_super) {
    __extends(LLMError, _super);
    function LLMError(message, code, details) {
        if (code === void 0) { code = 'LLM_PROVIDER_ERROR'; }
        var _this = _super.call(this, message, code, details) || this;
        _this.name = 'LLMError';
        Object.setPrototypeOf(_this, LLMError.prototype);
        return _this;
    }
    return LLMError;
}(TrayLiteError));
exports.LLMError = LLMError;
var StorageError = /** @class */ (function (_super) {
    __extends(StorageError, _super);
    function StorageError(message, details) {
        var _this = _super.call(this, message, 'STORAGE_ERROR', details) || this;
        _this.name = 'StorageError';
        Object.setPrototypeOf(_this, StorageError.prototype);
        return _this;
    }
    return StorageError;
}(TrayLiteError));
exports.StorageError = StorageError;
var VerificationError = /** @class */ (function (_super) {
    __extends(VerificationError, _super);
    function VerificationError(message, details) {
        var _this = _super.call(this, message, 'VERIFY_FAILED', details) || this;
        _this.name = 'VerificationError';
        Object.setPrototypeOf(_this, VerificationError.prototype);
        return _this;
    }
    return VerificationError;
}(TrayLiteError));
exports.VerificationError = VerificationError;
