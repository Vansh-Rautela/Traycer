import { z } from 'zod';

// --- Zod Schemas ---

export const ExecutionStatusSchema = z.enum([
  'idle',
  'planning',
  'executing',
  'paused',
  'complete',
  'failed',
]);

export const ErrorInfoSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.string().datetime(),
});

export const PhaseFailureSchema = z.object({
  phaseId: z.string(),
  failedAt: z.string().datetime(),
  error: ErrorInfoSchema,
  retryCount: z.number().int().nonnegative(),
});

export const ExecutionStateSchema = z.object({
  planId: z.string().nullable(),
  status: ExecutionStatusSchema,
  currentPhase: z.string().nullable(),
  completedPhases: z.array(z.string()),
  failedPhases: z.array(PhaseFailureSchema),
  startedAt: z.string().datetime().nullable(),
  updatedAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable(),
});

// --- TypeScript Interfaces ---

export type ExecutionStatus = z.infer<typeof ExecutionStatusSchema>;
export type ErrorInfo = z.infer<typeof ErrorInfoSchema>;
export type PhaseFailure = z.infer<typeof PhaseFailureSchema>;
export type ExecutionState = z.infer<typeof ExecutionStateSchema>;
