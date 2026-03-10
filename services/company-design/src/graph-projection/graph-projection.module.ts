import { Module } from '@nestjs/common'
import { GraphProjectionController } from './application/graph-projection.controller'
import { GraphProjectionService } from './application/graph-projection.service'
import { ReleasesModule } from '../releases/releases.module'
import { ValidationsModule } from '../validations/validations.module'

@Module({
  imports: [ReleasesModule, ValidationsModule],
  controllers: [GraphProjectionController],
  providers: [GraphProjectionService],
})
export class GraphProjectionModule {}
