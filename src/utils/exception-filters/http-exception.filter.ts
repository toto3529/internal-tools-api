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
      if (responseData?.error === "Validation failed" && responseData?.details) {
        response.status(status).json(responseData)
        return
      }

      // Nest/class-validator fournit souvent message: string[] (ou string)
      const rawMessage = responseData?.message ?? "Validation failed"

      const messages = Array.isArray(rawMessage) ? rawMessage : [rawMessage]

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
      const msg = responseData?.message ?? exception.message ?? "Resource not found"

      response.status(status).json({
        error: "Tool not found",
        message: msg,
      })
      return
    }

    // Autres erreurs HTTP
    const message = (typeof responseData === "string" && responseData) || responseData?.message || exception.message || "Request failed"

    response.status(status).json({
      error: "Request failed",
      message,
      path: request.url,
    })
  }
}
