/**
 * @group unit
 */

import {
  ImageVariant,
  OrganizationEntity,
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

import type { IndividualDaoType } from "@/db/dao/profiles/individual";
jest.mock("@/db/dao/profiles/individual", () => ({
  __esModule: true,
  IndividualDao: mockDeep<IndividualDaoType>(),
}));
// prevent prettier from moving this import around
// prettier-ignore
import { IndividualDao } from "@/db/dao/profiles/individual";

import { OrganizationDao } from "@/db/dao/profiles/organization";
import { BaseProfileModel, OrganizationModel } from "@/model/profiles/profile";
import {
  BaseProfileReferenceModel,
  IndividualReferenceModel,
  OrganizationReferenceModel,
} from "@/model/profiles/profile_reference";

describe("OrganizationDao unit tests", () => {
  const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
  const BaseProfileDaoMock =
    BaseProfileDao as unknown as DeepMockProxy<BaseProfileDaoType>;
  const IndividualDaoMock =
    IndividualDao as unknown as DeepMockProxy<IndividualDaoType>;

  beforeEach(() => {
    mockReset(prismaMock);
    mockReset(BaseProfileDaoMock);
    mockReset(IndividualDaoMock);
  });

  test("getById handles base profile not found", async () => {
    BaseProfileDaoMock.getById.mockResolvedValueOnce(null);
    await expect(OrganizationDao.getById("profileId")).resolves.toBeNull();
  });

  test("getById ignores profile where type != organization", async () => {
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
    BaseProfileDaoMock.getById.mockResolvedValueOnce(baseProfile);

    await expect(OrganizationDao.getById("profileId")).resolves.toBeNull();
  });

  test("getById resolves profile", async () => {
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
    const individual1ReferenceModel: IndividualReferenceModel = {
      id: "ind1Id",
      type: ProfileType.individual,
      name: "Individual 1 name",
      tags: ["musician"],
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
    const individual2ReferenceModel: IndividualReferenceModel = {
      id: "ind2Id",
      type: ProfileType.individual,
      name: "Individual 2 name",
      tags: ["instructor", "organizer"],
      images: {
        cover: null,
        poster: null,
        square: null,
      },
    };
    const organizationEntity: OrganizationEntity & {
      members: {
        individualId: string;
        title: string;
      }[];
    } = {
      profileId: baseProfile.id,
      tags: ["educator", "organizer"],
      members: [
        {
          individualId: individual1ReferenceModel.id,
          title: "individual1Title",
        },
        {
          individualId: individual2ReferenceModel.id,
          title: "individual2Title",
        },
      ],
    };
    BaseProfileDaoMock.getById.mockResolvedValueOnce(baseProfile);
    prismaMock.organizationEntity.findUnique.mockResolvedValueOnce(
      organizationEntity
    );
    IndividualDaoMock.getReferenceById.mockImplementation(async (id) => {
      if (id === individual1ReferenceModel.id) {
        return Promise.resolve(individual1ReferenceModel);
      } else if (id === individual2ReferenceModel.id) {
        return Promise.resolve(individual2ReferenceModel);
      } else {
        throw new Error(`Unsupported id: ${id}`);
      }
    });

    await expect(
      OrganizationDao.getById("profileId")
    ).resolves.toEqual<OrganizationModel>({
      id: baseProfile.id,
      type: ProfileType.organization,
      name: baseProfile.name,
      description: baseProfile.description,
      links: baseProfile.links.map((l) => ({ url: l.url })),
      members: [
        {
          title: "individual1Title",
          profileReference: individual1ReferenceModel,
        },
        {
          title: "individual2Title",
          profileReference: individual2ReferenceModel,
        },
      ],
      tags: organizationEntity.tags,
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
      OrganizationDao.getReferenceById("profileId")
    ).resolves.toBeNull();
  });

  test("getReferenceById ignores profile where type != organization", async () => {
    const baseProfile: BaseProfileReferenceModel = {
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
    BaseProfileDaoMock.getReferenceById.mockResolvedValueOnce(baseProfile);

    await expect(
      OrganizationDao.getReferenceById("profileId")
    ).resolves.toBeNull();
  });

  test("getReferenceById resolves profile reference", async () => {
    const baseProfileReference: BaseProfileReferenceModel = {
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
    const organizationEntity: OrganizationEntity = {
      profileId: baseProfileReference.id,
      tags: ["educator", "organizer"],
    };
    BaseProfileDaoMock.getReferenceById.mockResolvedValueOnce(
      baseProfileReference
    );
    prismaMock.organizationEntity.findUnique.mockResolvedValueOnce(
      organizationEntity
    );

    await expect(
      OrganizationDao.getReferenceById("profileId")
    ).resolves.toEqual<OrganizationReferenceModel>({
      id: baseProfileReference.id,
      type: ProfileType.organization,
      name: baseProfileReference.name,
      tags: organizationEntity.tags,
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
