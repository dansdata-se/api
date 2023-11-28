import { registry } from "@/api/registry";
import { StatusCodes } from "@/api/status_codes";
import z from "@/api/zod";

export enum ErrorCode {
  internalServerError = "INTERNAL_SERVER_ERROR",
  notImplemented = "NOT_IMPLEMENTED",
  httpMethodNotAllowed = "METHOD_NOT_ALLOWED",
  unauthorized = "UNAUTHORIZED",
  forbidden = "FORBIDDEN",
  invalidParameters = "INVALID_PARAMETERS",
  invalidBody = "INVALID_BODY",
  notFound = "NOT_FOUND",
}

export function errorCodeToStatusCode(code: ErrorCode): number {
  switch (code) {
    case ErrorCode.internalServerError:
      return StatusCodes.serverError.internalServerError;
    case ErrorCode.notImplemented:
      return StatusCodes.serverError.notImplemented;
    case ErrorCode.httpMethodNotAllowed:
      return StatusCodes.clientError.methodNotAllowed;
    case ErrorCode.unauthorized:
      return StatusCodes.clientError.unauthorized;
    case ErrorCode.forbidden:
      return StatusCodes.clientError.forbidden;
    case ErrorCode.invalidParameters:
    case ErrorCode.invalidBody:
      return StatusCodes.clientError.badRequest;
    case ErrorCode.notFound:
      return StatusCodes.clientError.notFound;
  }
}

export type ErrorDto = z.infer<typeof ErrorDtoSchema>;
export const ErrorDtoSchema = registry.register(
  "ErrorDto",
  z
    .object({
      code: z
        .nativeEnum(ErrorCode)
        .describe(
          "Error code for the specific error. Can be used to supply the user with a localized message."
        ),
      message: z
        .string()
        .describe(
          "More details (where available). Primarily aimed at developers."
        ),
    })
    .describe("Error object returned for 4xx and 5xx responses.")
);
