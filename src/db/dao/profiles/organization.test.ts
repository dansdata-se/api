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

import type { BaseProfileDAOType } from "@/db/dao/profiles/base_profile";
jest.mock("@/db/dao/profiles/base_profile", () => ({
  __esModule: true,
  BaseProfileDAO: mockDeep<BaseProfileDAOType>(),
}));
// prevent prettier from moving this import around
// prettier-ignore
import { BaseProfileDAO } from "@/db/dao/profiles/base_profile";

import type { IndividualDAOType } from "@/db/dao/profiles/individual";
jest.mock("@/db/dao/profiles/individual", () => ({
  __esModule: true,
  IndividualDAO: mockDeep<IndividualDAOType>(),
}));
// prevent prettier from moving this import around
// prettier-ignore
import { IndividualDAO } from "@/db/dao/profiles/individual";

import { OrganizationDAO } from "@/db/dao/profiles/organization";
import { BaseProfileModel, OrganizationModel } from "@/model/profiles/profile";
import {
  BaseProfileReferenceModel,
  IndividualReferenceModel,
  OrganizationReferenceModel,
} from "@/model/profiles/profile_reference";

describe("OrganizationDAO unit tests", () => {
  const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
  const BaseProfileDAOMock =
    BaseProfileDAO as unknown as DeepMockProxy<BaseProfileDAOType>;
  const IndividualDAOMock =
    IndividualDAO as unknown as DeepMockProxy<IndividualDAOType>;

  beforeEach(() => {
    mockReset(prismaMock);
    mockReset(BaseProfileDAOMock);
    mockReset(IndividualDAOMock);
  });

  test("getById handles base profile not found", async () => {
    BaseProfileDAOMock.getById.mockResolvedValueOnce(null);
    await expect(OrganizationDAO.getById("profileId")).resolves.toBeNull();
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
    BaseProfileDAOMock.getById.mockResolvedValueOnce(baseProfile);

    await expect(OrganizationDAO.getById("profileId")).resolves.toBeNull();
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
          title: "org1Title",
        },
        {
          individualId: individual2ReferenceModel.id,
          title: "org2Title",
        },
      ],
    };
    BaseProfileDAOMock.getById.mockResolvedValueOnce(baseProfile);
    prismaMock.organizationEntity.findUnique.mockResolvedValueOnce(
      organizationEntity
    );
    IndividualDAOMock.getReferenceById.mockImplementation(async (id) => {
      if (id === individual1ReferenceModel.id) {
        return individual1ReferenceModel;
      } else if (id === individual2ReferenceModel.id) {
        return individual2ReferenceModel;
      } else {
        throw `Unsupported id: ${id}`;
      }
    });

    await expect(
      OrganizationDAO.getById("profileId")
    ).resolves.toEqual<OrganizationModel>({
      id: baseProfile.id,
      type: ProfileType.organization,
      name: baseProfile.name,
      description: baseProfile.description,
      links: baseProfile.links.map((l) => ({ url: l.url })),
      members: [individual1ReferenceModel, individual2ReferenceModel],
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
    BaseProfileDAOMock.getReferenceById.mockResolvedValueOnce(null);
    await expect(
      OrganizationDAO.getReferenceById("profileId")
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
    BaseProfileDAOMock.getReferenceById.mockResolvedValueOnce(baseProfile);

    await expect(
      OrganizationDAO.getReferenceById("profileId")
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
    BaseProfileDAOMock.getReferenceById.mockResolvedValueOnce(
      baseProfileReference
    );
    prismaMock.organizationEntity.findUnique.mockResolvedValueOnce(
      organizationEntity
    );

    await expect(
      OrganizationDAO.getReferenceById("profileId")
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
