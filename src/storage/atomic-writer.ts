import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { StorageError } from '../utils/error';

export class AtomicWriter {
  /**
   * atomicWrite
   * Writes data to a temp file then renames it to target to ensure atomicity.
   */
  async writeJSON<T>(filePath: string, data: T): Promise<void> {
    const dir = path.dirname(filePath);
    const tempFile = `${filePath}.${crypto.randomBytes(8).toString('hex')}.tmp`;

    try {
      // Ensure directory exists
      await fs.mkdir(dir, { recursive: true });

      const content = JSON.stringify(data, null, 2);

      // Write to temp file
      await fs.writeFile(tempFile, content, 'utf-8');

      // Atomic rename
      await fs.rename(tempFile, filePath);
    } catch (error) {
      // Clean up temp file if it exists
      try {
        await fs.unlink(tempFile);
      } catch (e) {
        // Ignore unlink errors
      }

      throw new StorageError(`Failed to write atomic JSON to ${filePath}`, {
        originalError: error,
        filePath
      });
    }
  }

  /**
   * readJSON
   * Reads and parses JSON file. Validation is left to the caller via Zod.
   */
  async readJSON(filePath: string): Promise<unknown> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null; // File doesn't exist
      }
      throw new StorageError(`Failed to read JSON from ${filePath}`, {
        originalError: error,
        filePath
      });
    }
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async delete(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw new StorageError(`Failed to delete file ${filePath}`, { originalError: error });
      }
    }
  }
}
