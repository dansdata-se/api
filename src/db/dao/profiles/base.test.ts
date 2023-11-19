/**
 * @group integration
 */

import { mockCreateImageUploadUrlFetchResponses } from "@/__test__/cloudflare";
import { withTestDatabaseForEach } from "@/__test__/db";
import { generateBaseCreateProfileModel } from "@/__test__/model/profiles/base/create";
import {
  BaseProfileDao,
  InvalidProfileImageReferenceError,
} from "@/db/dao/profiles/base";
import { ImageDao } from "@/db/dao/storage/image";
import { BaseCreateProfileModel } from "@/model/profiles/base/create";
import { BaseProfileModel } from "@/model/profiles/base/profile";
import { BaseProfileReferenceModel } from "@/model/profiles/base/reference";
import fetch from "jest-fetch-mock";

describe("BaseProfileDao integration tests", () => {
  withTestDatabaseForEach();

  beforeAll(() => {
    fetch.enableMocks();
  });

  beforeEach(() => {
    fetch.resetMocks();
  });

  test("getById returns null if the profile is not found", async () => {
    await expect(
      BaseProfileDao.getById("thisIdDoesNotExist")
    ).resolves.toBeNull();
  });

  test("getReferenceById returns null if the profile is not found", async () => {
    await expect(
      BaseProfileDao.getReferenceById("thisIdDoesNotExist")
    ).resolves.toBeNull();
  });

  test("create and retrieve full base profile", async () => {
    // Arrange
    const cloudflareMockResponses = mockCreateImageUploadUrlFetchResponses();
    const { id: coverImageId } =
      await ImageDao.createImageUploadUrl("testUser");
    const { id: posterImageId } =
      await ImageDao.createImageUploadUrl("testUser");
    const { id: squareImageId } =
      await ImageDao.createImageUploadUrl("testUser");
    const createModel: BaseCreateProfileModel = generateBaseCreateProfileModel({
      images: {
        coverId: coverImageId,
        posterId: posterImageId,
        squareId: squareImageId,
      },
    });

    // Act
    const profileId = await BaseProfileDao.create(createModel);
    const profile = await BaseProfileDao.getById(profileId);

    // Assert
    expect(cloudflareMockResponses).toHaveLength(3);
    expect(profile).toEqual<BaseProfileModel>({
      id: profileId,
      type: createModel.type,
      name: createModel.name,
      description: createModel.description,
      links: createModel.links,
      images: {
        cover: {
          id: coverImageId,
          cloudflareId: cloudflareMockResponses[0].id,
        },
        poster: {
          id: posterImageId,
          cloudflareId: cloudflareMockResponses[1].id,
        },
        square: {
          id: squareImageId,
          cloudflareId: cloudflareMockResponses[2].id,
        },
      },
    });
  });

  test("create and retrieve base profile reference", async () => {
    // Arrange
    const cloudflareMockResponses = mockCreateImageUploadUrlFetchResponses();
    const { id: coverImageId } =
      await ImageDao.createImageUploadUrl("testUser");
    const { id: posterImageId } =
      await ImageDao.createImageUploadUrl("testUser");
    const { id: squareImageId } =
      await ImageDao.createImageUploadUrl("testUser");
    const createModel: BaseCreateProfileModel = generateBaseCreateProfileModel({
      images: {
        coverId: coverImageId,
        posterId: posterImageId,
        squareId: squareImageId,
      },
    });

    // Act
    const profileId = await BaseProfileDao.create(createModel);
    const profile = await BaseProfileDao.getReferenceById(profileId);

    // Assert
    expect(cloudflareMockResponses).toHaveLength(3);
    expect(profile).toEqual<BaseProfileReferenceModel>({
      id: profileId,
      type: createModel.type,
      name: createModel.name,
      images: {
        cover: {
          id: coverImageId,
          cloudflareId: cloudflareMockResponses[0].id,
        },
        poster: {
          id: posterImageId,
          cloudflareId: cloudflareMockResponses[1].id,
        },
        square: {
          id: squareImageId,
          cloudflareId: cloudflareMockResponses[2].id,
        },
      },
    });
  });

  test.each([
    {
      images: {
        coverId: "thisIdDoesNotExist",
        posterId: null,
        squareId: null,
      },
    },
    {
      images: {
        coverId: null,
        posterId: "thisIdDoesNotExist",
        squareId: null,
      },
    },
    {
      images: {
        coverId: null,
        posterId: null,
        squareId: "thisIdDoesNotExist",
      },
    },
  ])(
    "refuses to create profile with invalid image reference ($images)",
    async (overrides) => {
      const createModel: BaseCreateProfileModel =
        generateBaseCreateProfileModel(overrides);

      await expect(() =>
        BaseProfileDao.create(createModel)
      ).rejects.toThrowError(InvalidProfileImageReferenceError);
    }
  );

  test("can delete a profile", async () => {
    // Arrange
    mockCreateImageUploadUrlFetchResponses();
    const { id: coverImageId } =
      await ImageDao.createImageUploadUrl("testUser");
    const { id: posterImageId } =
      await ImageDao.createImageUploadUrl("testUser");
    const { id: squareImageId } =
      await ImageDao.createImageUploadUrl("testUser");
    const createModel: BaseCreateProfileModel = generateBaseCreateProfileModel({
      images: {
        coverId: coverImageId,
        posterId: posterImageId,
        squareId: squareImageId,
      },
    });
    const profileId = await BaseProfileDao.create(createModel);

    // Act
    const deleteSuccessful = await BaseProfileDao.delete(profileId);

    // Assert
    expect(deleteSuccessful).toBe(true);
    await expect(BaseProfileDao.getById(profileId)).resolves.toBeNull();
  });
});
