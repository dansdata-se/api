import handleRequest from "@/pages/api/v1/test/index.page";
import { createMocks } from "node-mocks-http";

/**
 * @group unit
 */

describe("/api/v1/test", () => {
  test("GET", async () => {
    const {
      req,
      res,
    }: {
      req: Parameters<typeof handleRequest>[0];
      res: Parameters<typeof handleRequest>[1];
    } = createMocks({
      method: "GET",
    });

    await handleRequest(req, res);

    expect(res.statusCode).toBe(200);
  });

  test("POST", async () => {
    const {
      req,
      res,
    }: {
      req: Parameters<typeof handleRequest>[0];
      res: Parameters<typeof handleRequest>[1];
    } = createMocks({
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      query: {
        page: "aPage",
      },
      body: {
        name: "aName",
      },
    });

    await handleRequest(req, res);

    expect(res.statusCode).toBe(201);
  });
});
