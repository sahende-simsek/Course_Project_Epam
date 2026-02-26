#!/usr/bin/env node
/**
 * Seed admin emails from ADMIN_EMAILS env var (comma-separated)
 * Usage (local):
 *   ADMIN_EMAILS="alice@example.com,bob@example.com" node scripts/seed-admins.js
 * In CI/deploy, set ADMIN_EMAILS as a secret and call this script after migrations.
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const raw = process.env.ADMIN_EMAILS || '';
  const emails = raw
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  if (!emails.length) {
    console.log('No ADMIN_EMAILS provided; nothing to do.');
    return;
  }

  console.log(`Seeding ${emails.length} admin emails...`);

  // Basic email validation
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const invalid = emails.filter(e => !emailRe.test(e));
  if (invalid.length) {
    console.error('Aborting: invalid ADMIN_EMAILS entries:', invalid.join(', '));
    process.exitCode = 2;
    return;
  }

  for (const email of emails) {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        if (user.role !== 'ADMIN') {
          await prisma.user.update({ where: { email }, data: { role: 'ADMIN' } });
          console.log(`Updated existing user ${email} -> role=ADMIN`);
        } else {
          console.log(`User ${email} already has ADMIN role`);
        }
      } else {
        // Create a placeholder admin user. Adjust fields according to your schema.
        const createData = { email, role: 'ADMIN' };
        // Add optional defaults if your schema requires them (name, password, etc.)
        await prisma.user.create({ data: createData });
        console.log(`Created placeholder admin user ${email}`);
      }
    } catch (err) {
      console.error(`Failed to process ${email}:`, err.message || err);
    }
  }

  console.log('Admin seed complete.');
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
