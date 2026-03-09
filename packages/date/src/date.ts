import dayjs from 'dayjs';
import type { DateType, ISODateString, UnixTimestamp } from './type';

export const createDate = (date: Date | string | dayjs.Dayjs = dayjs()): DateType =>
  dayjs(date) as DateType;

export const createISODateString = (date: DateType): ISODateString =>
  date.toISOString() as ISODateString;

export const createUnixTimestamp = (date: DateType): UnixTimestamp => date.unix() as UnixTimestamp;
