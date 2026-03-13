import { text, timestamp } from 'drizzle-orm/pg-core'
import { companyDesign } from './_schema'

export const companyModels = companyDesign.table('company_models', {
  projectId: text('project_id').primaryKey(),
  purpose: text('purpose').notNull().default(''),
  type: text('type').notNull().default(''),
  scope: text('scope').notNull().default(''),
  principles: text('principles').array().notNull().default([]),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
