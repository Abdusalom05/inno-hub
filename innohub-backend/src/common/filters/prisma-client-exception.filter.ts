import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case 'P2002': {
        const status = HttpStatus.CONFLICT;
        const message = 'Unique constraint failed. A record with this unique field already exists.';
        response.status(status).json({
          statusCode: status,
          message: message,
          error: 'Conflict',
        });
        break;
      }
      case 'P2025': {
        const status = HttpStatus.NOT_FOUND;
        const message = 'Record to update, delete, or fetch was not found.';
        response.status(status).json({
          statusCode: status,
          message: message,
          error: 'Not Found',
        });
        break;
      }
      default: {
        // Fallback for unmapped codes
        const status = HttpStatus.INTERNAL_SERVER_ERROR;
        response.status(status).json({
          statusCode: status,
          message: 'An internal database error occurred.',
          error: 'Internal Server Error',
        });
        break;
      }
    }
  }
}
