import { AuthenticationMethod } from "@/api/auth";
import { ErrorCode, ErrorDto } from "@/api/dto/error";
import { wrapEndpointWithMiddleware } from "@/api/middleware";
import { registry } from "@/api/registry";
import { StatusCodes } from "@/api/status_codes";
import { getDbClient } from "@/db";
import env from "@/env";
import logger from "@/logger";
import { RouteConfig } from "@asteasolutions/zod-to-openapi";
import { NextApiRequest, NextApiResponse } from "next";

export type ApiRequestHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => void | Promise<void>;

export interface Endpoint {
  authentication: AuthenticationMethod | null;
  docs: RouteConfig | "undocumented";
  handler: ApiRequestHandler;
}
export interface Endpoints {
  HEAD: Endpoint;
  GET: Endpoint;
  POST: Endpoint;
  PUT: Endpoint;
  DELETE: Endpoint;
  PATCH: Endpoint;
}

export function defineEndpoints(
  endpoints: Partial<Endpoints>
): ApiRequestHandler {
  Object.entries(endpoints)
    .filter(([, { docs }]) => docs !== "undocumented")
    .forEach(([, endpoint]) => {
      const docs = endpoint.docs as RouteConfig;

      if (
        endpoint.authentication &&
        typeof endpoint.authentication.securityScheme === "object"
      ) {
        docs.security = [
          ...(docs.security ?? []),
          { [endpoint.authentication.securityScheme.name]: [] },
        ];
      }

      registry.registerPath(docs);
    });

  return buildRequestHandler(endpoints);
}

const buildRequestHandler = (endpoints: Partial<Endpoints>) =>
  withResponseLogger(
    withCorsHeaders(async (req: NextApiRequest, res: NextApiResponse) => {
      // Fallback if no endpoints are registered
      if (Object.keys(endpoints).length === 0) {
        res.status(StatusCodes.clientError.notFound).json({
          code: ErrorCode.notFound,
          message: "The requested resource does not exist.",
        });
        return;
      }

      const endpoint = endpoints[req.method as keyof typeof endpoints] ?? null;

      if (endpoint) {
        const handler = wrapEndpointWithMiddleware(endpoint, endpoints);
        await handler(req, res);
      } else if (req.method === "OPTIONS") {
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
        res.status(StatusCodes.success.noContent).end();
      } else {
        (res as NextApiResponse<ErrorDto>)
          .status(StatusCodes.clientError.methodNotAllowed)
          .json({
            code: ErrorCode.httpMethodNotAllowed,
            message: "HTTP method not allowed.",
          });
      }
    })
  );

/**
 * Logs requests and the responses they produce
 */
const withResponseLogger =
  (handler: ApiRequestHandler): ApiRequestHandler =>
  async (req, res) => {
    const start = performance.now();

    await handler(req, res);

    const duration = performance.now() - start;

    logger.info({
      req: {
        method: req.method,
        host: req.headers.host,
        url: req.url,
        userAgent: req.headers["user-agent"],
        referer: req.headers.referer,
        from: req.headers.from,
      },
      res: {
        status: res.statusCode,
        duration: `${duration} ms`,
      },
    });

    function getRequestHeader(name: string): string {
      const value = req.headers[name];
      if (Array.isArray(value)) {
        return value.join(", ");
      }
      return value ?? "";
    }

    await getDbClient()
      .request.create({
        data: {
          ip: getRequestHeader("x-forwarded-for"),
          ipCountry: getRequestHeader("x-vercel-ip-country"),
          url: req.url ?? "",
          method: req.method ?? "",
          status: res.statusCode ?? -1,
          duration,
          userAgent: req.headers["user-agent"] ?? "",
          host: req.headers.host ?? "",
          referer: req.headers.referer ?? "",
          from: req.headers.from ?? "",
          serverVersion: `${
            env.VERCEL_GIT_COMMIT_REF
          }:${env.VERCEL_GIT_COMMIT_SHA.substring(0, 7)}`,
        },
      })
      .catch((e) => logger.error(e, "Failed to write to request log"));
  };

/**
 * Writes CORS headers for the request before invoking the given handler.
 */
const withCorsHeaders =
  (handler: ApiRequestHandler): ApiRequestHandler =>
  async (req, res) => {
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin ?? "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,HEAD,OPTIONS,PATCH,DELETE,POST,PUT"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
    );

    await handler(req, res);
  };
