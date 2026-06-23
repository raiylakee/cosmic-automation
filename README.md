# ct

A CLI tool for logging daily project work and generating progress reports using a local LLM. Built for developers who need to report what they did, without the hassle of writing it up manually.

Originally built for [PT. Universal Big Data](https://ubig.co.id) where daily progress reporting is part of the workflow, but useful for anyone who needs to track project work and generate reports.

## Install

```bash
npm install -g cosmic-automation
```

Requires Node.js 18+. For LLM reports, you need [Ollama](https://ollama.com) running locally with a model pulled (e.g. `ollama pull llama3.1`).

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
| `ct report <project>` | Generate daily report with LLM |
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
10:00	Explored Ollama API @learning @llm
```

## LLM Reports

Reports are generated via Ollama (local, free). The tool sends your entries to the LLM and returns a structured report:

```
**Completed:**
- Built CLI task logger with Commander.js
- Set up Ollama integration for local LLM

**In Progress:**
- Adding search functionality

**Blockers:**
- None
```

Configure model and URL in `~/.cosmic/config.json`:

```json
{
  "ollamaModel": "llama3.1",
  "ollamaUrl": "http://localhost:11434"
}
```

## License

MIT
