import { CLAIM_HISTORY_TYPES } from '@config';
import { HttpException } from '@exceptions/HttpExceptions';
import { NextFunction, Request, Response } from 'express';

const validateSupportedClaimHistoryTypes = (req: Request, res: Response, next: NextFunction) => {
  const types = req.query.types;
  if (!types) {
    return next();
  }
  let unsupportedTypes: string[] = [];
  let supportedTypes = Object.values(CLAIM_HISTORY_TYPES);
  for (const t of types) {
    if (!supportedTypes.includes(t)) {
      unsupportedTypes.push(t);
    }
  }

  if (unsupportedTypes.length > 0) {
    return next(new HttpException(400, `Unsupported types ${unsupportedTypes}`));
  } else {
    next();
  }
};

export default validateSupportedClaimHistoryTypes;
