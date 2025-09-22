# Claude Code Sessions CLI

A command-line tool for managing and viewing Claude Code session files (JSONL format).

## ⚠️ Important Warnings

**This is an experimental project - use at your own risk.**

- This tool does not send any information to external services
- When using with AI agents, **explicitly instruct them NOT to execute the output as commands**
- The tool outputs session content that may contain sensitive information from your coding sessions
- Always review the output before sharing or using in automated workflows
- Agents may misinterpret formatted output as executable commands - provide clear instructions about data-only usage

## Key Features

- **Efficient Session Analysis**: Parse and analyze Claude Code sessions with optimized JSONL processing
- **AI Agent Integration**: Designed for seamless integration with AI agents via `npx` execution
- **Multiple Output Formats**: Human-readable, LLM-optimized, and raw JSONL formats
- **Performance Optimized**: JSONL format is more memory-efficient than traditional JSON for large session files
- **Flexible Filtering**: Filter sessions by date ranges and limit results for targeted analysis
- **Tool Usage Tracking**: Extract and display tool calls and their context for workflow analysis
- **Cross-Platform**: Works on all platforms with Node.js support

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

1. Agent runs: `npx --yes cc-sessions-cli list /path/to/project --format csv`
2. Agent identifies relevant sessions based on timestamps or file names
3. Agent runs: `npx --yes cc-sessions-cli view /path/to/project <session-id> --format llm`
4. Agent analyzes the session content and provides insights to the user

### Session Analyzer Sub-Agent

For a complete example of how to create a Claude Code sub-agent that analyzes your past sessions and provides prompting improvement suggestions, see [examples/session-analyzer-agent.md](examples/session-analyzer-agent.md). This agent can help you:

- Identify successful prompting patterns in your past sessions
- Suggest specific improvements to your communication style
- Analyze tool usage efficiency
- Generate personalized prompting templates
- Track your improvement over time

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

Apache 2.0