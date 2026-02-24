import { validateEmail } from './validators';
import { verifyPassword } from './hash';
import prisma from '../infra/prismaClient';

export async function verifyCredentials(email: string, password: string) {
  const normalized = validateEmail(email);
  const user = await prisma.user.findUnique({ where: { email: normalized } });
  if (!user) {
    const e = new Error('Invalid credentials');
    (e as any).status = 401;
    throw e;
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    const e = new Error('Invalid credentials');
    (e as any).status = 401;
    throw e;
  }

  // update lastLoginAt
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  return { id: user.id, email: user.email };
}

export default { verifyCredentials };
