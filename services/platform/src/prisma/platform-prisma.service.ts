import {
  Injectable,
  type OnModuleInit,
  type OnModuleDestroy,
  Logger,
} from '@nestjs/common'
import { PrismaClient } from '.prisma/platform-client'

@Injectable()
export class PlatformPrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PlatformPrismaService.name)

  async onModuleInit(): Promise<void> {
    await this.$connect()
    this.logger.log('Platform Prisma connected')
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect()
    this.logger.log('Platform Prisma disconnected')
  }
}
