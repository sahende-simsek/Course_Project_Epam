import { validateEmail, validatePassword } from './validators';
import { hashPassword } from './hash';
import prisma from '../infra/prismaClient';

export async function createUser(email: string, password: string) {
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

  try {
    const user = await prisma.user.create({
      data: {
        email: normalized,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
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
