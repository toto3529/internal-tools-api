import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common"
import { Prisma } from "@prisma/client"
import {
  PrismaClientInitializationError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library"
import { Request, Response } from "express"

@Catch(
  Prisma.PrismaClientKnownRequestError,
  PrismaClientInitializationError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientValidationError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === "P2002") {
        return response.status(HttpStatus.CONFLICT).json({
          error: "Validation failed",
          details: { name: "Tool name must be unique" },
        })
      }

      if (exception.code === "P2025") {
        return response.status(HttpStatus.NOT_FOUND).json({
          error: "Tool not found",
          message: "Tool does not exist",
        })
      }

      console.error("[API] Prisma error", {
        path: request.url,
        method: request.method,
        code: exception.code,
        error: exception,
      })

      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: "Internal server error",
        message: "Database connection failed",
      })
    }

    if (
      exception instanceof PrismaClientInitializationError ||
      exception instanceof PrismaClientUnknownRequestError ||
      exception instanceof PrismaClientRustPanicError
    ) {
      console.error("[API] Prisma DB error", {
        path: request.url,
        method: request.method,
        error: exception,
      })

      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: "Internal server error",
        message: "Database connection failed",
      })
    }

    if (exception instanceof PrismaClientValidationError) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        error: "Validation failed",
        details: { general: "Database request failed" },
      })
    }

    console.error("[API] Unknown prisma error", {
      path: request.url,
      method: request.method,
      error: exception,
    })

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Internal server error",
      message: "Database connection failed",
    })
  }
}
