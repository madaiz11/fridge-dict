import { MESSAGE_EXCEPTION_CONST } from '../../../core/configs';
import { HeaderException } from '../../../core/exceptions/header.exceptions';
import {
  type CustomHttpHeader,
  type HttpHeaderValue,
  createHttpHeaderValue,
} from '../../../core/types/logger.brand.type';

export const middleRedactorStrategy = (
  headerName: CustomHttpHeader,
  value: HttpHeaderValue | undefined,
): HttpHeaderValue => {
  if (!value || value === undefined) {
    throw new HeaderException(MESSAGE_EXCEPTION_CONST.invalidHeaderValue(headerName, value));
  }

  if (value.length < 8) {
    throw new HeaderException(MESSAGE_EXCEPTION_CONST.headerValueOutOfBounds(headerName, value));
  }

  return createHttpHeaderValue(`${value.slice(0, 4)}...${value.slice(-4)}`);
};
