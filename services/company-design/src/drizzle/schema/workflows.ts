import { jsonb, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { companyDesign } from './_schema'

export const workflows = companyDesign.table('workflows', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull().default(''),
  ownerDepartmentId: text('owner_department_id'),
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  triggerDescription: text('trigger_description').notNull().default(''),
  stages: jsonb('stages').notNull().default([]),
  participants: jsonb('participants').notNull().default([]),
  contractIds: text('contract_ids').array().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
