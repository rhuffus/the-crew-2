import { VERTICALER_PROJECT_ID } from '@the-crew/shared-types'
import type { ArtifactType } from '@the-crew/shared-types'

const P = VERTICALER_PROJECT_ID

// ============================================================
// Deterministic IDs
// ============================================================

const did = (type: string, n: number) => `vrt-${type}-${String(n).padStart(4, '0')}`

export const DEPT = {
  EXECUTIVE: did('dept', 1),
  PRODUCT: did('dept', 2),
  ENGINEERING: did('dept', 3),
  DESIGN: did('dept', 4),
  OPERATIONS: did('dept', 5),
  CUSTOMER_SUCCESS: did('dept', 6),
  SALES: did('dept', 7),
  FINANCE: did('dept', 8),
  COMPLIANCE: did('dept', 9),
} as const

export const CAP = {
  PRODUCT_DISCOVERY: did('cap', 1),
  PRD_DEFINITION: did('cap', 2),
  UX_DESIGN: did('cap', 3),
  TECHNICAL_DESIGN: did('cap', 4),
  SOFTWARE_IMPLEMENTATION: did('cap', 5),
  QA_VALIDATION: did('cap', 6),
  RELEASE_MANAGEMENT: did('cap', 7),
  INCIDENT_INTAKE: did('cap', 8),
  FIELD_DISPATCH: did('cap', 9),
  MAINTENANCE_CONTRACT: did('cap', 10),
  ELEVATOR_ASSET_REGISTRY: did('cap', 11),
  INSPECTION_MANAGEMENT: did('cap', 12),
  WORK_ORDER_PROCESSING: did('cap', 13),
  BILLING_RENEWALS: did('cap', 14),
  CUSTOMER_SUPPORT: did('cap', 15),
  COMPLIANCE_MONITORING: did('cap', 16),
} as const

export const ROLE = {
  CEO: did('role', 1),
  HEAD_OF_PRODUCT: did('role', 2),
  PRODUCT_MANAGER: did('role', 3),
  HEAD_OF_ENGINEERING: did('role', 4),
  TECH_LEAD: did('role', 5),
  FRONTEND_ENGINEER: did('role', 6),
  BACKEND_ENGINEER: did('role', 7),
  QA_LEAD: did('role', 8),
  HEAD_OF_OPERATIONS: did('role', 9),
  DISPATCH_COORDINATOR: did('role', 10),
  COMPLIANCE_MANAGER: did('role', 11),
  CUSTOMER_SUCCESS_LEAD: did('role', 12),
  SALES_LEAD: did('role', 13),
  FINANCE_MANAGER: did('role', 14),
  DESIGN_LEAD: did('role', 15),
} as const

export const SKILL = {
  DRAFT_PRD: did('skll', 1),
  REFINE_SCOPE: did('skll', 2),
  MAP_WORKFLOW: did('skll', 3),
  DEFINE_CONTRACT: did('skll', 4),
  REVIEW_UX: did('skll', 5),
  PRODUCE_TECH_SPEC: did('skll', 6),
  IMPLEMENT_FEATURE: did('skll', 7),
  REVIEW_CODE: did('skll', 8),
  DESIGN_TEST_PLAN: did('skll', 9),
  VALIDATE_RELEASE: did('skll', 10),
  ANALYZE_INCIDENT: did('skll', 11),
  PLAN_DISPATCH: did('skll', 12),
  REVIEW_COMPLIANCE: did('skll', 13),
  UPDATE_ARTIFACT_METADATA: did('skll', 14),
} as const

export const ARCH = {
  CEO_AGENT: did('arch', 1),
  PRODUCT_STRATEGIST: did('arch', 2),
  PRODUCT_OPS: did('arch', 3),
  DESIGN_LEAD: did('arch', 4),
  ENGINEERING_MANAGER: did('arch', 5),
  FRONTEND_BUILDER: did('arch', 6),
  BACKEND_BUILDER: did('arch', 7),
  QA_REVIEWER: did('arch', 8),
  RELEASE_COORDINATOR: did('arch', 9),
  OPS_COORDINATOR: did('arch', 10),
  COMPLIANCE_REVIEWER: did('arch', 11),
  CUSTOMER_SUCCESS: did('arch', 12),
  SALES_OPS: did('arch', 13),
  FINANCE_OPS: did('arch', 14),
} as const

export const ASGN = {
  CEO_AGENT: did('asgn', 1),
  PRODUCT_STRATEGIST: did('asgn', 2),
  PRODUCT_OPS: did('asgn', 3),
  DESIGN_LEAD: did('asgn', 4),
  ENGINEERING_MANAGER: did('asgn', 5),
  FRONTEND_BUILDER: did('asgn', 6),
  BACKEND_BUILDER: did('asgn', 7),
  QA_REVIEWER: did('asgn', 8),
  RELEASE_COORDINATOR: did('asgn', 9),
  OPS_COORDINATOR: did('asgn', 10),
  COMPLIANCE_REVIEWER: did('asgn', 11),
  CUSTOMER_SUCCESS: did('asgn', 12),
  SALES_OPS: did('asgn', 13),
  FINANCE_OPS: did('asgn', 14),
} as const

export const CONT = {
  PRD_TO_DESIGN: did('cont', 1),
  DESIGN_TO_ENGINEERING: did('cont', 2),
  ENGINEERING_TO_QA: did('cont', 3),
  QA_TO_RELEASE: did('cont', 4),
  SALES_TO_FINANCE: did('cont', 5),
  CS_TO_OPS: did('cont', 6),
  OPS_TO_COMPLIANCE: did('cont', 7),
} as const

