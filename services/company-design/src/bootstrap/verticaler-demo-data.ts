/**
 * Verticaler Live Company demo data.
 * Stable IDs prefixed with `vert-` for predictable references.
 *
 * Source: docs/25-verticaler-reference-company-spec.md (LCP-009 v2)
 */

import { VERTICALER_PROJECT_ID } from '@the-crew/shared-types'

export const PROJECT_ID = VERTICALER_PROJECT_ID

// ── Stable IDs ─────────────────────────────────────────────────────────

export const IDS = {
  // UOs
  company: 'vert-uo-company',
  engineering: 'vert-uo-engineering',
  product: 'vert-uo-product',
  operations: 'vert-uo-operations',
  customerSuccess: 'vert-uo-customer-success',
  compliance: 'vert-uo-compliance',
  platformTeam: 'vert-uo-platform-team',
  backendTeam: 'vert-uo-backend-team',
  qaTeam: 'vert-uo-qa-team',
  dispatchTeam: 'vert-uo-dispatch-team',
  fieldServiceTeam: 'vert-uo-field-service-team',
  discoveryTeam: 'vert-uo-discovery-team',
  // Agents — coordinators
  ceo: 'vert-agent-ceo',
  vpEngineering: 'vert-agent-vp-engineering',
  headOfProduct: 'vert-agent-head-of-product',
  vpOperations: 'vert-agent-vp-operations',
  csLead: 'vert-agent-cs-lead',
  complianceManager: 'vert-agent-compliance-manager',
  platformLead: 'vert-agent-platform-lead',
  backendLead: 'vert-agent-backend-lead',
  qaLead: 'vert-agent-qa-lead',
  dispatchCoordinator: 'vert-agent-dispatch-coordinator',
  fieldServiceLead: 'vert-agent-field-service-lead',
  discoveryLead: 'vert-agent-discovery-lead',
  // Agents — specialists
  infraEngineer: 'vert-agent-infra-engineer',
  devopsSpecialist: 'vert-agent-devops-specialist',
  domainEngineer: 'vert-agent-domain-engineer',
  apiSpecialist: 'vert-agent-api-specialist',
  testAutomation: 'vert-agent-test-automation',
  manualQa: 'vert-agent-manual-qa',
  productAnalyst: 'vert-agent-product-analyst',
  uxResearcher: 'vert-agent-ux-researcher',
  dispatchAnalyst: 'vert-agent-dispatch-analyst',
  scheduleOptimizer: 'vert-agent-schedule-optimizer',
  fieldOpsAgent: 'vert-agent-field-ops',
  supportAgent: 'vert-agent-support',
  onboardingSpecialist: 'vert-agent-onboarding',
  auditAnalyst: 'vert-agent-audit-analyst',
  inspectionSpecialist: 'vert-agent-inspection-specialist',
} as const

// ── Department definitions ──────────────────────────────────────────────

export interface DepartmentDef {
  id: string
  name: string
  mandate: string
  purpose: string
  functions: string[]
  coordinatorId: string
  coordinatorName: string
  coordinatorRole: string
  coordinatorResponsibilities: string[]
  coordinatorSkills: { name: string; description: string; category: string }[]
}

