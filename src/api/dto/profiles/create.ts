import { UploadedImageReferenceDtoSchema } from "@/api/dto/storage/image";
import z from "@/api/zod";

export const BaseCreateProfileDtoSchema = z.object({
  name: z.string().max(100).trim().min(1),
  description: z.string().max(2000).trim().optional().default(""),
  links: z
    .array(z.object({ url: z.string().url() }))
    .refine((items) => new Set(items).size === items.length, {
      message: "Must be an array of unique URLs",
    })
    .optional()
    .default([])
    .openapi({
      description:
        "URL(s) associated with this profile, such as Facebook or Spotify page, webshop, website, etc..",
    }),
  images: z
    .object({
      cover: UploadedImageReferenceDtoSchema,
      poster: UploadedImageReferenceDtoSchema,
      square: UploadedImageReferenceDtoSchema,
    })
    .optional()
    .default({}),
});
