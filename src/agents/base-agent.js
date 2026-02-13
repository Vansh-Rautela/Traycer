"use strict";
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
exports.BaseAgent = void 0;
var error_1 = require("../utils/error");
var BaseAgent = /** @class */ (function () {
    function BaseAgent(provider) {
        this.provider = provider;
    }
    /**
     * Public accessor for debugging prompts
     */
    BaseAgent.prototype.getPrompt = function (context) {
        // We return the user prompt as the primary "prompt" for debugging
        // But in reality, we send both system and user prompts to the provider
        return "SYSTEM: ".concat(this.getSystemPrompt(), "\n\nUSER: ").concat(this.getUserPrompt({ context: context }));
    };
    BaseAgent.prototype.invoke = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var systemPrompt, userPrompt, response, parsedContent, validationResult, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        systemPrompt = this.getSystemPrompt();
                        userPrompt = this.getUserPrompt(request);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.provider.generate(systemPrompt, userPrompt, {
                                temperature: (_a = request.temperature) !== null && _a !== void 0 ? _a : 0.1, // Planner needs high determinism
                                maxTokens: request.maxTokens,
                                responseFormat: 'json'
                            })];
                    case 2:
                        response = _b.sent();
                        parsedContent = this.parseJSON(response.content);
                        validationResult = this.getResponseSchema().safeParse(parsedContent);
                        if (!validationResult.success) {
                            throw new error_1.LLMError("Agent response failed schema validation: ".concat(validationResult.error.message), 'LLM_PROVIDER_ERROR', {
                                raw: response.content,
                                errors: validationResult.error.issues
                            });
                        }
                        return [2 /*return*/, {
                                content: validationResult.data,
                                tokensUsed: response.usage.totalTokens,
                                model: response.model,
                                timestamp: new Date().toISOString(),
                                rawOutput: response.content
                            }];
                    case 3:
                        error_2 = _b.sent();
                        if (error_2 instanceof error_1.LLMError)
                            throw error_2;
                        throw new error_1.LLMError('Agent invocation failed', 'INTERNAL_ERROR', { originalError: error_2 });
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    BaseAgent.prototype.validateResponse = function (response) {
        return this.getResponseSchema().safeParse(response).success;
    };
    BaseAgent.prototype.parseJSON = function (text) {
        try {
            // 1. Try direct parse
            return JSON.parse(text);
        }
        catch (_a) {
            // 2. Try extracting from markdown code blocks
            var match = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
            if (match) {
                try {
                    return JSON.parse(match[1]);
                }
                catch (_b) {
                    // Fall through to error
                }
            }
            throw new error_1.LLMError('Failed to parse JSON from LLM response', 'LLM_PROVIDER_ERROR', { raw: text });
        }
    };
    return BaseAgent;
}());
exports.BaseAgent = BaseAgent;
