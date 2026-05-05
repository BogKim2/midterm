import { sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
})

export const dailyQuotes = sqliteTable('daily_quotes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  quoteDate: text('quote_date').notNull().unique(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  sourceType: text('source_type', { enum: ['ai', 'manual', 'fallback'] }).notNull(),
  tags: text('tags').notNull().default('[]'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
})

export const savedItems = sqliteTable('saved_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  itemType: text('item_type', { enum: ['daily', 'user'] }).notNull(),
  itemId: text('item_id').notNull(),
  savedAt: text('saved_at').notNull().default(sql`(datetime('now'))`),
}, (t) => ({
  uniq: unique().on(t.userId, t.itemType, t.itemId),
}))

export const userPosts = sqliteTable('user_posts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  body: text('body').notNull(),
  visibility: text('visibility', { enum: ['public', 'private'] }).notNull().default('private'),
  tags: text('tags').notNull().default('[]'),
  createdAt: text('created_at').notNull().default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').notNull().default(sql`(datetime('now'))`),
})
