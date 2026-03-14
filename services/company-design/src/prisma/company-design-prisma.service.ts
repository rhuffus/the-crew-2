import {
  Injectable,
  type OnModuleInit,
  type OnModuleDestroy,
  Logger,
} from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class CompanyDesignPrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(CompanyDesignPrismaService.name)

  async onModuleInit(): Promise<void> {
    await this.$connect()
    this.logger.log('CompanyDesign Prisma connected')
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect()
    this.logger.log('CompanyDesign Prisma disconnected')
  }
}
