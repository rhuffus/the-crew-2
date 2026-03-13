import { text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { companyDesign } from './_schema'

export const contracts = companyDesign.table('contracts', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull().default(''),
  type: varchar('type', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  providerId: text('provider_id').notNull(),
  providerType: varchar('provider_type', { length: 20 }).notNull(),
  consumerId: text('consumer_id').notNull(),
  consumerType: varchar('consumer_type', { length: 20 }).notNull(),
  acceptanceCriteria: text('acceptance_criteria').array().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
