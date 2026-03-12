# Bar Time Trivia

Bar Time Trivia is a live-hosted trivia platform inspired by bar trivia nights and games like Kahoot. A host creates a trivia game, launches a live session, and players join using a short join code to compete in real time.

The project is designed to support social trivia events, classrooms, or casual game nights where one host runs the game and players participate from their own devices.

The application is built with a React front end and a Node/Socket.IO backend to enable real-time gameplay between hosts and players.

## Features

- User authentication with Firebase
- Create and manage trivia games
- Organize games into rounds and questions
- Host live trivia sessions
- Players join sessions using a short join code
- Real-time gameplay using Socket.IO
- Host-controlled game flow and scoring

## Tech Stack

Frontend
- React
- Vite
- React Router
- Firebase Authentication
- Firebase Firestore

Backend
- Node.js
- Express
- Socket.IO
- Firebase Admin SDK

Development Tools
- pnpm
- ESLint

## Architecture Overview

Bar Time Trivia is built using a client-server architecture designed to support real-time multiplayer trivia sessions.

The system is divided into two main layers:

Frontend (Client)
- React + Vite application
- Handles authentication, UI, game creation, and player interaction
- Communicates with Firebase for persistent data
- Communicates with the Socket.IO server for real-time game events

Backend (Real-Time Server)
- Node.js + Express
- Socket.IO manages real-time communication between hosts and players
- Firebase Admin SDK allows the server to securely read game data and validate sessions

Data Layer
- Firebase Authentication manages user accounts
- Firestore stores games, rounds, questions, and session metadata

High-Level Flow

1. User logs in via Firebase Authentication
2. User creates trivia games stored in Firestore
3. Host launches a trivia session
4. Socket.IO server creates a session and join code
5. Players connect to the session via WebSocket
6. Real-time events control gameplay (questions, answers, scoring)

This separation ensures that persistent data (games, questions, users) lives in Firestore while real-time session logic is handled by the Socket.IO server.

## Real-Time Session System

The live gameplay experience is powered by Socket.IO, which allows the server and clients to exchange events instantly.

Session Creation

1. Host selects a trivia game and creates a session
2. The client emits a `createSession` event to the server
3. The server:
   - Generates a unique 6-character join code
   - Creates an in-memory session object
   - Stores the host's socket ID
   - Creates a Socket.IO room for the session

Player Join

1. Player enters the join code
2. Client emits `joinSession`
3. Server validates the code and adds the player to the session room
4. Player socket joins the corresponding Socket.IO room

Live Gameplay

During the game, the host controls the flow of the session. Events include:

- `startGame`
- `startRound`
- `sendQuestion`
- `submitAnswer`
- `updateScores`
- `endRound`
- `endGame`

The server broadcasts events to all players in the session room.

Example event flow:

Host → Server → Players

Host starts question
↓
Server emits question to room
↓
Players submit answers
↓
Server processes responses
↓
Server emits updated scores


Host Socket Control

Each session tracks a `hostSocketId`. This allows the server to:

- Send host-only events
- Prevent players from triggering host actions
- Maintain secure control of the session flow

Reconnect Strategy

Sessions are designed to tolerate temporary disconnects. The client stores the following values in local storage:

- `sessionCode`
- `userId`
- `isHost`

When the client reconnects, it emits a reconnect event to restore the session state.

This approach allows both hosts and players to recover from page reloads or temporary network interruptions without losing the game session.


## Local Development Setup
1. Install pnpm
corepack enable
corepack prepare pnpm@latest --activate

2. Install dependencies
pnpm install

3. Create server environment file
btt-socket-server/.env

CLIENT_ORIGINS=http://localhost:5173
PORT=3001
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json

4. Place Firebase Admin key at
btt-socket-server/serviceAccountKey.json

5. Start development
pnpm run dev


The Vite development server will start the frontend while the Socket.IO server runs simultaneously.

## Gameplay Flow

1. Host logs in and selects a trivia game
2. Host creates a new trivia session
3. A join code is generated
4. Players join using the code
5. Host starts the game
6. Questions are delivered in real time
7. Scores update throughout the session

## Security Considerations

The backend server handles sensitive operations to prevent players from accessing correct answers or modifying game data. Firestore security rules ensure that users can only read and write their own game data.

## Key Engineering Challenges

Building Bar Time Trivia required solving several architectural and real-time system challenges.

### Secure Session Management

Live trivia sessions are coordinated through a Socket.IO server using unique 6-character join codes.

Each session tracks:

- sessionCode
- hostSocketId
- connected players
- current round and question state

Tracking the `hostSocketId` allows the server to distinguish between host and player actions. This prevents players from triggering host-only events such as starting rounds, advancing questions, or ending the game.

Sessions are stored in memory on the server and mapped to Socket.IO rooms so that events can be broadcast only to participants in the correct game session.

### Preventing Answer Leakage

One key design challenge was ensuring that players cannot access the correct answers before submitting their responses.

To address this:

- Correct answers are never sent to player clients
- The server controls scoring and validation
- Only the host receives full question data when needed
- Player-facing events include only the data required to render the question and answer options

This prevents players from inspecting network requests or client-side state to determine correct answers.

### Reliable Reconnection

Live games must remain stable even if a user refreshes their browser or briefly loses connection.

To support reconnection:

- Clients store `sessionCode`, `userId`, and `isHost` in local storage
- When the client reconnects, it emits a reconnect event
- The server restores the player's session state and re-adds the socket to the session room

This allows players and hosts to resume a session without restarting the game.



### Real-Time Event Coordination

Managing the flow of a live trivia game requires careful coordination of events between the host, server, and players.

The server acts as the authoritative source of truth for game state. The host triggers events such as:

- starting the game
- sending questions
- advancing rounds

The server then broadcasts the appropriate updates to all players in the session room.

This architecture prevents conflicting game states and ensures that all participants stay synchronized during gameplay.



## Future Improvements

Planned features include:

- Allow users to change their username
- Upload CSV files to create games, rounds, and questions
- Viewer mode to display questions and multiple-choice answers during live sessions
- Global searchable question bank
- Global round library
- Additional moderation and scoring controls for hosts
- Refactor navigation to use route-based identifiers (e.g. /game/:gameId and /session/:sessionCode) instead of passing state between pages

## License

This project is intended for educational and portfolio use.