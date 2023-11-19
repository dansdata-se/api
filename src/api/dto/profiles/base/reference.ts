import { BaseProfileDtoSchema } from "@/api/dto/profiles/base/profile";
import { ImagesDtoSchema } from "@/api/dto/storage/image";
import z from "@/api/zod";

export type BaseProfileReferenceDto = z.infer<
  typeof BaseProfileReferenceDtoSchema
>;
export const BaseProfileReferenceDtoSchema = z.object({
  id: BaseProfileDtoSchema.shape.id,
  type: BaseProfileDtoSchema.shape.type,
  name: BaseProfileDtoSchema.shape.name,
  images: ImagesDtoSchema,
});
