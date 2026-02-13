import path from 'path';
import fs from 'fs/promises';
import { AtomicWriter } from './atomic-writer';
import { ExecutionState, ExecutionStateSchema } from '../types/state';
import { StorageError } from '../utils/error';

const BACKUP_LIMIT = 5;

export class StateManager {
  private readonly statePath: string;
  private readonly backupDir: string;
  private readonly writer: AtomicWriter;

  constructor(rootDir: string) {
    this.statePath = path.join(rootDir, '.traylite', 'state.json');
    this.backupDir = path.join(rootDir, '.traylite', 'backups');
    this.writer = new AtomicWriter();
  }

  async loadState(): Promise<ExecutionState> {
    const data = await this.writer.readJSON(this.statePath);

    if (!data) {
      return this.createDefaultState();
    }

    const result = ExecutionStateSchema.safeParse(data);

    if (!result.success) {
      throw new StorageError('State file corrupted or invalid schema', {
        zodErrors: result.error.errors
      });
    }

    return result.data;
  }

  async saveState(state: ExecutionState): Promise<void> {
    // 1. Validate before writing
    const result = ExecutionStateSchema.safeParse(state);
    if (!result.success) {
      throw new StorageError('Attempted to save invalid state', {
        zodErrors: result.error.errors
      });
    }

    // 2. Create backup of current state if it exists
    await this.createBackup();

    // 3. Update timestamp
    const updatedState = {
      ...state,
      updatedAt: new Date().toISOString()
    };

    // 4. Atomic write
    await this.writer.writeJSON(this.statePath, updatedState);
  }

  async resetState(): Promise<void> {
    await this.saveState(this.createDefaultState());
  }

  private createDefaultState(): ExecutionState {
    return {
      planId: null,
      status: 'idle',
      currentPhase: null,
      completedPhases: [],
      failedPhases: [],
      startedAt: null,
      updatedAt: new Date().toISOString(),
      completedAt: null
    };
  }

  private async createBackup(): Promise<void> {
    const exists = await this.writer.exists(this.statePath);
    if (!exists) return;

    try {
      await fs.mkdir(this.backupDir, { recursive: true });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(this.backupDir, `state-${timestamp}.json`);

      // Copy current state to backup
      const data = await this.writer.readJSON(this.statePath);
      await this.writer.writeJSON(backupPath, data);

      // Rotate backups
      await this.rotateBackups();
    } catch (error) {
      // Backup failure should not block main execution, but we should log it
      console.warn('Failed to create state backup:', error);
    }
  }

  private async rotateBackups(): Promise<void> {
    const files = await fs.readdir(this.backupDir);
    const backups = files.filter(f => f.startsWith('state-') && f.endsWith('.json'));

    if (backups.length <= BACKUP_LIMIT) return;

    // Sort by name (which contains timestamp) ascending
    backups.sort();

    // Delete oldest
    const toDelete = backups.slice(0, backups.length - BACKUP_LIMIT);
    for (const file of toDelete) {
      await fs.unlink(path.join(this.backupDir, file));
    }
  }
}
