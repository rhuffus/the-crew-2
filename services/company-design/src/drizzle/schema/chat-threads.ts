import { text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { companyDesign } from './_schema'

export const chatThreads = companyDesign.table('chat_threads', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  scopeType: varchar('scope_type', { length: 30 }).notNull(),
  entityId: text('entity_id'),
  title: varchar('title', { length: 255 }).notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
