import { text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { companyDesign } from './_schema'

export const policies = companyDesign.table('policies', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull().default(''),
  scope: varchar('scope', { length: 20 }).notNull(),
  departmentId: text('department_id'),
  type: varchar('type', { length: 30 }).notNull(),
  condition: text('condition').notNull().default(''),
  enforcement: varchar('enforcement', { length: 20 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
