/**
 * @group unit
 */

import { PrismaClient, ProfileType } from "@prisma/client";
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

import { generateVenueEntity } from "@/__test__/db/dao/profiles/venue";
import { generateBaseProfileModel } from "@/__test__/model/profiles/profile";
import {
  generateBaseProfileReferenceModel,
  generateVenueReferenceModel,
} from "@/__test__/model/profiles/profile_reference";
import { VenueDAO } from "@/db/dao/profiles/venue";
import { VenueModel } from "@/model/profiles/profile";
import { VenueReferenceModel } from "@/model/profiles/profile_reference";
import { faker } from "@faker-js/faker";
import cuid2 from "@paralleldrive/cuid2";

describe("VenueDAO unit tests", () => {
  const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
  const BaseProfileDAOMock =
    BaseProfileDAO as unknown as DeepMockProxy<BaseProfileDAOType>;

  beforeEach(() => {
    mockReset(prismaMock);
    mockReset(BaseProfileDAOMock);
  });

  test("getById handles base profile not found", async () => {
    BaseProfileDAOMock.getById.mockResolvedValueOnce(null);
    await expect(VenueDAO.getById(cuid2.createId())).resolves.toBeNull();
  });

  test("getById ignores profile where type != venue", async () => {
    const baseProfile = generateBaseProfileModel({
      type: ProfileType.individual,
    });
    BaseProfileDAOMock.getById.mockResolvedValueOnce(baseProfile);

    await expect(VenueDAO.getById(baseProfile.id)).resolves.toBeNull();
  });

  test("getById resolves profile", async () => {
    const baseProfile = generateBaseProfileModel({ type: ProfileType.venue });
    const parentVenue1Entity = generateVenueEntity();
    const parentVenue1ReferenceModel = generateVenueReferenceModel({
      id: parentVenue1Entity.profileId,
      coords: await parentVenue1Entity.coords,
    });
    const parentVenue2Entity = generateVenueEntity({
      rootParentId: Promise.resolve(parentVenue1Entity.profileId),
    });
    const parentVenue2ReferenceModel = generateVenueReferenceModel({
      id: parentVenue2Entity.profileId,
      coords: await parentVenue2Entity.coords,
      rootParent: parentVenue1ReferenceModel,
    });
    const childEntities = Array.from({
      length: faker.number.int({ min: 0, max: 3 }),
    }).map(() =>
      generateVenueEntity({
        rootParentId: Promise.resolve(parentVenue1Entity.profileId),
      })
    );
    const childReferenceModels = await Promise.all(
      childEntities.map(async (it) =>
        generateVenueReferenceModel({
          id: it.profileId,
          coords: await it.coords,
          rootParent: parentVenue1ReferenceModel,
        })
      )
    );
    const venueEntity = generateVenueEntity({
      profileId: baseProfile.id,
      rootParentId: Promise.resolve(parentVenue1ReferenceModel.id),
      parentId: parentVenue2ReferenceModel.id,
      childVenues: childReferenceModels.map((it) => ({
        profileId: it.id,
      })),
    });
    BaseProfileDAOMock.getById.mockResolvedValueOnce(baseProfile);
    prismaMock.venueEntity.findUnique.mockImplementation(
      // @ts-expect-error <- typescript is concerned that we do
      // not support _all_ possible variations of findUnique.
      (args) => {
        const needle = args.where.profileId;
        const child = childEntities.find((it) => it.profileId === needle);
        if (child) return Promise.resolve(child);

        switch (needle) {
          case parentVenue1Entity.profileId:
            return Promise.resolve(parentVenue1Entity);
          case parentVenue2Entity.profileId:
            return Promise.resolve(parentVenue2Entity);
          case venueEntity.profileId:
            return Promise.resolve(venueEntity);
          default:
            return Promise.resolve(null);
        }
      }
    );
    BaseProfileDAOMock.getReferenceById.mockImplementation(async (id) => {
      const child = childReferenceModels.find((it) => it.id === id);
      if (child) return Promise.resolve(child);
      switch (id) {
        case parentVenue1ReferenceModel.id:
          return Promise.resolve(parentVenue1ReferenceModel);
        case parentVenue2ReferenceModel.id:
          return Promise.resolve(parentVenue2ReferenceModel);
        default:
          return Promise.resolve(null);
      }
    });

    await expect(VenueDAO.getById(baseProfile.id)).resolves.toEqual<VenueModel>(
      {
        id: baseProfile.id,
        type: ProfileType.venue,
        name: baseProfile.name,
        description: baseProfile.description,
        links: baseProfile.links,
        coords: await venueEntity.coords,
        parent: parentVenue2ReferenceModel,
        rootParent: parentVenue1ReferenceModel,
        children: childReferenceModels,
        images: baseProfile.images,
      }
    );
  });

  test("getReferenceById handles base profile not found", async () => {
    BaseProfileDAOMock.getReferenceById.mockResolvedValueOnce(null);
    await expect(
      VenueDAO.getReferenceById(cuid2.createId())
    ).resolves.toBeNull();
  });

  test("getReferenceById ignores profile where type != venue", async () => {
    const baseProfileReference = generateBaseProfileReferenceModel({
      type: ProfileType.individual,
    });
    BaseProfileDAOMock.getReferenceById.mockResolvedValueOnce(
      baseProfileReference
    );

    await expect(
      VenueDAO.getReferenceById(baseProfileReference.id)
    ).resolves.toBeNull();
  });

  test("getReferenceById resolves profile reference", async () => {
    const baseProfileReference = generateBaseProfileReferenceModel({
      type: ProfileType.venue,
    });
    const parentVenue1Entity = generateVenueEntity();
    const parentVenue1ReferenceModel = generateVenueReferenceModel({
      id: parentVenue1Entity.profileId,
      coords: await parentVenue1Entity.coords,
    });
    const parentVenue2Entity = generateVenueEntity({
      rootParentId: Promise.resolve(parentVenue1Entity.profileId),
    });
    const parentVenue2ReferenceModel = generateVenueReferenceModel({
      id: parentVenue2Entity.profileId,
      coords: await parentVenue2Entity.coords,
      rootParent: parentVenue1ReferenceModel,
    });
    const childEntities = Array.from({
      length: faker.number.int({ min: 0, max: 3 }),
    }).map(() =>
      generateVenueEntity({
        rootParentId: Promise.resolve(parentVenue1Entity.profileId),
      })
    );
    const childReferenceModels = await Promise.all(
      childEntities.map(async (it) =>
        generateVenueReferenceModel({
          id: it.profileId,
          coords: await it.coords,
          rootParent: parentVenue1ReferenceModel,
        })
      )
    );
    const venueEntity = generateVenueEntity({
      profileId: baseProfileReference.id,
      rootParentId: Promise.resolve(parentVenue1ReferenceModel.id),
      parentId: parentVenue2ReferenceModel.id,
      childVenues: childReferenceModels.map((it) => ({
        profileId: it.id,
      })),
    });
    BaseProfileDAOMock.getReferenceById.mockResolvedValueOnce(
      baseProfileReference
    );
    prismaMock.venueEntity.findUnique.mockResolvedValueOnce(venueEntity);
    prismaMock.venueEntity.findUnique.mockImplementation(
      // @ts-expect-error <- typescript is concerned that we do
      // not support _all_ possible variations of findUnique.
      (args) => {
        const needle = args.where.profileId;
        const child = childEntities.find((it) => it.profileId === needle);
        if (child) return Promise.resolve(child);

        switch (needle) {
          case parentVenue1Entity.profileId:
            return Promise.resolve(parentVenue1Entity);
          case parentVenue2Entity.profileId:
            return Promise.resolve(parentVenue2Entity);
          case venueEntity.profileId:
            return Promise.resolve(venueEntity);
          default:
            return Promise.resolve(null);
        }
      }
    );
    BaseProfileDAOMock.getReferenceById.mockImplementation(async (id) => {
      const child = childReferenceModels.find((it) => it.id === id);
      if (child) return Promise.resolve(child);
      switch (id) {
        case parentVenue1ReferenceModel.id:
          return Promise.resolve(parentVenue1ReferenceModel);
        case parentVenue2ReferenceModel.id:
          return Promise.resolve(parentVenue2ReferenceModel);
        default:
          return Promise.resolve(null);
      }
    });

    await expect(
      VenueDAO.getReferenceById(baseProfileReference.id)
    ).resolves.toEqual<VenueReferenceModel>({
      id: baseProfileReference.id,
      type: ProfileType.venue,
      name: baseProfileReference.name,
      coords: await venueEntity.coords,
      images: baseProfileReference.images,
      rootParent: parentVenue1ReferenceModel,
    });
  });
});
