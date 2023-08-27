import { BaseCreateProfileDtoSchema } from "@/api/dto/profiles/create_profile";
import { registry } from "@/api/registry";
import z from "@/api/zod";
import { OrganizationTag } from "@prisma/client";

export type CreateOrganizationDto = z.infer<typeof CreateOrganizationDtoSchema>;
export const CreateOrganizationDtoSchema = registry.register(
  "CreateOrganizationDto",
  BaseCreateProfileDtoSchema.merge(
    z.object({
      tags: z
        .array(z.nativeEnum(OrganizationTag))
        .refine((items) => new Set(items).size === items.length, {
          message: "Must be an array of unique tags",
        })
        .openapi({
          description:
            "A set of tags describing this organization and allowing API users to easier find it using filters.",
        }),
      members: z
        .array(
          z.object({
            individualId: z.string().cuid(),
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
            new Set(items.map((m) => m.individualId)).size ===
            items.map((m) => m.individualId).length,
          {
            message: "Each individual may only occur once in this list.",
          }
        )
        .optional()
        .default([])
        .openapi({
          description:
            "A list of individuals that are members of this organization.",
        }),
    })
  )
);
