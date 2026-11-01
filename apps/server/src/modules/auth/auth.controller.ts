import type { Request, Response } from 'express';
import { getCurrentHost } from '../../shared/context/current-host.js';
import { clearSessionCookie, setSessionCookie } from '../../shared/auth/session.js';
import { sendSuccess } from '../../shared/http/api-response.js';
import { authService, AuthService, toUserDto } from './auth.service.js';

export class AuthController {
  constructor(private readonly service: AuthService = authService) {}

  signup = async (req: Request, res: Response) => {
    const user = await this.service.signup(req.body);
    setSessionCookie(res, user.id);
    return sendSuccess(res, toUserDto(user), 201);
  };

  login = async (req: Request, res: Response) => {
    const user = await this.service.login(req.body);
    setSessionCookie(res, user.id);
    return sendSuccess(res, toUserDto(user));
  };

  logout = async (_req: Request, res: Response) => {
    clearSessionCookie(res);
    return sendSuccess(res, { loggedOut: true });
  };

  me = async (_req: Request, res: Response) => {
    return sendSuccess(res, toUserDto(getCurrentHost(res)));
  };
}

export const authController = new AuthController();
