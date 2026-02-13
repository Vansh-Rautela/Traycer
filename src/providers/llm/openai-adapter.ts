import OpenAI from 'openai';
import { BaseLLMProvider, ProviderOptions, ProviderResponse } from './base-provider';
import { LLMError } from '../../utils/error';

export class OpenAIProvider extends BaseLLMProvider {
  readonly name = 'openai';
  private client: OpenAI;

  constructor(apiKey?: string) {
    super();
    // Allow passing key explicitly or falling back to env var
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      // We don't throw here to allow instantiation, but validateConfig will fail
      console.warn('OpenAI API Key missing');
    }
    this.client = new OpenAI({ apiKey: key });
  }

  async validateConfig(): Promise<void> {
    if (!this.client.apiKey) {
      throw new LLMError('OpenAI API Key is missing. Set OPENAI_API_KEY environment variable.');
    }
  }

  async generate(
    systemPrompt: string,
    userPrompt: string,
    options: ProviderOptions = {}
  ): Promise<ProviderResponse> {
    try {
      const model = options.model || 'gpt-4-turbo-preview';

      const response = await this.client.chat.completions.create({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: options.temperature ?? 0.3, // Default to low temp for determinism
        max_tokens: options.maxTokens ?? 4000,
        response_format: options.responseFormat === 'json' ? { type: 'json_object' } : undefined,
      });

      const choice = response.choices[0];
      const content = choice.message.content || '';

      return {
        content,
        usage: {
          inputTokens: response.usage?.prompt_tokens || 0,
          outputTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
        model: response.model,
        finishReason: choice.finish_reason,
      };

    } catch (error) {
      throw this.createError(error, 'Failed to generate completion');
    }
  }
}
