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

import type { BaseProfileDAOType } from "@/db/dao/profiles/base_profile";
jest.mock("@/db/dao/profiles/base_profile", () => ({
  __esModule: true,
  BaseProfileDAO: mockDeep<BaseProfileDAOType>(),
}));
// prevent prettier from moving this import around
// prettier-ignore
import { BaseProfileDAO } from "@/db/dao/profiles/base_profile";

import type { OrganizationDAOType } from "@/db/dao/profiles/organization";
jest.mock("@/db/dao/profiles/organization", () => ({
  __esModule: true,
  OrganizationDAO: mockDeep<OrganizationDAOType>(),
}));
// prevent prettier from moving this import around
// prettier-ignore
import { OrganizationDAO } from "@/db/dao/profiles/organization";

import { IndividualDAO } from "@/db/dao/profiles/individual";
import { BaseProfileModel, IndividualModel } from "@/model/profiles/profile";
import {
  BaseProfileReferenceModel,
  IndividualReferenceModel,
  OrganizationReferenceModel,
} from "@/model/profiles/profile_reference";

describe("IndividualDAO unit tests", () => {
  const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
  const BaseProfileDAOMock =
    BaseProfileDAO as unknown as DeepMockProxy<BaseProfileDAOType>;
  const OrganizationDAOMock =
    OrganizationDAO as unknown as DeepMockProxy<OrganizationDAOType>;

  beforeEach(() => {
    mockReset(prismaMock);
    mockReset(BaseProfileDAOMock);
    mockReset(OrganizationDAOMock);
  });

  test("getById handles base profile not found", async () => {
    BaseProfileDAOMock.getById.mockResolvedValueOnce(null);
    await expect(IndividualDAO.getById("profileId")).resolves.toBeNull();
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
    BaseProfileDAOMock.getById.mockResolvedValueOnce(baseProfile);

    await expect(IndividualDAO.getById("profileId")).resolves.toBeNull();
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
    BaseProfileDAOMock.getById.mockResolvedValueOnce(baseProfile);
    prismaMock.individualEntity.findUnique.mockResolvedValueOnce(
      individualEntity
    );
    OrganizationDAOMock.getReferenceById.mockImplementation(async (id) => {
      if (id === org1ReferenceModel.id) {
        return org1ReferenceModel;
      } else if (id === org2ReferenceModel.id) {
        return org2ReferenceModel;
      } else {
        throw `Unsupported id: ${id}`;
      }
    });

    await expect(
      IndividualDAO.getById("profileId")
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
    BaseProfileDAOMock.getReferenceById.mockResolvedValueOnce(null);
    await expect(
      IndividualDAO.getReferenceById("profileId")
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
    BaseProfileDAOMock.getReferenceById.mockResolvedValueOnce(baseProfile);

    await expect(
      IndividualDAO.getReferenceById("profileId")
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
    BaseProfileDAOMock.getReferenceById.mockResolvedValueOnce(
      baseProfileReference
    );
    prismaMock.individualEntity.findUnique.mockResolvedValueOnce(
      individualEntity
    );

    await expect(
      IndividualDAO.getReferenceById("profileId")
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
