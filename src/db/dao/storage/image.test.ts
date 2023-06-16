/**
 * @group unit
 */

import { ImageVariant, PrismaClient } from "@prisma/client";
import { DeepMockProxy, mockDeep, mockReset } from "jest-mock-extended";

jest.mock("@/db", () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));
// prevent prettier from moving this import around
// prettier-ignore
import { prisma } from "@/db";

import {
  ImageDAO,
  ImageNotUploadedToCloudflareError,
  imageEntitiesToImagesModel,
} from "@/db/dao/storage/image";
import { ImagesModel } from "@/model/profiles/images";
import fetch from "jest-fetch-mock";

describe("ImageDAO unit tests", () => {
  const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

  beforeEach(() => {
    fetch.resetMocks();
    mockReset(prismaMock);
  });

  test("request an image upload url", async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        result: {
          id: "610a686f-3fa7-46ca-e36d-3c00bd791b00",
          uploadURL:
            "https://upload.imagedelivery.net/abcdefghijklmnopqrstuv/610a686f-3fa7-46ca-e36d-3c00bd791b00",
        },
        success: true,
        errors: [],
        messages: [],
      })
    );
    const { id, uploadURL } = await ImageDAO.createImageUploadUrl("testUserId");

    expect(id).toEqual("610a686f-3fa7-46ca-e36d-3c00bd791b00");
    expect(uploadURL).toEqual(
      "https://upload.imagedelivery.net/abcdefghijklmnopqrstuv/610a686f-3fa7-46ca-e36d-3c00bd791b00"
    );
    expect(fetch.mock.calls).toHaveLength(1);
  });

  test("create throws ImageNotUploadedToCloudflareError if the image is not known to cloudflare", async () => {
    fetch.mockResponseOnce("ERROR 5404: Image not found", { status: 404 });

    await expect(
      ImageDAO.create({
        cloudflareId: "610a686f-3fa7-46ca-e36d-3c00bd791b00",
        variant: ImageVariant.cover,
      })
    ).rejects.toThrowError(ImageNotUploadedToCloudflareError);
  });

  test("create throws ImageNotUploadedToCloudflareError if the image has not been uploaded yet", async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        result: {
          id: "610a686f-3fa7-46ca-e36d-3c00bd791b00",
          filename: null,
          meta: {
            uploaderId: "testUserId",
          },
          uploaded: "2023-06-04T19:18:04.451Z",
          requireSignedURLs: false,
          variants: [
            "https://imagedelivery.net/abcdefghijklmnopqrstuv/610a686f-3fa7-46ca-e36d-3c00bd791b00/squaresm",
            "https://imagedelivery.net/abcdefghijklmnopqrstuv/610a686f-3fa7-46ca-e36d-3c00bd791b00/postersm",
            "https://imagedelivery.net/abcdefghijklmnopqrstuv/610a686f-3fa7-46ca-e36d-3c00bd791b00/coverlg",
            "https://imagedelivery.net/abcdefghijklmnopqrstuv/610a686f-3fa7-46ca-e36d-3c00bd791b00/posterlg",
            "https://imagedelivery.net/abcdefghijklmnopqrstuv/610a686f-3fa7-46ca-e36d-3c00bd791b00/coversm",
            "https://imagedelivery.net/abcdefghijklmnopqrstuv/610a686f-3fa7-46ca-e36d-3c00bd791b00/covermd",
            "https://imagedelivery.net/abcdefghijklmnopqrstuv/610a686f-3fa7-46ca-e36d-3c00bd791b00/posterxl",
            "https://imagedelivery.net/abcdefghijklmnopqrstuv/610a686f-3fa7-46ca-e36d-3c00bd791b00/coverxl",
            "https://imagedelivery.net/abcdefghijklmnopqrstuv/610a686f-3fa7-46ca-e36d-3c00bd791b00/squarexl",
            "https://imagedelivery.net/abcdefghijklmnopqrstuv/610a686f-3fa7-46ca-e36d-3c00bd791b00/postermd",
            "https://imagedelivery.net/abcdefghijklmnopqrstuv/610a686f-3fa7-46ca-e36d-3c00bd791b00/squaremd",
            "https://imagedelivery.net/abcdefghijklmnopqrstuv/610a686f-3fa7-46ca-e36d-3c00bd791b00/squarelg",
          ],
          draft: true,
        },
        success: true,
        errors: [],
        messages: [],
      })
    );

    await expect(
      ImageDAO.create({
        cloudflareId: "610a686f-3fa7-46ca-e36d-3c00bd791b00",
        variant: ImageVariant.cover,
      })
    ).rejects.toThrowError(ImageNotUploadedToCloudflareError);
  });

  test("create inserts image", async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        result: {
          id: "610a686f-3fa7-46ca-e36d-3c00bd791b00",
          filename: "cover_1800_945.png",
          uploaded: "2023-06-04T19:18:04.451Z",
          meta: {
            uploaderId: "testUserId",
          },
          requireSignedURLs: false,
          variants: [
            "https://imagedelivery.net/abcdefghijklmnopqrstuv/610a686f-3fa7-46ca-e36d-3c00bd791b00/coversm",
            "https://imagedelivery.net/abcdefghijklmnopqrstuv/610a686f-3fa7-46ca-e36d-3c00bd791b00/postermd",
            "https://imagedelivery.net/abcdefghijklmnopqrstuv/610a686f-3fa7-46ca-e36d-3c00bd791b00/postersm",
            "https://imagedelivery.net/abcdefghijklmnopqrstuv/610a686f-3fa7-46ca-e36d-3c00bd791b00/coverxl",
            "https://imagedelivery.net/abcdefghijklmnopqrstuv/610a686f-3fa7-46ca-e36d-3c00bd791b00/posterlg",
            "https://imagedelivery.net/abcdefghijklmnopqrstuv/610a686f-3fa7-46ca-e36d-3c00bd791b00/squaremd",
            "https://imagedelivery.net/abcdefghijklmnopqrstuv/610a686f-3fa7-46ca-e36d-3c00bd791b00/squarelg",
            "https://imagedelivery.net/abcdefghijklmnopqrstuv/610a686f-3fa7-46ca-e36d-3c00bd791b00/squaresm",
            "https://imagedelivery.net/abcdefghijklmnopqrstuv/610a686f-3fa7-46ca-e36d-3c00bd791b00/squarexl",
            "https://imagedelivery.net/abcdefghijklmnopqrstuv/610a686f-3fa7-46ca-e36d-3c00bd791b00/posterxl",
            "https://imagedelivery.net/abcdefghijklmnopqrstuv/610a686f-3fa7-46ca-e36d-3c00bd791b00/covermd",
            "https://imagedelivery.net/abcdefghijklmnopqrstuv/610a686f-3fa7-46ca-e36d-3c00bd791b00/coverlg",
          ],
        },
        success: true,
        errors: [],
        messages: [],
      })
    );

    prismaMock.imageEntity.create.mockResolvedValueOnce({
      id: "abc123",
      cloudflareId: "610a686f-3fa7-46ca-e36d-3c00bd791b00",
      variant: ImageVariant.cover,
    });

    await expect(
      ImageDAO.create({
        cloudflareId: "610a686f-3fa7-46ca-e36d-3c00bd791b00",
        variant: ImageVariant.cover,
      })
    ).resolves.toEqual({
      id: "abc123",
      cloudflareId: "610a686f-3fa7-46ca-e36d-3c00bd791b00",
      variant: ImageVariant.cover,
    });
    expect(prismaMock.imageEntity.create.mock.calls).toHaveLength(1);
    // Ensure cloudflare API was consulted once only
    expect(fetch.mock.calls).toHaveLength(1);
  });

  test("imageEntitiesToImagesModel yields null values for unspecified image variants", () => {
    const allNullImagesModel: ImagesModel = {
      cover: null,
      poster: null,
      square: null,
    };
    expect(imageEntitiesToImagesModel([])).toEqual(allNullImagesModel);
  });

  test("imageEntitiesToImagesModel converts to ImagesModel", () => {
    const input: Parameters<typeof imageEntitiesToImagesModel>[0] = [
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
    expect(imageEntitiesToImagesModel(input)).toEqual(expectedImages);
  });
});
