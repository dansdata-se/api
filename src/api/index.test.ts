/**
 * @group unit
 */

import { Endpoint, defineEndpoints } from "@/api";
import { AuthenticationMethod } from "@/api/auth";
import { StatusCodes } from "@/api/status_codes";
import { exportedForTesting as dbTesting } from "@/db";
import { RouteConfig } from "@asteasolutions/zod-to-openapi";
import { mockDeep } from "jest-mock-extended";
import { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";

const authorizationHeaderValue = "Bearer aBearerToken";

const testAuthenticationMethod: AuthenticationMethod = {
  securityScheme: "undocumented",
  isAuthenticated(req: NextApiRequest) {
    return req.headers.authorization === authorizationHeaderValue;
  },
};

function makeDummyEndpoint({
  authentication,
  method,
}: {
  authentication: AuthenticationMethod | null;
  method: RouteConfig["method"];
}): Endpoint {
  return {
    authentication,
    docs: {
      method,
      path: "/api/v1/some/path",
      responses: {
        [StatusCodes.success.ok]: {
          description: "OK",
        },
      },
    },
    async handler() {
      // dummy - do nothing
    },
  };
}

describe("API core", () => {
  beforeAll(() => {
    const prisma =
      mockDeep<Parameters<typeof dbTesting.overridePrismaClient>[0]>();
    prisma.request.create.mockResolvedValue(
      // @ts-expect-error this return value is never used
      Promise.resolve()
    );
    prisma.error.create.mockResolvedValue(
      // @ts-expect-error this return value is never used
      Promise.resolve()
    );
    dbTesting.overridePrismaClient(prisma);
  });

  test("returns status 404 if no endpoints have been defined", async () => {
    //#region arrange
    const handler = defineEndpoints({});
    const {
      req,
      res,
    }: {
      req: Parameters<typeof handler>[0];
      res: Parameters<typeof handler>[1];
    } = createMocks({
      method: "OPTIONS",
    });
    //#endregion

    //#region act
    await handler(req, res);
    //#endregion

    //#region assert
    expect(res.statusCode).toBe(404);
    //#endregion
  });

  test.each([
    {
      expected: "OPTIONS, GET",
      endpoints: {
        GET: makeDummyEndpoint({
          // OPTIONS should work even if authentication is required
          authentication: testAuthenticationMethod,
          method: "get",
        }),
      },
    },
    {
      expected: "OPTIONS, HEAD, GET, POST, PUT, DELETE, PATCH",
      endpoints: {
        // OPTIONS should work even if authentication is required
        HEAD: makeDummyEndpoint({
          // OPTIONS should work even if authentication is required
          authentication: testAuthenticationMethod,
          method: "head",
        }),
        GET: makeDummyEndpoint({
          // OPTIONS should work even if authentication is required
          authentication: testAuthenticationMethod,
          method: "get",
        }),
        POST: makeDummyEndpoint({
          // OPTIONS should work even if authentication is required
          authentication: testAuthenticationMethod,
          method: "post",
        }),
        PUT: makeDummyEndpoint({
          // OPTIONS should work even if authentication is required
          authentication: testAuthenticationMethod,
          method: "put",
        }),
        DELETE: makeDummyEndpoint({
          // OPTIONS should work even if authentication is required
          authentication: testAuthenticationMethod,
          method: "delete",
        }),
        PATCH: makeDummyEndpoint({
          // OPTIONS should work even if authentication is required
          authentication: testAuthenticationMethod,
          method: "patch",
        }),
      },
    },
  ] as {
    endpoints: Parameters<typeof defineEndpoints>[0];
    expected: string;
  }[])("responds to OPTIONS request %#", async ({ endpoints, expected }) => {
    //#region arrange
    const handler = defineEndpoints(endpoints);
    const {
      req,
      res,
    }: {
      req: Parameters<typeof handler>[0];
      res: Parameters<typeof handler>[1];
    } = createMocks({
      method: "OPTIONS",
    });
    //#endregion

    //#region act
    await handler(req, res);
    //#endregion

    //#region assert
    expect(res.statusCode).toBe(204);
    expect(res.hasHeader("allow")).toBe(true);
    expect(res.getHeader("allow")).toEqual(expected);
    //#endregion
  });

  test("returns status 405 if no endpoint have been defined for the given method", async () => {
    //#region arrange
    const handler = defineEndpoints({
      GET: makeDummyEndpoint({
        authentication: testAuthenticationMethod,
        method: "get",
      }),
    });
    const {
      req,
      res,
    }: {
      req: Parameters<typeof handler>[0];
      res: Parameters<typeof handler>[1];
    } = createMocks({
      method: "POST",
    });
    //#endregion

    //#region act
    await handler(req, res);
    //#endregion

    //#region assert
    expect(res.statusCode).toBe(405);
    //#endregion
  });

  test("returns status 401 when accessing a protected resource without authentication", async () => {
    //#region arrange
    const handler = defineEndpoints({
      GET: makeDummyEndpoint({
        authentication: testAuthenticationMethod,
        method: "get",
      }),
    });
    const {
      req,
      res,
    }: {
      req: Parameters<typeof handler>[0];
      res: Parameters<typeof handler>[1];
    } = createMocks({
      method: "GET",
    });
    //#endregion

    //#region act
    await handler(req, res);
    //#endregion

    //#region assert
    expect(res.statusCode).toBe(401);
    //#endregion
  });

  test("returns status 401 when accessing a protected resource with invalid authentication", async () => {
    //#region arrange
    const handler = defineEndpoints({
      GET: makeDummyEndpoint({
        authentication: testAuthenticationMethod,
        method: "get",
      }),
    });
    const {
      req,
      res,
    }: {
      req: Parameters<typeof handler>[0];
      res: Parameters<typeof handler>[1];
    } = createMocks({
      method: "GET",
      authorization: "Bearer anInvalidToken",
    });
    //#endregion

    //#region act
    await handler(req, res);
    //#endregion

    //#region assert
    expect(res.statusCode).toBe(401);
    //#endregion
  });

  test("executes handler when accessing a protected resource with valid credentials", async () => {
    //#region arrange
    const mockHandler = jest.fn((_, res: NextApiResponse) => {
      res.status(StatusCodes.success.ok).end();
      return Promise.resolve();
    });
    const handler = defineEndpoints({
      GET: {
        authentication: testAuthenticationMethod,
        docs: {
          method: "get",
          path: "/api/v1/some/path",
          responses: {
            [StatusCodes.success.ok]: {
              description: "OK",
            },
          },
        },
        handler: mockHandler,
      },
    });
    const {
      req,
      res,
    }: {
      req: Parameters<typeof handler>[0];
      res: Parameters<typeof handler>[1];
    } = createMocks({
      method: "GET",
      headers: {
        authorization: authorizationHeaderValue,
      },
    });
    //#endregion

    //#region act
    await handler(req, res);
    //#endregion

    //#region assert
    expect(res.statusCode).toBe(200);
    expect(mockHandler.mock.calls).toHaveLength(1);
    //#endregion
  });
});
