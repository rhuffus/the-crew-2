import { jsonb, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { companyDesign } from './_schema'

export const chatMessages = companyDesign.table('chat_messages', {
  id: text('id').primaryKey(),
  threadId: text('thread_id').notNull(),
  role: varchar('role', { length: 20 }).notNull(),
  content: text('content').notNull(),
  entityRefs: jsonb('entity_refs').notNull().default([]),
  actions: jsonb('actions').notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
