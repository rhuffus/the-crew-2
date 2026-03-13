import { jsonb, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { companyDesign } from './_schema'

export const projectSeeds = companyDesign.table('project_seeds', {
  projectId: text('project_id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull().default(''),
  mission: text('mission').notNull().default(''),
  vision: text('vision').notNull().default(''),
  companyType: varchar('company_type', { length: 100 }).notNull().default(''),
  restrictions: text('restrictions').array().notNull().default([]),
  principles: text('principles').array().notNull().default([]),
  aiBudget: jsonb('ai_budget').notNull().default({}),
  initialObjectives: text('initial_objectives').array().notNull().default([]),
  founderPreferences: jsonb('founder_preferences').notNull().default({}),
  maturityPhase: varchar('maturity_phase', { length: 20 }).notNull().default('seed'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
