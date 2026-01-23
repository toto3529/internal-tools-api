import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common"
import { Request, Response } from "express"

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const isHttp = exception instanceof HttpException
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
    const responseData = isHttp ? (exception.getResponse() as any) : null

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
      const msg = responseData?.message ?? (isHttp ? (exception as HttpException).message : "Resource not found")

      response.status(status).json({
        error: "Tool not found",
        message: msg,
      })
      return
    }

    // 500 - fallback global
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      console.error("[API] Internal server error", {
        path: request.url,
        method: request.method,
        error: exception,
      })

      response.status(status).json({
        error: "Internal server error",
        message: "Database connection failed",
      })
      return
    }

    // Autres erreurs HTTP
    const message =
      (typeof responseData === "string" && responseData) ||
      responseData?.message ||
      (isHttp ? (exception as HttpException).message : "Request failed")
    response.status(status).json({
      error: "Request failed",
      message,
      path: request.url,
    })
  }
}
