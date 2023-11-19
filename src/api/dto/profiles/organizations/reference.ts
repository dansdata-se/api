import { BaseProfileReferenceDtoSchema } from "@/api/dto/profiles/base/reference";
import { registry } from "@/api/registry";
import z from "@/api/zod";
import { OrganizationTag, ProfileType } from "@prisma/client";

export type OrganizationReferenceDto = z.infer<
  typeof OrganizationReferenceDtoSchema
>;
export const OrganizationReferenceDtoSchema = registry.register(
  "OrganizationReferenceDto",
  BaseProfileReferenceDtoSchema.merge(
    z
      .object({
        tags: z.array(z.nativeEnum(OrganizationTag)).openapi({
          description:
            "A set of tags describing this organization and allowing API users to easier find it using filters.",
        }),
      })
      .setKey("type", z.literal(ProfileType.organization))
  )
);
