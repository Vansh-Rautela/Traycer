import { z } from 'zod';

export const ConfigSchema = z.object({
  provider: z.enum(['openai', 'anthropic']),
  model: z.string().optional(),
  temperature: z.number().min(0).max(1).default(0.7),
  maxTokens: z.number().positive().default(4000),
  architecturalRules: z.array(z.string()).default([]), // Simple strings for V1 constraints
  excludePatterns: z.array(z.string()).default([
    'node_modules/**',
    'dist/**',
    '.git/**',
    'coverage/**'
  ]),
});

export type Config = z.infer<typeof ConfigSchema>;
