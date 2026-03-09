import {
  type CustomHttpHeader,
  type HttpHeaderValue,
  createCustomHttpHeader,
} from '../../core/types/logger.brand.type';
import { middleRedactorStrategy } from './strategies/middle.redactor.strategy';
import { staticRedactorStrategy } from './strategies/static.redactor.strategy';

export const redactorFactory = (
  headerName: CustomHttpHeader,
  value: HttpHeaderValue | undefined,
): HttpHeaderValue => {
  switch (headerName) {
    case createCustomHttpHeader('authorization'):
      return middleRedactorStrategy(headerName, value);
    case createCustomHttpHeader('x-api-key'):
      return middleRedactorStrategy(headerName, value);
    default:
      return staticRedactorStrategy();
  }
};
