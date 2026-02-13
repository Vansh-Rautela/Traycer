export type ErrorCode =
  | 'INIT_FAILED' | 'PLAN_GENERATION_FAILED' | 'PLAN_VALIDATION_FAILED'
  | 'PHASE_EXECUTION_FAILED' | 'VERIFY_FAILED' | 'DRIFT_DETECTED'
  | 'LLM_PROVIDER_ERROR' | 'STORAGE_ERROR' | 'GIT_ERROR'
  | 'STATE_CORRUPTED' | 'INVALID_PHASE_ID' | 'CONTEXT_TOO_LARGE'
  | 'MISSING_PREREQUISITES' | 'PERMISSION_DENIED' | 'NETWORK_ERROR'
  | 'TIMEOUT' | 'INTERNAL_ERROR';

export class TrayLiteError extends Error {
  public readonly timestamp: string;
  constructor(message: string, public readonly code: ErrorCode, public readonly details?: Record<string, unknown>, public readonly originalError?: unknown) {
    super(message);
    this.name = 'TrayLiteError';
    this.timestamp = new Date().toISOString();
    Object.setPrototypeOf(this, TrayLiteError.prototype);
  }
}

export class UserError extends TrayLiteError {
  constructor(message: string, code: ErrorCode = 'INIT_FAILED', details?: Record<string, unknown>) {
    super(message, code, details);
    this.name = 'UserError';
    Object.setPrototypeOf(this, UserError.prototype);
  }
}

export class LLMError extends TrayLiteError {
  constructor(message: string, code: ErrorCode = 'LLM_PROVIDER_ERROR', details?: Record<string, unknown>) {
    super(message, code, details);
    this.name = 'LLMError';
    Object.setPrototypeOf(this, LLMError.prototype);
  }
}

export class StorageError extends TrayLiteError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'STORAGE_ERROR', details);
    this.name = 'StorageError';
    Object.setPrototypeOf(this, StorageError.prototype);
  }
}
