import { ErrorCode, ErrorDto } from "@/api/dto/error";
import { commaSeparatedToArray, withParsedObject } from "@/api/util";
import z from "@/api/zod";
import { NextApiResponse } from "next";
import { MockResponse, createResponse } from "node-mocks-http";

/**
 * @group unit
 */

describe("API utilities", () => {
  test.each([
    {
      schema: z.string(),
      obj: "hello world",
      expected: "hello world",
    },
    {
      schema: z.string(),
      obj: 123,
      errorCode: ErrorCode.invalidParameters,
    },
    {
      schema: z.object({
        name: z.string(),
      }),
      obj: {
        name: "Alice",
      },
      expected: {
        name: "Alice",
      },
    },
    {
      schema: z.object({
        name: z.string(),
      }),
      obj: {
        name: {
          name: "Alice",
        },
      },
      errorCode: ErrorCode.invalidBody,
    },
  ])(
    "withParsedObject",
    async ({
      schema,
      obj,
      errorCode,
      expected,
    }: {
      schema: z.ZodSchema;
      obj: unknown;
      errorCode?: ErrorCode;
      expected?: unknown;
    }) => {
      const res: MockResponse<NextApiResponse> = createResponse();

      await withParsedObject(
        schema,
        obj,
        res,
        errorCode ?? ErrorCode.invalidBody,
        (parsed) => {
          if (errorCode === undefined) {
            expect(parsed).toEqual(expected);
            res.status(200).end();
          } else {
            fail("Callback should not run if an error is expected");
          }
          return Promise.resolve();
        }
      );

      if (errorCode === undefined) {
        expect(res.statusCode).toBe(200);
      } else {
        expect(res.statusCode).toBe(400);
        expect(res._getJSONData() as ErrorDto).toMatchObject({
          code: errorCode,
        } as Partial<ErrorDto>);
      }
    }
  );

  test("convert comma separated to array", () => {
    expect(commaSeparatedToArray("")).toEqual([]);
    expect(commaSeparatedToArray("  ")).toEqual([]);
    expect(commaSeparatedToArray(",,,")).toEqual([]);
    expect(commaSeparatedToArray("hello")).toEqual(["hello"]);
    expect(commaSeparatedToArray(",,hello,")).toEqual(["hello"]);
    expect(commaSeparatedToArray("  hello  ")).toEqual(["hello"]);
    expect(commaSeparatedToArray("  hello  ,world,  out,  there")).toEqual([
      "hello",
      "world",
      "out",
      "there",
    ]);
  });
});
