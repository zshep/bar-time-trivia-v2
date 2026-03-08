# Bar Time Trivia


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