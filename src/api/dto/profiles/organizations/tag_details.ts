import { registry } from "@/api/registry";
import z from "@/api/zod";
import { OrganizationTag } from "@prisma/client";

export type OrganizationTagDetailsDto = z.infer<
  typeof OrganizationTagDetailsDtoSchema
>;
export const OrganizationTagDetailsDtoSchema = registry.register(
  "OrganizationTagDetailsDto",
  z.object({
    tag: z.nativeEnum(OrganizationTag).openapi({
      example: OrganizationTag.educator,
    }),
    label: z
      .string()
      .describe("Human readable label (in Swedish) for this tag")
      .openapi({
        example: "Utbildare",
      }),
    description: z
      .string()
      .describe(
        "Human readable description (in Swedish) of when the tag is applicable"
      )
      .openapi({
        example: "Företag eller förening som erbjuder dansutbildning",
      }),
  })
);
