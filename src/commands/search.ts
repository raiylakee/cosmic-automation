import chalk from "chalk";
import { searchEntries, getProjectMeta, projectExists } from "../storage.js";
import type { SearchFilter } from "../types.js";

export function searchCommand(
  projectName: string,
  filter: SearchFilter
) {
  if (!projectExists(projectName)) {
    console.log(chalk.red(`Project "${projectName}" not found.`));
    process.exit(1);
  }

  const meta = getProjectMeta(projectName);
  const results = searchEntries(projectName, filter);

  if (results.length === 0) {
    console.log(chalk.dim("No matching entries found."));
    return;
  }

  console.log(chalk.bold(`\n  ${meta.name} — ${results.length} result(s)\n`));
  let lastDate = "";
  for (const { date, entry } of results) {
    if (date !== lastDate) {
      console.log(chalk.dim(`  ${date}`));
      lastDate = date;
    }
    console.log(`    ${chalk.dim(entry.time)}  ${entry.text}`);
  }
  console.log();
}
