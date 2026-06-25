import chalk from "chalk";
import { readEntries, readAllEntries, getProjectMeta, projectExists, resolveDate, getWeekDates } from "../storage.js";
import { buildDailyPrompt, buildWeeklyPrompt } from "../llm.js";

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

    const prompt = buildWeeklyPrompt(meta.name, weekDates[0], weekDates[6], entries);
    console.log(chalk.green("Copy the prompt below and paste it into your chatbot:\n"));
    console.log(prompt);
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

  const prompt = buildDailyPrompt(meta.name, key, entries);
  console.log(chalk.green("Copy the prompt below and paste it into your chatbot:\n"));
  console.log(prompt);
}
