import { proxyActivities } from '@temporalio/workflow'
import type * as activities from '../activities'

const { evaluateOrgProposal } = proxyActivities<typeof activities>({
  startToCloseTimeout: '30s',
})

export async function minimalOrgGrowthWorkflow(
  projectId: string,
  proposalId: string,
): Promise<{ projectId: string; proposalId: string; approved: boolean }> {
  const result = await evaluateOrgProposal(projectId, proposalId)
  return { projectId, proposalId, approved: result.approved }
}
