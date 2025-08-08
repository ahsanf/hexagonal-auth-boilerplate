import { Request, Response, NextFunction } from 'express';
import { ApplicationError } from '@util/error/application_error';
import { HttpError } from '@util/error/type/http_error';
import { formatError } from '@util/error/format_error';


let applicationError: ApplicationError
export const refreshTokenMiddleware =  (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    try {
      const token: string = req.cookies.refreshToken
      if (!token || token === undefined) {
        const errorMessage  = HttpError().FORBIDDEN
        errorMessage.message = 'Forbidden, refresh token is required or login again'
        applicationError = new ApplicationError(errorMessage);
        res.status(403).json(formatError(applicationError));
      } else {
        next()
      }
    } catch (err: any) {
      applicationError = new ApplicationError(HttpError().UNAUTHORIZED);
      applicationError.message = err.message;
      res.status(401).json(formatError(applicationError));
    }
  })()
};

