import { describe, it, expect, beforeEach } from 'vitest'
import { BootstrapController } from './bootstrap.controller'
import { CeoFirstBootstrapService } from './ceo-first-bootstrap.service'
import { InMemoryProjectSeedRepository } from '../project-seed/infra/in-memory-project-seed.repository'
import { InMemoryCompanyConstitutionRepository } from '../constitution/infra/in-memory-company-constitution.repository'
import { InMemoryOrganizationalUnitRepository } from '../organizational-units/infra/in-memory-organizational-unit.repository'
import { InMemoryLcpAgentRepository } from '../lcp-agents/infra/in-memory-lcp-agent.repository'

describe('BootstrapController', () => {
  let controller: BootstrapController

  beforeEach(() => {
    const service = new CeoFirstBootstrapService(
      new InMemoryProjectSeedRepository(),
      new InMemoryCompanyConstitutionRepository(),
      new InMemoryOrganizationalUnitRepository(),
      new InMemoryLcpAgentRepository(),
    )
    controller = new BootstrapController(service)
  })

  it('should bootstrap a project', async () => {
    const result = await controller.bootstrap('proj-001', {
      name: 'Test Co',
      mission: 'Test mission',
      companyType: 'saas-startup',
    })

    expect(result.projectSeedId).toBe('proj-001')
    expect(result.maturityPhase).toBe('seed')
    expect(result.nextStep).toBe('bootstrap-conversation')
    expect(result.companyUoId).toBeTruthy()
    expect(result.ceoAgentId).toBeTruthy()
  })

  it('should return status for non-bootstrapped project', async () => {
    const status = await controller.getStatus('proj-001')

    expect(status.bootstrapped).toBe(false)
    expect(status.maturityPhase).toBeNull()
  })

  it('should return status for bootstrapped project', async () => {
    const bootstrapped = await controller.bootstrap('proj-001', {
      name: 'Test Co',
      mission: 'Test mission',
      companyType: 'saas-startup',
    })

    const status = await controller.getStatus('proj-001')

    expect(status.bootstrapped).toBe(true)
    expect(status.maturityPhase).toBe('seed')
    expect(status.ceoAgentId).toBe(bootstrapped.ceoAgentId)
    expect(status.companyUoId).toBe(bootstrapped.companyUoId)
  })

  it('should be idempotent', async () => {
    const first = await controller.bootstrap('proj-001', {
      name: 'Test Co',
      mission: 'Test mission',
      companyType: 'saas-startup',
    })
    const second = await controller.bootstrap('proj-001', {
      name: 'Test Co',
      mission: 'Test mission',
      companyType: 'saas-startup',
    })

    expect(second.companyUoId).toBe(first.companyUoId)
    expect(second.ceoAgentId).toBe(first.ceoAgentId)
  })

  it('should pass optional fields through', async () => {
    const result = await controller.bootstrap('proj-001', {
      name: 'Test Co',
      mission: 'Test mission',
      companyType: 'saas-startup',
      vision: 'Be the best',
      growthPace: 'aggressive',
      approvalLevel: 'all-changes',
    })

    expect(result.maturityPhase).toBe('seed')
  })
})
