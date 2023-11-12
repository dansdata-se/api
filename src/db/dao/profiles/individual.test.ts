/**
 * @group unit
 */

import { DbClient, exportedForTesting as dbTesting } from "@/db";
import { DeepMockProxy, mockDeep, mockReset } from "jest-mock-extended";
const dbMock = mockDeep<DbClient>();
dbTesting.overridePrismaClient(dbMock);

import { IndividualEntity, ProfileType } from "@prisma/client";

import type { BaseProfileDaoType } from "@/db/dao/profiles/base";
jest.mock("@/db/dao/profiles/base", () => ({
  __esModule: true,
  BaseProfileDao: mockDeep<BaseProfileDaoType>(),
}));
// prevent prettier from moving this import around
// prettier-ignore
import { BaseProfileDao } from "@/db/dao/profiles/base";

import type { OrganizationDaoType } from "@/db/dao/profiles/organization";
jest.mock("@/db/dao/profiles/organization", () => ({
  __esModule: true,
  OrganizationDao: mockDeep<OrganizationDaoType>(),
}));
// prevent prettier from moving this import around
// prettier-ignore
import { OrganizationDao } from "@/db/dao/profiles/organization";

import { IndividualDao } from "@/db/dao/profiles/individual";
import { BaseProfileModel } from "@/model/profiles/base";
import { BaseProfileReferenceModel } from "@/model/profiles/base_reference";
import { IndividualModel } from "@/model/profiles/individuals/profile";
import { IndividualReferenceModel } from "@/model/profiles/individuals/profile_reference";
import { OrganizationReferenceModel } from "@/model/profiles/organizations/profile_reference";

describe("IndividualDao unit tests", () => {
  const BaseProfileDaoMock =
    BaseProfileDao as unknown as DeepMockProxy<BaseProfileDaoType>;
  const OrganizationDaoMock =
    OrganizationDao as unknown as DeepMockProxy<OrganizationDaoType>;

  beforeEach(() => {
    mockReset(dbMock);
    mockReset(BaseProfileDaoMock);
    mockReset(OrganizationDaoMock);
  });

  test("getById handles base profile not found", async () => {
    BaseProfileDaoMock.getById.mockResolvedValueOnce(null);
    await expect(IndividualDao.getById("profileId")).resolves.toBeNull();
  });

  test("getById ignores profile where type != individual", async () => {
    const baseProfile: BaseProfileModel = {
      id: "profileId",
      type: ProfileType.organization,
      name: "Profile name",
      description: "Profile description",
      links: [
        {
          url: "https://profile.example",
        },
        {
          url: "https://facebooke.com/profile",
        },
      ],
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
    };
    BaseProfileDaoMock.getById.mockResolvedValueOnce(baseProfile);

    await expect(IndividualDao.getById("profileId")).resolves.toBeNull();
  });

  test("getById resolves profile", async () => {
    const baseProfile: BaseProfileModel = {
      id: "profileId",
      type: ProfileType.individual,
      name: "Profile name",
      description: "Profile description",
      links: [
        {
          url: "https://profile.example",
        },
        {
          url: "https://facebooke.com/profile",
        },
      ],
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
    };
    const org1ReferenceModel: OrganizationReferenceModel = {
      id: "org1Id",
      type: ProfileType.organization,
      name: "Organization 1 name",
      tags: ["performer"],
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
    };
    const org2ReferenceModel: OrganizationReferenceModel = {
      id: "org2Id",
      type: ProfileType.organization,
      name: "Organization 2 name",
      tags: ["educator"],
      images: {
        cover: null,
        poster: null,
        square: null,
      },
    };
    const individualEntity: IndividualEntity & {
      organizations: {
        title: string;
        organizationId: string;
      }[];
    } = {
      profileId: baseProfile.id,
      tags: ["musician", "instructor"],
      organizations: [
        {
          organizationId: org1ReferenceModel.id,
          title: "org1Title",
        },
        {
          organizationId: org2ReferenceModel.id,
          title: "org2Title",
        },
      ],
    };
    BaseProfileDaoMock.getById.mockResolvedValueOnce(baseProfile);
    dbMock.individualEntity.findUnique.mockResolvedValueOnce(individualEntity);
    OrganizationDaoMock.getReferenceById.mockImplementation(async (id) => {
      if (id === org1ReferenceModel.id) {
        return Promise.resolve(org1ReferenceModel);
      } else if (id === org2ReferenceModel.id) {
        return Promise.resolve(org2ReferenceModel);
      } else {
        throw new Error(`Unsupported id: ${id}`);
      }
    });

    await expect(
      IndividualDao.getById("profileId")
    ).resolves.toEqual<IndividualModel>({
      id: baseProfile.id,
      type: ProfileType.individual,
      name: baseProfile.name,
      description: baseProfile.description,
      links: baseProfile.links.map((l) => ({ url: l.url })),
      organizations: [
        {
          title: "org1Title",
          profileReference: org1ReferenceModel,
        },

        {
          title: "org2Title",
          profileReference: org2ReferenceModel,
        },
      ],
      tags: individualEntity.tags,
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

  test("getReferenceById handles base profile not found", async () => {
    BaseProfileDaoMock.getReferenceById.mockResolvedValueOnce(null);
    await expect(
      IndividualDao.getReferenceById("profileId")
    ).resolves.toBeNull();
  });

  test("getReferenceById ignores profile where type != individual", async () => {
    const baseProfile: BaseProfileReferenceModel = {
      id: "profileId",
      type: ProfileType.organization,
      name: "Profile name",
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
    };
    BaseProfileDaoMock.getReferenceById.mockResolvedValueOnce(baseProfile);

    await expect(
      IndividualDao.getReferenceById("profileId")
    ).resolves.toBeNull();
  });

  test("getReferenceById resolves profile reference", async () => {
    const baseProfileReference: BaseProfileReferenceModel = {
      id: "profileId",
      type: ProfileType.individual,
      name: "Profile name",
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
    };
    const individualEntity: IndividualEntity = {
      profileId: baseProfileReference.id,
      tags: ["musician", "instructor"],
    };
    BaseProfileDaoMock.getReferenceById.mockResolvedValueOnce(
      baseProfileReference
    );
    dbMock.individualEntity.findUnique.mockResolvedValueOnce(individualEntity);

    await expect(
      IndividualDao.getReferenceById("profileId")
    ).resolves.toEqual<IndividualReferenceModel>({
      id: baseProfileReference.id,
      type: ProfileType.individual,
      name: baseProfileReference.name,
      tags: individualEntity.tags,
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
