import bcrypt from 'bcrypt';
import { customAlphabet } from 'nanoid';
import { Prisma, type User as PrismaUser } from '@prisma/client';
import {
  loginSchema,
  signupSchema,
  type LoginDto,
  type SignupDto,
  type User,
} from '@calendly/shared';
import { webAppUrl } from '../../config/env.js';
import { ConflictError, UnauthorizedError } from '../../shared/errors/app-error.js';
import { displayName } from '../../shared/context/current-host.js';
import { sendWelcomeEmail } from '../../shared/email/email.service.js';
import { authRepository, AuthRepository } from './auth.repository.js';

const BCRYPT_ROUNDS = 10;
const usernameSuffix = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 4);

/**
 * Compared against when the email is unknown, so a login attempt takes the
 * same time whether or not the account exists (no account enumeration).
 */
let dummyHash: Promise<string> | null = null;
function getDummyHash(): Promise<string> {
  dummyHash ??= bcrypt.hash('not-a-real-password', BCRYPT_ROUNDS);
  return dummyHash;
}

/** "Jane.Doe+cal@x.com" -> "jane-doe-cal". Always 3 to 40 URL-safe characters. */
function usernameBase(email: string): string {
  const local = email.split('@')[0] ?? '';
  const base = local
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return base.length >= 3 ? base : `host-${base || usernameSuffix()}`;
}

export function toUserDto(user: PrismaUser): User {
  return {
    id: user.id,
    firstname: user.firstname,
    lastname: user.lastname,
    name: displayName(user),
    email: user.email,
    username: user.username,
    timezone: user.timezone,
  };
}

export class AuthService {
  constructor(private readonly repo: AuthRepository = authRepository) {}

  async signup(input: SignupDto): Promise<PrismaUser> {
    const dto = signupSchema.parse(input);

    if (await this.repo.emailExists(dto.email)) {
      throw new ConflictError('An account with this email already exists');
    }

    let user: PrismaUser;
    try {
      user = await this.repo.createHost({
        firstname: dto.firstname,
        lastname: dto.lastname,
        email: dto.email,
        username: await this.pickUsername(dto.email),
        passwordHash: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
        timezone: dto.timezone,
      });
    } catch (error) {
      // Two signups racing for the same email or username.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictError('An account with this email already exists');
      }
      throw error;
    }

    // Never throws: a mail outage must not fail a signup that is saved.
    await sendWelcomeEmail({
      hostName: displayName(user),
      hostEmail: user.email,
      dashboardUrl: `${webAppUrl}/`,
      publicPageUrl: `${webAppUrl}/book/${user.username}`,
    });

    return user;
  }

  async login(input: LoginDto): Promise<PrismaUser> {
    const dto = loginSchema.parse(input);
    const user = await this.repo.findActiveByEmail(dto.email);

    const hash = user?.password ?? (await getDummyHash());
    const matches = await bcrypt.compare(dto.password, hash);

    if (!user?.password || !matches) {
      throw new UnauthorizedError('Incorrect email or password');
    }
    return user;
  }

  private async pickUsername(email: string): Promise<string> {
    const base = usernameBase(email);
    if (!(await this.repo.usernameExists(base))) return base;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const candidate = `${base}-${usernameSuffix()}`;
      if (!(await this.repo.usernameExists(candidate))) return candidate;
    }
    throw new ConflictError('Could not create the account, please try again');
  }
}

export const authService = new AuthService();
