import { describe, it, expect } from 'vitest'
import {
  computeDepthMetric,
  computeFanOutMetric,
  computePendingProposalsMetric,
  computeOverallHealth,
  buildHealthReport,
} from '../domain/health-checker'
import { OrganizationalUnit } from '../../organizational-units/domain/organizational-unit'
import type { AutonomyLimitsProps } from '../../constitution/domain/company-constitution'

const defaultLimits: AutonomyLimitsProps = {
  maxDepth: 3,
  maxFanOut: 5,
  maxAgentsPerTeam: 8,
  coordinatorToSpecialistRatio: 0.25,
}

function makeUnit(
  id: string,
  parentUoId: string | null = null,
  uoType: 'company' | 'department' | 'team' = 'department',
) {
  return OrganizationalUnit.create({
    id,
    projectId: 'proj-1',
    name: `Unit ${id}`,
    description: '',
    uoType,
    mandate: 'test',
    parentUoId,
  })
}

describe('health-checker', () => {
  describe('computeDepthMetric', () => {
    it('returns 0 for empty units', () => {
      const m = computeDepthMetric([], defaultLimits)
      expect(m.value).toBe(0)
      expect(m.status).toBe('ok')
    })

    it('returns 1 for single root', () => {
      const units = [makeUnit('co', null, 'company')]
      const m = computeDepthMetric(units, defaultLimits)
      expect(m.value).toBe(1)
      expect(m.status).toBe('ok')
    })

    it('returns correct depth for nested units', () => {
      const units = [
        makeUnit('co', null, 'company'),
        makeUnit('d1', 'co'),
        makeUnit('t1', 'd1', 'team'),
      ]
      const m = computeDepthMetric(units, defaultLimits)
      expect(m.value).toBe(3)
      expect(m.status).toBe('ok')
    })

    it('flags violation when depth exceeds limit', () => {
      const units = [
        makeUnit('co', null, 'company'),
        makeUnit('d1', 'co'),
        makeUnit('d2', 'd1'),
        makeUnit('d3', 'd2'),
      ]
      const m = computeDepthMetric(units, defaultLimits) // maxDepth: 3
      expect(m.value).toBe(4)
      expect(m.status).toBe('violation')
    })
  })

  describe('computeFanOutMetric', () => {
    it('returns 0 for empty units', () => {
      const m = computeFanOutMetric([], defaultLimits)
      expect(m.value).toBe(0)
      expect(m.status).toBe('ok')
    })

    it('returns correct fan-out', () => {
      const units = [
        makeUnit('co', null, 'company'),
        makeUnit('d1', 'co'),
        makeUnit('d2', 'co'),
        makeUnit('d3', 'co'),
      ]
      const m = computeFanOutMetric(units, defaultLimits)
      expect(m.value).toBe(3)
      expect(m.status).toBe('ok')
    })

    it('flags violation when fan-out exceeds limit', () => {
      const units = [
        makeUnit('co', null, 'company'),
        ...Array.from({ length: 6 }, (_, i) => makeUnit(`d${i}`, 'co')),
      ]
      const m = computeFanOutMetric(units, defaultLimits) // maxFanOut: 5
      expect(m.value).toBe(6)
      expect(m.status).toBe('violation')
    })
  })

  describe('computePendingProposalsMetric', () => {
    it('ok when below threshold', () => {
      const m = computePendingProposalsMetric(3)
      expect(m.status).toBe('ok')
    })

    it('warning when above threshold', () => {
      const m = computePendingProposalsMetric(6)
      expect(m.status).toBe('warning')
    })
  })

  describe('computeOverallHealth', () => {
    it('healthy when all ok', () => {
      expect(
        computeOverallHealth([
          { name: 'test', value: 1, threshold: 5, status: 'ok', description: '' },
        ]),
      ).toBe('healthy')
    })

    it('attention-needed when any warning', () => {
      expect(
        computeOverallHealth([
          { name: 'test', value: 6, threshold: 5, status: 'warning', description: '' },
        ]),
      ).toBe('attention-needed')
    })

    it('at-risk when any violation', () => {
      expect(
        computeOverallHealth([
          { name: 'test', value: 10, threshold: 5, status: 'violation', description: '' },
        ]),
      ).toBe('at-risk')
    })
  })

  describe('buildHealthReport', () => {
    it('returns a complete report', () => {
      const units = [makeUnit('co', null, 'company'), makeUnit('d1', 'co')]
      const report = buildHealthReport({
        projectId: 'proj-1',
        phase: 'formation',
        units,
        limits: defaultLimits,
        pendingProposalCount: 2,
      })

      expect(report.projectId).toBe('proj-1')
      expect(report.phase).toBe('formation')
      expect(report.metrics.length).toBeGreaterThanOrEqual(3)
      expect(report.overallHealth).toBe('healthy')
      expect(report.generatedAt).toBeInstanceOf(Date)
    })

    it('flags at-risk when depth violation', () => {
      const units = [
        makeUnit('co', null, 'company'),
        makeUnit('d1', 'co'),
        makeUnit('d2', 'd1'),
        makeUnit('d3', 'd2'),
      ]
      const report = buildHealthReport({
        projectId: 'proj-1',
        phase: 'structured',
        units,
        limits: defaultLimits,
        pendingProposalCount: 0,
      })

      expect(report.overallHealth).toBe('at-risk')
      expect(report.recommendations.length).toBeGreaterThan(0)
    })
  })
})
