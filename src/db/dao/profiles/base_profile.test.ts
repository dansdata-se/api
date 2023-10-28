/**
 * @group unit
 */

import { DbClient, exportedForTesting as dbTesting } from "@/db";
import { mockDeep, mockReset } from "jest-mock-extended";
const dbMock = mockDeep<DbClient>();
dbTesting.overridePrismaClient(dbMock);

import { BaseProfileDao } from "@/db/dao/profiles/base_profile";
import { BaseProfileModel } from "@/model/profiles/profile";
import { BaseProfileReferenceModel } from "@/model/profiles/profile_reference";
import {
  ImageEntity,
  ImageVariant,
  ProfileEntity,
  ProfileLinkEntity,
  ProfileType,
} from "@prisma/client";

describe("BaseProfileDao unit tests", () => {
  beforeEach(() => {
    mockReset(dbMock);
  });

  test("getById", async () => {
    const expectedProfileEntity: ProfileEntity & {
      images: {
        image: ImageEntity;
      }[];
      links: ProfileLinkEntity[];
    } = {
      id: "profileId",
      type: ProfileType.organization,
      name: "Profile Name",
      description: "Profile description",
      links: [
        {
          id: 1,
          profileId: "profileId",
          url: "https://profile.example",
        },
        {
          id: 2,
          profileId: "profileId",
          url: "https://facebooke.com/profile",
        },
      ],
      images: [
        {
          image: {
            id: "coverImageId",
            cloudflareId: "coverImageCloudflareId",
            variant: ImageVariant.cover,
          },
        },
        {
          image: {
            id: "posterImageId",
            cloudflareId: "posterImageCloudflareId",
            variant: ImageVariant.poster,
          },
        },
        {
          image: {
            id: "squareImageId",
            cloudflareId: "squareImageCloudflareId",
            variant: ImageVariant.square,
          },
        },
      ],
      createdAt: new Date("2023-06-16T22:26:49"),
    };
    dbMock.profileEntity.findUnique.mockResolvedValueOnce(
      expectedProfileEntity
    );

    await expect(
      BaseProfileDao.getById("profileId")
    ).resolves.toEqual<BaseProfileModel>({
      id: expectedProfileEntity.id,
      type: expectedProfileEntity.type,
      name: expectedProfileEntity.name,
      description: expectedProfileEntity.description,
      links: expectedProfileEntity.links.map((l) => ({ url: l.url })),
      images: {
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
      },
    });
  });

  test("getReferenceById", async () => {
    const expectedProfileEntity: ProfileEntity & {
      images: {
        image: ImageEntity;
      }[];
    } = {
      id: "profileId",
      type: ProfileType.organization,
      name: "Profile Name",
      description: "Profile description",
      images: [
        {
          image: {
            id: "coverImageId",
            cloudflareId: "coverImageCloudflareId",
            variant: ImageVariant.cover,
          },
        },
        {
          image: {
            id: "posterImageId",
            cloudflareId: "posterImageCloudflareId",
            variant: ImageVariant.poster,
          },
        },
        {
          image: {
            id: "squareImageId",
            cloudflareId: "squareImageCloudflareId",
            variant: ImageVariant.square,
          },
        },
      ],
      createdAt: new Date("2023-06-16T22:26:49"),
    };
    dbMock.profileEntity.findUnique.mockResolvedValueOnce(
      expectedProfileEntity
    );

    await expect(
      BaseProfileDao.getReferenceById("profileId")
    ).resolves.toEqual<BaseProfileReferenceModel>({
      id: expectedProfileEntity.id,
      type: expectedProfileEntity.type,
      name: expectedProfileEntity.name,
      images: {
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
      },
    });
  });
});