export const WKFL = {
  PRODUCT_DELIVERY: did('wkfl', 1),
  INCIDENT_MANAGEMENT: did('wkfl', 2),
  MAINTENANCE_LIFECYCLE: did('wkfl', 3),
  INSPECTION_COMPLIANCE: did('wkfl', 4),
} as const

export const PLCY = {
  RELEASE_APPROVAL: did('plcy', 1),
  PRODUCTION_CHANGE_GATE: did('plcy', 2),
  EVIDENCE_RETENTION: did('plcy', 3),
  INCIDENT_ESCALATION: did('plcy', 4),
  CONTRACT_ACCEPTANCE: did('plcy', 5),
} as const

export const ARTF = {
  PRD: did('artf', 1),
  DESIGN_SPEC: did('artf', 2),
  TECH_SPEC: did('artf', 3),
  DELIVERY_PLAN: did('artf', 4),
  QA_REPORT: did('artf', 5),
  RELEASE_NOTE: did('artf', 6),
  INCIDENT_REPORT: did('artf', 7),
  WORK_ORDER: did('artf', 8),
  MAINTENANCE_CONTRACT: did('artf', 9),
  INSPECTION_EVIDENCE: did('artf', 10),
  BILLING_ACTIVATION: did('artf', 11),
  COMPLIANCE_FINDING: did('artf', 12),
} as const

// ============================================================
// Seed data
// ============================================================

export const SEED_DEPARTMENTS = [
  { id: DEPT.EXECUTIVE, projectId: P, name: 'Executive', description: 'Company leadership and strategic direction', mandate: 'Set vision, approve budgets and strategic initiatives' },
  { id: DEPT.PRODUCT, projectId: P, name: 'Product', description: 'Product strategy, discovery and delivery planning', mandate: 'Define what to build and ensure product-market fit' },
  { id: DEPT.ENGINEERING, projectId: P, name: 'Engineering', description: 'Software design, implementation, QA and release', mandate: 'Build, test and ship reliable software' },
  { id: DEPT.DESIGN, projectId: P, name: 'Design', description: 'User experience research and interface design', mandate: 'Ensure usability and design consistency' },
  { id: DEPT.OPERATIONS, projectId: P, name: 'Operations', description: 'Field service, dispatch and incident management', mandate: 'Coordinate field work and resolve operational incidents' },
  { id: DEPT.CUSTOMER_SUCCESS, projectId: P, name: 'Customer Success', description: 'Customer onboarding, support and retention', mandate: 'Maximize customer satisfaction and lifetime value' },
  { id: DEPT.SALES, projectId: P, name: 'Sales', description: 'Lead generation, contracts and revenue growth', mandate: 'Acquire and retain customers through contracts' },
  { id: DEPT.FINANCE, projectId: P, name: 'Finance & Admin', description: 'Billing, renewals and financial administration', mandate: 'Manage invoicing, renewals and financial compliance' },
  { id: DEPT.COMPLIANCE, projectId: P, name: 'Compliance & Quality', description: 'Regulatory compliance, inspections and quality assurance', mandate: 'Ensure adherence to regulations and quality standards' },
]

export const SEED_CAPABILITIES = [
  { id: CAP.PRODUCT_DISCOVERY, projectId: P, name: 'Product Discovery', description: 'Identify market opportunities and validate product hypotheses', ownerDepartmentId: DEPT.PRODUCT },
  { id: CAP.PRD_DEFINITION, projectId: P, name: 'PRD Definition', description: 'Author product requirement documents with scope and priorities', ownerDepartmentId: DEPT.PRODUCT },
  { id: CAP.UX_DESIGN, projectId: P, name: 'UX Design', description: 'Design user flows, wireframes and interaction models', ownerDepartmentId: DEPT.DESIGN },
  { id: CAP.TECHNICAL_DESIGN, projectId: P, name: 'Technical Design', description: 'Produce technical specifications and architecture decisions', ownerDepartmentId: DEPT.ENGINEERING },
  { id: CAP.SOFTWARE_IMPLEMENTATION, projectId: P, name: 'Software Implementation', description: 'Write, review and maintain production code', ownerDepartmentId: DEPT.ENGINEERING },
  { id: CAP.QA_VALIDATION, projectId: P, name: 'QA Validation', description: 'Design test plans and validate software quality', ownerDepartmentId: DEPT.ENGINEERING },
  { id: CAP.RELEASE_MANAGEMENT, projectId: P, name: 'Release Management', description: 'Coordinate releases, versioning and deployment', ownerDepartmentId: DEPT.ENGINEERING },
  { id: CAP.INCIDENT_INTAKE, projectId: P, name: 'Incident Intake', description: 'Receive, classify and triage operational incidents', ownerDepartmentId: DEPT.OPERATIONS },
  { id: CAP.FIELD_DISPATCH, projectId: P, name: 'Field Dispatch Planning', description: 'Plan and assign field technicians to service locations', ownerDepartmentId: DEPT.OPERATIONS },
  { id: CAP.MAINTENANCE_CONTRACT, projectId: P, name: 'Maintenance Contract Management', description: 'Manage lifecycle of elevator maintenance contracts', ownerDepartmentId: DEPT.OPERATIONS },
  { id: CAP.ELEVATOR_ASSET_REGISTRY, projectId: P, name: 'Elevator Asset Registry', description: 'Track elevator installations, models and service history', ownerDepartmentId: DEPT.OPERATIONS },
  { id: CAP.INSPECTION_MANAGEMENT, projectId: P, name: 'Inspection Management', description: 'Schedule and track regulatory elevator inspections', ownerDepartmentId: DEPT.COMPLIANCE },
  { id: CAP.WORK_ORDER_PROCESSING, projectId: P, name: 'Work Order Processing', description: 'Create, assign and close maintenance work orders', ownerDepartmentId: DEPT.OPERATIONS },
  { id: CAP.BILLING_RENEWALS, projectId: P, name: 'Billing & Renewals', description: 'Invoice customers and manage contract renewals', ownerDepartmentId: DEPT.FINANCE },
  { id: CAP.CUSTOMER_SUPPORT, projectId: P, name: 'Customer Support', description: 'Handle customer inquiries, complaints and follow-ups', ownerDepartmentId: DEPT.CUSTOMER_SUCCESS },
  { id: CAP.COMPLIANCE_MONITORING, projectId: P, name: 'Compliance Monitoring', description: 'Monitor regulatory adherence and audit readiness', ownerDepartmentId: DEPT.COMPLIANCE },
]