export const DEPARTMENTS: DepartmentDef[] = [
  {
    id: IDS.engineering,
    name: 'Engineering',
    mandate: 'Build, test, and ship the core product',
    purpose: 'Software development and platform reliability',
    functions: ['Software development', 'Platform infrastructure', 'Quality assurance', 'CI/CD'],
    coordinatorId: IDS.vpEngineering,
    coordinatorName: 'VP Engineering',
    coordinatorRole: 'Engineering Executive',
    coordinatorResponsibilities: [
      'Lead software development',
      'Manage technical debt',
      'Define engineering standards',
      'Propose teams for platform, backend, and QA',
    ],
    coordinatorSkills: [
      { name: 'Technical Architecture', description: 'System design', category: 'engineering' },
      { name: 'Team Leadership', description: 'Engineering management', category: 'leadership' },
    ],
  },
  {
    id: IDS.product,
    name: 'Product',
    mandate: 'Define what to build and why',
    purpose: 'Product direction, discovery and market fit',
    functions: ['Product strategy', 'User research', 'Roadmap prioritization'],
    coordinatorId: IDS.headOfProduct,
    coordinatorName: 'Head of Product',
    coordinatorRole: 'Product Executive',
    coordinatorResponsibilities: [
      'Own product roadmap',
      'Lead customer discovery',
      'Define product requirements',
      'Propose discovery team',
    ],
    coordinatorSkills: [
      { name: 'Product Strategy', description: 'Market analysis and direction', category: 'product' },
      { name: 'User Research', description: 'Customer insight gathering', category: 'research' },
    ],
  },
  {
    id: IDS.operations,
    name: 'Operations',
    mandate: 'Execute field operations and dispatch services',
    purpose: 'Dispatch coordination, maintenance scheduling, and incident response',
    functions: ['Dispatch', 'Field service', 'Maintenance scheduling', 'Incident response'],
    coordinatorId: IDS.vpOperations,
    coordinatorName: 'VP Operations',
    coordinatorRole: 'Operations Executive',
    coordinatorResponsibilities: [
      'Manage dispatch operations',
      'Ensure field service quality',
      'Optimize scheduling',
      'Propose dispatch and field service teams',
    ],
    coordinatorSkills: [
      { name: 'Operations Management', description: 'Process optimization', category: 'operations' },
      { name: 'Logistics', description: 'Resource scheduling', category: 'operations' },
    ],
  },
  {
    id: IDS.customerSuccess,
    name: 'Customer Success',
    mandate: 'Onboard, support, and retain customers',
    purpose: 'Customer onboarding, support resolution, and retention',
    functions: ['Onboarding', 'Support', 'Retention', 'Customer health monitoring'],
    coordinatorId: IDS.csLead,
    coordinatorName: 'CS Lead',
    coordinatorRole: 'Customer Success Executive',
    coordinatorResponsibilities: [
      'Own customer health metrics',
      'Design onboarding flows',
      'Manage support queue',
      'Reduce churn',
    ],
    coordinatorSkills: [
      { name: 'Customer Relations', description: 'Client interaction', category: 'communication' },
      { name: 'Support Triage', description: 'Issue prioritization', category: 'operations' },
    ],
  },
  {
    id: IDS.compliance,
    name: 'Compliance',
    mandate: 'Ensure regulatory adherence and audit readiness',
    purpose: 'Regulatory compliance, audits, and safety inspections',
    functions: ['Regulatory compliance', 'Audit management', 'Safety inspections', 'Documentation'],
    coordinatorId: IDS.complianceManager,
    coordinatorName: 'Compliance Manager',
    coordinatorRole: 'Compliance Executive',
    coordinatorResponsibilities: [
      'Track regulatory requirements',
      'Schedule audits',
      'Maintain compliance documentation',
      'Manage inspection pipeline',
    ],
    coordinatorSkills: [
      { name: 'Regulatory Knowledge', description: 'Industry regulations', category: 'compliance' },
      { name: 'Audit Management', description: 'Audit execution', category: 'compliance' },
    ],
  },
]

// ── Team definitions ────────────────────────────────────────────────────

export interface TeamDef {
  id: string
  parentId: string
  name: string
  mandate: string
  purpose: string
  functions: string[]
  coordinatorId: string
  coordinatorName: string
  coordinatorRole: string
  coordinatorResponsibilities: string[]
  coordinatorSkills: { name: string; description: string; category: string }[]
  proposedByAgentId: string
}

