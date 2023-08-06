import { ApiRequestHandler, Endpoint, Endpoints } from "@/api";
import { authMiddleware } from "@/api/middleware/auth";
import { errorCatchingMiddleware } from "@/api/middleware/errors";

export type ApiMiddleware = (
  handler: ApiRequestHandler,
  endpoint: Endpoint,
  endpoints: Partial<Endpoints>
) => ApiRequestHandler;

// Sorted in the order the middleware is to be applied.
const apiMiddlewares: ApiMiddleware[] = [
  errorCatchingMiddleware,
  authMiddleware,
];

/**
 * Wraps the given endpoint with the middlewares defined in {@link apiMiddlewares}
 */
export const wrapEndpointWithMiddleware = (
  endpoint: Endpoint,
  endpoints: Partial<Endpoints>
) =>
  apiMiddlewares.reduceRight(
    (inner, outer) => outer(inner, endpoint, endpoints),
    endpoint.handler
  );
