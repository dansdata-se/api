import { registry } from "@/api/registry";
import z from "@/api/zod";
import { IndividualTag } from "@prisma/client";

export type IndividualTagDetailsDTO = z.infer<
  typeof IndividualTagDetailsDTOSchema
>;
export const IndividualTagDetailsDTOSchema = registry.register(
  "IndividualTagDetailsDTO",
  z.object({
    tag: z.nativeEnum(IndividualTag).openapi({
      example: IndividualTag.musician,
    }),
    label: z.string().openapi({
      description: "Human readable label (in Swedish) for this tag",
      example: "Musiker",
    }),
    description: z.string().openapi({
      description:
        "Human readable description (in Swedish) of when the tag is applicable",
      example: "Någon som utövar musik, med eller utan instrument",
    }),
  })
);
