import type { StreamEventEnvelope } from './stream-envelope.js'

// --- ProjectSeed events ---
export interface ProjectSeedCreatedPayload { projectId: string; name: string; description: string }
export interface ProjectSeedUpdatedPayload { projectId: string }
export interface MaturityPhaseAdvancedPayload { projectId: string; fromPhase: string; toPhase: string }

// --- CompanyModel events ---
export interface CompanyModelCreatedPayload { projectId: string }
export interface CompanyModelUpdatedPayload { projectId: string }

// --- CompanyConstitution events ---
export interface ConstitutionCreatedPayload { projectId: string }
export interface ConstitutionUpdatedPayload { projectId: string }

// --- BootstrapConversation events ---
export interface BootstrapConversationCreatedPayload { projectId: string }
export interface BootstrapConversationAdvancedPayload { projectId: string; toStage: string }

// --- OrganizationalUnit events ---
export interface OrganizationalUnitCreatedPayload { projectId: string; name: string; type: string }
export interface OrganizationalUnitUpdatedPayload { projectId: string }

// --- Department events ---
export interface DepartmentCreatedPayload { projectId: string; name: string }
export interface DepartmentUpdatedPayload { projectId: string }

// --- LcpAgent events ---
export interface AgentCreatedPayload { projectId: string; name: string; type: string }
export interface AgentUpdatedPayload { projectId: string }

// --- AgentAssignment events ---
export interface AgentAssignmentCreatedPayload { projectId: string; agentId: string; unitId: string }
export interface AgentAssignmentUpdatedPayload { projectId: string }
export interface AgentAssignmentDeactivatedPayload { projectId: string }
export interface AgentAssignmentActivatedPayload { projectId: string }

// --- AgentArchetype events ---
export interface AgentArchetypeCreatedPayload { projectId: string; name: string }
export interface AgentArchetypeUpdatedPayload { projectId: string }

// --- Role events ---
export interface RoleCreatedPayload { projectId: string; name: string }
export interface RoleUpdatedPayload { projectId: string }

// --- Skill events ---
export interface SkillCreatedPayload { projectId: string; name: string }
export interface SkillUpdatedPayload { projectId: string }

// --- Capability events ---
export interface CapabilityCreatedPayload { projectId: string; name: string }
export interface CapabilityUpdatedPayload { projectId: string }

// --- Contract events ---
export interface ContractCreatedPayload { projectId: string; name: string }
export interface ContractUpdatedPayload { projectId: string }

// --- Policy events ---
export interface PolicyCreatedPayload { projectId: string; name: string }
export interface PolicyUpdatedPayload { projectId: string }

// --- Workflow events ---
export interface WorkflowCreatedPayload { projectId: string; name: string }
export interface WorkflowUpdatedPayload { projectId: string }

// --- Artifact events ---
export interface ArtifactCreatedPayload { projectId: string; name: string }
export interface ArtifactUpdatedPayload { projectId: string }

// --- Release events ---
export interface ReleaseCreatedPayload { projectId: string; version: string }
export interface ReleaseUpdatedPayload { projectId: string }
export interface ReleasePublishedPayload { projectId: string; publishedAt: string }

// --- Proposal events ---
export interface ProposalCreatedPayload { projectId: string; type: string }
export interface ProposalSubmittedPayload { projectId: string }
export interface ProposalUnderReviewPayload { projectId: string }
export interface ProposalApprovedPayload { projectId: string; approvedBy: string }
export interface ProposalRejectedPayload { projectId: string; reason: string }
export interface ProposalImplementedPayload { projectId: string }
export interface ProposalSupersededPayload { projectId: string; supersededBy: string }

// --- ProjectDocument events ---
export interface ProjectDocumentCreatedPayload { projectId: string; slug: string; title: string }
export interface ProjectDocumentUpdatedPayload { projectId: string; slug: string }

// --- Union type for all company-design events ---

