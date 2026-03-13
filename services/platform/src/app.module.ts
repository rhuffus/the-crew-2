import { Module } from '@nestjs/common'
import { DrizzleModule, isPersistenceModeDrizzle } from '@the-crew/drizzle-db'
import { HealthController } from './health.controller'
import { ProjectsModule } from './projects/projects.module'
import { BootstrapModule } from './bootstrap/bootstrap.module'

const drizzleImport = isPersistenceModeDrizzle()
  ? [DrizzleModule.forRoot({ connectionString: process.env.DATABASE_URL! })]
  : []

@Module({
  imports: [...drizzleImport, ProjectsModule, BootstrapModule],
  controllers: [HealthController],
})
export class AppModule {}
