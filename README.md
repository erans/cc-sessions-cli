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

### Example Sub-Agents

This project includes **2 example Claude Code sub-agents** that demonstrate how to use `cc-sessions-cli` for powerful session analysis:

#### 1. Session Analyzer Agent
**Purpose**: Improve your prompting skills by analyzing conversation patterns
**Use cases**: "How can I communicate better with Claude?" | "What prompting patterns work best?"

- Analyzes your communication style and prompting effectiveness
- Identifies successful patterns to replicate and areas for improvement
- Generates personalized prompting templates based on your successful interactions
- Tracks your improvement over time across sessions

#### 2. Session Query Agent
**Purpose**: Search and retrieve information from your session history
**Use cases**: "When did we work on authentication?" | "What errors have we encountered?"

- Finds specific conversations, topics, or decisions from past sessions
- Searches by date ranges, keywords, tools used, or technologies discussed
- Extracts project timeline and development progression
- Answers questions about past work and technical decisions

#### Installation

1. **Copy agent files** to your project's `.claude/agents/` directory:
   ```bash
   mkdir -p .claude/agents
   # Copy the agent configuration from examples/ to .claude/agents/
   ```

2. **Use the agents** in Claude Code:
   ```
   /agents session-analyzer   # Analyze your prompting patterns
   /agents session-query      # Search your session history
   ```

3. **Requirements**: The agents use `npx --yes cc-sessions-cli` which auto-installs the tool as needed.

See the full configuration details in:
- [examples/session-analyzer-agent.md](examples/session-analyzer-agent.md)
- [examples/session-query-agent.md](examples/session-query-agent.md)

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