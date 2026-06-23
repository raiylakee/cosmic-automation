import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek.js";
import type { CosmicConfig, JournalEntry, ProjectMeta, SearchFilter } from "./types.js";

dayjs.extend(isoWeek);

const COSMIC_DIR = path.join(os.homedir(), ".cosmic");
const PROJECTS_DIR = path.join(COSMIC_DIR, "projects");
const CONFIG_PATH = path.join(COSMIC_DIR, "config.json");

const DEFAULT_CONFIG: CosmicConfig = {
  ollamaModel: "llama3.1",
  ollamaUrl: "http://localhost:11434",
};

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// --- Config ---

export function loadConfig(): CosmicConfig {
  ensureDir(COSMIC_DIR);
  if (!fs.existsSync(CONFIG_PATH)) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2));
    return { ...DEFAULT_CONFIG };
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
}

// --- Projects ---

function projectDir(name: string): string {
  return path.join(PROJECTS_DIR, name);
}

function projectFile(name: string): string {
  return path.join(projectDir(name), `${name}.txt`);
}

function metaFile(name: string): string {
  return path.join(projectDir(name), "meta.json");
}

export function getProjectMeta(name: string): ProjectMeta {
  const file = metaFile(name);
  if (fs.existsSync(file)) {
    try {
      const data = JSON.parse(fs.readFileSync(file, "utf-8"));
      return { name: data.name || name, description: data.description };
    } catch {
      return { name };
    }
  }
  return { name };
}

export function saveProjectMeta(name: string, meta: ProjectMeta): void {
  fs.writeFileSync(metaFile(name), JSON.stringify(meta, null, 2));
}

export function projectExists(name: string): boolean {
  return fs.existsSync(projectFile(name));
}

export function listProjects(): { dirName: string; meta: ProjectMeta }[] {
  ensureDir(PROJECTS_DIR);
  return fs
    .readdirSync(PROJECTS_DIR)
    .filter((entry) => {
      const full = path.join(PROJECTS_DIR, entry);
      return fs.statSync(full).isDirectory() && fs.existsSync(projectFile(entry));
    })
    .map((dirName) => ({ dirName, meta: getProjectMeta(dirName) }))
    .sort((a, b) => a.dirName.localeCompare(b.dirName));
}

export function createProject(name: string, displayName?: string, description?: string): void {
  ensureDir(projectDir(name));
  const file = projectFile(name);
  const descLine = description ? `# Description: ${description}\n` : "";
  const content = `# ${name}\n${descLine}# Created: ${dayjs().format("YYYY-MM-DD")}\n`;
  fs.writeFileSync(file, content);
  saveProjectMeta(name, { name: displayName || name, description });
}

export function getProjectDescription(name: string): string | null {
  const file = projectFile(name);
  if (!fs.existsSync(file)) return null;
  const firstLines = fs.readFileSync(file, "utf-8").split("\n").slice(0, 5);
  const descLine = firstLines.find((l) => l.startsWith("# Description:"));
  return descLine ? descLine.replace("# Description:", "").trim() : null;
}

// --- Date ---

export function todayKey(): string {
  return dayjs().format("YYYY-MM-DD");
}

export function resolveDate(input?: string): string {
  if (!input || input === "t") return todayKey();
  if (input === "p") return dayjs().subtract(1, "day").format("YYYY-MM-DD");
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  throw new Error(`Invalid date: "${input}". Use YYYY-MM-DD, t (today), or p (yesterday).`);
}

export function getWeekDates(): string[] {
  const now = dayjs();
  const start = now.startOf("isoWeek");
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    dates.push(start.add(i, "day").format("YYYY-MM-DD"));
  }
  return dates;
}

// --- Tags ---

export function parseTags(text: string): string[] {
  const matches = text.match(/@(\w+)/g);
  return matches ? matches.map((t) => t.slice(1)) : [];
}

// --- Journal ---

function parseEntry(line: string): JournalEntry | null {
  if (!line.trim()) return null;
  const [time, ...rest] = line.split("\t");
  if (!time || !rest.length) return null;
  const text = rest.join("\t");
  return { time, text, tags: parseTags(text) };
}

