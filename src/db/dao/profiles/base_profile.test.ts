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
import { ProfileEntity, ProfileLinkEntity, ProfileType } from "@prisma/client";

describe("BaseProfileDao unit tests", () => {
  beforeEach(() => {
    mockReset(dbMock);
  });

  test("getById", async () => {
    const expectedProfileEntity: ProfileEntity & {
      coverImage: {
        id: string;
        cloudflareId: string;
      } | null;
      posterImage: {
        id: string;
        cloudflareId: string;
      } | null;
      squareImage: {
        id: string;
        cloudflareId: string;
      } | null;
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
      coverImageId: "coverImageId",
      coverImage: {
        id: "coverImageId",
        cloudflareId: "coverImageCloudflareId",
      },
      posterImageId: "posterImageId",
      posterImage: {
        id: "posterImageId",
        cloudflareId: "posterImageCloudflareId",
      },
      squareImageId: "squareImageId",
      squareImage: {
        id: "squareImageId",
        cloudflareId: "squareImageCloudflareId",
      },
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
        },
        poster: {
          id: "posterImageId",
          cloudflareId: "posterImageCloudflareId",
        },
        square: {
          id: "squareImageId",
          cloudflareId: "squareImageCloudflareId",
        },
      },
    });
  });

  test("getReferenceById", async () => {
    const expectedProfileEntity: ProfileEntity & {
      coverImage: {
        id: string;
        cloudflareId: string;
      } | null;
      posterImage: {
        id: string;
        cloudflareId: string;
      } | null;
      squareImage: {
        id: string;
        cloudflareId: string;
      } | null;
    } = {
      id: "profileId",
      type: ProfileType.organization,
      name: "Profile Name",
      description: "Profile description",
      coverImageId: "coverImageId",
      coverImage: {
        id: "coverImageId",
        cloudflareId: "coverImageCloudflareId",
      },
      posterImageId: "posterImageId",
      posterImage: {
        id: "posterImageId",
        cloudflareId: "posterImageCloudflareId",
      },
      squareImageId: "squareImageId",
      squareImage: {
        id: "squareImageId",
        cloudflareId: "squareImageCloudflareId",
      },
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
        },
        poster: {
          id: "posterImageId",
          cloudflareId: "posterImageCloudflareId",
        },
        square: {
          id: "squareImageId",
          cloudflareId: "squareImageCloudflareId",
        },
      },
    });
  });
});
