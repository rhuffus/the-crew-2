import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { Client, Connection } from '@temporalio/client'
import type { SubmitAgentTaskDto, AgentTaskStatusDto } from '@the-crew/shared-types'

@Injectable()
export class AgentTaskService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AgentTaskService.name)
  private client?: Client
  private connection?: Connection

  async onModuleInit(): Promise<void> {
    const address = process.env.TEMPORAL_ADDRESS ?? 'localhost:7233'
    this.logger.log(`Connecting Temporal client to ${address}`)

    try {
      this.connection = await Connection.connect({ address })
      this.client = new Client({ connection: this.connection })
      this.logger.log('Temporal client connected')
    } catch (err) {
      this.logger.warn(
        `Could not connect to Temporal at ${address}: ${err instanceof Error ? err.message : err}. Agent task submissions will fail until Temporal is available.`,
      )
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.connection?.close()
  }

  async submit(
    projectId: string,
    dto: SubmitAgentTaskDto,
  ): Promise<AgentTaskStatusDto> {
    if (!this.client) {
      throw new Error(
        'Temporal client is not connected. Cannot submit agent tasks.',
      )
    }

    const workflowId = `agent-task-${projectId}-${dto.agentId}-${Date.now()}`

    const handle = await this.client.workflow.start(
      'basicAgentTaskWorkflow',
      {
        taskQueue: 'agent-execution',
        workflowId,
        args: [
          {
            projectId,
            agentId: dto.agentId,
            taskType: dto.taskType,
            instruction: dto.instruction,
            contextBundle: dto.contextBundle,
            inputDocs: dto.inputDocs,
            allowedOutputs: dto.allowedOutputs,
            maxTurns: dto.maxTurns,
            maxTokens: dto.maxTokens,
            maxCostUsd: dto.maxCostUsd,
            timeout: dto.timeout,
            maxRetries: dto.maxRetries,
          },
        ],
      },
    )

    this.logger.log(`Started workflow ${workflowId}`)

    return {
      workflowId: handle.workflowId,
      projectId,
      agentId: dto.agentId,
      status: 'running',
    }
  }

  async getStatus(workflowId: string): Promise<AgentTaskStatusDto> {
    if (!this.client) {
      throw new Error('Temporal client is not connected.')
    }

    const handle = this.client.workflow.getHandle(workflowId)
    const description = await handle.describe()

    const temporalStatus = description.status.name

    if (temporalStatus === 'COMPLETED') {
      const result = await handle.result()
      return {
        workflowId,
        projectId: (result as Record<string, string>).projectId ?? '',
        agentId: (result as Record<string, string>).agentId ?? '',
        status: 'completed',
        result: result as AgentTaskStatusDto['result'],
      }
    }

    if (temporalStatus === 'FAILED' || temporalStatus === 'TERMINATED') {
      return {
        workflowId,
        projectId: '',
        agentId: '',
        status: 'failed',
      }
    }

    if (temporalStatus === 'TIMED_OUT') {
      return {
        workflowId,
        projectId: '',
        agentId: '',
        status: 'timed-out',
      }
    }

    if (temporalStatus === 'CANCELLED') {
      return {
        workflowId,
        projectId: '',
        agentId: '',
        status: 'cancelled',
      }
    }

    return {
      workflowId,
      projectId: '',
      agentId: '',
      status: 'running',
    }
  }
}
