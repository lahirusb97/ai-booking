import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Reservation } from './reservations/entities/reservation.entity';
import { Payment } from './reservations/entities/payment.entity';
import { CallLog } from './reservations/entities/call-log.entity';
import { ReservationsModule } from './reservations/reservations.module';
import { VoiceModule } from './voice/voice.module';
import { AvailabilityRule } from './availability-rules/entities/availability-rule.entity';
import { AvailabilityRulesModule } from './availability-rules/availability-rules.module';
import { Organization } from './auth/entities/organization.entity';
import { AuthModule } from './auth/auth.module';
import { Customer } from './customers/entities/customer.entity';
import { CustomersModule } from './customers/customers.module';

const isLocalDb = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL ?? '');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [
        Reservation,
        Payment,
        CallLog,
        AvailabilityRule,
        Organization,
        Customer,
      ],
      synchronize: true,
      ssl: isLocalDb ? false : { rejectUnauthorized: false },
    }),
    ReservationsModule,
    VoiceModule,
    AvailabilityRulesModule,
    AuthModule,
    CustomersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
