import { integer, jsonb, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { companyDesign } from './_schema'

export const lcpAgents = companyDesign.table('lcp_agents', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull().default(''),
  agentType: varchar('agent_type', { length: 20 }).notNull(),
  uoId: text('uo_id').notNull(),
  role: text('role').notNull().default(''),
  skills: jsonb('skills').notNull().default([]),
  inputs: text('inputs').array().notNull().default([]),
  outputs: text('outputs').array().notNull().default([]),
  responsibilities: text('responsibilities').array().notNull().default([]),
  budget: jsonb('budget'),
  contextWindow: integer('context_window'),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  systemPromptRef: text('system_prompt_ref'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
