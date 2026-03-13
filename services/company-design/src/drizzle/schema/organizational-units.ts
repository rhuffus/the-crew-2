import { text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { companyDesign } from './_schema'

export const organizationalUnits = companyDesign.table('organizational_units', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull().default(''),
  uoType: varchar('uo_type', { length: 20 }).notNull(),
  mandate: text('mandate').notNull().default(''),
  purpose: text('purpose').notNull().default(''),
  parentUoId: text('parent_uo_id'),
  coordinatorAgentId: text('coordinator_agent_id'),
  functions: text('functions').array().notNull().default([]),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
