import { Mood } from '../types/check-in';

export const MOOD_LABELS: Record<Mood, string> = {
  [Mood.GREAT]: 'Great! 😄',
  [Mood.GOOD]: 'Good 🙂',
  [Mood.OKAY]: 'Okay 😐',
  [Mood.LOW]: 'Low 😕',
  [Mood.STRUGGLING]: 'Struggling 😞',
};

export const MOOD_EMOJIS: Record<Mood, string> = {
  [Mood.GREAT]: '😄',
  [Mood.GOOD]: '🙂',
  [Mood.OKAY]: '😐',
  [Mood.LOW]: '😕',
  [Mood.STRUGGLING]: '😞',
};
