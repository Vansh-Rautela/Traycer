"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigSchema = void 0;
var zod_1 = require("zod");
exports.ConfigSchema = zod_1.z.object({
    provider: zod_1.z.enum(['openai', 'anthropic']),
    model: zod_1.z.string().optional(),
    temperature: zod_1.z.number().min(0).max(1).default(0.7),
    maxTokens: zod_1.z.number().positive().default(4000),
    architecturalRules: zod_1.z.array(zod_1.z.string()).default([]), // Simple strings for V1 constraints
    excludePatterns: zod_1.z.array(zod_1.z.string()).default([
        'node_modules/**',
        'dist/**',
        '.git/**',
        'coverage/**'
    ]),
});
