import { text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { companyDesign } from './_schema'

export const contractCompliances = companyDesign.table('contract_compliances', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  contractId: text('contract_id').notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  reason: text('reason'),
  lastCheckedAt: timestamp('last_checked_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
