import { cloudflareApi } from "@/cloudflare/api";
import { prisma } from "@/db";
import { ImagesModel } from "@/model/profiles/images";
import { ImageModel, ImageUploadUrlModel } from "@/model/storage/image";
import { ImageEntity, ImageVariant } from "@prisma/client";

export class ImageNotUploadedToCloudflareError extends Error {}
export class ImageInUseError extends Error {}

function imageEntityToImageModel(entity: ImageEntity): ImageModel {
  return {
    id: entity.id,
    cloudflareId: entity.cloudflareId,
    variant: entity.variant,
  };
}

export function imageEntitiesToImagesModel(images: ImageEntity[]): ImagesModel {
  return Object.fromEntries(
    Object.values(ImageVariant).map((variant) => {
      const image = images.find((it) => it.variant === variant);
      if (image === undefined) return [variant, null] as const;
      return [variant, imageEntityToImageModel(image)];
    })
  ) as unknown as ImagesModel;
}

export const ImageDAO = {
  /**
   * Retrieve an image by its id
   */
  async getById(id: ImageModel["id"]): Promise<ImageModel | null> {
    const entity = await prisma.imageEntity.findUnique({
      where: {
        id,
      },
    });
    if (entity === null) return null;
    return imageEntityToImageModel(entity);
  },
  /**
   * Retrieve an image by its cloudflare id
   */
  async getByCloudflareId(cloudflareId: ImageModel["cloudflareId"]) {
    const entity = await prisma.imageEntity.findUnique({
      where: {
        cloudflareId,
      },
    });
    if (entity === null) return null;
    return imageEntityToImageModel(entity);
  },
  /**
   * Creates a url to which an image can be uploaded.
   *
   * @param userId id of the user uploading this image.
   *
   * The user id is appended to the image's metadata (not publicly available)
   * in case we need to know who uploaded the image originally.
   *
   * @see https://developers.cloudflare.com/images/cloudflare-images/upload-images/direct-creator-upload/
   */
  async createImageUploadUrl(userId: string): Promise<ImageUploadUrlModel> {
    const {
      success,
      result: { id, uploadURL },
    } = await cloudflareApi.images.createImageUploadUrl({
      metadata: {
        uploaderId: userId,
      },
    });

    if (!success) {
      throw new Error("Failed to allocate upload url from cloudflare");
    }

    return {
      id,
      uploadURL,
    };
  },
  /**
   * Writes the given image to the database.
   *
   * Note that the `image.cloudflareId` property must point to an image which
   * has already been uploaded to cloudflare.
   * @throws {@link ImageNotUploadedToCloudflareError}
   */
  async create(image: Omit<ImageModel, "id">): Promise<ImageModel> {
    if (!(await cloudflareApi.images.isUploaded(image.cloudflareId))) {
      throw new ImageNotUploadedToCloudflareError(
        `Image with cloudflareId ${image.cloudflareId} has not been uploaded.`
      );
    }

    const entity = await prisma.imageEntity.create({
      data: {
        cloudflareId: image.cloudflareId,
        variant: image.variant,
      },
    });

    return imageEntityToImageModel(entity);
  },
  /**
   * Deletes the given image from local database and cloudflare.
   *
   * @param imageId the id of the image to delete
   * @param force True if the image should be deleted even if it has usages.
   *
   * By default, an image is only deleted if it has no associated usages.
   * @throws {@link ImageInUseError}
   * Thrown if `force` is set to `false` and the related image has associated
   * usages.
   */
  async deleteById(
    id: ImageModel["id"],
    force = false
  ): Promise<ImageModel | null> {
    const image = await prisma.imageEntity.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            profileImages: true,
          },
        },
      },
    });
    if (image === null) return null;

    if (!force && Object.values(image._count).some((count) => count > 0)) {
      throw new ImageInUseError(
        "This image still has usages and the force flag is set to `false`"
      );
    }

    const { success } = await cloudflareApi.images.delete(image.cloudflareId);

    if (!success) {
      throw new Error("Failed to delete image from cloudflare");
    }

    await prisma.imageEntity.delete({
      where: {
        id: image.id,
      },
    });

    return image;
  },
  /**
   * Deletes the given image from local database and cloudflare.
   *
   * @param cloudflareId the cloudflare id of the image to delete
   * @param force True if the image should be deleted even if it has usages.
   *
   * By default, an image is only deleted if it has no associated usages.
   * @throws {@link ImageInUseError}
   * Thrown if `force` is set to `false` and the related image has associated
   * usages.
   */
  async deleteByCloudflareId(
    cloudflareId: ImageModel["cloudflareId"],
    force = false
  ) {
    const image = await this.getByCloudflareId(cloudflareId);
    if (image === null) return null;

    return await this.deleteById(image.id, force);
  },
};
