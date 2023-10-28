/**
 * @group unit
 */

import { Endpoint, defineEndpoints } from "@/api";
import { exportedForTesting as dbTesting } from "@/db";
import { RouteConfig } from "@asteasolutions/zod-to-openapi";
import { mockDeep } from "jest-mock-extended";
import { NextApiRequest, NextApiResponse } from "next";
import { createMocks } from "node-mocks-http";

const authorizationHeaderValue = "Bearer aBearerToken";
const xUserRoleHeaderValue = "aRoleWithAccess";
jest.mock("@/api/auth", () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const original = jest.requireActual("@/api/auth");

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    __esModule: true,
    ...original,
    isAuthenticated(req: NextApiRequest) {
      return req.headers.authorization === authorizationHeaderValue;
    },
    isAuthorized(req: NextApiRequest) {
      return req.headers["x-user-role"] === xUserRoleHeaderValue;
    },
  };
});

function makeDummyEndpoint({
  authenticated,
  method,
}: {
  authenticated: boolean;
  method: RouteConfig["method"];
}): Endpoint {
  return {
    authenticated,
    docs: {
      method,
      path: "/api/v1/some/path",
      responses: {
        "200": {
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
          authenticated: true,
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
          authenticated: true,
          method: "head",
        }),
        GET: makeDummyEndpoint({
          // OPTIONS should work even if authentication is required
          authenticated: true,
          method: "get",
        }),
        POST: makeDummyEndpoint({
          // OPTIONS should work even if authentication is required
          authenticated: true,
          method: "post",
        }),
        PUT: makeDummyEndpoint({
          // OPTIONS should work even if authentication is required
          authenticated: true,
          method: "put",
        }),
        DELETE: makeDummyEndpoint({
          // OPTIONS should work even if authentication is required
          authenticated: true,
          method: "delete",
        }),
        PATCH: makeDummyEndpoint({
          // OPTIONS should work even if authentication is required
          authenticated: true,
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
        authenticated: true,
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
        authenticated: true,
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
        authenticated: true,
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

  test("returns status 403 when accessing a protected resource without authorization", async () => {
    //#region arrange
    const handler = defineEndpoints({
      GET: makeDummyEndpoint({
        authenticated: true,
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
      headers: {
        authorization: authorizationHeaderValue,
      },
    });
    //#endregion

    //#region act
    await handler(req, res);
    //#endregion

    //#region assert
    expect(res.statusCode).toBe(403);
    //#endregion
  });

  test("returns status 403 when accessing a protected resource with invalid authorization", async () => {
    //#region arrange
    const handler = defineEndpoints({
      GET: makeDummyEndpoint({
        authenticated: true,
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
      headers: {
        authorization: authorizationHeaderValue,
        "x-user-role": "aRoleWithoutAccess",
      },
    });
    //#endregion

    //#region act
    await handler(req, res);
    //#endregion

    //#region assert
    expect(res.statusCode).toBe(403);
    //#endregion
  });

  test("executes handler when accessing a protected resource with valid credentials", async () => {
    //#region arrange
    const mockHandler = jest.fn((_, res: NextApiResponse) => {
      res.status(200).end();
      return Promise.resolve();
    });
    const handler = defineEndpoints({
      GET: {
        authenticated: true,
        docs: {
          method: "get",
          path: "/api/v1/some/path",
          responses: {
            "200": {
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
        "x-user-role": xUserRoleHeaderValue,
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
