"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMProviderFactory = void 0;
var openai_adapter_1 = require("./openai-adapter");
var anthropic_adapter_1 = require("./anthropic-adapter");
var errors_1 = require("../../utils/errors");
var LLMProviderFactory = /** @class */ (function () {
    function LLMProviderFactory() {
    }
    LLMProviderFactory.create = function (providerName) {
        switch (providerName.toLowerCase()) {
            case 'openai':
                return new openai_adapter_1.OpenAIProvider();
            case 'anthropic':
                return new anthropic_adapter_1.AnthropicProvider();
            default:
                throw new errors_1.LLMError("Unsupported provider: ".concat(providerName), 'LLM_PROVIDER_ERROR', { supported: ['openai', 'anthropic'] });
        }
    };
    return LLMProviderFactory;
}());
exports.LLMProviderFactory = LLMProviderFactory;
