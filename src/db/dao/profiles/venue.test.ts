/**
 * @group unit
 */

import { DbClient, exportedForTesting as dbTesting } from "@/db";
import { DeepMockProxy, mockDeep, mockReset } from "jest-mock-extended";
const dbMock = mockDeep<DbClient>();
dbTesting.overridePrismaClient(dbMock);

import { ProfileType } from "@prisma/client";

import type { BaseProfileDaoType } from "@/db/dao/profiles/base_profile";
jest.mock("@/db/dao/profiles/base_profile", () => ({
  __esModule: true,
  BaseProfileDao: mockDeep<BaseProfileDaoType>(),
}));
// prevent prettier from moving this import around
// prettier-ignore
import { BaseProfileDao } from "@/db/dao/profiles/base_profile";

import { generateVenueEntity } from "@/__test__/db/dao/profiles/venue";
import { generateBaseProfileModel } from "@/__test__/model/profiles/profile";
import { generateBaseProfileReferenceModel } from "@/__test__/model/profiles/profile_reference";
import { generateVenueReferenceModel } from "@/__test__/model/profiles/venues/profile_reference";
import { VenueDao } from "@/db/dao/profiles/venue";
import { VenueModel } from "@/model/profiles/venues/profile";
import { VenueReferenceModel } from "@/model/profiles/venues/profile_reference";
import { faker } from "@faker-js/faker";
import cuid2 from "@paralleldrive/cuid2";

describe("VenueDao unit tests", () => {
  const BaseProfileDaoMock =
    BaseProfileDao as unknown as DeepMockProxy<BaseProfileDaoType>;

  beforeEach(() => {
    mockReset(dbMock);
    mockReset(BaseProfileDaoMock);
  });

  test("getById handles base profile not found", async () => {
    BaseProfileDaoMock.getById.mockResolvedValueOnce(null);
    await expect(VenueDao.getById(cuid2.createId())).resolves.toBeNull();
  });

  test("getById ignores profile where type != venue", async () => {
    const baseProfile = generateBaseProfileModel({
      type: ProfileType.individual,
    });
    BaseProfileDaoMock.getById.mockResolvedValueOnce(baseProfile);

    await expect(VenueDao.getById(baseProfile.id)).resolves.toBeNull();
  });

  test("getById resolves profile", async () => {
    const baseProfile = generateBaseProfileModel({ type: ProfileType.venue });
    const parentVenue1Entity = generateVenueEntity();
    const parentVenue1ReferenceModel = generateVenueReferenceModel({
      id: parentVenue1Entity.profileId,
      coords: await parentVenue1Entity.coords,
    });
    const parentVenue2Entity = generateVenueEntity({
      parentId: parentVenue1Entity.profileId,
      ancestorIds: Promise.resolve([parentVenue1Entity.profileId]),
    });
    const parentVenue2ReferenceModel = generateVenueReferenceModel({
      id: parentVenue2Entity.profileId,
      coords: await parentVenue2Entity.coords,
    });
    const childEntities = Array.from({
      length: faker.number.int({ min: 0, max: 3 }),
    }).map(() =>
      generateVenueEntity({
        parentId: baseProfile.id,
        ancestorIds: Promise.resolve([
          parentVenue1Entity.profileId,
          parentVenue2Entity.profileId,
          baseProfile.id,
        ]),
      })
    );
    const childReferenceModels = await Promise.all(
      childEntities.map(async (it) =>
        generateVenueReferenceModel({
          id: it.profileId,
          coords: await it.coords,
        })
      )
    );
    const venueEntity = generateVenueEntity({
      profileId: baseProfile.id,
      parentId: parentVenue2ReferenceModel.id,
      ancestorIds: Promise.resolve([
        parentVenue1Entity.profileId,
        parentVenue2Entity.profileId,
      ]),
      childVenues: childReferenceModels.map((it) => ({
        profileId: it.id,
      })),
    });
    BaseProfileDaoMock.getById.mockResolvedValueOnce(baseProfile);
    dbMock.venueEntity.findUnique.mockImplementation(
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
    BaseProfileDaoMock.getReferenceById.mockImplementation(async (id) => {
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

    await expect(VenueDao.getById(baseProfile.id)).resolves.toEqual<VenueModel>(
      {
        id: baseProfile.id,
        type: ProfileType.venue,
        permanentlyClosed: false,
        name: baseProfile.name,
        description: baseProfile.description,
        links: baseProfile.links,
        coords: await venueEntity.coords,
        ancestors: [parentVenue1ReferenceModel, parentVenue2ReferenceModel],
        children: childReferenceModels,
        images: baseProfile.images,
      }
    );
  });

  test("getReferenceById handles base profile not found", async () => {
    BaseProfileDaoMock.getReferenceById.mockResolvedValueOnce(null);
    await expect(
      VenueDao.getReferenceById(cuid2.createId())
    ).resolves.toBeNull();
  });

  test("getReferenceById ignores profile where type != venue", async () => {
    const baseProfileReference = generateBaseProfileReferenceModel({
      type: ProfileType.individual,
    });
    BaseProfileDaoMock.getReferenceById.mockResolvedValueOnce(
      baseProfileReference
    );

    await expect(
      VenueDao.getReferenceById(baseProfileReference.id)
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
      parentId: parentVenue1Entity.profileId,
      ancestorIds: Promise.resolve([parentVenue1Entity.profileId]),
    });
    const parentVenue2ReferenceModel = generateVenueReferenceModel({
      id: parentVenue2Entity.profileId,
      coords: await parentVenue2Entity.coords,
    });
    const childEntities = Array.from({
      length: faker.number.int({ min: 0, max: 3 }),
    }).map(() =>
      generateVenueEntity({
        parentId: baseProfileReference.id,
        ancestorIds: Promise.resolve([baseProfileReference.id]),
      })
    );
    const childReferenceModels = await Promise.all(
      childEntities.map(async (it) =>
        generateVenueReferenceModel({
          id: it.profileId,
          coords: await it.coords,
        })
      )
    );
    const venueEntity = generateVenueEntity({
      profileId: baseProfileReference.id,
      parentId: parentVenue2ReferenceModel.id,
      ancestorIds: Promise.resolve([parentVenue2ReferenceModel.id]),
      childVenues: childReferenceModels.map((it) => ({
        profileId: it.id,
      })),
    });
    BaseProfileDaoMock.getReferenceById.mockResolvedValueOnce(
      baseProfileReference
    );
    dbMock.venueEntity.findUnique.mockResolvedValueOnce(venueEntity);
    dbMock.venueEntity.findUnique.mockImplementation(
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
    BaseProfileDaoMock.getReferenceById.mockImplementation(async (id) => {
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
      VenueDao.getReferenceById(baseProfileReference.id)
    ).resolves.toEqual<VenueReferenceModel>({
      id: baseProfileReference.id,
      type: ProfileType.venue,
      permanentlyClosed: false,
      name: baseProfileReference.name,
      coords: await venueEntity.coords,
      images: baseProfileReference.images,
    });
  });
});
