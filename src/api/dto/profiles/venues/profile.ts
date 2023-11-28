import { CoordsDtoSchema } from "@/api/dto/coords";
import { BaseProfileDtoSchema } from "@/api/dto/profiles/base/profile";
import { VenueReferenceDtoSchema } from "@/api/dto/profiles/venues/reference";
import { registry } from "@/api/registry";
import z from "@/api/zod";
import { ProfileType } from "@prisma/client";

export type VenueDto = z.infer<typeof VenueDtoSchema>;
export const VenueDtoSchema = registry.register(
  "VenueDto",
  BaseProfileDtoSchema.merge(
    z.object({
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
      ancestors: z.array(VenueReferenceDtoSchema).min(0)
        .describe(`A list of venues to which this venue belongs.
        
The list is sorted, starting with the root ancestor at index 0
and ending with the venue's closest parent. The same venue will never
appear twice in a given venue hierarchy.

Example: "The Library" and "Floor 3" could both be considered "ancestors"
of "Room 301".

Note that the number of ancestors for a given venue is unrestricted,
though likely to be fairly low (n < 5).
`),
      children: z.array(VenueReferenceDtoSchema).min(0)
        .describe(`An unsorted list of venues that belong to this venue.

Example: "The Library" would likely contain children such as "Floor 1",
"Floor 2" and "Floor 3"

Note: this list contains only direct children. Children's children are
not included.

The same venue will never appear twice in a given venue hierarchy.
`),
    })
  ).setKey("type", z.literal(ProfileType.venue))
);
