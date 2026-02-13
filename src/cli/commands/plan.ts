import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import { ConfigManager } from '../../storage/config-manager';
import { PlanStore } from '../../storage/plan-store';
import { LLMProviderFactory } from '../../providers/llm/factory';
import { PlannerAgent } from '../../agents/planner-agent';
import { AgentContext } from '../../types/agent';

export class PlanCommand {
  register(program: Command): void {
    program
      .command('plan')
      .description('Generate an implementation plan from natural language intent')
      .argument('<intent>', 'Description of the feature to implement')
      .action(async (intent: string) => {
        await this.execute(intent);
      });
  }

  private async execute(intent: string): Promise<void> {
    const spinner = ora('Initializing Planner...').start();
    const rootDir = process.cwd();

    try {
      // 1. Load Config & Dependencies
      const configManager = new ConfigManager(rootDir);
      const config = await configManager.loadConfig();

      const provider = LLMProviderFactory.create(config.provider);
      await provider.validateConfig();

      const planner = new PlannerAgent(provider);
      const planStore = new PlanStore(rootDir);

      // 2. Build Context (Simplified for V1)
      // In a real app, we would scan the file system here
      const context: AgentContext = {
        projectFiles: [],
        existingCode: {},
        architecture: {
          dependencies: {},
          projectType: 'typescript',
          structure: [] // Populate with fs.readdir recursive if needed
        }
      };

      spinner.text = 'Generating Plan (this may take 30s)...';

      // 3. Generate Plan
      const plan = await planner.generatePlan(intent, context);

      // 4. Save Plan
      await planStore.savePlan(plan);

      spinner.succeed(chalk.green('Plan Generated Successfully!'));
      console.log(chalk.cyan('\nPlan Summary:'));
      console.log(`ID: ${plan.id}`);
      console.log(`Phases: ${plan.phases.length}`);

      plan.phases.forEach(phase => {
        console.log(chalk.gray(`- [${phase.id}] ${phase.goal}`));
      });

      console.log(chalk.yellow('\nRun `traylite execute` to start implementation.'));

    } catch (error: any) {
      spinner.fail('Plan Generation Failed');
      console.error(chalk.red(error.message));
      if (process.env.DEBUG) console.error(error);
      process.exit(1);
    }
  }
}
