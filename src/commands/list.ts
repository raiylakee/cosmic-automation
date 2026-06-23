import chalk from "chalk";
import { readEntries, projectExists, resolveDate } from "../storage.js";

export function listCommand(projectName: string, date?: string) {
  if (!projectExists(projectName)) {
    console.log(chalk.red(`Project "${projectName}" not found.`));
    process.exit(1);
  }

  let key: string;
  try {
    key = resolveDate(date);
  } catch (err: any) {
    console.log(chalk.red(err.message));
    process.exit(1);
  }

  const entries = readEntries(projectName, key);

  if (entries.length === 0) {
    console.log(chalk.dim(`No entries for ${projectName} on ${key}.`));
    return;
  }

  console.log(chalk.bold(`\n  ${projectName} — ${key}\n`));
  for (const entry of entries) {
    console.log(`  ${chalk.dim(entry.time)}  ${entry.text}`);
  }
  console.log();
}
