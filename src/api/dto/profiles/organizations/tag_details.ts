import { registry } from "@/api/registry";
import z from "@/api/zod";
import { OrganizationTag } from "@prisma/client";

export type OrganizationTagDetailsDTO = z.infer<
  typeof OrganizationTagDetailsDTOSchema
>;
export const OrganizationTagDetailsDTOSchema = registry.register(
  "OrganizationTagDetailsDTO",
  z.object({
    tag: z.nativeEnum(OrganizationTag).openapi({
      example: OrganizationTag.educator,
    }),
    label: z.string().openapi({
      description: "Human readable label (in Swedish) for this tag",
      example: "Utbildare",
    }),
    description: z.string().openapi({
      description:
        "Human readable description (in Swedish) of when the tag is applicable",
      example: "Företag eller förening som erbjuder dansutbildning",
    }),
  })
);