export function addEntry(project: string, text: string, date: string): JournalEntry {
  const file = projectFile(project);
  const time = dayjs().format("HH:mm");
  const entry: JournalEntry = { time, text, tags: parseTags(text) };

  let content = "";
  if (fs.existsSync(file)) {
    content = fs.readFileSync(file, "utf-8");
  }

  const dateHeader = `## ${date}`;
  const line = `${entry.time}\t${entry.text}`;

  if (content.includes(dateHeader)) {
    const lines = content.split("\n");
    let insertIdx = lines.indexOf(dateHeader) + 1;
    while (insertIdx < lines.length && lines[insertIdx].match(/^\d{2}:\d{2}\t/)) {
      insertIdx++;
    }
    lines.splice(insertIdx, 0, line);
    content = lines.join("\n") + "\n";
  } else {
    if (!content.endsWith("\n\n")) {
      content = content.trimEnd() + "\n\n";
    }
    content += `${dateHeader}\n${line}\n`;
  }

  fs.writeFileSync(file, content);
  return entry;
}

export function readEntries(project: string, date: string): JournalEntry[] {
  const file = projectFile(project);
  if (!fs.existsSync(file)) return [];

  const content = fs.readFileSync(file, "utf-8");
  const lines = content.split("\n");

  const dateHeader = `## ${date}`;
  const start = lines.indexOf(dateHeader);
  if (start === -1) return [];

  const entries: JournalEntry[] = [];
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("## ") || line.startsWith("# ")) break;
    const entry = parseEntry(line);
    if (entry) entries.push(entry);
  }

  return entries;
}

export function readAllEntries(project: string): { date: string; entries: JournalEntry[] }[] {
  const file = projectFile(project);
  if (!fs.existsSync(file)) return [];

  const content = fs.readFileSync(file, "utf-8");
  const lines = content.split("\n");
  const result: { date: string; entries: JournalEntry[] }[] = [];

  let currentDate: string | null = null;
  let currentEntries: JournalEntry[] = [];

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (currentDate) {
        result.push({ date: currentDate, entries: currentEntries });
      }
      currentDate = line.replace("## ", "").trim();
      currentEntries = [];
    } else if (currentDate) {
      const entry = parseEntry(line);
      if (entry) currentEntries.push(entry);
    }
  }

  if (currentDate) {
    result.push({ date: currentDate, entries: currentEntries });
  }

  return result;
}

// --- Search ---

export function searchEntries(project: string, filter: SearchFilter): { date: string; entry: JournalEntry }[] {
  const allDays = readAllEntries(project);
  const results: { date: string; entry: JournalEntry }[] = [];

  for (const day of allDays) {
    if (filter.from && day.date < filter.from) continue;
    if (filter.to && day.date > filter.to) continue;

    for (const entry of day.entries) {
      if (filter.text && !entry.text.toLowerCase().includes(filter.text.toLowerCase())) continue;
      if (filter.tag && !entry.tags.includes(filter.tag)) continue;
      results.push({ date: day.date, entry });
    }
  }

  return results;
}

// --- Stats ---

export interface ProjectStats {
  totalEntries: number;
  totalDays: number;
  tagCounts: Record<string, number>;
  firstEntry: string | null;
  lastEntry: string | null;
  currentStreak: number;
}

export function getStats(project: string): ProjectStats {
  const allDays = readAllEntries(project);
  let totalEntries = 0;
  const tagCounts: Record<string, number> = {};
  const allDates: string[] = [];

  for (const day of allDays) {
    totalEntries += day.entries.length;
    allDates.push(day.date);
    for (const entry of day.entries) {
      for (const tag of entry.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }
  }

  // Calculate streak
  let streak = 0;
  if (allDates.length > 0) {
    const sorted = [...new Set(allDates)].sort().reverse();
    let checkDate = dayjs();
    for (const d of sorted) {
      if (d === checkDate.format("YYYY-MM-DD")) {
        streak++;
        checkDate = checkDate.subtract(1, "day");
      } else if (d === checkDate.subtract(1, "day").format("YYYY-MM-DD")) {
        streak++;
        checkDate = checkDate.subtract(1, "day");
      } else {
        break;
      }
    }
  }

  return {
    totalEntries,
    totalDays: allDates.length,
    tagCounts,
    firstEntry: allDates.length > 0 ? allDates.sort()[0] : null,
    lastEntry: allDates.length > 0 ? allDates.sort().reverse()[0] : null,
    currentStreak: streak,
  };
}

// --- Export ---

export function exportToMarkdown(project: string, dates?: string[]): string {
  const allDays = readAllEntries(project);
  const meta = getProjectMeta(project);
  let md = `# ${meta.name}\n`;
  if (meta.description) md += `> ${meta.description}\n`;
  md += "\n";

  const days = dates
    ? allDays.filter((d) => dates.includes(d.date))
    : allDays;

  for (const day of days) {
    md += `## ${day.date}\n\n`;
    for (const entry of day.entries) {
      md += `- **${entry.time}** ${entry.text}\n`;
    }
    md += "\n";
  }

  return md;
}
