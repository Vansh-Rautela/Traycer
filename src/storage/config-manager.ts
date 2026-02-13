import path from 'path';
import { AtomicWriter } from './atomic-writer';
import { Config, ConfigSchema } from '../types/config';
import { StorageError } from '../utils/errors';

export class ConfigManager {
  private readonly configPath: string;
  private readonly writer: AtomicWriter;

  constructor(rootDir: string) {
    this.configPath = path.join(rootDir, '.traylite', 'config.json');
    this.writer = new AtomicWriter();
  }

  async loadConfig(): Promise<Config> {
    const data = await this.writer.readJSON(this.configPath);

    // If no config exists, return default (don't write it automatically yet)
    if (!data) {
      // We parse an empty object to trigger default values in schema
      return ConfigSchema.parse({ provider: 'openai' });
    }

    const result = ConfigSchema.safeParse(data);
    if (!result.success) {
      throw new StorageError('Invalid configuration file', { zodErrors: result.error.errors });
    }

    return result.data;
  }

  async saveConfig(config: Config): Promise<void> {
    const result = ConfigSchema.safeParse(config);
    if (!result.success) {
      throw new StorageError('Invalid configuration object', { zodErrors: result.error.errors });
    }
    await this.writer.writeJSON(this.configPath, config);
  }
}
