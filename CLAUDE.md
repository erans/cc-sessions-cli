# Claude Code Project Configuration

## Project Overview
A CLI tool to manage and view Claude Code sessions from JSONL files.

## Development Workflow

### Before Any Commit
**MANDATORY:** Run the following commands and ensure they pass before committing:

```bash
npm run lint
npm run typecheck
npm run build
```

All commands must complete successfully with no errors or warnings.

### Available Scripts
- `npm run dev` - Run the CLI in development mode with tsx
- `npm run build` - Compile TypeScript to JavaScript
- `npm run lint` - Run ESLint on source files
- `npm run lint:fix` - Auto-fix linting issues where possible
- `npm run typecheck` - Run TypeScript type checking without emitting files

### Code Standards
- Use TypeScript with strict type checking
- Follow ESLint configuration for code style
- Avoid `any` types - use specific type definitions
- Maintain existing code patterns and conventions

### Project Structure
- `src/` - TypeScript source files
- `dist/` - Compiled JavaScript output (gitignored)
- Entry point: `src/index.ts`
- Binary: `dist/index.js`