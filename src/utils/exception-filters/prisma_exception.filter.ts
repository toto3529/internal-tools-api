import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common"
import { Prisma } from "@prisma/client"
import { Request, Response } from "express"

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    // P2002 = unique constraint failed
    if (exception.code === "P2002") {
      return response.status(HttpStatus.CONFLICT).json({
        error: "Validation failed",
        details: {
          name: "Name must be unique",
        },
        path: request.url,
      })
    }

    // P2025 = record not found (update/delete/find)
    if (exception.code === "P2025") {
      return response.status(HttpStatus.NOT_FOUND).json({
        error: "Tool not found",
        message: "Tool does not exist",
        path: request.url,
      })
    }

    // Fallback
    return response.status(HttpStatus.BAD_REQUEST).json({
      error: "Request failed",
      message: "Database request failed",
      path: request.url,
    })
  }
}
