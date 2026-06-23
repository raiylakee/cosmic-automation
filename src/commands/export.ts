import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { exportToMarkdown, projectExists } from "../storage.js";

export function exportCommand(projectName: string, outputPath?: string) {
  if (!projectExists(projectName)) {
    console.log(chalk.red(`Project "${projectName}" not found.`));
    process.exit(1);
  }

  const md = exportToMarkdown(projectName);
  const file = outputPath || `${projectName}-export.md`;

  fs.writeFileSync(file, md);
  console.log(chalk.green(`Exported to ${file}`));
}
