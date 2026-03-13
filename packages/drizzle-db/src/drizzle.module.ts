import { type DynamicModule, Global, Module } from '@nestjs/common'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { DRIZZLE_DB } from './drizzle.constants'

export interface DrizzleModuleOptions {
  connectionString: string
}

@Global()
@Module({})
export class DrizzleModule {
  static forRoot(options: DrizzleModuleOptions): DynamicModule {
    const client = postgres(options.connectionString)
    const db = drizzle(client)

    return {
      module: DrizzleModule,
      providers: [
        {
          provide: DRIZZLE_DB,
          useValue: db,
        },
      ],
      exports: [DRIZZLE_DB],
      global: true,
    }
  }
}
