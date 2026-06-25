# ct

A CLI tool for logging daily project work and generating copyable report prompts. Log your tasks, then get a structured prompt you can paste into any chatbot (ChatGPT, Claude, etc.) to generate a polished progress report.

Originally built for [PT. Universal Big Data](https://ubig.co.id) where daily progress reporting is part of the workflow, but useful for anyone who needs to track project work and generate reports.

## Install

```bash
npm install -g cosmic-automation
```

Requires Node.js 18+.

## Usage

```bash
ct init my-project -D "Description of the project"
ct log my-project "What you did @tag"
ct list my-project
ct report my-project
```

## Commands

| Command | Description |
|---------|-------------|
| `ct init <project>` | Create a new project |
| `ct log <project> [text]` | Add journal entry. Omit text to open `$EDITOR` |
| `ct list <project>` | Show entries for today |
| `ct report <project>` | Get a copyable report prompt |
| `ct search <project> [query]` | Search entries |
| `ct export <project>` | Export to markdown |
| `ct stats <project>` | Show stats |
| `ct projects` | List all projects |

## Options

### Date flags

```
-d t        Today (default)
-d p        Yesterday
-d 2026-06-20   Specific date
```

### Tags

Inline tags with `@`. Use for categorizing work.

```bash
ct log my-app "Fixed login bug @bugfix @auth"
ct search my-app -t bugfix
```

### Search

```bash
ct search my-app "login"           # text search
ct search my-app -t bugfix         # by tag
ct search my-app --from 2026-06-01 --to 2026-06-23  # date range
```

### Weekly report

```bash
ct report my-app --week
```

### Export

```bash
ct export my-app -o report.md
```

### $EDITOR

```bash
ct log my-project    # opens your editor for multi-line input
```

## Data

All data lives in `~/.cosmic/projects/<name>/<name>.txt`. One file per project, plain text, human-readable. No database, no accounts, no cloud.

```
# my-project
# Description: What this project is about
# Created: 2026-06-23

## 2026-06-23
15:31	Set up Node.js project @setup @learning
15:31	Built CLI task logger @feature @cli

## 2026-06-22
10:00	Explored API integrations @learning
```

## Report Prompts

Run `ct report <project>` to get a ready-to-paste prompt with your entries. Copy it into any chatbot to get a structured report:

```
--- System Prompt ---
You are a professional development journal writer...

--- Your Data ---
Project: my-app
Date: 2026-06-23

Entries:
15:31 - Set up Node.js project [setup, learning]
15:31 - Built CLI task logger [feature, cli]
```

Paste this into ChatGPT, Claude, or any LLM and it will generate a clean daily or weekly report for you.

## License

MIT