export const SEED_ROLES = [
  { id: ROLE.CEO, projectId: P, name: 'CEO', description: 'Chief Executive Officer', departmentId: DEPT.EXECUTIVE, accountability: 'Overall company strategy and performance', authority: 'Final decision on budget, hiring and strategic direction' },
  { id: ROLE.HEAD_OF_PRODUCT, projectId: P, name: 'Head of Product', description: 'Leads product strategy and roadmap', departmentId: DEPT.PRODUCT, capabilityIds: [CAP.PRODUCT_DISCOVERY, CAP.PRD_DEFINITION], accountability: 'Product vision and roadmap execution', authority: 'Prioritize features and approve PRDs' },
  { id: ROLE.PRODUCT_MANAGER, projectId: P, name: 'Product Manager', description: 'Owns feature definition and delivery tracking', departmentId: DEPT.PRODUCT, capabilityIds: [CAP.PRODUCT_DISCOVERY, CAP.PRD_DEFINITION], accountability: 'Feature scope and stakeholder alignment', authority: 'Define acceptance criteria and scope trade-offs' },
  { id: ROLE.HEAD_OF_ENGINEERING, projectId: P, name: 'Head of Engineering', description: 'Leads engineering organization', departmentId: DEPT.ENGINEERING, capabilityIds: [CAP.TECHNICAL_DESIGN, CAP.SOFTWARE_IMPLEMENTATION, CAP.RELEASE_MANAGEMENT], accountability: 'Engineering quality and delivery cadence', authority: 'Approve architecture decisions and release gates' },
  { id: ROLE.TECH_LEAD, projectId: P, name: 'Tech Lead', description: 'Technical leadership and code quality', departmentId: DEPT.ENGINEERING, capabilityIds: [CAP.TECHNICAL_DESIGN, CAP.SOFTWARE_IMPLEMENTATION], accountability: 'Technical design and code review standards', authority: 'Approve pull requests and technical approaches' },
  { id: ROLE.FRONTEND_ENGINEER, projectId: P, name: 'Frontend Engineer', description: 'Builds and maintains user-facing interfaces', departmentId: DEPT.ENGINEERING, capabilityIds: [CAP.SOFTWARE_IMPLEMENTATION], accountability: 'Frontend feature delivery and UI quality', authority: 'Implement UI components and interactions' },
  { id: ROLE.BACKEND_ENGINEER, projectId: P, name: 'Backend Engineer', description: 'Builds and maintains server-side systems', departmentId: DEPT.ENGINEERING, capabilityIds: [CAP.SOFTWARE_IMPLEMENTATION], accountability: 'Backend service reliability and performance', authority: 'Implement APIs, services and data models' },
  { id: ROLE.QA_LEAD, projectId: P, name: 'QA Lead', description: 'Leads quality assurance and testing strategy', departmentId: DEPT.ENGINEERING, capabilityIds: [CAP.QA_VALIDATION], accountability: 'Test coverage and release quality gates', authority: 'Block releases that fail quality criteria' },
  { id: ROLE.HEAD_OF_OPERATIONS, projectId: P, name: 'Head of Operations', description: 'Leads field operations and incident response', departmentId: DEPT.OPERATIONS, capabilityIds: [CAP.INCIDENT_INTAKE, CAP.FIELD_DISPATCH, CAP.MAINTENANCE_CONTRACT], accountability: 'Operational SLAs and field team efficiency', authority: 'Approve dispatch plans and escalation decisions' },
  { id: ROLE.DISPATCH_COORDINATOR, projectId: P, name: 'Dispatch Coordinator', description: 'Plans and assigns field service visits', departmentId: DEPT.OPERATIONS, capabilityIds: [CAP.FIELD_DISPATCH, CAP.WORK_ORDER_PROCESSING], accountability: 'Timely dispatch and work order completion', authority: 'Assign technicians and prioritize work orders' },
  { id: ROLE.COMPLIANCE_MANAGER, projectId: P, name: 'Compliance Manager', description: 'Ensures regulatory compliance and audit readiness', departmentId: DEPT.COMPLIANCE, capabilityIds: [CAP.INSPECTION_MANAGEMENT, CAP.COMPLIANCE_MONITORING], accountability: 'Regulatory adherence and inspection pass rates', authority: 'Flag non-compliance and require remediation' },
  { id: ROLE.CUSTOMER_SUCCESS_LEAD, projectId: P, name: 'Customer Success Lead', description: 'Manages customer relationships and retention', departmentId: DEPT.CUSTOMER_SUCCESS, capabilityIds: [CAP.CUSTOMER_SUPPORT], accountability: 'Customer satisfaction and churn reduction', authority: 'Escalate issues and approve service credits' },
  { id: ROLE.SALES_LEAD, projectId: P, name: 'Sales Lead', description: 'Drives new business and contract renewals', departmentId: DEPT.SALES, capabilityIds: [CAP.MAINTENANCE_CONTRACT], accountability: 'Revenue targets and pipeline health', authority: 'Negotiate contract terms and pricing' },
  { id: ROLE.FINANCE_MANAGER, projectId: P, name: 'Finance Manager', description: 'Manages billing, invoicing and financial reporting', departmentId: DEPT.FINANCE, capabilityIds: [CAP.BILLING_RENEWALS], accountability: 'Accurate invoicing and financial compliance', authority: 'Approve billing adjustments and payment terms' },
  { id: ROLE.DESIGN_LEAD, projectId: P, name: 'Design Lead', description: 'Leads UX research and design direction', departmentId: DEPT.DESIGN, capabilityIds: [CAP.UX_DESIGN], accountability: 'Design quality and user experience consistency', authority: 'Approve design specs and UX patterns' },
]

