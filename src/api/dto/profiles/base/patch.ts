import { BaseCreateProfileDtoSchema } from "@/api/dto/profiles/base/create";
import z from "@/api/zod";

export type BasePatchProfileDto = z.infer<typeof BasePatchProfileDtoSchema>;
export const BasePatchProfileDtoSchema = z.object({
  name: BaseCreateProfileDtoSchema.shape.name.optional(),
  description: BaseCreateProfileDtoSchema.shape.description.optional(),
  links: BaseCreateProfileDtoSchema.shape.links.optional(),
  images: z
    .object({
      coverId: BaseCreateProfileDtoSchema.shape.images.shape.coverId.optional()
        .describe(`Id of the image to use as the cover image.

Special values:
* \`null\`: unlinks any existing image.
* field omitted: no change to the currently linked image.
`),
      posterId:
        BaseCreateProfileDtoSchema.shape.images.shape.posterId.optional()
          .describe(`Id of the image to use as the cover image.
  
  Special values:
  * \`null\`: unlinks any existing image.
  * field omitted: no change to the currently linked image.
  `),
      squareId:
        BaseCreateProfileDtoSchema.shape.images.shape.squareId.optional()
          .describe(`Id of the image to use as the cover image.
  
  Special values:
  * \`null\`: unlinks any existing image.
  * field omitted: no change to the currently linked image.
  `),
    })
    .optional(),
});
