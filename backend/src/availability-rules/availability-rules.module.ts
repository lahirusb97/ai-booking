import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilityRule } from './entities/availability-rule.entity';
import { AvailabilityRulesService } from './availability-rules.service';
import { AvailabilityRulesController } from './availability-rules.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AvailabilityRule])],
  controllers: [AvailabilityRulesController],
  providers: [AvailabilityRulesService],
  exports: [AvailabilityRulesService, TypeOrmModule],
})
export class AvailabilityRulesModule {}
