/**
 * @group unit
 */

import { mapImageEntitiesToImagesModel } from "@/mapping/storage/image";
import { ImagesModel } from "@/model/profiles/images";

describe("Image mappings unit tests", () => {
  test("mapImageEntitiesToImagesModel converts to ImagesModel", () => {
    const input: Parameters<typeof mapImageEntitiesToImagesModel>[0] = {
      cover: {
        id: "coverImageId",
        cloudflareId: "coverImageCloudflareId",
      },
      poster: {
        id: "posterImageId",
        cloudflareId: "posterImageCloudflareId",
      },
      square: {
        id: "squareImageId",
        cloudflareId: "squareImageCloudflareId",
      },
    };

    const expectedImages: ImagesModel = {
      cover: {
        id: "coverImageId",
        cloudflareId: "coverImageCloudflareId",
      },
      poster: {
        id: "posterImageId",
        cloudflareId: "posterImageCloudflareId",
      },
      square: {
        id: "squareImageId",
        cloudflareId: "squareImageCloudflareId",
      },
    };
    expect(mapImageEntitiesToImagesModel(input)).toEqual(expectedImages);
  });
});
