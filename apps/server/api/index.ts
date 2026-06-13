import serverless from 'serverless-http';
import { createApp } from '../dist/app.js';
import { connectDatabase } from '../dist/infra/prisma.js';

let handler: ReturnType<typeof serverless> | undefined;
let ready: Promise<void> | undefined;

async function ensureReady() {
  if (!ready) {
    ready = connectDatabase().then(() => {
      handler = serverless(createApp());
    });
  }
  await ready;
}

/** Vercel serverless entry — wraps the Express app for production deployment. */
export default async function vercelHandler(req: unknown, res: unknown) {
  await ensureReady();
  return handler!(req as never, res as never);
}
