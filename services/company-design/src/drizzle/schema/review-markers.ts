import { text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { companyDesign } from './_schema'

export const reviewMarkers = companyDesign.table('review_markers', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  entityId: text('entity_id').notNull(),
  nodeType: varchar('node_type', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  reviewerId: text('reviewer_id').notNull(),
  reviewerName: varchar('reviewer_name', { length: 255 }).notNull(),
  feedback: text('feedback'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
