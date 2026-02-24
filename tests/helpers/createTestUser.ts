import { prisma } from '../../src/auth/infra/prismaClient';
import { hashPassword } from '../../src/auth/domain/hash';

export async function createTestUser(attrs?: { email?: string; password?: string }) {
  const email = attrs?.email ?? `test+${Date.now()}@example.com`;
  const password = attrs?.password ?? 'Password123!';
  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashed,
    },
  });
  return { user, password };
}

export default createTestUser;
