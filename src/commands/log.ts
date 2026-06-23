import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import chalk from "chalk";
import { addEntry, getProjectMeta, projectExists, resolveDate } from "../storage.js";

function openEditor(content: string): string | null {
  const editor = process.env.EDITOR || process.env.VISUAL || "vi";
  const tmpFile = path.join(os.tmpdir(), `cosmic-edit-${Date.now()}.txt`);
  fs.writeFileSync(tmpFile, content);

  try {
    execSync(`${editor} "${tmpFile}"`, { stdio: "inherit" });
    const result = fs.readFileSync(tmpFile, "utf-8").trim();
    fs.unlinkSync(tmpFile);
    return result || null;
  } catch {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    return null;
  }
}

export function logCommand(projectName: string, text: string | undefined, date?: string) {
  if (!projectExists(projectName)) {
    console.log(chalk.red(`Project "${projectName}" not found. Run: ct init ${projectName}`));
    process.exit(1);
  }

  const meta = getProjectMeta(projectName);

  let key: string;
  try {
    key = resolveDate(date);
  } catch (err: any) {
    console.log(chalk.red(err.message));
    process.exit(1);
  }

  let finalText = text;

  if (!finalText) {
    const edited = openEditor("");
    if (!edited) {
      console.log(chalk.dim("No input. Aborted."));
      return;
    }
    finalText = edited;
  }

  const lines = finalText.split("\n").filter((l) => l.trim());
  for (const line of lines) {
    const entry = addEntry(projectName, line, key);
    console.log(chalk.green(`Logged to ${meta.name} (${key})`));
    console.log(chalk.dim(`  ${entry.time}  ${entry.text}`));
  }
}
