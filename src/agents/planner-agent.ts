import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid'; // You need to install uuid: npm install uuid @types/uuid
import { BaseAgent } from './base-agent';
import { AgentRole, AgentRequest } from '../types/agent';
import { Plan, PlanSchema, PhaseSchema, PlanMetadataSchema } from '../types/plan';
import { PLANNER_SYSTEM_PROMPT, PLANNER_USER_PROMPT } from './prompts/planner-prompts';

// The LLM output schema is a subset of the full PlanSchema
// We don't ask the LLM for IDs or Dates to avoid hallucinations/inconsistencies
const PlannerOutputSchema = z.object({
  intent: z.string(),
  phases: z.array(PhaseSchema.omit({ dependencies: true })
    .extend({ dependencies: z.array(z.string()).optional() })), // Optional in input, standardized in output
  metadata: PlanMetadataSchema.omit({ provider: true, model: true }), // System fills these
});

type PlannerOutput = z.infer<typeof PlannerOutputSchema>;

export class PlannerAgent extends BaseAgent<PlannerOutput> {
  readonly role: AgentRole = 'planner';

  getSystemPrompt(): string {
    return PLANNER_SYSTEM_PROMPT;
  }

  getUserPrompt(request: AgentRequest): string {
    // Extract file list from context for the prompt
    const fileList = request.context.projectFiles.map(f => f.path);
    return PLANNER_USER_PROMPT(request.context.architecture.structure[0] || "New Project", fileList);
    // Note: In real usage, we pass the actual intent string differently or embedded in context.
    // For V1, let's assume 'intent' is passed via a specialized request property 
    // or we'll define a specialized PlannerRequest type.
  }

  // To properly support the specific signature for prompts, we might need to override invoke 
  // or adjust the prompt generation. For strict adherence to BaseAgent, we assume 
  // 'intent' is passed in the request.context or similar.
  // CORRECT APPROACH: We will create a specialized method for the public API.

  getResponseSchema() {
    return PlannerOutputSchema;
  }

  /**
   * Specialized entry point for the Planner
   */
  async generatePlan(intent: string, context: AgentRequest['context']): Promise<Plan> {
    // 1. Construct the prompt dynamically
    const userPrompt = PLANNER_USER_PROMPT(intent, context.projectFiles.map(f => f.path));

    // 2. Invoke LLM via BaseAgent logic
    // We override the getUserPrompt locally by passing the constructed string via a trick 
    // or by refactoring BaseAgent. To keep it clean, we'll implement the generation logic here 
    // calling this.provider directly if needed, BUT reusing BaseAgent.invoke is better.

    // Let's rely on the BaseAgent.invoke but we need to ensure getUserPrompt has access to 'intent'.
    // We will attach intent to the context for this call.
    const request: AgentRequest = {
      context: { ...context, architecture: { ...context.architecture, structure: [intent] } }, // Hack: passing intent in structure for now, or we extend AgentContext
      temperature: 0.2,
      maxTokens: 4000
    };

    // Better: Refactor getUserPrompt to read from a standardized place. 
    // Since AgentRequest is strict, we will interpret `context.existingCode['__INTENT__']` as intent.
    const augmentedContext = {
      ...context,
      existingCode: { ...context.existingCode, '__INTENT__': intent }
    };

    const response = await this.invoke({ ...request, context: augmentedContext });
    const output = response.content;

    // 3. Hydrate the Plan (Add System Metadata)
    const planId = uuidv4();
    const now = new Date().toISOString();

    const fullPlan: Plan = {
      id: planId,
      createdAt: now,
      updatedAt: now,
      intent: output.intent,
      phases: output.phases.map((p, index) => ({
        ...p,
        // Ensure dependencies are sequential if not provided
        dependencies: p.dependencies || (index > 0 ? [`phase-${index}`] : []),
        // Ensure IDs are normalized
        id: p.id || `phase-${index + 1}`
      })),
      metadata: {
        ...output.metadata,
        provider: this.provider.name,
        model: response.model
      }
    };

    return fullPlan;
  }

  // Implementation of abstract method for BaseAgent
  override getUserPrompt(request: AgentRequest): string {
    const intent = request.context.existingCode['__INTENT__'] || 'No intent provided';
    const fileList = request.context.projectFiles.map(f => f.path);
    return PLANNER_USER_PROMPT(intent, fileList);
  }
}
