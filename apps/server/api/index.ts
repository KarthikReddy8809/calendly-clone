import type { IncomingMessage, ServerResponse } from 'node:http';
import { createApp } from '../dist/app.js';
import { connectDatabase } from '../dist/infra/prisma.js';

let app: ReturnType<typeof createApp> | undefined;
let ready: Promise<void> | undefined;

async function ensureReady() {
  if (!ready) {
    ready = connectDatabase().then(() => {
      app = createApp();
    });
  }
  await ready;
}

/** Vercel serverless entry — wraps the Express app for production deployment. */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await ensureReady();
  app!(req, res);
}
