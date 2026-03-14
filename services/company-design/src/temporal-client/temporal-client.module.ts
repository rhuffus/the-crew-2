import { Module, Logger, type OnModuleDestroy } from '@nestjs/common'
import { Connection, WorkflowClient } from '@temporalio/client'

export const TEMPORAL_WORKFLOW_CLIENT = Symbol('TEMPORAL_WORKFLOW_CLIENT')

/**
 * Lazy wrapper around WorkflowClient that connects on first use.
 * This prevents the service from crashing at startup if Temporal is
 * temporarily unavailable, while still failing fast on actual use.
 */
export class LazyWorkflowClient {
  private client: WorkflowClient | null = null
  private connecting: Promise<WorkflowClient> | null = null
  private readonly logger = new Logger('TemporalClientModule')
  private readonly address: string
  private readonly namespace: string

  constructor() {
    this.address = process.env.TEMPORAL_ADDRESS ?? 'localhost:7233'
    this.namespace = process.env.TEMPORAL_NAMESPACE ?? 'default'
    this.logger.log(`Temporal client configured for ${this.address} (namespace: ${this.namespace})`)
  }

  async getClient(): Promise<WorkflowClient> {
    if (this.client) return this.client

    if (!this.connecting) {
      this.connecting = this.connect()
    }

    try {
      this.client = await this.connecting
      return this.client
    } catch (err) {
      this.connecting = null
      throw err
    }
  }

  private async connect(): Promise<WorkflowClient> {
    this.logger.log(`Connecting Temporal client to ${this.address}...`)
    const connection = await Connection.connect({ address: this.address })
    const client = new WorkflowClient({ connection, namespace: this.namespace })
    this.logger.log('Temporal client connected')
    return client
  }

  async close(): Promise<void> {
    if (!this.client) return
    try {
      await this.client.connection.close()
      this.logger.log('Temporal client connection closed')
    } catch (err) {
      this.logger.warn('Error closing Temporal connection', err)
    }
    this.client = null
  }
}

@Module({
  providers: [
    {
      provide: TEMPORAL_WORKFLOW_CLIENT,
      useFactory: (): LazyWorkflowClient => {
        return new LazyWorkflowClient()
      },
    },
    {
      provide: 'TEMPORAL_CLIENT_CLEANUP',
      useFactory: (lazy: LazyWorkflowClient): OnModuleDestroy => ({
        async onModuleDestroy() {
          await lazy.close()
        },
      }),
      inject: [TEMPORAL_WORKFLOW_CLIENT],
    },
  ],
  exports: [TEMPORAL_WORKFLOW_CLIENT],
})
export class TemporalClientModule {}
