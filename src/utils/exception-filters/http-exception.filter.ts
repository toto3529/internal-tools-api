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

    if (status === HttpStatus.BAD_REQUEST) {
      if (responseData?.error === "Validation failed" && responseData?.details) {
        return response.status(status).json(responseData)
      }

      const rawMessage = responseData?.message ?? "Validation failed"
      const messages = Array.isArray(rawMessage) ? rawMessage : [rawMessage]

      return response.status(status).json({
        error: "Validation failed",
        details: { general: messages.join(" | ") },
      })
    }

    if (status === HttpStatus.NOT_FOUND) {
      const msg = responseData?.message ?? (isHttp ? (exception as HttpException).message : "Resource not found")

      return response.status(status).json({
        error: "Tool not found",
        message: msg,
      })
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      console.error("[API] Internal server error", {
        path: request.url,
        method: request.method,
        error: exception,
      })

      return response.status(status).json({
        error: "Internal server error",
        message: "Internal server error",
      })
    }

    const message =
      (typeof responseData === "string" && responseData) ||
      responseData?.message ||
      (isHttp ? (exception as HttpException).message : "Request failed")

    return response.status(status).json({
      error: "Request failed",
      message,
    })
  }
}
