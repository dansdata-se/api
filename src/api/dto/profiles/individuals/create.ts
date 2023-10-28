import { BaseCreateProfileDtoSchema } from "@/api/dto/profiles/create";
import { registry } from "@/api/registry";
import z from "@/api/zod";
import { IndividualTag } from "@prisma/client";

export type CreateIndividualDto = z.infer<typeof CreateIndividualDtoSchema>;
export const CreateIndividualDtoSchema = registry.register(
  "CreateIndividualDto",
  BaseCreateProfileDtoSchema.merge(
    z.object({
      tags: z
        .array(z.nativeEnum(IndividualTag))
        .refine((items) => new Set(items).size === items.length, {
          message: "Must be an array of unique tags",
        })
        .openapi({
          description:
            "A set of tags describing this individual and allowing API users to easier find them using filters.",
        }),
      organizations: z
        .array(
          z.object({
            organizationId: z.string().cuid(),
            title: z
              .string()
              .trim()
              .min(1)
              .max(100)
              .openapi({
                description: "The individual's role within the organization.",
                examples: [
                  "Sångare",
                  "Keyboard och sång",
                  "Ordförande, instruktör och webbansvarig",
                ],
              }),
          })
        )
        .refine(
          (items) =>
            new Set(items.map((o) => o.organizationId)).size ===
            items.map((o) => o.organizationId).length,
          {
            message: "Each organization may only occur once in this list.",
          }
        )
        .optional()
        .default([])
        .openapi({
          description:
            "A list of organizations this individual is affiliated with.",
        }),
    })
  )
);