export const SEED_SKILLS = [
  { id: SKILL.DRAFT_PRD, projectId: P, name: 'Draft PRD', description: 'Author a product requirements document', category: 'product', compatibleRoleIds: [ROLE.HEAD_OF_PRODUCT, ROLE.PRODUCT_MANAGER] },
  { id: SKILL.REFINE_SCOPE, projectId: P, name: 'Refine Scope', description: 'Narrow and clarify feature scope', category: 'product', compatibleRoleIds: [ROLE.HEAD_OF_PRODUCT, ROLE.PRODUCT_MANAGER] },
  { id: SKILL.MAP_WORKFLOW, projectId: P, name: 'Map Workflow', description: 'Model a business process as a structured workflow', category: 'product', compatibleRoleIds: [ROLE.PRODUCT_MANAGER, ROLE.TECH_LEAD] },
  { id: SKILL.DEFINE_CONTRACT, projectId: P, name: 'Define Contract', description: 'Specify a formal agreement between departments', category: 'governance', compatibleRoleIds: [ROLE.HEAD_OF_PRODUCT, ROLE.HEAD_OF_ENGINEERING, ROLE.HEAD_OF_OPERATIONS] },
  { id: SKILL.REVIEW_UX, projectId: P, name: 'Review UX', description: 'Evaluate usability and interaction quality', category: 'design', compatibleRoleIds: [ROLE.DESIGN_LEAD] },
  { id: SKILL.PRODUCE_TECH_SPEC, projectId: P, name: 'Produce Tech Spec', description: 'Write a technical specification document', category: 'engineering', compatibleRoleIds: [ROLE.TECH_LEAD, ROLE.HEAD_OF_ENGINEERING] },
  { id: SKILL.IMPLEMENT_FEATURE, projectId: P, name: 'Implement Feature', description: 'Write production code for a feature', category: 'engineering', compatibleRoleIds: [ROLE.FRONTEND_ENGINEER, ROLE.BACKEND_ENGINEER, ROLE.TECH_LEAD] },
  { id: SKILL.REVIEW_CODE, projectId: P, name: 'Review Code', description: 'Review pull requests for quality and correctness', category: 'engineering', compatibleRoleIds: [ROLE.TECH_LEAD, ROLE.FRONTEND_ENGINEER, ROLE.BACKEND_ENGINEER] },
  { id: SKILL.DESIGN_TEST_PLAN, projectId: P, name: 'Design Test Plan', description: 'Define test strategy and acceptance criteria', category: 'quality', compatibleRoleIds: [ROLE.QA_LEAD] },
  { id: SKILL.VALIDATE_RELEASE, projectId: P, name: 'Validate Release', description: 'Run release validation checks', category: 'quality', compatibleRoleIds: [ROLE.QA_LEAD, ROLE.TECH_LEAD] },
  { id: SKILL.ANALYZE_INCIDENT, projectId: P, name: 'Analyze Incident', description: 'Investigate and classify an operational incident', category: 'operations', compatibleRoleIds: [ROLE.HEAD_OF_OPERATIONS, ROLE.DISPATCH_COORDINATOR] },
  { id: SKILL.PLAN_DISPATCH, projectId: P, name: 'Plan Dispatch', description: 'Plan field technician assignments', category: 'operations', compatibleRoleIds: [ROLE.DISPATCH_COORDINATOR] },
  { id: SKILL.REVIEW_COMPLIANCE, projectId: P, name: 'Review Compliance', description: 'Audit regulatory compliance status', category: 'compliance', compatibleRoleIds: [ROLE.COMPLIANCE_MANAGER] },
  { id: SKILL.UPDATE_ARTIFACT_METADATA, projectId: P, name: 'Update Artifact Metadata', description: 'Maintain artifact metadata and traceability', category: 'general', compatibleRoleIds: [ROLE.PRODUCT_MANAGER, ROLE.TECH_LEAD] },
]

