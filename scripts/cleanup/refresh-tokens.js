#!/usr/bin/env node
// Simple cleanup script to remove revoked/expired refresh tokens older than 30 days
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const cutoff = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const res = await prisma.refreshToken.deleteMany({ where: { revoked: true, updatedAt: { lt: cutoff } } }).catch(() => ({ count: 0 }));
  console.log('Cleanup result', res);
  await prisma.$disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
