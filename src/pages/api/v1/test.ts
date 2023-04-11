import { defineEndpoints } from "@/next_rest_framework/v1/client";
import { z } from "zod";

const todoSchema = z.object({
  id: z.string(),
  name: z.string(),
  completed: z.boolean(),
});

export default defineEndpoints({
  GET: {
    output: [
      {
        status: 200,
        contentType: "application/json",
        schema: z.array(todoSchema),
      },
    ],
    handler: ({ res }) => {
      // Any other content type will lead to TS error.
      res.setHeader("content-type", "application/json");

      // Any other status or JSON format will lead to TS error.
      res.status(200).json([
        {
          id: "foo",
          name: "bar",
          completed: true,
        },
      ]);
    },
  },
  POST: {
    input: {
      contentType: "application/json",
      body: z.object({
        name: z.string(),
      }),
      query: z.object({
        page: z.string(),
      }),
    },
    output: [
      {
        status: 201,
        contentType: "application/json",
        schema: todoSchema,
      },
    ],
    handler: ({
      res,
      req: {
        body: {
          name, // Any other attribute will lead to TS error.
        },
        query: {
          page, // Any other attribute will lead to TS error.
        },
      },
    }) => {
      // Any other content type will lead to TS error.
      res.setHeader("content-type", "application/json");

      // Any other status or JSON format will lead to TS error.
      res.status(201).json({
        id: "foo",
        name,
        completed: false,
      });
    },
  },
});
