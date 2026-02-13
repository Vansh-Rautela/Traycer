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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIProvider = void 0;
var openai_1 = require("openai");
var base_provider_1 = require("./base-provider");
var error_1 = require("../../utils/error");
var OpenAIProvider = /** @class */ (function (_super) {
    __extends(OpenAIProvider, _super);
    function OpenAIProvider(apiKey) {
        var _this = _super.call(this) || this;
        _this.name = 'openai';
        // Allow passing key explicitly or falling back to env var
        var key = apiKey || process.env.OPENAI_API_KEY;
        if (!key) {
            // We don't throw here to allow instantiation, but validateConfig will fail
            console.warn('OpenAI API Key missing');
        }
        _this.client = new openai_1.default({ apiKey: key });
        return _this;
    }
    OpenAIProvider.prototype.validateConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.client.apiKey) {
                    throw new error_1.LLMError('OpenAI API Key is missing. Set OPENAI_API_KEY environment variable.');
                }
                return [2 /*return*/];
            });
        });
    };
    OpenAIProvider.prototype.generate = function (systemPrompt_1, userPrompt_1) {
        return __awaiter(this, arguments, void 0, function (systemPrompt, userPrompt, options) {
            var model, response, choice, content, error_2;
            var _a, _b, _c, _d, _e;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 2, , 3]);
                        model = options.model || 'gpt-4-turbo-preview';
                        return [4 /*yield*/, this.client.chat.completions.create({
                                model: model,
                                messages: [
                                    { role: 'system', content: systemPrompt },
                                    { role: 'user', content: userPrompt }
                                ],
                                temperature: (_a = options.temperature) !== null && _a !== void 0 ? _a : 0.3, // Default to low temp for determinism
                                max_tokens: (_b = options.maxTokens) !== null && _b !== void 0 ? _b : 4000,
                                response_format: options.responseFormat === 'json' ? { type: 'json_object' } : undefined,
                            })];
                    case 1:
                        response = _f.sent();
                        choice = response.choices[0];
                        content = choice.message.content || '';
                        return [2 /*return*/, {
                                content: content,
                                usage: {
                                    inputTokens: ((_c = response.usage) === null || _c === void 0 ? void 0 : _c.prompt_tokens) || 0,
                                    outputTokens: ((_d = response.usage) === null || _d === void 0 ? void 0 : _d.completion_tokens) || 0,
                                    totalTokens: ((_e = response.usage) === null || _e === void 0 ? void 0 : _e.total_tokens) || 0,
                                },
                                model: response.model,
                                finishReason: choice.finish_reason,
                            }];
                    case 2:
                        error_2 = _f.sent();
                        throw this.createError(error_2, 'Failed to generate completion');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return OpenAIProvider;
}(base_provider_1.BaseLLMProvider));
exports.OpenAIProvider = OpenAIProvider;
