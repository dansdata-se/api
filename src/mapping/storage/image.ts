import { ImagesModel } from "@/model/profiles/images";
import { ImageModel } from "@/model/storage/image";
import { ImageEntity, ImageVariant } from "@prisma/client";

export function mapImageEntityToImageModel(entity: ImageEntity): ImageModel {
  return {
    id: entity.id,
    cloudflareId: entity.cloudflareId,
    variant: entity.variant,
  };
}

export function mapImageEntitiesToImagesModel(
  images: ImageEntity[]
): ImagesModel {
  return Object.fromEntries(
    Object.values(ImageVariant).map((variant) => {
      const image = images.find((it) => it.variant === variant);
      if (image === undefined) return [variant, null] as const;
      return [variant, mapImageEntityToImageModel(image)];
    })
  ) as unknown as ImagesModel;
}
