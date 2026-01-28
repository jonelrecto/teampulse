import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(100),
  logoUrl: z.string().url().optional(),
});

export const updateTeamSchema = createTeamSchema.partial();

export const joinTeamSchema = z.object({
  code: z.string().min(1, 'Invite code is required'),
});
