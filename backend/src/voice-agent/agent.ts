import 'reflect-metadata';
import {
  cli,
  defineAgent,
  voice,
  WorkerOptions,
  type JobContext,
} from '@livekit/agents';
import * as openai from '@livekit/agents-plugin-openai';
import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { AppModule } from '../app.module';
import { BUSINESS_NAME } from '../config/business.config';
import { CallLog } from '../reservations/entities/call-log.entity';
import { ReservationsService } from '../reservations/reservations.service';
import { buildInstructions } from './instructions';
import { buildTools } from './tools';

const nestAppPromise = NestFactory.createApplicationContext(AppModule, {
  logger: ['error', 'warn'],
});

export default defineAgent({
  entry: async (ctx: JobContext) => {
    const nestApp = await nestAppPromise;
    const reservationsService = nestApp.get(ReservationsService);
    const callLogRepo = nestApp.get<Repository<CallLog>>(
      getRepositoryToken(CallLog),
    );

    await ctx.connect();

    const transcript: string[] = [];
    let outcome = 'abandoned';

    const agent = new voice.Agent({
      instructions: buildInstructions(),
      tools: buildTools(reservationsService, {
        onReservationCreated: () => {
          outcome = 'reservation_created';
        },
        onNoAvailability: () => {
          outcome = 'no_availability';
        },
      }),
    });

    const session = new voice.AgentSession({
      llm: new openai.realtime.RealtimeModel({
        voice: 'alloy',
      }),
    });

    session.on(voice.AgentSessionEventTypes.ConversationItemAdded, (ev) => {
      const item = ev.item;
      if ('textContent' in item && item.textContent) {
        transcript.push(`${item.role}: ${item.textContent}`);
      }
    });

    const persistCallLog = async () => {
      await callLogRepo.save(
        callLogRepo.create({
          callSid: ctx.room.name,
          transcript: transcript.join('\n'),
          outcome,
        }),
      );
    };

    ctx.addShutdownCallback(persistCallLog);

    await session.start({ agent, room: ctx.room });

    session.generateReply({
      instructions: `Greet the caller as the receptionist for ${BUSINESS_NAME}. Say the restaurant name, introduce yourself briefly, and ask how you can help them today. Keep it short and friendly. Greet in English.`,
    });
  },
});

cli.runApp(new WorkerOptions({ agent: __filename }));
