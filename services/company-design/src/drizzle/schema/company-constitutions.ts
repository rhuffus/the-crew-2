import { jsonb, text, timestamp } from 'drizzle-orm/pg-core'
import { companyDesign } from './_schema'

export const companyConstitutions = companyDesign.table('company_constitutions', {
  projectId: text('project_id').primaryKey(),
  operationalPrinciples: text('operational_principles').array().notNull().default([]),
  autonomyLimits: jsonb('autonomy_limits').notNull().default({}),
  budgetConfig: jsonb('budget_config').notNull().default({}),
  approvalCriteria: jsonb('approval_criteria').notNull().default([]),
  namingConventions: text('naming_conventions').array().notNull().default([]),
  expansionRules: jsonb('expansion_rules').notNull().default([]),
  contextMinimizationPolicy: text('context_minimization_policy').notNull().default(''),
  qualityRules: text('quality_rules').array().notNull().default([]),
  deliveryRules: text('delivery_rules').array().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
