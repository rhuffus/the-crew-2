import { pgSchema, text, timestamp, varchar } from 'drizzle-orm/pg-core'

export const platformSchema = pgSchema('platform')

export const projects = platformSchema.table('projects', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull().default(''),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
