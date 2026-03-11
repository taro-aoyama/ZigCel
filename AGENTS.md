# AGENTS.md

This file provides context and instructions for AI coding agents interacting with the ZigCel repository.
We follow the [AGENTS.md standard](https://agents.md/).

## 1. Project Identity
- **Name**: ZigCel
- **Description**: A framework-agnostic, blazingly fast spreadsheet engine component built with Zig (compiled to WASM) and HTML5 Canvas API.

## 2. Core Architecture
- **Zig (WASM)** manages data state, formula evaluation, and the dependency graph. `src/main.zig`
- **TypeScript (Canvas)** handles pure rendering of cells. `src/main.ts`
- **Web Components** provides the `<zig-cel>` tag interface.
- DO NOT use the DOM element (`<div>`, `<table>`) for thousands of cells; ALWAYS render via Canvas.

## 3. How to work in this Repository
All AI agents must respect the centralized context management:

1. **Read Guidelines**: Read `docs/architecture/ai_guidelines.md` to understand coding rules and architectural constraints.
2. **Read Current Tasks**: Read `docs/tasks/current_tasks.md` to know what to do next. Check off items `[x]` when completed.
3. **Commit History**: When concluding a significant step, document the history in a markdown file under `docs/history/`. 
4. **Develop Locally**: Use `docker compose up -d` to run the environment. Rebuild WASM using `docker compose exec app zig build`.

## 4. Communication
- The prompt inputs might be in Japanese, and the AI MUST reply in Japanese to the user.
- Documentation under `docs/` should be written in Japanese.
- Code comments and commit messages must be in English.
