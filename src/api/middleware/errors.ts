import { ErrorCode, ErrorDto } from "@/api/dto/error";
import { ApiMiddleware } from "@/api/middleware";
import { StatusCodes } from "@/api/status_codes";
import { getDbClient } from "@/db";
import env from "@/env";
import logger from "@/logger";
import { NextApiResponse } from "next";

export const errorCatchingMiddleware: ApiMiddleware =
  (handler) => async (req, res) => {
    try {
      await handler(req, res);
    } catch (e) {
      logger.error(e);

      await getDbClient()
        .error.create({
          data: {
            message: e instanceof Error ? e.message : String(e),
            stackTrace: e instanceof Error ? e.stack ?? "" : "",
            serverVersion: `${
              env.VERCEL_GIT_COMMIT_REF
            }:${env.VERCEL_GIT_COMMIT_SHA.substring(0, 7)}`,
          },
        })
        .catch((e) => logger.error(e, "Failed to write to error log"));

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
