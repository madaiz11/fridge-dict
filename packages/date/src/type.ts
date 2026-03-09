import type { BrandedType } from '@frigdict/types';
import type { Dayjs } from 'dayjs';

export type DateType = BrandedType<Dayjs, 'dateType'>;
export type ISODateString = BrandedType<string, 'ISODateString'>;
export type UnixTimestamp = BrandedType<number, 'UnixTimestamp'>;
