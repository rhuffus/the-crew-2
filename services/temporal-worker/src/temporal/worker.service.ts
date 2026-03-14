import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common'
import * as path from 'path'
import {
  NativeConnection,
  Worker,
  bundleWorkflowCode,
} from '@temporalio/worker'
import { ALL_TASK_QUEUES } from '../task-queues'
import * as activities from '../activities'

@Injectable()
export class WorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WorkerService.name)
  private workers: Worker[] = []
  private runPromises: Promise<void>[] = []
  private connection?: NativeConnection
  private started = false

  async onModuleInit(): Promise<void> {
    const address = process.env.TEMPORAL_ADDRESS ?? 'localhost:7233'
    this.logger.log(`Connecting to Temporal at ${address}`)

    this.connection = await NativeConnection.connect({ address })

    const workflowBundle = await bundleWorkflowCode({
      workflowsPath: path.resolve(__dirname, '../workflows'),
    })

    for (const taskQueue of ALL_TASK_QUEUES) {
      const worker = await Worker.create({
        connection: this.connection,
        namespace: 'default',
        taskQueue,
        workflowBundle,
        activities,
      })
      this.workers.push(worker)
      this.logger.log(`Worker created for queue: ${taskQueue}`)
    }

    this.runPromises = this.workers.map((w, i) =>
      w.run().catch((err) => {
        this.logger.error(`Worker error on queue ${ALL_TASK_QUEUES[i]}`, err)
      }),
    )

    this.started = true
    this.logger.log(`All ${this.workers.length} workers started`)
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Shutting down workers...')
    for (const worker of this.workers) {
      worker.shutdown()
    }
    await Promise.all(this.runPromises)
    await this.connection?.close()
    this.started = false
    this.logger.log('All workers stopped')
  }

  getStatus(): { started: boolean; queues: string[] } {
    return {
      started: this.started,
      queues: this.started ? [...ALL_TASK_QUEUES] : [],
    }
  }
}