export const TEAMS: TeamDef[] = [
  {
    id: IDS.platformTeam,
    parentId: IDS.engineering,
    name: 'Platform Team',
    mandate: 'Build and maintain infrastructure and DevOps',
    purpose: 'Cloud infrastructure, CI/CD pipelines, and developer tooling',
    functions: ['Infrastructure', 'CI/CD', 'Developer tooling'],
    coordinatorId: IDS.platformLead,
    coordinatorName: 'Platform Lead',
    coordinatorRole: 'Platform Team Lead',
    coordinatorResponsibilities: ['Manage infrastructure', 'Own CI/CD pipeline', 'Provision environments'],
    coordinatorSkills: [
      { name: 'Cloud Infrastructure', description: 'AWS/GCP/Azure', category: 'engineering' },
      { name: 'DevOps', description: 'CI/CD and automation', category: 'engineering' },
    ],
    proposedByAgentId: IDS.vpEngineering,
  },
  {
    id: IDS.backendTeam,
    parentId: IDS.engineering,
    name: 'Backend Team',
    mandate: 'Develop core backend services and domain logic',
    purpose: 'API development, domain modeling, and service implementation',
    functions: ['API development', 'Domain logic', 'Database management'],
    coordinatorId: IDS.backendLead,
    coordinatorName: 'Backend Lead',
    coordinatorRole: 'Backend Team Lead',
    coordinatorResponsibilities: ['Design APIs', 'Implement domain services', 'Manage database schema'],
    coordinatorSkills: [
      { name: 'Backend Development', description: 'NestJS and Node.js', category: 'engineering' },
      { name: 'Domain Modeling', description: 'DDD patterns', category: 'engineering' },
    ],
    proposedByAgentId: IDS.vpEngineering,
  },
  {
    id: IDS.qaTeam,
    parentId: IDS.engineering,
    name: 'QA Team',
    mandate: 'Guarantee quality through testing and automation',
    purpose: 'Test automation, manual QA, and release validation',
    functions: ['Test automation', 'Manual QA', 'Release validation'],
    coordinatorId: IDS.qaLead,
    coordinatorName: 'QA Lead',
    coordinatorRole: 'QA Team Lead',
    coordinatorResponsibilities: ['Design test strategy', 'Automate regression', 'Validate releases'],
    coordinatorSkills: [
      { name: 'Test Strategy', description: 'Quality planning', category: 'quality' },
      { name: 'Automation', description: 'Test automation frameworks', category: 'engineering' },
    ],
    proposedByAgentId: IDS.vpEngineering,
  },
  {
    id: IDS.dispatchTeam,
    parentId: IDS.operations,
    name: 'Dispatch Team',
    mandate: 'Coordinate service dispatch and scheduling',
    purpose: 'Optimize dispatch routing, scheduling, and resource allocation',
    functions: ['Dispatch routing', 'Schedule optimization', 'Resource allocation'],
    coordinatorId: IDS.dispatchCoordinator,
    coordinatorName: 'Dispatch Coordinator',
    coordinatorRole: 'Dispatch Team Lead',
    coordinatorResponsibilities: ['Manage dispatch queue', 'Optimize routing', 'Allocate resources'],
    coordinatorSkills: [
      { name: 'Scheduling', description: 'Dispatch optimization', category: 'operations' },
      { name: 'Resource Planning', description: 'Crew allocation', category: 'operations' },
    ],
    proposedByAgentId: IDS.vpOperations,
  },
  {
    id: IDS.fieldServiceTeam,
    parentId: IDS.operations,
    name: 'Field Service Team',
    mandate: 'Execute on-site maintenance and repairs',
    purpose: 'Field operations, maintenance execution, and on-site incident resolution',
    functions: ['Maintenance execution', 'On-site repairs', 'Incident resolution'],
    coordinatorId: IDS.fieldServiceLead,
    coordinatorName: 'Field Service Lead',
    coordinatorRole: 'Field Service Team Lead',
    coordinatorResponsibilities: ['Lead field crews', 'Ensure maintenance quality', 'Manage on-site incidents'],
    coordinatorSkills: [
      { name: 'Field Operations', description: 'On-site coordination', category: 'operations' },
      { name: 'Safety Management', description: 'Workplace safety', category: 'compliance' },
    ],
    proposedByAgentId: IDS.vpOperations,
  },
  {
    id: IDS.discoveryTeam,
    parentId: IDS.product,
    name: 'Discovery Team',
    mandate: 'Validate product ideas through research and analysis',
    purpose: 'User research, market analysis, and product validation',
    functions: ['User research', 'Market analysis', 'Prototype testing'],
    coordinatorId: IDS.discoveryLead,
    coordinatorName: 'Discovery Lead',
    coordinatorRole: 'Discovery Team Lead',
    coordinatorResponsibilities: ['Run discovery sprints', 'Synthesize research', 'Present findings'],
    coordinatorSkills: [
      { name: 'User Research Methods', description: 'Qualitative and quantitative', category: 'research' },
      { name: 'Data Analysis', description: 'Insights from data', category: 'research' },
    ],
    proposedByAgentId: IDS.headOfProduct,
  },
]

// ── Specialist definitions ──────────────────────────────────────────────

export interface SpecialistDef {
  id: string
  uoId: string
  name: string
  role: string
  responsibilities: string[]
  skills: { name: string; description: string; category: string }[]
  inputs: string[]
  outputs: string[]
  proposedByAgentId: string
}

