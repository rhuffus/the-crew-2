import type { StreamEventEnvelope } from './stream-envelope.js'

// --- Platform commands ---

export interface CreateProjectCommand {
  name: string
  description: string
}

export interface UpdateProjectCommand {
  name?: string
  description?: string
}

export interface ArchiveProjectCommand {
  reason?: string
}

// --- Company Design commands ---

export interface CreateProjectSeedCommand {
  projectId: string
  name: string
  description: string
}

export interface UpdateProjectSeedCommand {
  projectId: string
}

export interface CreateCompanyModelCommand {
  projectId: string
}

export interface UpdateCompanyModelCommand {
  projectId: string
}

export interface CreateDepartmentCommand {
  projectId: string
  name: string
  description: string
}

export interface CreateOrganizationalUnitCommand {
  projectId: string
  name: string
  type: string
}

export interface CreateAgentCommand {
  projectId: string
  name: string
  type: string
}

export interface CreateProposalCommand {
  projectId: string
  type: string
  title: string
  description: string
}

export interface ApproveProposalCommand {
  projectId: string
  approvedBy: string
}

export interface RejectProposalCommand {
  projectId: string
  reason: string
}

export interface SendBootstrapMessageCommand {
  projectId: string
  content: string
}

export interface CreateProjectDocumentCommand {
  projectId: string
  slug: string
  title: string
  content: string
}

export interface UpdateProjectDocumentCommand {
  projectId: string
  slug: string
  content: string
}

// --- Union types ---

export type PlatformCommandType =
  | 'CreateProject'
  | 'UpdateProject'
  | 'ArchiveProject'

export type CompanyDesignCommandType =
  | 'CreateProjectSeed'
  | 'UpdateProjectSeed'
  | 'CreateCompanyModel'
  | 'UpdateCompanyModel'
  | 'CreateDepartment'
  | 'CreateOrganizationalUnit'
  | 'CreateAgent'
  | 'CreateProposal'
  | 'ApproveProposal'
  | 'RejectProposal'
  | 'SendBootstrapMessage'
  | 'CreateProjectDocument'
  | 'UpdateProjectDocument'

export type CommandEnvelope =
  | StreamEventEnvelope<CreateProjectCommand>
  | StreamEventEnvelope<UpdateProjectCommand>
  | StreamEventEnvelope<ArchiveProjectCommand>
  | StreamEventEnvelope<CreateProjectSeedCommand>
  | StreamEventEnvelope<UpdateProjectSeedCommand>
  | StreamEventEnvelope<CreateCompanyModelCommand>
  | StreamEventEnvelope<UpdateCompanyModelCommand>
  | StreamEventEnvelope<CreateDepartmentCommand>
  | StreamEventEnvelope<CreateOrganizationalUnitCommand>
  | StreamEventEnvelope<CreateAgentCommand>
  | StreamEventEnvelope<CreateProposalCommand>
  | StreamEventEnvelope<ApproveProposalCommand>
  | StreamEventEnvelope<RejectProposalCommand>
  | StreamEventEnvelope<SendBootstrapMessageCommand>
  | StreamEventEnvelope<CreateProjectDocumentCommand>
  | StreamEventEnvelope<UpdateProjectDocumentCommand>
