import { z } from 'zod';
import { Plan, Phase } from './plan';

// --- Schemas for I/O ---

export const AgentRoleSchema = z.enum(['planner', 'implementer', 'reviewer']);

export const ConstraintSchema = z.object({
  type: z.enum(['NO_NEW_DEPENDENCIES', 'USE_EXISTING_PATTERN', 'SECURITY', 'PERFORMANCE']),
  description: z.string(),
  enforcementLevel: z.enum(['required', 'preferred', 'suggestion']),
});

// --- Interfaces (Contracts) ---

export type AgentRole = z.infer<typeof AgentRoleSchema>;
export type Constraint = z.infer<typeof ConstraintSchema>;

export interface FileInfo {
  path: string;
  content?: string; // Content loaded lazily or partially
  exists: boolean;
}

export interface ArchitectureInfo {
  dependencies: Record<string, string>;
  projectType: 'typescript'; // V1 constraint
  structure: string[]; // List of file paths
}

export interface AgentContext {
  projectFiles: FileInfo[];
  existingCode: Record<string, string>;
  architecture: ArchitectureInfo;
  phase?: Phase;            // For Implementer/Reviewer
  previousPhases?: Phase[]; // Execution history
}

export interface AgentRequest {
  context: AgentContext;
  constraints?: Constraint[];
  maxTokens?: number;
  temperature?: number;
}

export interface AgentResponse<T = unknown> {
  content: T;
  tokensUsed: number;
  model: string;
  timestamp: string;
  validationErrors?: string[];
  rawOutput?: string; // For debugging
}

// Strict Interface for Implementation
export interface Agent {
  role: AgentRole;

  /**
   * Generates the prompt string based on context.
   * Useful for debugging prompt engineering separate from execution.
   */
  getPrompt(context: AgentContext): string;

  /**
   * Invokes the LLM and returns structured data.
   */
  invoke(request: AgentRequest): Promise<AgentResponse<unknown>>;

  /**
   * Runtime validation of the LLM output.
   */
  validateResponse(response: unknown): boolean;
}
