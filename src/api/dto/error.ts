import { registry } from "@/api/registry";
import z from "@/api/zod";

export enum ErrorCode {
  internalServerError = "INTERNAL_SERVER_ERROR",
  httpMethodNotAllowed = "METHOD_NOT_ALLOWED",
  unauthorized = "UNAUTHORIZED",
  forbidden = "FORBIDDEN",
  invalidParameters = "INVALID_PARAMETERS",
  invalidBody = "INVALID_BODY",
  notFound = "NOT_FOUND",
}

export type ErrorDto = z.infer<typeof ErrorDtoSchema>;
export const ErrorDtoSchema = registry.register(
  "ErrorDto",
  z
    .object({
      code: z.nativeEnum(ErrorCode).openapi({
        description:
          "Error code for the specific error. Can be used to supply the user with a localized message.",
      }),
      message: z.string().openapi({
        description:
          "More details (where available). Primarily aimed at developers.",
      }),
    })
    .openapi({
      description: "Error object returned for 4xx and 5xx responses.",
    })
);
