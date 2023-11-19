/**
 * @group integration
 */

import { mockCreateImageUploadUrlFetchResponses } from "@/__test__/cloudflare";
import { withTestDatabaseForEach } from "@/__test__/db";
import { generateBaseCreateProfileModel } from "@/__test__/model/profiles/base/create";
import { generateBasePatchProfileModel } from "@/__test__/model/profiles/base/patch";
import { generateLinkModel } from "@/__test__/model/profiles/link";
import {
  BaseProfileDao,
  InvalidProfileImageReferenceError,
} from "@/db/dao/profiles/base";
import { ImageDao } from "@/db/dao/storage/image";
import { BaseCreateProfileModel } from "@/model/profiles/base/create";
import { BasePatchProfileModel } from "@/model/profiles/base/patch";
import { BaseProfileModel } from "@/model/profiles/base/profile";
import { BaseProfileReferenceModel } from "@/model/profiles/base/reference";
import { faker } from "@faker-js/faker";
import { ProfileType } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
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

  test("patch throws if OLD.type !== NEW.type", async () => {
    // Arrange
    const profileId = await BaseProfileDao.create(
      generateBaseCreateProfileModel({
        type: ProfileType.individual,
        images: {
          coverId: null,
          posterId: null,
          squareId: null,
        },
      })
    );

    // Act
    const promise = BaseProfileDao.patch(
      generateBasePatchProfileModel({
        id: profileId,
        type: ProfileType.organization,
      })
    );

    // Assert
    await expect(promise).rejects.toThrowError(PrismaClientKnownRequestError);
    await expect(promise).rejects.toMatchObject<
      Partial<PrismaClientKnownRequestError>
    >({
      code: "P2025",
    });
    expect(
      (
        (await promise.catch(
          (it) => it as PrismaClientKnownRequestError
        )) as PrismaClientKnownRequestError
      ).message
    ).toContain(
      "An operation failed because it depends on one or more records that were required but not found."
    );
  });

  test("create and patch full base profile", async () => {
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
        coverId: null,
        posterId: posterImageId,
        squareId: squareImageId,
      },
    });
    const patchModel: BasePatchProfileModel = generateBasePatchProfileModel({
      type: createModel.type,
      images: {
        coverId: coverImageId,
        posterId: null,
      },
    });

    // Act
    const profileId = await BaseProfileDao.create(createModel);
    patchModel.id = profileId;

    const createdProfile = await BaseProfileDao.getById(profileId);
    await BaseProfileDao.patch(patchModel);
    const patchedProfile = await BaseProfileDao.getById(patchModel.id);

    // Assert
    expect(cloudflareMockResponses).toHaveLength(3);
    expect(createdProfile).toEqual<BaseProfileModel>({
      id: profileId,
      type: createModel.type,
      name: createModel.name,
      description: createModel.description,
      links: createModel.links,
      images: {
        cover: null,
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
    expect(patchedProfile).toEqual<BaseProfileModel>({
      id: profileId,
      type: patchModel.type,
      name: patchModel.name ?? createModel.name,
      description: patchModel.description ?? createModel.description,
      links: patchModel.links ?? createModel.links,
      images: {
        cover: {
          id: coverImageId,
          cloudflareId: cloudflareMockResponses[0].id,
        },
        poster: null,
        square: {
          id: squareImageId,
          cloudflareId: cloudflareMockResponses[2].id,
        },
      },
    });
  });

  test.each([0, 1, 3])(
    "patch can update the link list to have %s links",
    async (patchedLinkCount) => {
      // Arrange
      const createModel: BaseCreateProfileModel =
        generateBaseCreateProfileModel({
          links: Array.from({
            length: faker.number.int({ min: 1, max: 10 }),
          }).map(() => generateLinkModel()),
          images: {
            coverId: null,
            posterId: null,
            squareId: null,
          },
        });
      const profileId = await BaseProfileDao.create(createModel);
      const patchModel: BasePatchProfileModel = generateBasePatchProfileModel({
        id: profileId,
        type: createModel.type,
        links: Array.from({ length: patchedLinkCount }).map(() =>
          generateLinkModel()
        ),
        images: {},
      });

      // Act
      await BaseProfileDao.patch(patchModel);
      const patchedProfile = await BaseProfileDao.getById(profileId);

      // Assert
      expect(createModel.links.length).toBeGreaterThan(0);
      expect(patchedProfile).not.toBeNull();
      expect(patchedProfile?.links).toHaveLength(patchedLinkCount);
      expect(patchedProfile?.links).not.toEqual(createModel.links);
      expect(patchedProfile).toMatchObject<Pick<BaseProfileModel, "links">>({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        links: patchModel.links!,
      });
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
