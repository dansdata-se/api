import { BaseProfileDtoSchema } from "@/api/dto/profiles/base/profile";
import { IndividualReferenceDtoSchema } from "@/api/dto/profiles/individuals/reference";
import { registry } from "@/api/registry";
import z from "@/api/zod";
import { OrganizationTag, ProfileType } from "@prisma/client";

export type OrganizationDto = z.infer<typeof OrganizationDtoSchema>;
export const OrganizationDtoSchema = registry.register(
  "OrganizationDto",
  BaseProfileDtoSchema.merge(
    z.object({
      tags: z
        .array(z.nativeEnum(OrganizationTag))
        .describe(
          "A set of tags describing this organization and allowing API users to easier find it using filters."
        ),
      members: z
        .array(
          IndividualReferenceDtoSchema.merge(
            z.object({
              title: z
                .string()
                .describe("The individual's role within the organization.")
                .openapi({
                  examples: [
                    "Sångare",
                    "Keyboard och sång",
                    "Ordförande, instruktör och webbansvarig",
                  ],
                }),
            })
          )
        )
        .describe(
          "A list of individuals that are members of this organization."
        ),
    })
  ).setKey("type", z.literal(ProfileType.organization))
);
