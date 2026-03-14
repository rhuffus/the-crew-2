import { type DynamicModule, Global, Module } from '@nestjs/common'
import { PRISMA_CLIENT } from './prisma.constants'
import { PrismaBaseService } from './prisma-base.service'

export interface PrismaModuleOptions {
  /**
   * DATABASE_URL to connect to. If omitted, Prisma falls back to
   * the `datasource.url` in the generated schema (env var DATABASE_URL).
   */
  url?: string
}

@Global()
@Module({})
export class PrismaModule {
  static forRoot(options: PrismaModuleOptions = {}): DynamicModule {
    return {
      module: PrismaModule,
      providers: [
        {
          provide: PrismaBaseService,
          useFactory: () => {
            if (options.url) {
              return new PrismaBaseService({
                datasources: { db: { url: options.url } },
              })
            }
            return new PrismaBaseService()
          },
        },
        {
          provide: PRISMA_CLIENT,
          useExisting: PrismaBaseService,
        },
      ],
      exports: [PrismaBaseService, PRISMA_CLIENT],
      global: true,
    }
  }
}
