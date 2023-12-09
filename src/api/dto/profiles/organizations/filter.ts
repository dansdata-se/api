import { KeyPagedParametersSchema } from "@/api/dto/pagination";
import { BaseProfileReferenceDtoSchema } from "@/api/dto/profiles/base/reference";
import z from "@/api/zod";
import { OrganizationTag } from "@prisma/client";

export type OrganizationFilterParameters = z.infer<
  typeof OrganizationFilterParametersSchema
>;
export const OrganizationFilterParametersSchema = KeyPagedParametersSchema(
  BaseProfileReferenceDtoSchema.shape.id
).merge(
  z.object({
    qName: z
      .string()
      .min(3)
      .max(50)
      .optional()
      .describe(
        "Name query.\n\n Limits the search to organizations with names similar to the given query."
      ),
    tags: z
      .union([
        z.nativeEnum(OrganizationTag),
        z.array(z.nativeEnum(OrganizationTag)),
      ])
      .transform((it) => (Array.isArray(it) ? it : [it]))
      .optional()
      .default([])
      .refine((items) => new Set(items).size === items.length, {
        message: "Must be an array of unique tags",
      })
      .describe(
        "A set of organization tags.\n\nAn organization matches this filter only if it matches *all* of the listed tags."
      ),
    members: z
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
        "A set of individual ids.\n\nAn organization matches this filter only if *all* of the listed individuals are members of it."
      ),
  })
);
