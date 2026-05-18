import * as dotenv from 'dotenv';
dotenv.config();

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { users } from './schema';

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  const password = await bcrypt.hash('admin', 10);

  await db
    .insert(users)
    .values({ email: 'admin', password })
    .onConflictDoNothing();

  console.log('Seeded: admin / admin');
  await pool.end();
}

seed().catch(console.error);
