// One-time migration: move existing Prisma `User` rows (email + bcrypt
// passwordHash + cv/profile/session jsonb) into Supabase Auth (auth.users)
// and public.cv_profiles.
//
// Existing bcrypt hashes are imported as-is via the Admin API's
// `password_hash` field — users keep their current password, no reset needed.
//
// Usage: node --env-file=.env scripts/migrate-users-to-supabase.mjs [--dry-run]

import { PrismaClient } from '@prisma/client';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.');
  process.exit(1);
}

const dryRun = process.argv.includes('--dry-run');
const prisma = new PrismaClient();

async function createAuthUser(email, passwordHash) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password_hash: passwordHash,
      email_confirm: true,
    }),
  });

  const body = await res.json();
  if (!res.ok) throw new Error(`admin createUser failed (${res.status}): ${JSON.stringify(body)}`);
  return body; // { id, email, ... }
}

async function upsertCvProfile(userId, { cv, profile, session }) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/cv_profiles?id=eq.${userId}`, {
    method: 'PATCH',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ cv, profile, session }),
  });

  if (!res.ok) throw new Error(`cv_profiles update failed (${res.status}): ${await res.text()}`);
}

async function main() {
  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} user(s) to migrate.${dryRun ? ' (dry run)' : ''}`);

  let migrated = 0;
  let skipped = 0;

  for (const user of users) {
    try {
      if (dryRun) {
        console.log(`[dry-run] would migrate ${user.email}`);
        continue;
      }

      // The signup trigger (on_auth_user_created) creates the cv_profiles
      // row automatically as part of this insert.
      const authUser = await createAuthUser(user.email, user.passwordHash);
      await upsertCvProfile(authUser.id, {
        cv: user.cv ?? null,
        profile: user.profile ?? null,
        session: user.session ?? null,
      });

      console.log(`Migrated ${user.email} -> ${authUser.id}`);
      migrated += 1;
    } catch (err) {
      console.error(`Skipped ${user.email}:`, err instanceof Error ? err.message : err);
      skipped += 1;
    }
  }

  console.log(`Done. migrated=${migrated} skipped=${skipped}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
