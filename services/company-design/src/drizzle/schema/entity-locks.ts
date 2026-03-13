import { text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { companyDesign } from './_schema'

export const entityLocks = companyDesign.table('entity_locks', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  entityId: text('entity_id').notNull(),
  nodeType: varchar('node_type', { length: 50 }).notNull(),
  lockedBy: text('locked_by').notNull(),
  lockedByName: varchar('locked_by_name', { length: 255 }).notNull(),
  lockedAt: timestamp('locked_at', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
})
