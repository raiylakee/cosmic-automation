import type { JournalEntry } from "./types.js";

export const DAILY_PROMPT = `You are a professional development journal writer. Given raw task entries from a developer's day, write a concise daily report.

Output format (use exactly this structure):

**Selesai:**
- [ringkasan tugas]

**Sedang Dikerjakan:**
- [ringkasan tugas] (jika ada)

**Hambatan:**
- [hambatan] (jika ada, jika tidak tulis "Tidak ada")

Rules:
- Tulis dalam Bahasa Indonesia
- Tulis dalam sudut pandang orang pertama
- Kelompokkan tugas yang terkait
- Singkat, setiap poin maksimal satu baris
- Fokus pada apa yang telah diselesaikan
- Gunakan teks biasa, tanpa code block
- JANGAN tambahkan judul atau header tanggal
- Maksimal 150 kata`;

export const WEEKLY_PROMPT = `You are a professional development journal writer. Given a week of raw task entries, write a concise weekly summary.

Output format (use exactly this structure):

**Tercapai / Selesai:**
- [pencapaian]

**Pelajaran Penting:**
- [pelajaran] (jika ada)

**Masih Dikerjakan:**
- [item] (jika ada)

**Hambatan / Catatan:**
- [item] (jika ada, jika tidak tulis "Tidak ada")

Rules:
- Tulis dalam Bahasa Indonesia
- Tulis dalam sudut pandang orang pertama
- Kelompokkan tugas berdasarkan tema atau area proyek
- Singkat, setiap poin maksimal satu baris
- Utamakan pencapaian terbesar di atas
- Gunakan teks biasa, tanpa code block
- JANGAN tambahkan judul atau header tanggal
- Maksimal 250 kata`;

function formatEntries(entries: JournalEntry[], includeTime: boolean): string {
  return entries.map((e) => {
    const tags = e.tags.length > 0 ? ` [${e.tags.join(", ")}]` : "";
    const prefix = includeTime ? `${e.time} - ` : "";
    return `${prefix}${e.text}${tags}`;
  }).join("\n");
}

export function buildDailyPrompt(
  project: string,
  date: string,
  entries: JournalEntry[],
  includeTime: boolean
): string {
  const userData = `Project: ${project}\nDate: ${date}\n\nEntries:\n${formatEntries(entries, includeTime)}`;
  return `--- System Prompt ---\n${DAILY_PROMPT}\n\n--- Your Data ---\n${userData}`;
}

export function buildWeeklyPrompt(
  project: string,
  from: string,
  to: string,
  entries: JournalEntry[],
  includeTime: boolean
): string {
  const userData = `Project: ${project}\nWeek: ${from} to ${to}\n\nEntries:\n${formatEntries(entries, includeTime)}`;
  return `--- System Prompt ---\n${WEEKLY_PROMPT}\n\n--- Your Data ---\n${userData}`;
}
