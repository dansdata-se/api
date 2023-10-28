import { BaseCreateProfileDtoSchema } from "@/api/dto/profiles/create";
import { UploadedImageReferenceDtoSchema } from "@/api/dto/storage/image";
import z from "@/api/zod";

export const BaseUpdateProfileDtoSchema = BaseCreateProfileDtoSchema.merge(
  z.object({
    images: z
      .object({
        cover: UploadedImageReferenceDtoSchema.nullable().openapi({
          description:
            (UploadedImageReferenceDtoSchema._def.openapi?.metadata
              ?.description ?? "") +
            "\n\nPass `null` to unlink the existing image.",
        }),
        poster: UploadedImageReferenceDtoSchema.nullable().openapi({
          description:
            (UploadedImageReferenceDtoSchema._def.openapi?.metadata
              ?.description ?? "") +
            "\n\nPass `null` to unlink the existing image.",
        }),
        square: UploadedImageReferenceDtoSchema.nullable().openapi({
          description:
            (UploadedImageReferenceDtoSchema._def.openapi?.metadata
              ?.description ?? "") +
            "\n\nPass `null` to unlink the existing image.",
        }),
      })
      .optional()
      .default({}),
  })
);
