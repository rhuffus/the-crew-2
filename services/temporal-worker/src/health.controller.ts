import { Controller, Get } from '@nestjs/common'
import { WorkerService } from './temporal/worker.service'

@Controller('health')
export class HealthController {
  constructor(private readonly workerService: WorkerService) {}

  @Get()
  check() {
    return {
      status: 'ok',
      service: 'temporal-worker',
      workers: this.workerService.getStatus(),
    }
  }
}
