/**
 * @group unit
 */

import { DbClient, exportedForTesting as dbTesting } from "@/db";
import { mockDeep, mockReset } from "jest-mock-extended";
const dbMock = mockDeep<DbClient>();
dbTesting.overridePrismaClient(dbMock);

import fetch from "jest-fetch-mock";
fetch.enableMocks();

import {
  ImageDao,
  ImageNotUploadedToCloudflareError,
} from "@/db/dao/storage/image";
import { ImageVariant } from "@prisma/client";

describe("ImageDao unit tests", () => {
  beforeEach(() => {
    fetch.resetMocks();
    mockReset(dbMock);
  });

  test("request an image upload url", async () => {
    fetch.mockResponse(
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
    const { id, uploadURL } = await ImageDao.createImageUploadUrl("testUserId");

    expect(id).toEqual("610a686f-3fa7-46ca-e36d-3c00bd791b00");
    expect(uploadURL).toEqual(
      "https://upload.imagedelivery.net/abcdefghijklmnopqrstuv/610a686f-3fa7-46ca-e36d-3c00bd791b00"
    );
    expect(fetch.mock.calls).toHaveLength(1);
  });

  test("create throws ImageNotUploadedToCloudflareError if the image is not known to cloudflare", async () => {
    fetch.mockResponse("ERROR 5404: Image not found", { status: 404 });

    await expect(
      ImageDao.create({
        cloudflareId: "610a686f-3fa7-46ca-e36d-3c00bd791b00",
        variant: ImageVariant.cover,
      })
    ).rejects.toThrowError(ImageNotUploadedToCloudflareError);
  });

  test("create throws ImageNotUploadedToCloudflareError if the image has not been uploaded yet", async () => {
    fetch.mockResponse(
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
      ImageDao.create({
        cloudflareId: "610a686f-3fa7-46ca-e36d-3c00bd791b00",
        variant: ImageVariant.cover,
      })
    ).rejects.toThrowError(ImageNotUploadedToCloudflareError);
  });

  test("create inserts image", async () => {
    fetch.mockResponse(
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

    dbMock.imageEntity.create.mockResolvedValueOnce({
      id: "abc123",
      cloudflareId: "610a686f-3fa7-46ca-e36d-3c00bd791b00",
      variant: ImageVariant.cover,
    });

    await expect(
      ImageDao.create({
        cloudflareId: "610a686f-3fa7-46ca-e36d-3c00bd791b00",
        variant: ImageVariant.cover,
      })
    ).resolves.toEqual({
      id: "abc123",
      cloudflareId: "610a686f-3fa7-46ca-e36d-3c00bd791b00",
      variant: ImageVariant.cover,
    });
    expect(dbMock.imageEntity.create.mock.calls).toHaveLength(1);
    // Ensure cloudflare API was consulted once only
    expect(fetch.mock.calls).toHaveLength(1);
  });
});
