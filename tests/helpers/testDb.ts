import prisma from '../../src/auth/infra/prismaClient';

export async function clearDb() {
  // Clear tables used by auth feature. Adjust if more models are added.
  // Order matters for FK constraints.
  try {
    await prisma.evaluation.deleteMany();
  } catch (e) {
    // ignore if table doesn't exist in some test setups
  }
  try {
    await prisma.attachment.deleteMany();
  } catch (e) {
    // ignore if table doesn't exist in some test setups
  }
  try {
    await prisma.idea.deleteMany();
  } catch (e) {
    // ignore if table doesn't exist in some test setups
  }
  try {
    await prisma.refreshToken.deleteMany();
  } catch (e) {
    // ignore if table doesn't exist in some test setups
  }
  try {
    await prisma.user.deleteMany();
  } catch (e) {
    // ignore
  }
}

export async function disconnectDb() {
  await prisma.$disconnect();
}

export default { clearDb, disconnectDb };
