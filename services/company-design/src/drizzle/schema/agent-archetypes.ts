import { jsonb, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { companyDesign } from './_schema'

export const agentArchetypes = companyDesign.table('agent_archetypes', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull().default(''),
  roleId: text('role_id').notNull(),
  departmentId: text('department_id').notNull(),
  skillIds: text('skill_ids').array().notNull().default([]),
  constraints: jsonb('constraints').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
