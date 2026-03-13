import { jsonb, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { companyDesign } from './_schema'

export const releases = companyDesign.table('releases', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  version: varchar('version', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  notes: text('notes').notNull().default(''),
  snapshot: jsonb('snapshot'),
  validationIssues: jsonb('validation_issues').notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
})
