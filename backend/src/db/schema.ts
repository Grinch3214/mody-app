import {
  pgTable,
  serial,
  varchar,
  timestamp,
  integer,
  jsonb,
} from 'drizzle-orm/pg-core';
import { ProductPrices, Stock } from '../common/types/product.types';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  segment: varchar('segment', { length: 255 }).notNull(),
  brand: varchar('brand', { length: 255 }).notNull(),
  name: varchar('name', { length: 500 }).notNull(),
  volume: integer('volume').notNull(),
  prices: jsonb('prices').notNull().$type<ProductPrices>(),
  stock: jsonb('stock').$type<Stock>(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type DbProduct = typeof products.$inferSelect;
