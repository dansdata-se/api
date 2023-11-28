import { ImagesDtoSchema } from "@/api/dto/storage/image";
import z from "@/api/zod";
import { ProfileType } from "@prisma/client";

export type BaseProfileDto = z.infer<typeof BaseProfileDtoSchema>;
export const BaseProfileDtoSchema = z.object({
  id: z.string().cuid().describe("Id of this profile"),
  type: z.nativeEnum(ProfileType).describe("Type of profile"),
  name: z.string(),
  description: z.string(),
  links: z
    .array(z.object({ url: z.string().url() }))
    .describe(
      "URL(s) associated with this profile, such as Facebook or Spotify page, webshop, website, etc.."
    ),
  images: ImagesDtoSchema,
});
