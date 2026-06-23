import chalk from "chalk";
import { createProject, projectExists } from "../storage.js";

export function initCommand(projectName: string, description?: string) {
  if (projectExists(projectName)) {
    console.log(chalk.yellow(`Project "${projectName}" already exists.`));
    return;
  }

  createProject(projectName, description);
  console.log(chalk.green(`Created project "${projectName}".`));
  console.log(chalk.dim(`  File: ~/.cosmic/projects/${projectName}/${projectName}.txt`));
}
