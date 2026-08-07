export class CreateReservationDto {
  customerName!: string;
  customerPhone!: string;
  areaName!: string;
  partySize!: number;
  reservationDate!: string;
  startTime!: string;
  amount?: number;
}