export const SEED_AGENT_ARCHETYPES = [
  { id: ARCH.CEO_AGENT, projectId: P, name: 'CEO Agent', description: 'Strategic oversight and contract governance', roleId: ROLE.CEO, departmentId: DEPT.EXECUTIVE, skillIds: [SKILL.DEFINE_CONTRACT] },
  { id: ARCH.PRODUCT_STRATEGIST, projectId: P, name: 'Product Strategist Agent', description: 'Product vision, PRDs and scope refinement', roleId: ROLE.HEAD_OF_PRODUCT, departmentId: DEPT.PRODUCT, skillIds: [SKILL.DRAFT_PRD, SKILL.REFINE_SCOPE, SKILL.DEFINE_CONTRACT] },
  { id: ARCH.PRODUCT_OPS, projectId: P, name: 'Product Ops Agent', description: 'Day-to-day product operations and workflow mapping', roleId: ROLE.PRODUCT_MANAGER, departmentId: DEPT.PRODUCT, skillIds: [SKILL.DRAFT_PRD, SKILL.REFINE_SCOPE, SKILL.MAP_WORKFLOW, SKILL.UPDATE_ARTIFACT_METADATA] },
  { id: ARCH.DESIGN_LEAD, projectId: P, name: 'Design Lead Agent', description: 'UX review and design quality assurance', roleId: ROLE.DESIGN_LEAD, departmentId: DEPT.DESIGN, skillIds: [SKILL.REVIEW_UX] },
  { id: ARCH.ENGINEERING_MANAGER, projectId: P, name: 'Engineering Manager Agent', description: 'Engineering coordination and technical contracts', roleId: ROLE.HEAD_OF_ENGINEERING, departmentId: DEPT.ENGINEERING, skillIds: [SKILL.PRODUCE_TECH_SPEC, SKILL.DEFINE_CONTRACT] },
  { id: ARCH.FRONTEND_BUILDER, projectId: P, name: 'Frontend Builder Agent', description: 'Frontend feature implementation and code review', roleId: ROLE.FRONTEND_ENGINEER, departmentId: DEPT.ENGINEERING, skillIds: [SKILL.IMPLEMENT_FEATURE, SKILL.REVIEW_CODE] },
  { id: ARCH.BACKEND_BUILDER, projectId: P, name: 'Backend Builder Agent', description: 'Backend service implementation and code review', roleId: ROLE.BACKEND_ENGINEER, departmentId: DEPT.ENGINEERING, skillIds: [SKILL.IMPLEMENT_FEATURE, SKILL.REVIEW_CODE] },
  { id: ARCH.QA_REVIEWER, projectId: P, name: 'QA Reviewer Agent', description: 'Test planning and release validation', roleId: ROLE.QA_LEAD, departmentId: DEPT.ENGINEERING, skillIds: [SKILL.DESIGN_TEST_PLAN, SKILL.VALIDATE_RELEASE] },
  { id: ARCH.RELEASE_COORDINATOR, projectId: P, name: 'Release Coordinator Agent', description: 'Release validation and artifact tracking', roleId: ROLE.HEAD_OF_ENGINEERING, departmentId: DEPT.ENGINEERING, skillIds: [SKILL.VALIDATE_RELEASE, SKILL.UPDATE_ARTIFACT_METADATA] },
  { id: ARCH.OPS_COORDINATOR, projectId: P, name: 'Ops Coordinator Agent', description: 'Incident analysis, dispatch and contract governance', roleId: ROLE.HEAD_OF_OPERATIONS, departmentId: DEPT.OPERATIONS, skillIds: [SKILL.ANALYZE_INCIDENT, SKILL.PLAN_DISPATCH, SKILL.DEFINE_CONTRACT] },
  { id: ARCH.COMPLIANCE_REVIEWER, projectId: P, name: 'Compliance Reviewer Agent', description: 'Regulatory compliance auditing', roleId: ROLE.COMPLIANCE_MANAGER, departmentId: DEPT.COMPLIANCE, skillIds: [SKILL.REVIEW_COMPLIANCE] },
  { id: ARCH.CUSTOMER_SUCCESS, projectId: P, name: 'Customer Success Agent', description: 'Customer issue analysis and escalation', roleId: ROLE.CUSTOMER_SUCCESS_LEAD, departmentId: DEPT.CUSTOMER_SUCCESS, skillIds: [SKILL.ANALYZE_INCIDENT] },
  { id: ARCH.SALES_OPS, projectId: P, name: 'Sales Operations Agent', description: 'Contract negotiation and pipeline management', roleId: ROLE.SALES_LEAD, departmentId: DEPT.SALES, skillIds: [SKILL.DEFINE_CONTRACT] },
  { id: ARCH.FINANCE_OPS, projectId: P, name: 'Finance Ops Agent', description: 'Billing artifact management and financial tracking', roleId: ROLE.FINANCE_MANAGER, departmentId: DEPT.FINANCE, skillIds: [SKILL.UPDATE_ARTIFACT_METADATA] },
]

export const SEED_AGENT_ASSIGNMENTS = Object.entries(ARCH).map(([_key, archetypeId], i) => {
  const archetype = SEED_AGENT_ARCHETYPES.find((a) => a.id === archetypeId)!
  const asgnId = Object.values(ASGN)[i]!
  return {
    id: asgnId,
    projectId: P,
    archetypeId,
    name: archetype.name.replace(' Agent', ' Assignment'),
  }
})

