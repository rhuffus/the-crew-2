import { type DynamicModule, Global, Module } from '@nestjs/common'
import { CompanyDesignPrismaService } from './company-design-prisma.service'

export interface CompanyDesignPrismaModuleOptions {
  url?: string
}

@Global()
@Module({})
export class CompanyDesignPrismaModule {
  static forRoot(options: CompanyDesignPrismaModuleOptions = {}): DynamicModule {
    return {
      module: CompanyDesignPrismaModule,
      providers: [
        {
          provide: CompanyDesignPrismaService,
          useFactory: () => {
            if (options.url) {
              return new CompanyDesignPrismaService({
                datasources: { db: { url: options.url } },
              })
            }
            return new CompanyDesignPrismaService()
          },
        },
      ],
      exports: [CompanyDesignPrismaService],
      global: true,
    }
  }
}
