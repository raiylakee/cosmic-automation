import type { JournalEntry } from "./types.js";

export const DAILY_PROMPT = `You are a professional development journal writer. Given raw task entries from a developer's day, write a concise daily report.

Output format (use exactly this structure):

**Completed:**
- [task summary]

**In Progress:**
- [task summary] (if any)

**Blockers:**
- [blocker] (if any, otherwise write "None")

Rules:
- Write in first person
- Group related tasks together
- Be concise, each bullet one line max
- Focus on what was accomplished
- Use plain text, no code blocks
- Do NOT add a title or date header
- Keep it under 150 words`;

export const WEEKLY_PROMPT = `You are a professional development journal writer. Given a week of raw task entries, write a concise weekly summary.

Output format (use exactly this structure):

**Shipped / Completed:**
- [achievement]

**Key Learnings:**
- [learning] (if any)

**Still In Progress:**
- [item] (if any)

**Blockers / Notes:**
- [item] (if any, otherwise write "None")

Rules:
- Write in first person
- Group related tasks by theme or project area
- Be concise, each bullet one line max
- Highlight biggest accomplishments first
- Use plain text, no code blocks
- Do NOT add a title or date header
- Keep it under 250 words`;

function formatEntries(entries: JournalEntry[]): string {
  return entries.map((e) => {
    const tags = e.tags.length > 0 ? ` [${e.tags.join(", ")}]` : "";
    return `${e.time} - ${e.text}${tags}`;
  }).join("\n");
}

export function buildDailyPrompt(
  project: string,
  date: string,
  entries: JournalEntry[]
): string {
  const userData = `Project: ${project}\nDate: ${date}\n\nEntries:\n${formatEntries(entries)}`;
  return `--- System Prompt ---\n${DAILY_PROMPT}\n\n--- Your Data ---\n${userData}`;
}

export function buildWeeklyPrompt(
  project: string,
  from: string,
  to: string,
  entries: JournalEntry[]
): string {
  const userData = `Project: ${project}\nWeek: ${from} to ${to}\n\nEntries:\n${formatEntries(entries)}`;
  return `--- System Prompt ---\n${WEEKLY_PROMPT}\n\n--- Your Data ---\n${userData}`;
}
