/**
 * @group unit
 */

import {
  ImageVariant,
  IndividualEntity,
  PrismaClient,
  ProfileType,
} from "@prisma/client";
import { DeepMockProxy, mockDeep, mockReset } from "jest-mock-extended";

jest.mock("@/db", () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));
// prevent prettier from moving this import around
// prettier-ignore
import { prisma } from "@/db";

import type { BaseProfileDaoType } from "@/db/dao/profiles/base_profile";
jest.mock("@/db/dao/profiles/base_profile", () => ({
  __esModule: true,
  BaseProfileDao: mockDeep<BaseProfileDaoType>(),
}));
// prevent prettier from moving this import around
// prettier-ignore
import { BaseProfileDao } from "@/db/dao/profiles/base_profile";

import type { OrganizationDaoType } from "@/db/dao/profiles/organization";
jest.mock("@/db/dao/profiles/organization", () => ({
  __esModule: true,
  OrganizationDao: mockDeep<OrganizationDaoType>(),
}));
// prevent prettier from moving this import around
// prettier-ignore
import { OrganizationDao } from "@/db/dao/profiles/organization";

import { IndividualDao } from "@/db/dao/profiles/individual";
import { BaseProfileModel, IndividualModel } from "@/model/profiles/profile";
import {
  BaseProfileReferenceModel,
  IndividualReferenceModel,
  OrganizationReferenceModel,
} from "@/model/profiles/profile_reference";

describe("IndividualDao unit tests", () => {
  const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
  const BaseProfileDaoMock =
    BaseProfileDao as unknown as DeepMockProxy<BaseProfileDaoType>;
  const OrganizationDaoMock =
    OrganizationDao as unknown as DeepMockProxy<OrganizationDaoType>;

  beforeEach(() => {
    mockReset(prismaMock);
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
    prismaMock.individualEntity.findUnique.mockResolvedValueOnce(
      individualEntity
    );
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
      organizations: [org1ReferenceModel, org2ReferenceModel],
      tags: individualEntity.tags,
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
    };
    const individualEntity: IndividualEntity = {
      profileId: baseProfileReference.id,
      tags: ["musician", "instructor"],
    };
    BaseProfileDaoMock.getReferenceById.mockResolvedValueOnce(
      baseProfileReference
    );
    prismaMock.individualEntity.findUnique.mockResolvedValueOnce(
      individualEntity
    );

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
