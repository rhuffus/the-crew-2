import { boolean, integer, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { companyDesign } from './_schema'

export const comments = companyDesign.table('comments', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  targetType: varchar('target_type', { length: 30 }).notNull(),
  targetId: text('target_id'),
  scopeType: varchar('scope_type', { length: 30 }).notNull(),
  authorId: text('author_id').notNull(),
  authorName: varchar('author_name', { length: 255 }).notNull(),
  content: text('content').notNull(),
  resolved: boolean('resolved').notNull().default(false),
  parentId: text('parent_id'),
  replyCount: integer('reply_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