export const SEED_CONTRACTS: Array<{
  id: string
  projectId: string
  name: string
  description: string
  type: 'SLA' | 'DataContract' | 'InterfaceContract' | 'OperationalAgreement'
  providerId: string
  providerType: 'department' | 'capability'
  consumerId: string
  consumerType: 'department' | 'capability'
  acceptanceCriteria: string[]
}> = [
  {
    id: CONT.PRD_TO_DESIGN,
    projectId: P,
    name: 'PRD to Design Spec Handoff',
    description: 'Product hands off approved PRD to Design for spec creation',
    type: 'InterfaceContract',
    providerId: DEPT.PRODUCT,
    providerType: 'department',
    consumerId: DEPT.DESIGN,
    consumerType: 'department',
    acceptanceCriteria: ['PRD includes user stories', 'Scope and priorities are defined', 'Stakeholder sign-off obtained'],
  },
  {
    id: CONT.DESIGN_TO_ENGINEERING,
    projectId: P,
    name: 'Design Package Handoff',
    description: 'Design delivers design package to Engineering for implementation',
    type: 'InterfaceContract',
    providerId: DEPT.DESIGN,
    providerType: 'department',
    consumerId: DEPT.ENGINEERING,
    consumerType: 'department',
    acceptanceCriteria: ['Wireframes and interaction models complete', 'Component list provided', 'Responsive breakpoints defined'],
  },
  {
    id: CONT.ENGINEERING_TO_QA,
    projectId: P,
    name: 'Candidate Build Handoff',
    description: 'Engineering delivers candidate build to QA for validation',
    type: 'InterfaceContract',
    providerId: CAP.SOFTWARE_IMPLEMENTATION,
    providerType: 'capability',
    consumerId: CAP.QA_VALIDATION,
    consumerType: 'capability',
    acceptanceCriteria: ['All unit tests pass', 'Build deploys to staging', 'Release notes drafted'],
  },
  {
    id: CONT.QA_TO_RELEASE,
    projectId: P,
    name: 'Release Validation Contract',
    description: 'QA validates and approves release candidate',
    type: 'OperationalAgreement',
    providerId: CAP.QA_VALIDATION,
    providerType: 'capability',
    consumerId: CAP.RELEASE_MANAGEMENT,
    consumerType: 'capability',
    acceptanceCriteria: ['All test plans executed', 'No critical or major defects open', 'Performance benchmarks met'],
  },
  {
    id: CONT.SALES_TO_FINANCE,
    projectId: P,
    name: 'Closed Won to Billing Activation',
    description: 'Sales notifies Finance to activate billing for new contracts',
    type: 'DataContract',
    providerId: DEPT.SALES,
    providerType: 'department',
    consumerId: DEPT.FINANCE,
    consumerType: 'department',
    acceptanceCriteria: ['Contract terms documented', 'Customer billing info verified', 'Activation date confirmed'],
  },
  {
    id: CONT.CS_TO_OPS,
    projectId: P,
    name: 'Incident Escalation Contract',
    description: 'Customer Success escalates incidents to Operations for resolution',
    type: 'SLA',
    providerId: DEPT.CUSTOMER_SUCCESS,
    providerType: 'department',
    consumerId: DEPT.OPERATIONS,
    consumerType: 'department',
    acceptanceCriteria: ['Incident severity classified', 'Customer context provided', 'Response time SLA defined'],
  },
  {
    id: CONT.OPS_TO_COMPLIANCE,
    projectId: P,
    name: 'Inspection Evidence Contract',
    description: 'Operations provides inspection evidence to Compliance for audit',
    type: 'DataContract',
    providerId: DEPT.OPERATIONS,
    providerType: 'department',
    consumerId: DEPT.COMPLIANCE,
    consumerType: 'department',
    acceptanceCriteria: ['Evidence includes photos and timestamps', 'Technician signature captured', 'Findings documented'],
  },
]

