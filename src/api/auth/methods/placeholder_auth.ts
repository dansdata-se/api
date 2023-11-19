import { AuthenticationMethod } from "@/api/auth";
import { registry } from "@/api/registry";
import env from "@/env";
import { NextApiRequest } from "next";

export const placeholderAuth: AuthenticationMethod = {
  securityScheme: registry.registerComponent(
    "securitySchemes",
    "placeholderAuth",
    {
      type: "http",
      in: "header",
      scheme: "bearer",
    }
  ),
  isAuthenticated(req: NextApiRequest) {
    return req.headers.authorization === `Bearer ${env.PLACEHOLDER_AUTH_KEY}`;
  },
};
