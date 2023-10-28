import { defineEndpoints } from "@/api";
import { placeholderAuth } from "@/api/auth";
import { ErrorCode } from "@/api/dto/error";
import { CreateOrganizationDtoSchema } from "@/api/dto/profiles/organizations/create";
import { withParsedObject } from "@/api/util";
import z from "@/api/zod";
import { NextApiResponse } from "next";

export default defineEndpoints({
  POST: {
    authenticated: true,
    docs: {
      method: "post",
      path: "/api/v1/profiles/organizations/",
      tags: ["Profiles", "Organizations"],
      security: [{ [placeholderAuth.name]: [] }],
      summary: "Create a profile for an organization",
      request: {
        body: {
          required: true,
          content: {
            "application/json": {
              schema: CreateOrganizationDtoSchema,
            },
          },
        },
      },
      responses: {
        "201": {
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
        CreateOrganizationDtoSchema,
        req.body,
        res,
        ErrorCode.invalidBody,
        // TODO(FelixZY): Implement
        () => {
          (res as NextApiResponse<void>).status(501).end();
          return Promise.resolve();
        }
      );
    },
  },
});
