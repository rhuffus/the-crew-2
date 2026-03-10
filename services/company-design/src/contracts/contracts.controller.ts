import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
} from '@nestjs/common'
import type { CreateContractDto, UpdateContractDto } from '@the-crew/shared-types'
import { ContractService } from './application/contract.service'

@Controller('projects/:projectId/contracts')
export class ContractsController {
  constructor(private readonly contractService: ContractService) {}

  @Get()
  list(@Param('projectId') projectId: string) {
    return this.contractService.list(projectId)
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.contractService.get(id)
  }

  @Post()
  @HttpCode(201)
  create(@Param('projectId') projectId: string, @Body() dto: CreateContractDto) {
    return this.contractService.create(projectId, dto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateContractDto) {
    return this.contractService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.contractService.remove(id)
  }
}
