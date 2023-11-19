import { AuthenticationMethod } from "@/api/auth";
import env from "@/env";
import { NextApiRequest } from "next";

export const vercelCronAuth: AuthenticationMethod = {
  securityScheme: "undocumented",
  isAuthenticated(req: NextApiRequest) {
    return req.headers.authorization === `Bearer ${env.CRON_SECRET}`;
  },
};
