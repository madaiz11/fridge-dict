import type { DateType } from './type';

enum DateFormat {
  Yyyymmdd = 'YYYY-MM-DD',
  YyyymmddHhmmss = 'YYYY-MM-DD HH:mm:ss',
  YyyymmddHhmmssSs = 'YYYY-MM-DD HH:mm:ss.SSS',
}

export const getDateFormatted = (date: DateType, format: DateFormat): string => date.format(format);
