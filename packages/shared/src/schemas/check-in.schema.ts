import { z } from 'zod';
import { Mood } from '../types/check-in';
import { MAX_CHECK_IN_LENGTH, ENERGY_MIN, ENERGY_MAX } from '../constants/check-in';

export const checkInSchema = z.object({
  yesterday: z.string().min(1, 'Yesterday field is required').max(MAX_CHECK_IN_LENGTH.YESTERDAY),
  today: z.string().min(1, 'Today field is required').max(MAX_CHECK_IN_LENGTH.TODAY),
  blockers: z.string().max(MAX_CHECK_IN_LENGTH.BLOCKERS).optional(),
  mood: z.nativeEnum(Mood),
  energy: z.number().int().min(ENERGY_MIN).max(ENERGY_MAX),
});

export const checkInUpdateSchema = checkInSchema.partial();

export const checkInQuerySchema = z.object({
  dateFrom: z.string().date().optional(),
  dateTo: z.string().date().optional(),
  userIds: z.string().array().optional(),
  hasBlockers: z.boolean().optional(),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});
