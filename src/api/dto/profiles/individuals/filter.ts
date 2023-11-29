import { KeyPagedParametersSchema } from "@/api/dto/pagination";
import { BaseProfileReferenceDtoSchema } from "@/api/dto/profiles/base/reference";
import z from "@/api/zod";
import { IndividualTag } from "@prisma/client";

export type IndividualFilterParameters = z.infer<
  typeof IndividualFilterParametersSchema
>;
export const IndividualFilterParametersSchema = KeyPagedParametersSchema(
  BaseProfileReferenceDtoSchema.shape.id
).merge(
  z.object({
    tags: z
      .union([
        z.nativeEnum(IndividualTag),
        z.array(z.nativeEnum(IndividualTag)),
      ])
      .transform((it) => (Array.isArray(it) ? it : [it]))
      .optional()
      .default([])
      .refine((items) => new Set(items).size === items.length, {
        message: "Must be an array of unique tags",
      })
      .describe(
        "A set of individual tags.\n\nAn individual matches this filter if it matches at least one of the listed tags."
      ),
    orgs: z
      .union([
        BaseProfileReferenceDtoSchema.shape.id,
        z.array(BaseProfileReferenceDtoSchema.shape.id),
      ])
      .transform((it) => (Array.isArray(it) ? it : [it]))
      .optional()
      .default([])
      .refine((items) => new Set(items).size === items.length, {
        message: "Must be an array of unique ids",
      })
      .describe(
        "A set of organization ids.\n\nAn individual matches this filter if it is a member of at least one of the listed organizations."
      ),
  })
);
