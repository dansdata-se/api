import { registry } from "@/api/registry";
import { NextApiRequest } from "next";

export const placeholderAuth = registry.registerComponent(
  "securitySchemes",
  "placeholderAuth",
  {
    type: "apiKey",
    in: "header",
    name: "X-PLACEHOLDER-AUTH",
  }
);

/**
 * Whether or not the given request contains valid authentication information
 */
export function isAuthenticated(req: NextApiRequest) {
  return req.headers["x-placeholder-auth"] === process.env.PLACEHOLDER_AUTH_KEY;
}

/**
 * Whether an authenticated (see {@link isAuthenticated}) user has enough
 * permissions to access the requested resource.
 */
export function isAuthorized(_: NextApiRequest) {
  return true;
}
