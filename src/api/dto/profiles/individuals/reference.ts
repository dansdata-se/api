import { BaseProfileReferenceDtoSchema } from "@/api/dto/profiles/base/reference";
import { registry } from "@/api/registry";
import z from "@/api/zod";
import { IndividualTag, ProfileType } from "@prisma/client";

export type IndividualReferenceDto = z.infer<
  typeof IndividualReferenceDtoSchema
>;
export const IndividualReferenceDtoSchema = registry.register(
  "IndividualReferenceDto",
  BaseProfileReferenceDtoSchema.merge(
    z.object({
      tags: z
        .array(z.nativeEnum(IndividualTag))
        .describe(
          "A set of tags describing this individual and allowing API users to easier find them using filters."
        ),
    })
  ).setKey("type", z.literal(ProfileType.individual))
);
