import { z } from 'zod';
import {
  Agent,
  AgentRole,
  AgentRequest,
  AgentResponse,
  AgentContext
} from '../types/agent';
import { BaseLLMProvider } from '../providers/llm/base-provider';
import { LLMError } from '../utils/error';

export abstract class BaseAgent<T> implements Agent {
  abstract readonly role: AgentRole;

  constructor(protected provider: BaseLLMProvider) { }

  /**
   * Defined by specific agents (Planner, Implementer, etc.)
   */
  abstract getSystemPrompt(): string;
  abstract getUserPrompt(request: AgentRequest): string;
  abstract getResponseSchema(): z.ZodType<T>;

  /**
   * Public accessor for debugging prompts
   */
  getPrompt(context: AgentContext): string {
    // We return the user prompt as the primary "prompt" for debugging
    // But in reality, we send both system and user prompts to the provider
    return `SYSTEM: ${this.getSystemPrompt()}\n\nUSER: ${this.getUserPrompt({ context })}`;
  }

  async invoke(request: AgentRequest): Promise<AgentResponse<T>> {
    const systemPrompt = this.getSystemPrompt();
    const userPrompt = this.getUserPrompt(request);

    try {
      const response = await this.provider.generate(systemPrompt, userPrompt, {
        temperature: request.temperature ?? 0.1, // Planner needs high determinism
        maxTokens: request.maxTokens,
        responseFormat: 'json'
      });

      const parsedContent = this.parseJSON(response.content);

      // Runtime Schema Validation
      const validationResult = this.getResponseSchema().safeParse(parsedContent);

      if (!validationResult.success) {
        throw new LLMError(
          `Agent response failed schema validation: ${validationResult.error.message}`,
          'LLM_PROVIDER_ERROR',
          {
            raw: response.content,
            errors: validationResult.error.issues
          }
        );
      }

      return {
        content: validationResult.data,
        tokensUsed: response.usage.totalTokens,
        model: response.model,
        timestamp: new Date().toISOString(),
        rawOutput: response.content
      };

    } catch (error) {
      if (error instanceof LLMError) throw error;
      throw new LLMError('Agent invocation failed', 'INTERNAL_ERROR', { originalError: error });
    }
  }

  validateResponse(response: unknown): boolean {
    return this.getResponseSchema().safeParse(response).success;
  }

  private parseJSON(text: string): unknown {
    try {
      // 1. Try direct parse
      return JSON.parse(text);
    } catch {
      // 2. Try extracting from markdown code blocks
      const match = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
      if (match) {
        try {
          return JSON.parse(match[1]);
        } catch {
          // Fall through to error
        }
      }
      throw new LLMError('Failed to parse JSON from LLM response', 'LLM_PROVIDER_ERROR', { raw: text });
    }
  }
}
