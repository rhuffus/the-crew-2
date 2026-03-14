-- CreateTable
CREATE TABLE "company_models" (
    "project_id" TEXT NOT NULL,
    "purpose" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT '',
    "scope" TEXT NOT NULL DEFAULT '',
    "principles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_models_pkey" PRIMARY KEY ("project_id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "mandate" TEXT NOT NULL DEFAULT '',
    "parent_id" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capabilities" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "owner_department_id" TEXT,
    "inputs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "outputs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "capabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "department_id" TEXT NOT NULL,
    "capability_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "accountability" TEXT NOT NULL DEFAULT '',
    "authority" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "type" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "provider_id" TEXT NOT NULL,
    "provider_type" VARCHAR(20) NOT NULL,
    "consumer_id" TEXT NOT NULL,
    "consumer_type" VARCHAR(20) NOT NULL,
    "acceptance_criteria" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflows" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "owner_department_id" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "trigger_description" TEXT NOT NULL DEFAULT '',
    "stages" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "participants" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "contract_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policies" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "scope" VARCHAR(20) NOT NULL,
    "department_id" TEXT,
    "type" VARCHAR(30) NOT NULL,
    "condition" TEXT NOT NULL DEFAULT '',
    "enforcement" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" VARCHAR(100) NOT NULL DEFAULT '',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "compatible_role_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_archetypes" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "role_id" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "skill_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "constraints" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_archetypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_assignments" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "archetype_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artifacts" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "type" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "producer_id" TEXT,
    "producer_type" VARCHAR(20),
    "consumer_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "artifacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_entries" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" TEXT NOT NULL,
    "entity_name" VARCHAR(255) NOT NULL,
    "action" VARCHAR(20) NOT NULL,
    "changes" JSONB,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_threads" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "scope_type" VARCHAR(30) NOT NULL,
    "entity_id" TEXT,
    "title" VARCHAR(255) NOT NULL DEFAULT '',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "content" TEXT NOT NULL,
    "entity_refs" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "actions" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "target_type" VARCHAR(30) NOT NULL,
    "target_id" TEXT,
    "scope_type" VARCHAR(30) NOT NULL,
    "author_id" TEXT NOT NULL,
    "author_name" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "parent_id" TEXT,
    "reply_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entity_locks" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "node_type" VARCHAR(50) NOT NULL,
    "locked_by" TEXT NOT NULL,
    "locked_by_name" VARCHAR(255) NOT NULL,
    "locked_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "entity_locks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_markers" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "node_type" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "reviewer_name" VARCHAR(255) NOT NULL,
    "feedback" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_markers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_views" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "state" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "releases" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "version" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "notes" TEXT NOT NULL DEFAULT '',
    "snapshot" JSONB,
    "validation_issues" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMPTZ,

    CONSTRAINT "releases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_compliances" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "contract_id" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "reason" TEXT,
    "last_checked_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contract_compliances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" TEXT NOT NULL,
    "severity" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "reported_at" TIMESTAMPTZ NOT NULL,
    "resolved_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_runs" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "workflow_id" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "current_stage_index" INTEGER,
    "started_at" TIMESTAMPTZ NOT NULL,
    "completed_at" TIMESTAMPTZ,
    "failure_reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workflow_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stage_executions" (
    "id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "workflow_id" TEXT NOT NULL,
    "stage_name" VARCHAR(255) NOT NULL,
    "stage_index" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "assignee_id" TEXT,
    "block_reason" TEXT,
    "started_at" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,

    CONSTRAINT "stage_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_seeds" (
    "project_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "mission" TEXT NOT NULL DEFAULT '',
    "vision" TEXT NOT NULL DEFAULT '',
    "company_type" VARCHAR(100) NOT NULL DEFAULT '',
    "restrictions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "principles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ai_budget" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "initial_objectives" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "founder_preferences" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "maturity_phase" VARCHAR(20) NOT NULL DEFAULT 'seed',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_seeds_pkey" PRIMARY KEY ("project_id")
);

-- CreateTable
CREATE TABLE "company_constitutions" (
    "project_id" TEXT NOT NULL,
    "operational_principles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "autonomy_limits" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "budget_config" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "approval_criteria" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "naming_conventions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "expansion_rules" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "context_minimization_policy" TEXT NOT NULL DEFAULT '',
    "quality_rules" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "delivery_rules" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_constitutions_pkey" PRIMARY KEY ("project_id")
);

-- CreateTable
CREATE TABLE "organizational_units" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "uo_type" VARCHAR(20) NOT NULL,
    "mandate" TEXT NOT NULL DEFAULT '',
    "purpose" TEXT NOT NULL DEFAULT '',
    "parent_uo_id" TEXT,
    "coordinator_agent_id" TEXT,
    "functions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizational_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lcp_agents" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "agent_type" VARCHAR(20) NOT NULL,
    "uo_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT '',
    "skills" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "inputs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "outputs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "responsibilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "budget" JSONB,
    "context_window" INTEGER,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "system_prompt_ref" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lcp_agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposals" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "proposal_type" VARCHAR(30) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "motivation" TEXT NOT NULL DEFAULT '',
    "problem_detected" TEXT NOT NULL DEFAULT '',
    "expected_benefit" TEXT NOT NULL DEFAULT '',
    "estimated_cost" TEXT NOT NULL DEFAULT '',
    "context_to_assign" TEXT NOT NULL DEFAULT '',
    "affected_contract_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "affected_workflow_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "required_approval" TEXT NOT NULL DEFAULT '',
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "proposed_by_agent_id" TEXT NOT NULL,
    "reviewed_by_user_id" TEXT,
    "approved_by_user_id" TEXT,
    "rejection_reason" TEXT,
    "implemented_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "runtime_executions" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "execution_type" VARCHAR(30) NOT NULL,
    "workflow_id" TEXT,
    "agent_id" TEXT,
    "status" VARCHAR(20) NOT NULL,
    "started_at" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,
    "input" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "output" JSONB,
    "errors" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "waiting_for" TEXT,
    "approvals" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "ai_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "log_summary" TEXT NOT NULL DEFAULT '',
    "parent_execution_id" TEXT,
    "operations_run_id" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "runtime_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "runtime_events" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "event_type" VARCHAR(50) NOT NULL,
    "severity" VARCHAR(20) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "source_entity_type" VARCHAR(50) NOT NULL,
    "source_entity_id" TEXT NOT NULL,
    "target_entity_type" VARCHAR(50),
    "target_entity_id" TEXT,
    "execution_id" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "occurred_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "runtime_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bootstrap_conversations" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "ceo_agent_id" TEXT NOT NULL,
    "status" VARCHAR(40) NOT NULL DEFAULT 'not-started',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bootstrap_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_documents" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "body_markdown" TEXT NOT NULL DEFAULT '',
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "linked_entity_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "last_updated_by" VARCHAR(255) NOT NULL DEFAULT 'system',
    "source_type" VARCHAR(20) NOT NULL DEFAULT 'system',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bootstrap_conversations_project_id_key" ON "bootstrap_conversations"("project_id");
