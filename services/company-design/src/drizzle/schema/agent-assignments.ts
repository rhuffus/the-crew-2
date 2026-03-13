import { text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { companyDesign } from './_schema'

export const agentAssignments = companyDesign.table('agent_assignments', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  archetypeId: text('archetype_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
