import type { Request, Response } from 'express';
import { webAppUrl } from '../../config/env.js';
import { getCurrentHost } from '../../shared/context/current-host.js';
import { readSessionUserId, SESSION_COOKIE } from '../../shared/auth/session.js';
import { sendSuccess } from '../../shared/http/api-response.js';
import { integrationService, IntegrationService } from './integration.service.js';

export class IntegrationController {
  constructor(private readonly service: IntegrationService = integrationService) {}

  googleStatus = async (_req: Request, res: Response) => {
    return sendSuccess(res, await this.service.googleStatus(getCurrentHost(res)));
  };

  googleConnect = async (_req: Request, res: Response) => {
    return sendSuccess(res, { url: this.service.googleConnectUrl(getCurrentHost(res)) });
  };

  /** Google redirects the browser here; we always redirect back to the web app. */
  googleCallback = async (req: Request, res: Response) => {
    const query = req.query as { code?: string; state?: string; error?: string };
    const result = await this.service.completeGoogleConnect({
      code: query.code,
      state: query.state,
      error: query.error,
      sessionUserId: readSessionUserId(req.cookies?.[SESSION_COOKIE]),
    });
    res.redirect(303, `${webAppUrl}/integrations?google=${result}`);
  };

  googleDisconnect = async (_req: Request, res: Response) => {
    await this.service.disconnectGoogle(getCurrentHost(res));
    return sendSuccess(res, { disconnected: true });
  };
}

export const integrationController = new IntegrationController();
