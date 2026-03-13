import { jsonb, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { companyDesign } from './_schema'

export const auditEntries = companyDesign.table('audit_entries', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: text('entity_id').notNull(),
  entityName: varchar('entity_name', { length: 255 }).notNull(),
  action: varchar('action', { length: 20 }).notNull(),
  changes: jsonb('changes'),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
})
