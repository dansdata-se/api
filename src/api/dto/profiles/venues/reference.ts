import { CoordsDtoSchema } from "@/api/dto/coords";
import { BaseProfileReferenceDtoSchema } from "@/api/dto/profiles/base/reference";
import { registry } from "@/api/registry";
import z from "@/api/zod";
import { ProfileType } from "@prisma/client";

export type VenueReferenceDto = z.infer<typeof VenueReferenceDtoSchema>;
export const VenueReferenceDtoSchema = registry.register(
  "VenueReferenceDto",
  BaseProfileReferenceDtoSchema.merge(
    z
      .object({
        coords: CoordsDtoSchema,
        permanentlyClosed: z.boolean()
          .describe(`Whether the venue is permanently closed.

A venue may be permanently closed for any number of reasons,
including - but not limited to - being demolished or converted for
other uses. When this field is set to \`true\`, the venue is
typically not expected to open again, nor to be used for future events.

For temporary closures, such as renovation work, this field is
expected to be \`false\`.
`),
      })
      .setKey("type", z.literal(ProfileType.venue))
  )
);
