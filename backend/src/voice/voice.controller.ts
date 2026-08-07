import { Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AccessToken } from 'livekit-server-sdk';
import { randomUUID } from 'node:crypto';

@Controller('voice')
export class VoiceController {
  @Post('token')
  async token(@Res() res: Response) {
    const roomName = `call-${randomUUID()}`;
    const identity = `caller-${randomUUID()}`;

    const accessToken = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      { identity },
    );
    accessToken.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    res.json({
      token: await accessToken.toJwt(),
      url: process.env.LIVEKIT_URL,
      roomName,
    });
  }
}
