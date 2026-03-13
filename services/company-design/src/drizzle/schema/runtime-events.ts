import { jsonb, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { companyDesign } from './_schema'

export const runtimeEvents = companyDesign.table('runtime_events', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  severity: varchar('severity', { length: 20 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull().default(''),
  sourceEntityType: varchar('source_entity_type', { length: 50 }).notNull(),
  sourceEntityId: text('source_entity_id').notNull(),
  targetEntityType: varchar('target_entity_type', { length: 50 }),
  targetEntityId: text('target_entity_id'),
  executionId: text('execution_id'),
  metadata: jsonb('metadata').notNull().default({}),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
})
