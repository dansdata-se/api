import { BaseProfileDtoSchema } from "@/api/dto/profiles/base";
import { OrganizationReferenceDtoSchema } from "@/api/dto/profiles/organizations/profile_reference";
import { registry } from "@/api/registry";
import z from "@/api/zod";
import { IndividualTag, ProfileType } from "@prisma/client";

export type IndividualDto = z.infer<typeof IndividualDtoSchema>;
export const IndividualDtoSchema = registry.register(
  "IndividualDto",
  BaseProfileDtoSchema.merge(
    z
      .object({
        tags: z.array(z.nativeEnum(IndividualTag)).openapi({
          description:
            "A set of tags describing this individual and allowing API users to easier find them using filters.",
        }),
        organizations: z.array(OrganizationReferenceDtoSchema).openapi({
          description:
            "A list of organizations this individual is affiliated with.",
        }),
      })
      .setKey("type", z.literal(ProfileType.individual))
  )
);
