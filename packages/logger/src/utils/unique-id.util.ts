import { v4 as uuidv4 } from 'uuid';

export const generateUniqueID = (): string => {
  return uuidv4();
};