export const SEED_WORKFLOWS = [
  {
    id: WKFL.PRODUCT_DELIVERY,
    projectId: P,
    name: 'Product Delivery',
    description: 'End-to-end product feature delivery from PRD to release',
    ownerDepartmentId: DEPT.PRODUCT,
    triggerDescription: 'New feature approved in roadmap',
    stages: [
      { name: 'PRD Draft', order: 1, description: 'Author and refine the product requirements document' },
      { name: 'Design Spec', order: 2, description: 'Produce UX wireframes and interaction specs' },
      { name: 'Tech Spec', order: 3, description: 'Define technical architecture and implementation plan' },
      { name: 'Sprint Planning', order: 4, description: 'Break work into tasks and assign to sprint' },
      { name: 'Implementation', order: 5, description: 'Build the feature in code' },
      { name: 'Code Review', order: 6, description: 'Peer review of implementation' },
      { name: 'QA Validation', order: 7, description: 'Execute test plan and validate quality' },
      { name: 'Release', order: 8, description: 'Deploy to production and announce' },
    ],
    participants: [
      { participantId: ROLE.HEAD_OF_PRODUCT, participantType: 'role' as const, responsibility: 'Owns PRD and final scope decisions' },
      { participantId: ROLE.PRODUCT_MANAGER, participantType: 'role' as const, responsibility: 'Tracks delivery and stakeholder communication' },
      { participantId: ROLE.DESIGN_LEAD, participantType: 'role' as const, responsibility: 'Delivers design spec and reviews UX' },
      { participantId: ROLE.TECH_LEAD, participantType: 'role' as const, responsibility: 'Authors tech spec and reviews code' },
      { participantId: ROLE.FRONTEND_ENGINEER, participantType: 'role' as const, responsibility: 'Implements frontend features' },
      { participantId: ROLE.BACKEND_ENGINEER, participantType: 'role' as const, responsibility: 'Implements backend services' },
      { participantId: ROLE.QA_LEAD, participantType: 'role' as const, responsibility: 'Validates quality and approves release' },
      { participantId: ROLE.HEAD_OF_ENGINEERING, participantType: 'role' as const, responsibility: 'Approves release gate' },
    ],
    contractIds: [CONT.PRD_TO_DESIGN, CONT.DESIGN_TO_ENGINEERING, CONT.ENGINEERING_TO_QA, CONT.QA_TO_RELEASE],
  },
  {
    id: WKFL.INCIDENT_MANAGEMENT,
    projectId: P,
    name: 'Incident Management',
    description: 'Handle operational incidents from intake to resolution',
    ownerDepartmentId: DEPT.OPERATIONS,
    triggerDescription: 'Customer reports an issue or system detects an anomaly',
    stages: [
      { name: 'Incident Intake', order: 1, description: 'Receive and log the incident' },
      { name: 'Triage', order: 2, description: 'Classify severity and assign priority' },
      { name: 'Dispatch', order: 3, description: 'Assign field technician or support agent' },
      { name: 'Field Resolution', order: 4, description: 'On-site diagnosis and repair' },
      { name: 'Verification', order: 5, description: 'Verify the fix resolves the issue' },
      { name: 'Customer Update', order: 6, description: 'Notify customer of resolution' },
      { name: 'Close', order: 7, description: 'Close incident and archive records' },
    ],
    participants: [
      { participantId: ROLE.HEAD_OF_OPERATIONS, participantType: 'role' as const, responsibility: 'Owns escalation and SLA compliance' },
      { participantId: ROLE.DISPATCH_COORDINATOR, participantType: 'role' as const, responsibility: 'Assigns technicians and tracks dispatch' },
      { participantId: ROLE.CUSTOMER_SUCCESS_LEAD, participantType: 'role' as const, responsibility: 'Communicates with the customer' },
    ],
    contractIds: [CONT.CS_TO_OPS],
  },
  {
    id: WKFL.MAINTENANCE_LIFECYCLE,
    projectId: P,
    name: 'Maintenance Contract Lifecycle',
    description: 'Manage maintenance contracts from lead to renewal',
    ownerDepartmentId: DEPT.OPERATIONS,
    triggerDescription: 'New lead or contract approaching renewal date',
    stages: [
      { name: 'Lead / Renewal', order: 1, description: 'Identify new lead or flag upcoming renewal' },
      { name: 'Contract Setup', order: 2, description: 'Negotiate terms and create contract' },
      { name: 'Asset Linkage', order: 3, description: 'Link elevator assets to the contract' },
      { name: 'Schedule Maintenance', order: 4, description: 'Plan recurring maintenance visits' },
      { name: 'Execute Service', order: 5, description: 'Perform maintenance and log results' },
      { name: 'Invoice / Renew', order: 6, description: 'Invoice for services and propose renewal' },
    ],
    participants: [
      { participantId: ROLE.SALES_LEAD, participantType: 'role' as const, responsibility: 'Negotiates contract terms' },
      { participantId: ROLE.HEAD_OF_OPERATIONS, participantType: 'role' as const, responsibility: 'Oversees service execution' },
      { participantId: ROLE.DISPATCH_COORDINATOR, participantType: 'role' as const, responsibility: 'Plans maintenance schedules' },
      { participantId: ROLE.FINANCE_MANAGER, participantType: 'role' as const, responsibility: 'Handles invoicing and renewals' },
    ],
    contractIds: [CONT.SALES_TO_FINANCE],
  },
  {
    id: WKFL.INSPECTION_COMPLIANCE,
    projectId: P,
    name: 'Inspection / Compliance',
    description: 'Manage regulatory inspections and compliance evidence',
    ownerDepartmentId: DEPT.COMPLIANCE,
    triggerDescription: 'Scheduled inspection date or regulatory audit trigger',
    stages: [
      { name: 'Inspection Scheduled', order: 1, description: 'Set inspection date and assign inspector' },
      { name: 'Evidence Collection', order: 2, description: 'Gather documentation and field evidence' },
      { name: 'Findings Review', order: 3, description: 'Review findings and classify issues' },
      { name: 'Remediation', order: 4, description: 'Address non-conformities' },
      { name: 'Sign-off', order: 5, description: 'Obtain sign-off from compliance authority' },
      { name: 'Archive', order: 6, description: 'Archive evidence and close inspection' },
    ],
    participants: [
      { participantId: ROLE.COMPLIANCE_MANAGER, participantType: 'role' as const, responsibility: 'Leads inspection process and reviews findings' },
      { participantId: ROLE.HEAD_OF_OPERATIONS, participantType: 'role' as const, responsibility: 'Provides field evidence and coordinates remediation' },
    ],
    contractIds: [CONT.OPS_TO_COMPLIANCE],
  },
]

