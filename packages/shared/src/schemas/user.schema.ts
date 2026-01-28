import { z } from 'zod';

export const updateUserSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  timezone: z.string().optional(),
});
