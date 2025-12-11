# AGENTS.md

This file contains instructions for AI coding agents working with this repository.

## Project Overview

**Resonate Coach** is a React-based fitness coaching application powered by AI (Google Gemini and OpenAI). It features a chat interface where users interact with an AI coach.

- **Tech Stack**: React, Vite, TypeScript, Tailwind CSS
- **State Management**: Zustand, React Context
- **AI Integration**: LangChain, Google Generative AI, OpenAI
- **Styling**: Tailwind CSS, Lucide React icons

## Dev Environment Setup

- **Node.js**: Required (LTS version recommended).
- **Package Manager**: npm
- **Installation**: Run `npm install` to install dependencies.
- **Development Server**: Run `npm run dev` to start the local server (usually at http://localhost:5173).

**Note on API Keys**:
This application does not rely on a `.env` file for API keys during local development. Instead, API keys (Google Gemini and OpenAI) are entered by the user through the UI (handled in `src/components/TokenSetup.tsx`) and stored in the application state/local storage.

## Build and Compilation

```bash
npm run build     # Compile TypeScript and build for production
npm run preview   # Preview the production build locally
```

- **Output Directory**: `dist/`
- **TypeScript**: The project uses TypeScript with a relatively loose configuration (`strict: false` in `tsconfig.json`).

## Code Style and Conventions

- **Linting**: Run `npm run lint` to check for linting errors using ESLint.
- **Formatting**: Code should be formatted consistently.
- **Naming**:
    - React Components: PascalCase (e.g., `ChatInterface.tsx`)
    - Hooks: camelCase with `use` prefix (e.g., `useTheme.ts`)
    - Utilities: camelCase (e.g., `fitnessCoach.ts`)
- **Imports**: Use the `@/` alias to import from `src/` (e.g., `import { useApp } from '@/context/AppContext'`).
- **Styling**: Use Tailwind CSS utility classes. Avoid inline styles where possible.

## Project Structure

```
src/
  ├── components/    - UI components (ChatInterface, MessageBubble, etc.)
  ├── context/       - React Context providers (AppContext)
  ├── hooks/         - Custom React hooks
  ├── lib/           - Shared libraries and utilities
  ├── pages/         - Route components (Home)
  ├── prompts/       - Markdown files containing system prompts for the AI
  ├── types/         - TypeScript type definitions
  ├── utils/         - Core logic (fitnessCoach, observer, storage)
  ├── App.tsx        - Main application component
  └── main.tsx       - Entry point
```

## Common Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Serve the built application |

## AI & Prompts

- **System Prompts**: The behavior of the AI coach and observer is defined in markdown files located in `src/prompts/`.
- **LLM Integration**: The application uses `langchain` and official SDKs (`@google/generative-ai`) to communicate with LLMs.
- **Logic**: Core AI logic usually resides in `src/utils/fitnessCoach.ts` and `src/utils/observer.ts`.

## Debugging and Troubleshooting

- **API Issues**: If AI responses fail, check `TokenSetup.tsx` logic or verify the keys entered in the UI.
- **State Issues**: Zustand and Context are used. Check `src/context/AppContext.tsx` for global state debugging.
- **Styling**: Tailwind classes are used. If styles aren't applying, check `tailwind.config.js` and `index.css`.

## Extra Instructions for AI Agents

- **Prompt Editing**: When modifying system prompts in `src/prompts/`, ensure the markdown format is preserved as these are loaded as raw text/strings.
- **Type Safety**: While `strict` is false, aim to provide accurate types for new code to improve maintainability.
- **Component Modularity**: Keep components focused. If `ChatInterface.tsx` grows too large, consider extracting sub-components.
