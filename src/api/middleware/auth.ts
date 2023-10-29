import { isAuthenticated, isAuthorized } from "@/api/auth";
import { ErrorCode, ErrorDto } from "@/api/dto/error";
import { ApiMiddleware } from "@/api/middleware";
import { StatusCodes } from "@/api/status_codes";
import { NextApiResponse } from "next";

export const authMiddleware: ApiMiddleware =
  (handler, endpoint) => async (req, res) => {
    // Verify authentication
    if (endpoint.authenticated) {
      if (!isAuthenticated(req)) {
        return (res as NextApiResponse<ErrorDto>)
          .status(StatusCodes.clientError.unauthorized)
          .json({
            code: ErrorCode.unauthorized,
            message: "You must be authenticated to access this resource.",
          });
      }

      if (!isAuthorized(req)) {
        return (res as NextApiResponse<ErrorDto>)
          .status(StatusCodes.clientError.forbidden)
          .json({
            code: ErrorCode.forbidden,
            message: "You are not allowed to access this resource.",
          });
      }
    }

    await handler(req, res);
  };
