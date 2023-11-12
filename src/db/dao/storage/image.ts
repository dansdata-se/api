import { cloudflareApi } from "@/cloudflare/api";
import { getDbClient } from "@/db";
import { mapImageEntityToImageModel } from "@/mapping/storage/image";
import { ImageModel, ImageUploadUrlModel } from "@/model/storage/image";

export const ImageDao = {
  /**
   * Retrieve an image by its id
   */
  async getById(id: ImageModel["id"]): Promise<ImageModel | null> {
    const entity = await getDbClient().imageEntity.findUnique({
      where: {
        id,
      },
    });
    if (entity === null) return null;
    return mapImageEntityToImageModel(entity);
  },
  /**
   * Retrieve an image by its cloudflare id
   */
  async getByCloudflareId(cloudflareId: ImageModel["cloudflareId"]) {
    const entity = await getDbClient().imageEntity.findUnique({
      where: {
        cloudflareId,
      },
    });
    if (entity === null) return null;
    return mapImageEntityToImageModel(entity);
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
      result: { id: cloudflareId, uploadURL },
    } = await cloudflareApi.images.createImageUploadUrl({
      metadata: {
        uploaderId: userId,
      },
    });

    if (!success) {
      throw new Error("Failed to allocate upload url from cloudflare");
    }

    // TODO(FelixZY): this can lead to the database listing an image which does not actually exist in cloudflare.
    // We should clean such "dangling" entities up regularly.
    // https://github.com/dansdata-se/api/issues/2
    const image = await getDbClient()
      .imageEntity.create({
        data: {
          cloudflareId,
        },
      })
      .then(mapImageEntityToImageModel);

    return {
      id: image.id,
      uploadURL,
    };
  },
  /**
   * Deletes the given image from local database and cloudflare.
   *
   * @param imageId the id of the image to delete
   */
  async deleteById(id: ImageModel["id"]): Promise<ImageModel | null> {
    const image = await getDbClient().imageEntity.findUnique({
      where: {
        id,
      },
    });
    if (image === null) return null;

    const { success } = await cloudflareApi.images.delete(image.cloudflareId);

    if (!success) {
      throw new Error("Failed to delete image from cloudflare");
    }

    await getDbClient().imageEntity.delete({
      where: {
        id,
      },
    });

    return image;
  },
  /**
   * Deletes the given image from local database and cloudflare.
   *
   * @param cloudflareId the cloudflare id of the image to delete.
   */
  async deleteByCloudflareId(cloudflareId: ImageModel["cloudflareId"]) {
    const image = await this.getByCloudflareId(cloudflareId);
    if (image === null) return null;

    return await this.deleteById(image.id);
  },
};