export const SEED_POLICIES: Array<{
  id: string
  projectId: string
  name: string
  description: string
  scope: 'global' | 'department'
  departmentId?: string
  type: 'approval-gate' | 'constraint' | 'rule'
  condition: string
  enforcement: 'mandatory' | 'advisory'
}> = [
  {
    id: PLCY.RELEASE_APPROVAL,
    projectId: P,
    name: 'Release Approval Policy',
    description: 'Requires QA and engineering approval before any production release',
    scope: 'global',
    type: 'approval-gate',
    condition: 'Every release must be approved by QA Lead and Head of Engineering before deployment',
    enforcement: 'mandatory',
  },
  {
    id: PLCY.PRODUCTION_CHANGE_GATE,
    projectId: P,
    name: 'Production Change Gate',
    description: 'All production changes must pass code review and QA',
    scope: 'department',
    departmentId: DEPT.ENGINEERING,
    type: 'approval-gate',
    condition: 'All production changes require code review and QA validation before merge',
    enforcement: 'mandatory',
  },
  {
    id: PLCY.EVIDENCE_RETENTION,
    projectId: P,
    name: 'Compliance Evidence Retention Policy',
    description: 'Mandates minimum retention period for inspection records',
    scope: 'global',
    type: 'rule',
    condition: 'Inspection evidence and compliance findings must be retained for a minimum of 5 years',
    enforcement: 'mandatory',
  },
  {
    id: PLCY.INCIDENT_ESCALATION,
    projectId: P,
    name: 'Incident Severity Escalation Policy',
    description: 'Defines escalation timelines for critical incidents',
    scope: 'department',
    departmentId: DEPT.OPERATIONS,
    type: 'rule',
    condition: 'Critical and major incidents must be escalated to Head of Operations within 30 minutes of intake',
    enforcement: 'mandatory',
  },
  {
    id: PLCY.CONTRACT_ACCEPTANCE,
    projectId: P,
    name: 'Contract Acceptance Criteria Policy',
    description: 'Recommends explicit acceptance criteria for all contracts',
    scope: 'global',
    type: 'constraint',
    condition: 'All inter-department contracts must define explicit acceptance criteria before activation',
    enforcement: 'advisory',
  },
]

export const SEED_ARTIFACTS: Array<{
  id: string
  projectId: string
  name: string
  description: string
  type: ArtifactType
  producerId: string
  producerType: 'department' | 'capability'
  consumerIds: string[]
  tags: string[]
}> = [
  { id: ARTF.PRD, projectId: P, name: 'PRD', description: 'Product Requirements Document for feature definition', type: 'document', producerId: DEPT.PRODUCT, producerType: 'department', consumerIds: [DEPT.DESIGN, DEPT.ENGINEERING], tags: ['product', 'requirements'] },
  { id: ARTF.DESIGN_SPEC, projectId: P, name: 'Design Spec', description: 'UX wireframes, flows and interaction specification', type: 'document', producerId: DEPT.DESIGN, producerType: 'department', consumerIds: [DEPT.ENGINEERING], tags: ['design', 'ux'] },
  { id: ARTF.TECH_SPEC, projectId: P, name: 'Tech Spec', description: 'Technical architecture and implementation plan', type: 'document', producerId: DEPT.ENGINEERING, producerType: 'department', consumerIds: [DEPT.PRODUCT], tags: ['engineering', 'architecture'] },
  { id: ARTF.DELIVERY_PLAN, projectId: P, name: 'Delivery Plan', description: 'Sprint breakdown and delivery timeline', type: 'document', producerId: DEPT.PRODUCT, producerType: 'department', consumerIds: [DEPT.ENGINEERING, DEPT.OPERATIONS], tags: ['product', 'planning'] },
  { id: ARTF.QA_REPORT, projectId: P, name: 'QA Report', description: 'Test execution results and quality assessment', type: 'deliverable', producerId: CAP.QA_VALIDATION, producerType: 'capability', consumerIds: [DEPT.ENGINEERING, DEPT.PRODUCT], tags: ['quality', 'testing'] },
  { id: ARTF.RELEASE_NOTE, projectId: P, name: 'Release Note', description: 'Summary of changes in a product release', type: 'document', producerId: DEPT.ENGINEERING, producerType: 'department', consumerIds: [DEPT.PRODUCT, DEPT.CUSTOMER_SUCCESS, DEPT.SALES], tags: ['release', 'changelog'] },
  { id: ARTF.INCIDENT_REPORT, projectId: P, name: 'Incident Report', description: 'Detailed record of an operational incident', type: 'document', producerId: DEPT.OPERATIONS, producerType: 'department', consumerIds: [DEPT.CUSTOMER_SUCCESS, DEPT.COMPLIANCE], tags: ['operations', 'incident'] },
  { id: ARTF.WORK_ORDER, projectId: P, name: 'Work Order', description: 'Field service task assignment and completion record', type: 'deliverable', producerId: DEPT.OPERATIONS, producerType: 'department', consumerIds: [DEPT.FINANCE], tags: ['operations', 'field-service'] },
  { id: ARTF.MAINTENANCE_CONTRACT, projectId: P, name: 'Maintenance Contract', description: 'Elevator maintenance service agreement', type: 'document', producerId: DEPT.SALES, producerType: 'department', consumerIds: [DEPT.OPERATIONS, DEPT.FINANCE], tags: ['sales', 'contract'] },
  { id: ARTF.INSPECTION_EVIDENCE, projectId: P, name: 'Inspection Evidence', description: 'Photographic and documentary evidence from inspections', type: 'data', producerId: DEPT.COMPLIANCE, producerType: 'department', consumerIds: [DEPT.OPERATIONS], tags: ['compliance', 'inspection'] },
  { id: ARTF.BILLING_ACTIVATION, projectId: P, name: 'Billing Activation Record', description: 'Record of billing activation for a new contract', type: 'data', producerId: DEPT.FINANCE, producerType: 'department', consumerIds: [DEPT.SALES, DEPT.CUSTOMER_SUCCESS], tags: ['finance', 'billing'] },
  { id: ARTF.COMPLIANCE_FINDING, projectId: P, name: 'Compliance Finding', description: 'Documented finding from a compliance audit or inspection', type: 'decision', producerId: DEPT.COMPLIANCE, producerType: 'department', consumerIds: [DEPT.OPERATIONS, DEPT.EXECUTIVE], tags: ['compliance', 'audit'] },
]
