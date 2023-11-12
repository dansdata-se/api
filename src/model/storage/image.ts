import { CreateImageUploadUrlDto } from "@/api/dto/storage/image";
import { ImageEntity } from "@prisma/client";

export type ImageUploadUrlModel = CreateImageUploadUrlDto;
export type ImageModel = ImageEntity;

export enum ImageVariant {
  cover = "cover",
  poster = "poster",
  square = "square",
}
