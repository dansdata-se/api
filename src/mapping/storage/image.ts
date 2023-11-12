import { ImagesModel } from "@/model/profiles/images";
import { ImageModel, ImageVariant } from "@/model/storage/image";
import { ImageEntity } from "@prisma/client";

export function mapImageEntityToImageModel(entity: ImageEntity): ImageModel {
  return {
    id: entity.id,
    cloudflareId: entity.cloudflareId,
  };
}

export function mapImageEntitiesToImagesModel(
  images: Record<ImageVariant, ImageEntity | null>
): ImagesModel {
  return Object.fromEntries(
    Object.values(ImageVariant).map((variant) => {
      const image = images[variant];
      if (image === null) return [variant, null] as const;
      return [variant, mapImageEntityToImageModel(image)];
    })
  ) as unknown as ImagesModel;
}
