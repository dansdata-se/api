import { ErrorCode, ErrorDto } from "@/api/dto/error";
import { ApiMiddleware } from "@/api/middleware";
import { StatusCodes } from "@/api/status_codes";
import logger from "@/logger";
import { NextApiResponse } from "next";

export const errorCatchingMiddleware: ApiMiddleware =
  (handler) => async (req, res) => {
    try {
      await handler(req, res);
    } catch (e) {
      logger.error(e);

      (res as NextApiResponse<ErrorDto>)
        .status(StatusCodes.serverError.internalServerError)
        .json({
          code: ErrorCode.internalServerError,
          message: ["development", "test"].includes(process.env.NODE_ENV)
            ? String(e)
            : "Something went wrong on our end.",
        });
    }
  };
