# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start both frontend (5173) and backend (3001) concurrently
npm run dev:client   # Vite frontend only
npm run dev:server   # Express backend only (node --watch)
npm run build        # tsc + vite build
npx tsc --noEmit     # Type-check without building
```

## Architecture

**Two-process dev setup:** Vite frontend proxies `/api/*` to Express backend on port 3001 (configured in `vite.config.ts`). The backend holds the Anthropic API key and streams responses back to the browser via Server-Sent Events.

**Data flow for chat:**
1. `src/hooks/useChat.ts` — all state lives here (conversations, streaming content, model selection). It `fetch`es `POST /api/chat` with the full message history.
2. `server/index.js` — receives the request, calls `client.messages.stream()` from `@anthropic-ai/sdk`, and pipes SSE events (`{ type: 'delta', text }` / `{ type: 'done', usage }`) back to the browser.
3. `useChat.ts` reads the SSE stream and incrementally updates the matching `Message` object in state, causing React to re-render each token.

**State shape:** A flat array of `Conversation` objects lives in `useChat`. Each `Conversation` has a `messages: Message[]` array. The active conversation is tracked by ID. There is no external state library — everything is `useState` + `useCallback`.

**Streaming cursor:** While a message is streaming, its `Message.isStreaming` flag is `true` and `MessageBubble` renders a blinking cursor after the markdown content.

**Voice:** The mic button in `MessageInput` is rendered but permanently `disabled`. The `/api/models` endpoint already lists the three Claude models intended for voice testing. Voice integration is the planned next step — do not remove the mic button.

## Key conventions

- Models are fetched from `GET /api/models` at startup; fallback hardcoded models exist in the hook if the server is unreachable.
- Conversation titles are auto-set to the first 40 chars of the first user message.
- `react-markdown` + `react-syntax-highlighter` (vscDarkPlus theme) render assistant messages. User messages render as plain `<p>` with `whitespace-pre-wrap`.
- Tailwind custom colors: `surface-{50..950}` for backgrounds, `accent-{400..600}` for brand/interactive elements.
- The `.env` file (gitignored) must contain `ANTHROPIC_API_KEY` for the server to work.
