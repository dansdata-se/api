/**
 * This file contains an endpoint that will be called by vercel
 * on a cron schedule.
 *
 * https://vercel.com/docs/cron-jobs
 */

import { defineEndpoints } from "@/api";
import { vercelCronAuth } from "@/api/auth/methods/vercel_cron_auth";
import { StatusCodes } from "@/api/status_codes";
import dayjs from "@/dayjs";
import { getDbClient } from "@/db";
import env from "@/env";
import type { NextApiResponse } from "next";

export default defineEndpoints({
  GET: {
    authentication: vercelCronAuth,
    docs: "undocumented",
    async handler(_, res) {
      // Clean up old request logs
      await getDbClient().request.deleteMany({
        where: {
          createdAt: {
            lt: dayjs()
              .subtract(env.REQUEST_LOG_RETENTION_DAYS, "days")
              .startOf("day")
              .toDate(),
          },
        },
      });

      (res as NextApiResponse<{ success: boolean }>)
        .status(StatusCodes.success.ok)
        .json({
          success: true,
        });
    },
  },
});
