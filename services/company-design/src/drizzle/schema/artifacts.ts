import { text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { companyDesign } from './_schema'

export const artifacts = companyDesign.table('artifacts', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull().default(''),
  type: varchar('type', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  producerId: text('producer_id'),
  producerType: varchar('producer_type', { length: 20 }),
  consumerIds: text('consumer_ids').array().notNull().default([]),
  tags: text('tags').array().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
