<!-- Copilot / AI agent instructions for contributors and automation -->
# Copilot instructions — bar-time-trivia-v2

Purpose: give an AI coding agent concise, actionable knowledge to be productive in this repository.

- Project type: React + Vite front-end with a separate Node/Express + Socket.IO realtime server.
- Key ports: front-end dev server ~5173 (Vite), socket server 3001 (see `src/main.jsx` and `btt-socket-server/server.js`).

Quick start (dev)

```bash
npm install
npm run dev         # runs both the socket server and the vite client (uses concurrently)
npm run start-server# starts the socket server only (btt-socket-server/server.js)
npm run start-client# starts the vite dev server
```

Build / preview

```bash
npm run build       # vite build
npm run preview     # vite preview
npm run build:css   # legacy tailwind build command (kept for reference)
```

Architecture & data flow (high level)

- Frontend: `src/` React app. `src/main.jsx` creates a Socket.IO client that connects to `http://localhost:3001` and mounts the router `AppRouter`.
- Realtime layer: `btt-socket-server/` is an Express + Socket.IO server. Core files:
  - `btt-socket-server/server.js` — socket server entry, CORS allowed origin `http://localhost:5173`.
  - `btt-socket-server/socket/index.js` and `sessionStore.js` — connection handlers and session state management.
- Persistence / cloud integration: `app/server/api/firebase/*` (Firestore logic, firebaseConfig and service account files) and top-level `firestore.rules`/`firestore.indexes.json` for security/indexes.

Important conventions & patterns

- Socket events are first-class: prefer using the socket server handlers under `btt-socket-server/socket/` to add or update events.
- Avoid sending circular objects over the socket — server constructs "safe" payloads before emitting (see `btt-socket-server/server.js` player payload mapping).
- Frontend uses small focused hooks in `src/hooks/` such as `useAuth.js`, `useGameSession.js`, and `useReconnect.js`. Follow those patterns for new cross-cutting logic.
- Utilities: `src/utils/safeEmit.js` and `src/utils/toWireQuestion.js` show the project's approach to sanitizing and shaping payloads for transport.
- The project uses ES modules (`"type": "module"` in `package.json`) — use `import` / `export` syntax in server and client code.

Files to inspect for context when making changes

- `src/main.jsx` — where the client socket is created and debug listeners are registered.
- `btt-socket-server/server.js` — socket server boot, connection/disconnect and emit examples.
- `btt-socket-server/socket/` — register event handlers and session store functions.
- `app/server/api/firebase/` — Firestore integration and admin secrets (careful with secrets in commits).
- `firestore.rules`, `firestore.indexes.json` — DB rules and indexes.
- `package.json` — scripts and important dev dependencies (concurrently, vite, tailwind).

Dev/Debug tips specific to this repo

- To reproduce socket behavior locally: run `npm run dev` then open the client at `http://localhost:5173`. The client connects to `http://localhost:3001` by default.
- Server logs: `btt-socket-server/server.js` logs connection ids and disconnect flows; inspect `sessionStore.js` for player/host disconnect handling and grace periods.
- Use `socket.onAny` (already used in `src/main.jsx`) to enumerate events during debugging.
- When adding a new socket event, update server-side handler registration in `btt-socket-server/socket/index.js` and any affected safe payload shaping in `sessionStore.js`.

Security & secrets

- `app/server/api/firebase/serviceAccountKey.json` exists in-tree; do NOT add or modify secrets in public commits. Prefer environment variables for production.

Decision notes / why things are structured this way

- Socket server is separate from the Vite dev server to keep realtime logic isolated and hostable independently.
- The project opts for small, specialized hooks and component directories (see `src/components/sessions` and `src/components/Trivia`) — follow that granularity when adding features.

If you (the agent) modify code

- Run linting via `npm run lint` if you change JS/JSX files.
- Keep changes limited to the feature area; update related `socket` handlers and `safeEmit` / `toWireQuestion` utilities when transport shape changes.

When uncertain, open these files first: `src/main.jsx`, `btt-socket-server/server.js`, `btt-socket-server/socket/index.js`, `btt-socket-server/socket/sessionStore.js`, and `app/server/api/firebase/*`.

If any part of this summary is incomplete or you need examples for a specific task, ask for the file or workflow to focus on next.