export const SPECIALISTS: SpecialistDef[] = [
  // Platform Team
  {
    id: IDS.infraEngineer,
    uoId: IDS.platformTeam,
    name: 'Infrastructure Engineer',
    role: 'Infrastructure Specialist',
    responsibilities: ['Provision cloud resources', 'Manage Kubernetes clusters', 'Monitor uptime'],
    skills: [
      { name: 'Kubernetes', description: 'Container orchestration', category: 'infrastructure' },
      { name: 'Terraform', description: 'Infrastructure as code', category: 'infrastructure' },
    ],
    inputs: ['Infrastructure requirements', 'Capacity plans'],
    outputs: ['Provisioned environments', 'Infrastructure reports'],
    proposedByAgentId: IDS.platformLead,
  },
  {
    id: IDS.devopsSpecialist,
    uoId: IDS.platformTeam,
    name: 'DevOps Specialist',
    role: 'DevOps Engineer',
    responsibilities: ['Maintain CI/CD pipelines', 'Automate deployments', 'Manage secrets'],
    skills: [
      { name: 'CI/CD', description: 'Pipeline automation', category: 'devops' },
      { name: 'Docker', description: 'Container management', category: 'devops' },
    ],
    inputs: ['Build artifacts', 'Deployment configs'],
    outputs: ['Deployed services', 'Pipeline reports'],
    proposedByAgentId: IDS.platformLead,
  },
  // Backend Team
  {
    id: IDS.domainEngineer,
    uoId: IDS.backendTeam,
    name: 'Domain Engineer',
    role: 'Domain Logic Specialist',
    responsibilities: ['Implement domain aggregates', 'Write domain services', 'Design event schemas'],
    skills: [
      { name: 'DDD', description: 'Domain-driven design', category: 'engineering' },
      { name: 'TypeScript', description: 'Strong typing', category: 'engineering' },
    ],
    inputs: ['Domain specs', 'Acceptance criteria'],
    outputs: ['Domain modules', 'Domain events'],
    proposedByAgentId: IDS.backendLead,
  },
  {
    id: IDS.apiSpecialist,
    uoId: IDS.backendTeam,
    name: 'API Specialist',
    role: 'API Development Specialist',
    responsibilities: ['Design REST endpoints', 'Implement controllers', 'Write OpenAPI docs'],
    skills: [
      { name: 'REST API Design', description: 'RESTful patterns', category: 'engineering' },
      { name: 'NestJS', description: 'Framework expertise', category: 'engineering' },
    ],
    inputs: ['API requirements', 'Domain DTOs'],
    outputs: ['REST endpoints', 'API documentation'],
    proposedByAgentId: IDS.backendLead,
  },
  // QA Team
  {
    id: IDS.testAutomation,
    uoId: IDS.qaTeam,
    name: 'Test Automation Specialist',
    role: 'Automation QA',
    responsibilities: ['Write automated tests', 'Maintain test suites', 'Run regression'],
    skills: [
      { name: 'Vitest', description: 'Test framework', category: 'quality' },
      { name: 'Playwright', description: 'E2E testing', category: 'quality' },
    ],
    inputs: ['Test plans', 'User stories'],
    outputs: ['Automated test suites', 'Coverage reports'],
    proposedByAgentId: IDS.qaLead,
  },
  {
    id: IDS.manualQa,
    uoId: IDS.qaTeam,
    name: 'Manual QA Specialist',
    role: 'Manual QA',
    responsibilities: ['Execute manual test cases', 'Exploratory testing', 'Report bugs'],
    skills: [
      { name: 'Exploratory Testing', description: 'Ad-hoc quality discovery', category: 'quality' },
      { name: 'Bug Reporting', description: 'Issue documentation', category: 'quality' },
    ],
    inputs: ['Feature specs', 'Release candidates'],
    outputs: ['Test reports', 'Bug tickets'],
    proposedByAgentId: IDS.qaLead,
  },
  // Discovery Team
  {
    id: IDS.productAnalyst,
    uoId: IDS.discoveryTeam,
    name: 'Product Analyst',
    role: 'Product Analysis Specialist',
    responsibilities: ['Analyze user data', 'Track product metrics', 'Generate insights'],
    skills: [
      { name: 'Data Analysis', description: 'Product analytics', category: 'research' },
      { name: 'SQL', description: 'Data querying', category: 'engineering' },
    ],
    inputs: ['Usage data', 'Analytics events'],
    outputs: ['Insight reports', 'Metric dashboards'],
    proposedByAgentId: IDS.discoveryLead,
  },
  {
    id: IDS.uxResearcher,
    uoId: IDS.discoveryTeam,
    name: 'UX Researcher',
    role: 'User Experience Research Specialist',
    responsibilities: ['Conduct user interviews', 'Run usability tests', 'Synthesize findings'],
    skills: [
      { name: 'User Interviews', description: 'Qualitative research', category: 'research' },
      { name: 'Usability Testing', description: 'Task-based evaluation', category: 'research' },
    ],
    inputs: ['Research questions', 'Participant pools'],
    outputs: ['Research reports', 'Design recommendations'],
    proposedByAgentId: IDS.discoveryLead,
  },
  // Dispatch Team
  {
    id: IDS.dispatchAnalyst,
    uoId: IDS.dispatchTeam,
    name: 'Dispatch Analyst',
    role: 'Dispatch Analysis Specialist',
    responsibilities: ['Analyze dispatch efficiency', 'Identify bottlenecks', 'Generate routing recommendations'],
    skills: [
      { name: 'Route Optimization', description: 'Dispatch algorithms', category: 'operations' },
      { name: 'Data Visualization', description: 'Operational dashboards', category: 'operations' },
    ],
    inputs: ['Dispatch logs', 'GPS data'],
    outputs: ['Efficiency reports', 'Route optimization plans'],
    proposedByAgentId: IDS.dispatchCoordinator,
  },
  {
    id: IDS.scheduleOptimizer,
    uoId: IDS.dispatchTeam,
    name: 'Schedule Optimizer',
    role: 'Scheduling Specialist',
    responsibilities: ['Build maintenance schedules', 'Balance crew workloads', 'Handle emergency rescheduling'],
    skills: [
      { name: 'Scheduling Algorithms', description: 'Optimization models', category: 'operations' },
      { name: 'Workforce Planning', description: 'Capacity management', category: 'operations' },
    ],
    inputs: ['Maintenance requests', 'Crew availability'],
    outputs: ['Optimized schedules', 'Capacity forecasts'],
    proposedByAgentId: IDS.dispatchCoordinator,
  },
  // Field Service Team
  {
    id: IDS.fieldOpsAgent,
    uoId: IDS.fieldServiceTeam,
    name: 'Field Operations Agent',
    role: 'Field Operations Specialist',
    responsibilities: ['Execute on-site maintenance', 'Document field work', 'Report incidents'],
    skills: [
      { name: 'Elevator Maintenance', description: 'Technical repair', category: 'operations' },
      { name: 'Safety Protocols', description: 'On-site safety', category: 'compliance' },
    ],
    inputs: ['Work orders', 'Safety checklists'],
    outputs: ['Completion reports', 'Incident reports'],
    proposedByAgentId: IDS.fieldServiceLead,
  },
  // Customer Success (directly under department, no team)
  {
    id: IDS.supportAgent,
    uoId: IDS.customerSuccess,
    name: 'Support Agent',
    role: 'Customer Support Specialist',
    responsibilities: ['Handle support tickets', 'Troubleshoot issues', 'Escalate complex cases'],
    skills: [
      { name: 'Technical Support', description: 'Issue resolution', category: 'support' },
      { name: 'Communication', description: 'Client interaction', category: 'communication' },
    ],
    inputs: ['Support tickets', 'Customer context'],
    outputs: ['Resolutions', 'Escalation records'],
    proposedByAgentId: IDS.csLead,
  },
  {
    id: IDS.onboardingSpecialist,
    uoId: IDS.customerSuccess,
    name: 'Onboarding Specialist',
    role: 'Customer Onboarding Specialist',
    responsibilities: ['Guide new customers', 'Configure initial setup', 'Track onboarding milestones'],
    skills: [
      { name: 'Customer Onboarding', description: 'Setup facilitation', category: 'support' },
      { name: 'Product Training', description: 'User education', category: 'communication' },
    ],
    inputs: ['New customer profiles', 'Onboarding checklists'],
    outputs: ['Activated accounts', 'Training completion records'],
    proposedByAgentId: IDS.csLead,
  },
  // Compliance (directly under department, no team)
  {
    id: IDS.auditAnalyst,
    uoId: IDS.compliance,
    name: 'Audit Analyst',
    role: 'Audit Specialist',
    responsibilities: ['Prepare audit documentation', 'Coordinate with auditors', 'Track findings'],
    skills: [
      { name: 'Audit Preparation', description: 'Documentation and evidence', category: 'compliance' },
      { name: 'Risk Assessment', description: 'Compliance risk evaluation', category: 'compliance' },
    ],
    inputs: ['Regulatory requirements', 'Audit schedules'],
    outputs: ['Audit reports', 'Remediation plans'],
    proposedByAgentId: IDS.complianceManager,
  },
  {
    id: IDS.inspectionSpecialist,
    uoId: IDS.compliance,
    name: 'Inspection Specialist',
    role: 'Safety Inspection Specialist',
    responsibilities: ['Conduct safety inspections', 'Document findings', 'Ensure corrective actions'],
    skills: [
      { name: 'Safety Inspection', description: 'On-site evaluation', category: 'compliance' },
      { name: 'Regulatory Standards', description: 'Industry norms', category: 'compliance' },
    ],
    inputs: ['Inspection schedules', 'Safety standards'],
    outputs: ['Inspection reports', 'Corrective action plans'],
    proposedByAgentId: IDS.complianceManager,
  },
]

