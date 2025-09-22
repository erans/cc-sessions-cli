# Claude Code Sessions CLI

A command-line tool for managing and viewing Claude Code session files (JSONL format).

## Installation

```bash
npm install -g cc-sessions-cli
```

Or run directly without installation:

```bash
npx --yes cc-sessions-cli
```

## Usage

### List Sessions

List all Claude Code session files in a directory:

```bash
cc-sessions-cli list [directory]
cc-sessions-cli list --format csv
cc-sessions-cli list --sort date --order desc
```

Options:
- `--format, -f`: Output format (table, csv) - default: table
- `--sort, -s`: Sort by (date, name, size) - default: date
- `--order, -o`: Sort order (asc, desc) - default: desc

### View Session Content

View the content of a specific session file:

```bash
cc-sessions-cli view <file-path>
cc-sessions-cli view session.jsonl --format human
cc-sessions-cli view session.jsonl --format llm
```

Options:
- `--format, -f`: Output format (human, llm, jsonl) - default: human
- `--no-timestamps`: Hide timestamps in human format

## For AI Agents

This tool can be executed by AI agents using:

```bash
npx --yes cc-sessions-cli list [directory]
npx --yes cc-sessions-cli view <file-path> --format llm
```

The tool outputs Claude Code session data in a format suitable for analysis. Agents can use this to help users with requests like:

- "Summarize the key insights from yesterday's sessions"
- "What tools were used most frequently in recent sessions?"
- "Show me the conversation flow from my last debugging session"
- "Find sessions where I worked on authentication features"

### Example Agent Workflow

1. Agent runs: `npx --yes cc-sessions-cli list ~/.claude/sessions --format csv`
2. Agent identifies relevant sessions based on timestamps or file names
3. Agent runs: `npx --yes cc-sessions-cli view <session-file> --format llm`
4. Agent analyzes the session content and provides insights to the user

## Output Formats

### Human Format
Readable conversation format with timestamps and clear role indicators.

### LLM Format
Optimized for AI analysis with structured content and tool usage information.

### JSONL Format
Raw JSONL data for programmatic processing.

## Development

```bash
npm install
npm run dev
npm run build
npm run lint
```

See [CLAUDE.md](CLAUDE.md) for development guidelines.

## License

MIT