import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AvailabilityRulesService } from './availability-rules.service';
import { CreateAvailabilityRuleDto } from './dto/create-availability-rule.dto';
import { UpdateAvailabilityRuleDto } from './dto/update-availability-rule.dto';

@Controller('availability-rules')
export class AvailabilityRulesController {
  constructor(
    private readonly availabilityRulesService: AvailabilityRulesService,
  ) {}

  @Get()
  findAll() {
    return this.availabilityRulesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.availabilityRulesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateAvailabilityRuleDto) {
    return this.availabilityRulesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAvailabilityRuleDto) {
    return this.availabilityRulesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.availabilityRulesService.remove(id);
  }
}
