import chalk from "chalk";
import { createProject, projectExists } from "../storage.js";

export function initCommand(projectName: string, displayName?: string, description?: string) {
  if (projectExists(projectName)) {
    console.log(chalk.yellow(`Project "${projectName}" already exists.`));
    return;
  }

  createProject(projectName, displayName, description);
  const label = displayName ? ` (${displayName})` : "";
  console.log(chalk.green(`Created project "${projectName}"${label}.`));
  console.log(chalk.dim(`  File: ~/.cosmic/projects/${projectName}/${projectName}.txt`));
}
