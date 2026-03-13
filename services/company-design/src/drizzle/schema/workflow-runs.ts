import { integer, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { companyDesign } from './_schema'

export const workflowRuns = companyDesign.table('workflow_runs', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  workflowId: text('workflow_id').notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  currentStageIndex: integer('current_stage_index'),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  failureReason: text('failure_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
