/**
 * @group unit
 */

import { mapImageEntitiesToImagesModel } from "@/mapping/storage/image";
import { ImagesModel } from "@/model/profiles/images";
import { ImageVariant } from "@prisma/client";

describe("Image mappings unit tests", () => {
  test("mapImageEntitiesToImagesModel yields null values for unspecified image variants", () => {
    const allNullImagesModel: ImagesModel = {
      cover: null,
      poster: null,
      square: null,
    };
    expect(mapImageEntitiesToImagesModel([])).toEqual(allNullImagesModel);
  });

  test("mapImageEntitiesToImagesModel converts to ImagesModel", () => {
    const input: Parameters<typeof mapImageEntitiesToImagesModel>[0] = [
      {
        id: "coverImageId",
        cloudflareId: "coverImageCloudflareId",
        variant: ImageVariant.cover,
      },
      {
        id: "posterImageId",
        cloudflareId: "posterImageCloudflareId",
        variant: ImageVariant.poster,
      },
      {
        id: "squareImageId",
        cloudflareId: "squareImageCloudflareId",
        variant: ImageVariant.square,
      },
    ];

    const expectedImages: ImagesModel = {
      cover: {
        id: "coverImageId",
        cloudflareId: "coverImageCloudflareId",
        variant: ImageVariant.cover,
      },
      poster: {
        id: "posterImageId",
        cloudflareId: "posterImageCloudflareId",
        variant: ImageVariant.poster,
      },
      square: {
        id: "squareImageId",
        cloudflareId: "squareImageCloudflareId",
        variant: ImageVariant.square,
      },
    };
    expect(mapImageEntitiesToImagesModel(input)).toEqual(expectedImages);
  });
});
