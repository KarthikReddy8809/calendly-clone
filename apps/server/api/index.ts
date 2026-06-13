import serverless from 'serverless-http';

let handler: ReturnType<typeof serverless> | undefined;
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
        handler = serverless(createApp());
      } catch (error) {
        bootError = error instanceof Error ? error : new Error(String(error));
        throw bootError;
      }
    })();
  }
  await ready;
}

/** Vercel serverless entry — wraps the Express app for production deployment. */
export default async function vercelHandler(req: unknown, res: unknown) {
  const response = res as {
    statusCode?: number;
    setHeader: (name: string, value: string) => void;
    end: (body: string) => void;
  };

  try {
    await ensureReady();
    return handler!(req as never, res as never);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server failed to start';
    if (typeof response.setHeader === 'function') {
      response.statusCode = 503;
      response.setHeader('Content-Type', 'application/json');
      response.end(
        JSON.stringify({
          success: false,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message,
          },
        }),
      );
      return;
    }
    throw error;
  }
}
