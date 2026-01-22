import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common"
import { Request, Response } from "express"

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const status = exception.getStatus()
    const responseData = exception.getResponse() as any

    // 400 - Validation errors
    if (status === HttpStatus.BAD_REQUEST) {
      // Nest/class-validator fournit souvent message: string[]
      const messages = Array.isArray(responseData?.message) ? responseData.message : [responseData?.message ?? "Validation failed"]

      // Format simple au début : on met tout dans general
      // TODO à affiner avec les DTO
      response.status(status).json({
        error: "Validation failed",
        details: {
          general: messages.join(" | "),
        },
      })
      return
    }

    // 404 - Not found
    if (status === HttpStatus.NOT_FOUND) {
      response.status(status).json({
        error: "Tool not found",
        message: exception.message,
      })
      return
    }

    // Autres erreurs HTTP
    response.status(status).json({
      error: "Request failed",
      message: exception.message,
      path: request.url,
    })
  }
}
