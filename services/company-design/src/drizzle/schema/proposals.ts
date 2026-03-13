import { text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { companyDesign } from './_schema'

export const proposals = companyDesign.table('proposals', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  proposalType: varchar('proposal_type', { length: 30 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull().default(''),
  motivation: text('motivation').notNull().default(''),
  problemDetected: text('problem_detected').notNull().default(''),
  expectedBenefit: text('expected_benefit').notNull().default(''),
  estimatedCost: text('estimated_cost').notNull().default(''),
  contextToAssign: text('context_to_assign').notNull().default(''),
  affectedContractIds: text('affected_contract_ids').array().notNull().default([]),
  affectedWorkflowIds: text('affected_workflow_ids').array().notNull().default([]),
  requiredApproval: text('required_approval').notNull().default(''),
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  proposedByAgentId: text('proposed_by_agent_id').notNull(),
  reviewedByUserId: text('reviewed_by_user_id'),
  approvedByUserId: text('approved_by_user_id'),
  rejectionReason: text('rejection_reason'),
  implementedAt: timestamp('implemented_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
