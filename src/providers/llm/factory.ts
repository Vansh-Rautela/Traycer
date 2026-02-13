import { BaseLLMProvider } from './base-provider';
import { OpenAIProvider } from './openai-adapter';
import { AnthropicProvider } from './anthropic-adapter';
import { LLMError } from '../../utils/errors';

export class LLMProviderFactory {
  static create(providerName: string): BaseLLMProvider {
    switch (providerName.toLowerCase()) {
      case 'openai':
        return new OpenAIProvider();
      case 'anthropic':
        return new AnthropicProvider();
      default:
        throw new LLMError(
          `Unsupported provider: ${providerName}`,
          'LLM_PROVIDER_ERROR',
          { supported: ['openai', 'anthropic'] }
        );
    }
  }
}
