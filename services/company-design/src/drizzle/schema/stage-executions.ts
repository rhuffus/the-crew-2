import { integer, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { companyDesign } from './_schema'

export const stageExecutions = companyDesign.table('stage_executions', {
  id: text('id').primaryKey(),
  runId: text('run_id').notNull(),
  workflowId: text('workflow_id').notNull(),
  stageName: varchar('stage_name', { length: 255 }).notNull(),
  stageIndex: integer('stage_index').notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  assigneeId: text('assignee_id'),
  blockReason: text('block_reason'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
})
