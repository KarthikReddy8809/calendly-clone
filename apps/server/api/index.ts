import type { Express } from 'express';
import type { IncomingMessage, ServerResponse } from 'node:http';

let app: Express | undefined;
let ready: Promise<void> | undefined;
let bootError: Error | undefined;

async function ensureReady() {
  if (bootError) throw bootError;
  if (!ready) {
    ready = (async () => {
      try {
        const { connectDatabase } = await import('../dist/infra/prisma.js');
        const { createApp } = await import('../dist/app.js');
        await connectDatabase();
        app = createApp();
      } catch (error) {
        bootError = error instanceof Error ? error : new Error(String(error));
        throw bootError;
      }
    })();
  }
  await ready;
}

function sendError(res: ServerResponse, message: string, statusCode = 503) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify({
      success: false,
      error: { code: 'SERVICE_UNAVAILABLE', message },
    }),
  );
}

/** Vercel serverless entry — forwards native Node req/res to Express. */
export default async function vercelHandler(req: IncomingMessage, res: ServerResponse) {
  try {
    await ensureReady();
    app!(req, res);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server failed to start';
    sendError(res, message);
  }
}
