import { KeyPagedParametersSchema } from "@/api/dto/pagination";
import { BaseProfileReferenceDtoSchema } from "@/api/dto/profiles/base/reference";
import z from "@/api/zod";

export type VenueFilterParameters = z.infer<typeof VenueFilterParametersSchema>;
export const VenueFilterParametersSchema = KeyPagedParametersSchema(
  BaseProfileReferenceDtoSchema.shape.id
).merge(
  z.object({
    lat: z
      .number()
      .min(-90)
      .max(90)
      .optional()
      // NOTE(FelixZY): I'm having trouble expressing "if a is given, then b is required"
      // in a way that is compatible with both zod and @asteasolutions/zod-to-openapi.
      // This requirement must therefore be implemented as part of the endpoint handler.
      .describe("Latitude.\n\nRequired if `lng` is given."),
    lng: z
      .number()
      .min(-180)
      .max(180)
      .optional()
      // NOTE(FelixZY): I'm having trouble expressing "if a is given, then b is required"
      // in a way that is compatible with both zod and @asteasolutions/zod-to-openapi.
      // This requirement must therefore be implemented as part of the endpoint handler.
      .describe("Longitude\n\nRequired if `lat` is given."),
    qName: z
      .string()
      .min(3)
      .max(50)
      .optional()
      .describe(
        "Name query.\n\n Limits the search to venues with names similar to the given query."
      ),
    level: z.enum(["root", "leaf", "any"]).optional().default("any")
      .describe(`The types of venues to return.

To represent complex venues, such as an arena with multiple dance floors,
each venue is part of a tree structure. For example, a hotel with multiple
floors and rooms might have the following structure:

\`\`\`
hotel
├── floor 1
│   ├── room 100
│   ├── room 101
│   └── room 102
└── floor 2
    ├── room 200
    ├── room 201
    └── room 202
\`\`\`

In this case, the hotel would be considered the "root" venue and each of the
rooms "leaves".

Note that venues whose trees consist only of themselves are considered _both_
root and leaf nodes.
`),
    closed: z
      .enum(["1", "0"])
      .transform((v) => v === "1")
      .pipe(z.boolean())
      .optional()
      .default("0")
      .describe(`Whether to include permanently closed venues in the response.

A venue may be permanently closed for any number of reasons,
including - but not limited to - being demolished or converted for
other uses. A venue that is marked as permanently closed is typically
not expected to open again, nor to be used for future events.
`),
  })
);
