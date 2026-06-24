// api/index.js — Vercel Serverless Function entry point
// This file wraps the entire Express app for Vercel deployment.
// All existing server code is reused without modification.

import app from '../server/server.js';

export default app;