// ── Runtime demo events ─────────────────────────────────────────────────

export interface RuntimeDemoEvent {
  eventType: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  title: string
  description: string
  sourceEntityType: string
  sourceEntityId: string
  targetEntityType?: string
  targetEntityId?: string
}

export const RUNTIME_DEMO_EVENTS: RuntimeDemoEvent[] = [
  {
    eventType: 'agent-activated',
    severity: 'info',
    title: 'CEO activated',
    description: 'CEO agent began bootstrap conversation',
    sourceEntityType: 'coordinator-agent',
    sourceEntityId: IDS.ceo,
  },
  {
    eventType: 'proposal-created',
    severity: 'info',
    title: 'Engineering Department proposed',
    description: 'CEO proposed creating the Engineering department',
    sourceEntityType: 'coordinator-agent',
    sourceEntityId: IDS.ceo,
    targetEntityType: 'department',
    targetEntityId: IDS.engineering,
  },
  {
    eventType: 'proposal-approved',
    severity: 'info',
    title: 'Engineering Department approved',
    description: 'Founder approved the Engineering department',
    sourceEntityType: 'department',
    sourceEntityId: IDS.engineering,
  },
  {
    eventType: 'agent-activated',
    severity: 'info',
    title: 'VP Engineering activated',
    description: 'VP Engineering coordinator started operations',
    sourceEntityType: 'coordinator-agent',
    sourceEntityId: IDS.vpEngineering,
  },
  {
    eventType: 'execution-started',
    severity: 'info',
    title: 'Dispatch run started',
    description: 'Daily dispatch routing workflow started execution',
    sourceEntityType: 'workflow',
    sourceEntityId: 'vert-wf-dispatch',
  },
  {
    eventType: 'stage-entered',
    severity: 'info',
    title: 'Stage: Route Calculation entered',
    description: 'Dispatch workflow entered route calculation stage',
    sourceEntityType: 'workflow-stage',
    sourceEntityId: 'vert-wf-dispatch-stage-calc',
  },
  {
    eventType: 'handoff-completed',
    severity: 'info',
    title: 'Handoff: Dispatch → Field Service',
    description: 'Work orders handed off from dispatch to field service team',
    sourceEntityType: 'team',
    sourceEntityId: IDS.dispatchTeam,
    targetEntityType: 'team',
    targetEntityId: IDS.fieldServiceTeam,
  },
  {
    eventType: 'agent-activated',
    severity: 'info',
    title: 'Field Operations Agent activated',
    description: 'Field ops agent processing incoming work orders',
    sourceEntityType: 'specialist-agent',
    sourceEntityId: IDS.fieldOpsAgent,
  },
  {
    eventType: 'artifact-produced',
    severity: 'info',
    title: 'Inspection report produced',
    description: 'Inspection Specialist completed safety inspection report',
    sourceEntityType: 'specialist-agent',
    sourceEntityId: IDS.inspectionSpecialist,
  },
  {
    eventType: 'budget-alert',
    severity: 'warning',
    title: 'Engineering budget at 50%',
    description: 'Engineering department AI cost reached 50% of allocated budget',
    sourceEntityType: 'department',
    sourceEntityId: IDS.engineering,
  },
  {
    eventType: 'execution-completed',
    severity: 'info',
    title: 'Dispatch run completed',
    description: 'Daily dispatch routing workflow completed successfully',
    sourceEntityType: 'workflow',
    sourceEntityId: 'vert-wf-dispatch',
  },
  {
    eventType: 'incident-detected',
    severity: 'error',
    title: 'SLA breach: Support response time',
    description: 'Customer support response time exceeded 4-hour SLA threshold',
    sourceEntityType: 'specialist-agent',
    sourceEntityId: IDS.supportAgent,
  },
  {
    eventType: 'incident-resolved',
    severity: 'info',
    title: 'SLA breach resolved',
    description: 'Support queue cleared, response times back to normal',
    sourceEntityType: 'specialist-agent',
    sourceEntityId: IDS.supportAgent,
  },
]
