import { Module } from '@nestjs/common'
import { HealthController } from './health.controller'
import { TemporalModule } from './temporal/temporal.module'

@Module({
  imports: [TemporalModule],
  controllers: [HealthController],
})
export class AppModule {}