export type CompanyDesignEventType =
  | 'ProjectSeedCreated' | 'ProjectSeedUpdated' | 'MaturityPhaseAdvanced'
  | 'CompanyModelCreated' | 'CompanyModelUpdated'
  | 'ConstitutionCreated' | 'ConstitutionUpdated'
  | 'BootstrapConversationCreated' | 'BootstrapConversationAdvanced'
  | 'OrganizationalUnitCreated' | 'OrganizationalUnitUpdated'
  | 'DepartmentCreated' | 'DepartmentUpdated'
  | 'AgentCreated' | 'AgentUpdated'
  | 'AgentAssignmentCreated' | 'AgentAssignmentUpdated' | 'AgentAssignmentDeactivated' | 'AgentAssignmentActivated'
  | 'AgentArchetypeCreated' | 'AgentArchetypeUpdated'
  | 'RoleCreated' | 'RoleUpdated'
  | 'SkillCreated' | 'SkillUpdated'
  | 'CapabilityCreated' | 'CapabilityUpdated'
  | 'ContractCreated' | 'ContractUpdated'
  | 'PolicyCreated' | 'PolicyUpdated'
  | 'WorkflowCreated' | 'WorkflowUpdated'
  | 'ArtifactCreated' | 'ArtifactUpdated'
  | 'ReleaseCreated' | 'ReleaseUpdated' | 'ReleasePublished'
  | 'ProposalCreated' | 'ProposalSubmitted' | 'ProposalUnderReview'
  | 'ProposalApproved' | 'ProposalRejected' | 'ProposalImplemented' | 'ProposalSuperseded'
  | 'ProjectDocumentCreated' | 'ProjectDocumentUpdated'

export type CompanyDesignEventEnvelope =
  | StreamEventEnvelope<ProjectSeedCreatedPayload>
  | StreamEventEnvelope<ProjectSeedUpdatedPayload>
  | StreamEventEnvelope<MaturityPhaseAdvancedPayload>
  | StreamEventEnvelope<CompanyModelCreatedPayload>
  | StreamEventEnvelope<CompanyModelUpdatedPayload>
  | StreamEventEnvelope<ConstitutionCreatedPayload>
  | StreamEventEnvelope<ConstitutionUpdatedPayload>
  | StreamEventEnvelope<BootstrapConversationCreatedPayload>
  | StreamEventEnvelope<BootstrapConversationAdvancedPayload>
  | StreamEventEnvelope<OrganizationalUnitCreatedPayload>
  | StreamEventEnvelope<OrganizationalUnitUpdatedPayload>
  | StreamEventEnvelope<DepartmentCreatedPayload>
  | StreamEventEnvelope<DepartmentUpdatedPayload>
  | StreamEventEnvelope<AgentCreatedPayload>
  | StreamEventEnvelope<AgentUpdatedPayload>
  | StreamEventEnvelope<AgentAssignmentCreatedPayload>
  | StreamEventEnvelope<AgentAssignmentUpdatedPayload>
  | StreamEventEnvelope<AgentAssignmentDeactivatedPayload>
  | StreamEventEnvelope<AgentAssignmentActivatedPayload>
  | StreamEventEnvelope<AgentArchetypeCreatedPayload>
  | StreamEventEnvelope<AgentArchetypeUpdatedPayload>
  | StreamEventEnvelope<RoleCreatedPayload>
  | StreamEventEnvelope<RoleUpdatedPayload>
  | StreamEventEnvelope<SkillCreatedPayload>
  | StreamEventEnvelope<SkillUpdatedPayload>
  | StreamEventEnvelope<CapabilityCreatedPayload>
  | StreamEventEnvelope<CapabilityUpdatedPayload>
  | StreamEventEnvelope<ContractCreatedPayload>
  | StreamEventEnvelope<ContractUpdatedPayload>
  | StreamEventEnvelope<PolicyCreatedPayload>
  | StreamEventEnvelope<PolicyUpdatedPayload>
  | StreamEventEnvelope<WorkflowCreatedPayload>
  | StreamEventEnvelope<WorkflowUpdatedPayload>
  | StreamEventEnvelope<ArtifactCreatedPayload>
  | StreamEventEnvelope<ArtifactUpdatedPayload>
  | StreamEventEnvelope<ReleaseCreatedPayload>
  | StreamEventEnvelope<ReleaseUpdatedPayload>
  | StreamEventEnvelope<ReleasePublishedPayload>
  | StreamEventEnvelope<ProposalCreatedPayload>
  | StreamEventEnvelope<ProposalSubmittedPayload>
  | StreamEventEnvelope<ProposalUnderReviewPayload>
  | StreamEventEnvelope<ProposalApprovedPayload>
  | StreamEventEnvelope<ProposalRejectedPayload>
  | StreamEventEnvelope<ProposalImplementedPayload>
  | StreamEventEnvelope<ProposalSupersededPayload>
  | StreamEventEnvelope<ProjectDocumentCreatedPayload>
  | StreamEventEnvelope<ProjectDocumentUpdatedPayload>
