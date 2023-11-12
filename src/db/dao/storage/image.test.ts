/**
 * @group integration
 */

import { mockCreateImageUploadUrlFetchResponses } from "@/__test__/cloudflare";
import { withTestDatabaseForEach } from "@/__test__/db";
import { ImageDao } from "@/db/dao/storage/image";
import { ImageModel } from "@/model/storage/image";
import fetch from "jest-fetch-mock";

describe("ImageDao integration tests", () => {
  withTestDatabaseForEach();

  beforeAll(() => {
    fetch.enableMocks();
  });

  beforeEach(() => {
    fetch.resetMocks();
  });

  test("request an image upload url", async () => {
    // Arrange
    const cloudflareMockResponses = mockCreateImageUploadUrlFetchResponses();

    // Act
    const { id, uploadURL } = await ImageDao.createImageUploadUrl("testUserId");

    // Assert
    expect(fetch.mock.calls).toHaveLength(1);
    expect(cloudflareMockResponses).toHaveLength(1);
    expect(uploadURL).toEqual(cloudflareMockResponses[0].uploadURL);
    await expect(ImageDao.getById(id)).resolves.toEqual<ImageModel>({
      id,
      cloudflareId: cloudflareMockResponses[0].id,
    });
  });
});
