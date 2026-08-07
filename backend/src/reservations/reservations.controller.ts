import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';

@Controller()
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get('reservations/slots')
  getSlots(@Query('date') date: string, @Query('areaName') areaName?: string) {
    return this.reservationsService.getAvailableSlots(date, areaName);
  }

  @Get('reservations')
  findAll() {
    return this.reservationsService.findAll();
  }

  @Get('reservations/:id')
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  @Post('reservations')
  create(@Body() dto: CreateReservationDto) {
    return this.reservationsService.create(dto);
  }

  @Patch('reservations/:id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateReservationStatusDto) {
    return this.reservationsService.updateStatus(id, dto.status);
  }

  @Delete('reservations/:id')
  remove(@Param('id') id: string) {
    return this.reservationsService.remove(id);
  }
}
