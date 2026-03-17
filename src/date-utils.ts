import dayjs from 'dayjs';
import { logger } from './logger';

export const DATE_FORMAT = 'YYYY MMM DD';

export function toDayJs(date: DateMC) {
  if (date instanceof Date || typeof date === 'string') return dayjs(date);
  if (typeof date === 'number') return dayjs.unix(date);
  if ((date as any).toDate) return dayjs((date as any).toDate());

  logger.error('invalid date: ', date);

  return dayjs();
}

export function formatDate(date?: DateMC | null, empty = '--') {
  if (!date) return empty;

  return toDayJs(date).format(DATE_FORMAT);
}

export const unixEpochSeconds = () => Math.floor(Date.now() / 1000);
