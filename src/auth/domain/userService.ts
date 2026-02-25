import { validateEmail, validatePassword } from './validators';
import { hashPassword } from './hash';
import prisma from '../infra/prismaClient';
import config from '../../config';
import { Role } from '@prisma/client';

function deriveRoleForEmail(normalizedEmail: string): Role {
  const emailLower = normalizedEmail.toLowerCase();

  const adminEmails = config.ADMIN_EMAILS || [];
  if (adminEmails.some((e) => e === emailLower)) {
    return Role.EVALUATOR;
  }

  const atIndex = emailLower.lastIndexOf('@');
  const domain = atIndex !== -1 ? emailLower.slice(atIndex + 1) : '';
  const adminDomains = config.ADMIN_EMAIL_DOMAINS || [];
  if (domain && adminDomains.some((d) => d === domain)) {
    return Role.EVALUATOR;
  }

  return Role.SUBMITTER;
}

export async function createUser(email: string, password: string, username?: string) {
  const normalized = validateEmail(email);
  if (!validatePassword(password)) {
    throw new Error('Password validation failed');
  }

  // Prevent duplicate emails in both real DB and in-memory test client.
  const existing = await prisma.user.findUnique({ where: { email: normalized } });
  if (existing) {
    const e = new Error('Conflict: email already exists');
    (e as any).status = 409;
    throw e;
  }

  const passwordHash = await hashPassword(password);
  const role = deriveRoleForEmail(normalized);

  try {
    const user = await prisma.user.create({
      data: {
        email: normalized,
        username: username || null,
        passwordHash,
        role,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });
    return user;
  } catch (err: any) {
    // Prisma unique constraint error code P2002
    if (err?.code === 'P2002') {
      const e = new Error('Conflict: email already exists');
      // attach status for adapters
      (e as any).status = 409;
      throw e;
    }
    throw err;
  }
}

export default { createUser };
