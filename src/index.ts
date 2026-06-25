#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { initCommand } from "./commands/init.js";
import { logCommand } from "./commands/log.js";
import { listCommand } from "./commands/list.js";
import { reportCommand } from "./commands/report.js";
import { searchCommand } from "./commands/search.js";
import { exportCommand } from "./commands/export.js";
import { statsCommand } from "./commands/stats.js";
import { listProjects } from "./storage.js";

const program = new Command();

program
  .name("ct")
  .description("Project journal + progress report prompts")
  .version("1.0.0");

program
  .command("init <project>")
  .description("Create a new project")
  .option("-n, --name <name>", "Display name for the project")
  .option("-D, --description <desc>", "Project description")
  .action((name: string, opts: { name?: string; description?: string }) => {
    initCommand(name, opts.name, opts.description);
  });

program
  .command("log <project> [text]")
  .description("Add a journal entry (omit text to open $EDITOR)")
  .option("-d, --date <date>", "Date: YYYY-MM-DD, t (today), or p (yesterday)")
  .action((project: string, text: string | undefined, opts: { date?: string }) => {
    logCommand(project, text, opts.date);
  });

program
  .command("list <project>")
  .description("Show journal entries")
  .option("-d, --date <date>", "Date: YYYY-MM-DD, t (today), or p (yesterday)")
  .action((project: string, opts: { date?: string }) => {
    listCommand(project, opts.date);
  });

program
  .command("report <project>")
  .description("Get a copyable report prompt for your chatbot")
  .option("-d, --date <date>", "Date: YYYY-MM-DD, t (today), or p (yesterday)")
  .option("-w, --week", "Generate weekly report instead")
  .action(async (project: string, opts: { date?: string; week?: boolean }) => {
    await reportCommand(project, opts.date, opts.week);
  });

program
  .command("search <project> [query]")
  .description("Search entries by text, tag, or date range")
  .option("-t, --tag <tag>", "Filter by tag (without @)")
  .option("--from <date>", "Start date (YYYY-MM-DD)")
  .option("--to <date>", "End date (YYYY-MM-DD)")
  .action((project: string, query: string | undefined, opts: { tag?: string; from?: string; to?: string }) => {
    searchCommand(project, { text: query, tag: opts.tag, from: opts.from, to: opts.to });
  });

program
  .command("export <project>")
  .description("Export journal to markdown file")
  .option("-o, --output <file>", "Output file path")
  .action((project: string, opts: { output?: string }) => {
    exportCommand(project, opts.output);
  });

program
  .command("stats <project>")
  .description("Show project stats (entries, streak, tags)")
  .action(statsCommand);

program
  .command("projects")
  .description("List all projects")
  .action(() => {
    const projects = listProjects();
    if (projects.length === 0) {
      console.log(chalk.dim("No projects yet. Run: ct init <project>"));
      return;
    }
    console.log(chalk.bold("\n  Projects\n"));
    for (const { dirName, meta } of projects) {
      const alias = dirName !== meta.name ? chalk.dim(` (${dirName})`) : "";
      const desc = meta.description ? chalk.dim(` — ${meta.description}`) : "";
      console.log(`  ${chalk.cyan(meta.name)}${alias}${desc}`);
    }
    console.log();
  });

program.parse();
