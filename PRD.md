Product Requirements Document (PRD)
1.1 Overview

TrayLite is a TypeScript-based CLI tool that acts as a deterministic planning and orchestration layer on top of AI coding agents.

It converts high-level developer intent into structured execution plans, orchestrates implementation via agents, and verifies that implementation adheres to the original spec.

It is not a coding agent.
It is a control system.

1.2 Problem Statement

AI coding agents:

Hallucinate APIs

Drift from architectural intent

Modify unrelated files

Forget edge cases

Produce inconsistent output across iterations

There is no deterministic planning layer between:
Intent → Code

TrayLite inserts a structured, inspectable, versioned planning layer.

1.3 Target Users

Primary:

Backend engineers using AI coding tools

Teams using AI for feature development

Secondary:

Solo developers building medium/large codebases

AI-first development workflows

1.4 Goals

Convert natural language feature requests into structured plans.

Break work into deterministic phases.

Execute tasks via AI agents with constrained context.

Verify implementation against the plan.

Detect drift and architectural violations.

Support iterative recovery of failed phases.

1.5 Non-Goals

Building a full IDE plugin.

Replacing coding agents.

Acting as a full CI/CD system.

Managing deployments.

1.6 Functional Requirements
FR-1: Plan Generation

Accept natural language input.

Generate structured plan JSON.

Output must conform to schema.

Persist to .traylite/plan.json.

FR-2: Plan Simulation

Analyze file-level changes.

Generate dependency graph.

Detect circular dependencies.

Display impact radius.

FR-3: Execution

Execute phases sequentially.

Provide phase-specific context to agent.

Apply returned file changes.

Track execution state.

FR-4: Verification

Parse AST of modified files.

Validate required functions exist.

Validate planned files were modified.

Detect unplanned file edits.

Produce structured verification report.

FR-5: Diff Engine

Compare:

Planned changes

Actual changes

Produce spec drift report.

FR-6: Recovery

Allow re-execution of failed phase only.

Preserve successful phase state.

FR-7: CLI Commands
traylite init
traylite plan "<feature description>"
traylite simulate
traylite execute
traylite verify
traylite diff
traylite recover <phase-id>

1.7 Non-Functional Requirements

Written entirely in TypeScript.

Node.js 18+ compatible.

Deterministic schema validation.

Clean modular architecture.

Extensible agent abstraction.

Clear CLI output.

Idempotent execution.

1.8 Success Metrics

Plan generation produces valid structured schema.

Drift detection catches >90% missing planned functions.

Execution supports phase-level recovery.

CLI commands complete without manual intervention.
