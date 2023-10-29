import { defineEndpoints } from "@/api";
import { placeholderAuth } from "@/api/auth";
import { ErrorCode } from "@/api/dto/error";
import { CreateIndividualDtoSchema } from "@/api/dto/profiles/individuals/create";
import { StatusCodes } from "@/api/status_codes";
import { withParsedObject } from "@/api/util";
import z from "@/api/zod";
import { NextApiResponse } from "next";

export default defineEndpoints({
  POST: {
    authenticated: true,
    docs: {
      method: "post",
      path: "/api/v1/profiles/individuals/",
      tags: ["Profiles", "Individuals"],
      security: [{ [placeholderAuth.name]: [] }],
      summary: "Create a profile for an individual",
      request: {
        body: {
          required: true,
          content: {
            "application/json": {
              schema: CreateIndividualDtoSchema,
            },
          },
        },
      },
      responses: {
        [StatusCodes.success.created]: {
          description: "Created",
          content: {
            "application/json": {
              schema: z.string().cuid(),
            },
          },
        },
      },
    },
    async handler(req, res) {
      await withParsedObject(
        CreateIndividualDtoSchema,
        req.body,
        res,
        ErrorCode.invalidBody,
        // TODO(FelixZY): Implement
        () => {
          (res as NextApiResponse<void>)
            .status(StatusCodes.serverError.notImplemented)
            .end();
          return Promise.resolve();
        }
      );
    },
  },
});
