import { CoordsDtoSchema } from "@/api/dto/coords";
import { BaseCreateProfileDtoSchema } from "@/api/dto/profiles/base/create";
import { BaseProfileDtoSchema } from "@/api/dto/profiles/base/profile";
import { registry } from "@/api/registry";
import z from "@/api/zod";
import { ProfileType } from "@prisma/client";

export type CreateVenueDto = z.infer<typeof CreateVenueDtoSchema>;
export const CreateVenueDtoSchema = registry.register(
  "CreateVenueDto",
  BaseCreateProfileDtoSchema.merge(
    z.object({
      coords: CoordsDtoSchema,
      permanentlyClosed: z
        .boolean()
        .openapi({
          description: `Whether the venue is permanently closed.

A venue may be permanently closed for any number of reasons,
including - but not limited to - being demolished or converted for
other uses. When this field is set to \`true\`, the venue is
typically not expected to open again, nor to be used for future events.

For temporary closures, such as renovation work, this field is
expected to be \`false\`.
`,
        })
        .optional()
        .default(false),
      parentId: BaseProfileDtoSchema.shape.id
        .optional()
        .nullable()
        .default(null)
        .openapi({
          description: `Id of this venue's parent venue.

The parent venue refers to the closest logical ancestor of this venue. For example,
the parent of "Room 301" might be "Floor 3", which in turn might have "The Library" as
its parent.

Note that the number of levels in this hierarchy is not restricted. Also, 
the same venue must never appear twice in a given venue hierarchy (i.e., a venue
cannot be an ancestor or descendent of itself).
`,
        }),
    })
  ).setKey("type", z.literal(ProfileType.venue))
);
