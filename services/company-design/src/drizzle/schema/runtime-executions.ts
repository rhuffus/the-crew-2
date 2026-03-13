import { doublePrecision, jsonb, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { companyDesign } from './_schema'

export const runtimeExecutions = companyDesign.table('runtime_executions', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  executionType: varchar('execution_type', { length: 30 }).notNull(),
  workflowId: text('workflow_id'),
  agentId: text('agent_id'),
  status: varchar('status', { length: 20 }).notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  input: jsonb('input').notNull().default({}),
  output: jsonb('output'),
  errors: jsonb('errors').notNull().default([]),
  waitingFor: text('waiting_for'),
  approvals: jsonb('approvals').notNull().default([]),
  aiCost: doublePrecision('ai_cost').notNull().default(0),
  logSummary: text('log_summary').notNull().default(''),
  parentExecutionId: text('parent_execution_id'),
  operationsRunId: text('operations_run_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
