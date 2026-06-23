import chalk from "chalk";
import { readEntries, readAllEntries, getProjectMeta, projectExists, resolveDate, getWeekDates } from "../storage.js";
import { generateReport, generateWeeklyReport } from "../llm.js";

export async function reportCommand(projectName: string, date?: string, week?: boolean) {
  if (!projectExists(projectName)) {
    console.log(chalk.red(`Project "${projectName}" not found.`));
    process.exit(1);
  }

  const meta = getProjectMeta(projectName);

  if (week) {
    const weekDates = getWeekDates();
    const allDays = readAllEntries(projectName);
    const weekDays = allDays.filter((d) => weekDates.includes(d.date));
    const entries = weekDays.flatMap((d) => d.entries);

    if (entries.length === 0) {
      console.log(chalk.dim(`No entries for ${meta.name} this week. Nothing to report.`));
      return;
    }

    process.stdout.write(chalk.dim("Generating weekly report..."));

    try {
      const report = await generateWeeklyReport(meta.name, weekDates[0], weekDates[6], entries);
      process.stdout.write("\r\x1b[K");
      console.log(report);
    } catch (err: any) {
      process.stdout.write("\r\x1b[K");
      console.log(chalk.red(`Failed to generate report: ${err.message}`));
      console.log(chalk.dim("Make sure Ollama is running: ollama serve"));
      process.exit(1);
    }
    return;
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
    console.log(chalk.dim(`No entries for ${meta.name} on ${key}. Nothing to report.`));
    return;
  }

  process.stdout.write(chalk.dim("Generating report..."));

  try {
    const report = await generateReport(meta.name, key, entries);
    process.stdout.write("\r\x1b[K");
    console.log(report);
  } catch (err: any) {
    process.stdout.write("\r\x1b[K");
    console.log(chalk.red(`Failed to generate report: ${err.message}`));
    console.log(chalk.dim("Make sure Ollama is running: ollama serve"));
    process.exit(1);
  }
}
