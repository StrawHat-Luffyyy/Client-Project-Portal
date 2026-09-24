import { acceptInviteSchema, createInviteSchema } from '@client-portal/shared';
import type { RequestHandler } from 'express';

import { setAccessCookie } from '../http/cookies.js';
import type { InviteService } from '../services/invite.service.js';

export function createInviteController(
  inviteService: InviteService,
  webOrigin: string,
) {
  const create: RequestHandler = async (request, response) => {
    const invite = await inviteService.create(
      request.auth!,
      createInviteSchema.parse(request.body),
    );
    response.status(201).json({
      data: {
        invite: {
          id: invite.id,
          email: invite.email,
          role: invite.role,
          clientId: invite.clientId,
          expiresAt: invite.expiresAt.toISOString(),
          inviteLink: `${webOrigin}/invite/${invite.token}`,
        },
      },
    });
  };

  const accept: RequestHandler = async (request, response) => {
    const token = request.params.token;
    if (typeof token !== 'string') {
      throw new Error('Invite route token parameter is missing.');
    }
    const result = await inviteService.accept(
      token,
      acceptInviteSchema.parse(request.body),
    );
    setAccessCookie(response, result.accessToken);
    response.status(201).json({ data: { user: result.user } });
  };

  return { create, accept };
}
