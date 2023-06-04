import { isAuthenticated, isAuthorized } from "@/api/auth";
import { ErrorCode, ErrorDTO } from "@/api/dto/error";
import { registry } from "@/api/registry";
import { withParsedObject } from "@/api/util";
import z from "@/api/zod";
import { RouteConfig } from "@asteasolutions/zod-to-openapi";
import { NextApiRequest, NextApiResponse } from "next";

export type Endpoint = {
  authenticated: boolean;
  docs: RouteConfig;
  handler(
    req: NextApiRequest,
    res: NextApiResponse,
    params: {
      [x: string]: any;
    }
  ): Promise<void>;
};
export type Endpoints = {
  HEAD: Endpoint;
  GET: Endpoint;
  POST: Endpoint;
  PUT: Endpoint;
  DELETE: Endpoint;
  PATCH: Endpoint;
};

export function defineEndpoints(
  endpoints: Partial<Endpoints>
): (req: NextApiRequest, res: NextApiResponse) => Promise<void> {
  Object.entries(endpoints).forEach(([, endpoint]) => {
    registry.registerPath(endpoint.docs);
  });

  return async function handler(req, res) {
    try {
      // Fallback if no endpoints are registered
      if (Object.keys(endpoints).length === 0) {
        return res.status(404).json({
          code: ErrorCode.notFound,
          message: "The requested resource does not exist.",
        });
      }

      const endpoint = endpoints[req.method as keyof typeof endpoints];

      // Respond to OPTIONS request.
      // This should be allowed whether the endpoint(s) require authentication
      // or not.
      if (req.method === "OPTIONS") {
        res.setHeader(
          "Allow",
          Object.entries({
            OPTIONS: true,
            HEAD: endpoints.HEAD !== undefined,
            GET: endpoints.GET !== undefined,
            POST: endpoints.POST !== undefined,
            PUT: endpoints.PUT !== undefined,
            DELETE: endpoints.DELETE !== undefined,
            PATCH: endpoints.PATCH !== undefined,
          })
            .filter(([, isAllowed]) => isAllowed)
            .map(([header]) => header)
            .join(", ")
        );
        res.status(204).end();
        return;
      }

      // Verify request method
      if (endpoint === undefined) {
        return (res as NextApiResponse<ErrorDTO>).status(405).json({
          code: ErrorCode.httpMethodNotAllowed,
          message: "HTTP method not allowed.",
        });
      }

      // Verify authentication
      if (endpoint.authenticated) {
        if (!isAuthenticated(req)) {
          return (res as NextApiResponse<ErrorDTO>).status(401).json({
            code: ErrorCode.forbidden,
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

      // Parse and validate parameters
      const parameterSchema = (
        endpoint.docs.request?.params ?? z.object({})
      ).merge(endpoint.docs.request?.query ?? z.object({}));

      // Execute endpoint handler
      await withParsedObject(
        parameterSchema,
        req.query,
        res,
        ErrorCode.invalidParameters,
        (params) => endpoint.handler(req, res, params)
      );
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.stack);
      } else {
        console.error(e);
      }

      (res as NextApiResponse<ErrorDTO>).status(500).json({
        code: ErrorCode.internalServerError,
        message: ["development", "test"].includes(process.env.NODE_ENV)
          ? String(e)
          : "Something went wrong on our end.",
      });
    }
  };
}
