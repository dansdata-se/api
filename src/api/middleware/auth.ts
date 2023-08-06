import { isAuthenticated, isAuthorized } from "@/api/auth";
import { ErrorCode, ErrorDTO } from "@/api/dto/error";
import { ApiMiddleware } from "@/api/middleware";
import { NextApiResponse } from "next";

export const authMiddleware: ApiMiddleware =
  (handler, endpoint) => async (req, res) => {
    // Verify authentication
    if (endpoint.authenticated) {
      if (!isAuthenticated(req)) {
        return (res as NextApiResponse<ErrorDTO>).status(401).json({
          code: ErrorCode.unauthorized,
          message: "You must be authenticated to access this resource.",
        });
      }

      if (!isAuthorized(req)) {
        return (res as NextApiResponse<ErrorDTO>).status(403).json({
          code: ErrorCode.forbidden,
          message: "You are not allowed to access this resource.",
        });
      }
    }

    await handler(req, res);
  };
