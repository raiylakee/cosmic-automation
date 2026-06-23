import chalk from "chalk";
import { getStats, getProjectMeta, projectExists } from "../storage.js";

export function statsCommand(projectName: string) {
  if (!projectExists(projectName)) {
    console.log(chalk.red(`Project "${projectName}" not found.`));
    process.exit(1);
  }

  const meta = getProjectMeta(projectName);
  const stats = getStats(projectName);

  console.log(chalk.bold(`\n  ${meta.name} — Stats\n`));
  console.log(`  Entries:       ${chalk.cyan(stats.totalEntries)}`);
  console.log(`  Days logged:   ${chalk.cyan(stats.totalDays)}`);
  console.log(`  Current streak: ${chalk.cyan(stats.currentStreak)} day(s)`);

  if (stats.firstEntry) {
    console.log(`  First entry:   ${chalk.dim(stats.firstEntry)}`);
    console.log(`  Last entry:    ${chalk.dim(stats.lastEntry)}`);
  }

  if (Object.keys(stats.tagCounts).length > 0) {
    console.log(chalk.bold("\n  Tags\n"));
    const sorted = Object.entries(stats.tagCounts).sort((a, b) => b[1] - a[1]);
    for (const [tag, count] of sorted) {
      const bar = "#".repeat(Math.min(count, 30));
      console.log(`  ${chalk.cyan("@" + tag.padEnd(15))} ${chalk.dim(bar)} ${count}`);
    }
  }

  console.log();
}
