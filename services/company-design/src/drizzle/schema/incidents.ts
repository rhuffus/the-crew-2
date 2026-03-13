import { text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { companyDesign } from './_schema'

export const incidents = companyDesign.table('incidents', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: text('entity_id').notNull(),
  severity: varchar('severity', { length: 20 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull().default(''),
  reportedAt: timestamp('reported_at', { withTimezone: true }).notNull(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
