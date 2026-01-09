import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from backend root
// From packages/api/lib/index.js -> ../../../.env (backend/.env)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import createApp from "./app";

const app = createApp();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}/`);
  console.log(`Apple Music configured: ${!!process.env.APPLE_TEAM_ID}`);
});