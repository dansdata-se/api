/**
 * @group integration
 */

import { withTestDatabaseForAll, withTestDatabaseForEach } from "@/__test__/db";
import { generateCoordsModel } from "@/__test__/model/profiles/coords";
import { generateCreateVenueModel } from "@/__test__/model/profiles/venues/create";
import { getDbClient } from "@/db";
import { VenueDao } from "@/db/dao/profiles/venue";
import env from "@/env";
import { mapVenueModelToReferenceModel } from "@/mapping/profiles/venues/profile";
import { CreateVenueModel } from "@/model/profiles/venues/create";
import { VenueFilterModel } from "@/model/profiles/venues/filter";
import { VenueModel } from "@/model/profiles/venues/profile";
import { VenueReferenceModel } from "@/model/profiles/venues/reference";
import { faker } from "@faker-js/faker";
import { ProfileType, VenueEntity } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

describe("Venue hierarchy constraints", () => {
  withTestDatabaseForEach();

  async function expectConstraintViolation(
    profileId: VenueModel["id"],
    promise: Promise<unknown>
  ) {
    await expect(promise).rejects.toThrowError(PrismaClientKnownRequestError);
    await expect(promise).rejects.toMatchObject<
      Partial<PrismaClientKnownRequestError>
    >({
      code: "P2010",
    });
    expect(
      (
        (await promise.catch(
          (it) => it as PrismaClientKnownRequestError
        )) as PrismaClientKnownRequestError
      ).message
    ).toContain(
      `Profile with id ${profileId} is already present in the venue hierarchy`
    );
  }

  test.each([
    // Connect to self
    { count: 1, childIndex: 0, parentIndex: 0 },

    // Connect head to tail
    { count: 2, childIndex: 0, parentIndex: 1 },
    { count: 3, childIndex: 0, parentIndex: 2 },
    { count: 100, childIndex: 0, parentIndex: 99 },

    // Connect random points inside hierarchy
    { count: 3, childIndex: 1, parentIndex: 2 },
    { count: 3, childIndex: 0, parentIndex: 1 },
    { count: 100, childIndex: 30, parentIndex: 70 },

    // Connect to self while inside hierarchy with other nodes
    { count: 100, childIndex: 50, parentIndex: 50 },
  ])(
    "constraint prevents loop from forming when connecting node $childIndex to node $parentIndex via UPDATE (total nodes: $count)",
    async ({
      count,
      childIndex,
      parentIndex,
    }: {
      count: number;
      childIndex: number;
      parentIndex: number;
    }) => {
      // Arrange
      const models: VenueModel[] = [];
      for (let i = 0; i < count; i++) {
        const createModel = generateCreateVenueModel({
          parentId: models.at(-1)?.id ?? null,
        });
        models.push(await VenueDao.create(createModel));
      }

      // Act
      const promise = getDbClient().venueEntity.update({
        id: models[childIndex].id,
        type: ProfileType.venue,
        parentId: models[parentIndex].id,
      });

      // Assert
      await expectConstraintViolation(models[childIndex].id, promise);
    }
  );
});

describe("Venues manual SQL", () => {
  withTestDatabaseForEach();

  test("update coords field", async () => {
    // Arrange
    const model = await VenueDao.create(generateCreateVenueModel());
    const newCoords = generateCoordsModel();

    // Act
    await getDbClient().venueEntity.update({
      id: model.id,
      type: ProfileType.venue,
      coords: newCoords,
    });

    // Assert
    await expect(VenueDao.getById(model.id)).resolves.toMatchObject<
      Pick<VenueModel, "coords">
    >({
      coords: newCoords,
    });
  });

  test("update permanentlyClosed field", async () => {
    // Arrange
    const model = await VenueDao.create(
      generateCreateVenueModel({
        permanentlyClosed: false,
      })
    );

    // Act
    await getDbClient().venueEntity.update({
      id: model.id,
      type: ProfileType.venue,
      permanentlyClosed: true,
    });

    // Assert
    await expect(VenueDao.getById(model.id)).resolves.toMatchObject<
      Pick<VenueModel, "permanentlyClosed">
    >({
      permanentlyClosed: true,
    });
  });

  test("update parentId field", async () => {
    // Arrange
    const model1 = await VenueDao.create(generateCreateVenueModel());
    const model2 = await VenueDao.create(generateCreateVenueModel());

    // Act
    await getDbClient().venueEntity.update({
      id: model2.id,
      type: ProfileType.venue,
      parentId: model1.id,
    });

    // Assert
    await expect(VenueDao.getById(model1.id)).resolves.toMatchObject<
      Pick<VenueModel, "children">
    >({
      children: [mapVenueModelToReferenceModel(model2)],
    });
    await expect(VenueDao.getById(model2.id)).resolves.toMatchObject<
      Pick<VenueModel, "ancestors">
    >({
      ancestors: [mapVenueModelToReferenceModel(model1)],
    });
  });

  test("retrieve coordinates for a venue", async () => {
    // Arrange
    const db = getDbClient();

    const createLinkoping = generateCreateVenueModel({
      name: "Linköping",
      coords: {
        lat: 58.41616195587502,
        lng: 15.625933242341707,
      },
    });

    const linkoping = await VenueDao.create(createLinkoping);

    // Act
    const coords = await db.venueEntity
      .findUnique({
        select: {
          coords: true,
        },
        where: {
          profileId: linkoping.id,
        },
      })
      .then((it) => it?.coords);

    // Assert
    expect(coords?.lat).toBeCloseTo(linkoping.coords.lat, 6);
    expect(coords?.lng).toBeCloseTo(linkoping.coords.lng, 6);
  });

  test("retrieve the ancestors for a venue", async () => {
    // Arrange
    const db = getDbClient();

    const rootCreate = generateCreateVenueModel();
    const sub1Create = generateCreateVenueModel();
    const sub2Create = generateCreateVenueModel();
    const leafCreate = generateCreateVenueModel();

    const createTree = [rootCreate, sub1Create, sub2Create, leafCreate];
    const tree: VenueModel[] = [];

    for (let i = 0; i < createTree.length; i++) {
      if (i > 0) {
        createTree[i].parentId = tree[i - 1].id;
      }
      tree.push(await VenueDao.create(createTree[i]));
    }

    // Act
    const actual = await db.venueEntity
      .findMany({
        select: {
          profileId: true,
          ancestors: {
            select: {
              parentId: true,
            },
            orderBy: {
              distance: "desc",
            },
          },
        },
      })
      .then((result) =>
        result.map((it) => ({
          id: it.profileId,
          ancestorIds: it.ancestors.map((it) => it.parentId),
        }))
      )
      .then((result) =>
        // Restore original list order
        result.sort(
          (a, b) =>
            tree.findIndex((branch) => branch.id === a.id) -
            tree.findIndex((branch) => branch.id === b.id)
        )
      );

    // Assert
    expect(actual).toEqual(
      tree.map((it) => ({
        id: it.id,
        ancestorIds: it.ancestors.map((it) => it.id),
      }))
    );
  });
});

describe("Venues manual SQL: findManyByFilter", () => {
  withTestDatabaseForAll();

  const origin = {
    lat: 58.41616195587502,
    lng: 15.625933242341707,
  };

  interface TestVenue {
    distanceToOrigin: number;
    createModel: CreateVenueModel;
    children: TestVenue[];
  }
  /**
   * A list of venues with various tree sizes for testing.
   *
   * Note that this list aims to provide good test data rather than accurate venues.
   * The data may therefore be inaccurate or use subdivisions (such as cities) that
   * are not intended to be present in the production system.
   */
  const testVenues: TestVenue[] = [
    {
      distanceToOrigin: 618,
      createModel: generateCreateVenueModel({
        name: "Linköping",
        coords: {
          lat: 58.4118163514212,
          lng: 15.619312724913462,
        },
      }),
      children: [
        {
          distanceToOrigin: 1271,
          createModel: generateCreateVenueModel({
            name: "Tornhagsskolan",
            coords: {
              lat: 58.4105125,
              lng: 15.6069576,
            },
          }),
          children: [
            {
              distanceToOrigin: 1979,
              createModel: generateCreateVenueModel({
                name: "Norra salen",
                coords: {
                  lat: 58.414013,
                  lng: 15.59221,
                },
              }),
              children: [],
            },
            {
              distanceToOrigin: 1977,
              createModel: generateCreateVenueModel({
                name: "Södra salen",
                coords: {
                  lat: 58.413879,
                  lng: 15.59227,
                },
              }),
              children: [],
            },
          ],
        },
        {
          distanceToOrigin: 799,
          createModel: generateCreateVenueModel({
            name: "Dansens hus",
            coords: {
              lat: 58.4116341,
              lng: 15.6152829,
            },
          }),
          children: [],
        },
      ],
    },
    {
      distanceToOrigin: 12_556,
      createModel: generateCreateVenueModel({
        name: "Ljungsbro",
        coords: {
          lat: 58.50563179706094,
          lng: 15.494221140260903,
        },
      }),
      children: [
        {
          distanceToOrigin: 12535,
          createModel: generateCreateVenueModel({
            name: "Folkets Park",
            coords: {
              lat: 58.50542350489035,
              lng: 15.494302818810569,
            },
          }),
          children: [
            {
              distanceToOrigin: 12553,
              createModel: generateCreateVenueModel({
                name: "Inomhus",
                permanentlyClosed: false,
                coords: {
                  lat: 58.50555329334717,
                  lng: 15.494109735187303,
                },
              }),
              children: [],
            },
            {
              distanceToOrigin: 12520,
              createModel: generateCreateVenueModel({
                name: "Utomhus",
                permanentlyClosed: true,
                coords: {
                  lat: 58.50559249525875,
                  lng: 15.495151075561814,
                },
              }),
              children: [],
            },
          ],
        },
      ],
    },
    {
      distanceToOrigin: 24_246,
      createModel: generateCreateVenueModel({
        name: "Borensberg",
        coords: {
          lat: 58.55553782832458,
          lng: 15.305118297934813,
        },
      }),
      children: [],
    },
    {
      distanceToOrigin: 35_272,
      createModel: generateCreateVenueModel({
        name: "Norrköping",
        coords: {
          lat: 58.5776551226464,
          lng: 16.148422882592975,
        },
      }),
      children: [],
    },
    {
      distanceToOrigin: 75_577,
      createModel: generateCreateVenueModel({
        name: "Södra Vi",
        coords: {
          lat: 57.7422407209703,
          lng: 15.792965255566815,
        },
      }),
      children: [],
    },
    {
      distanceToOrigin: 96_033,
      createModel: generateCreateVenueModel({
        name: "Örebro",
        coords: {
          lat: 59.24684390768979,
          lng: 15.16925002256166,
        },
      }),
      children: [],
    },
    {
      distanceToOrigin: 112_111,
      createModel: generateCreateVenueModel({
        name: "Jönköping",
        coords: {
          lat: 57.78247783258018,
          lng: 14.141843832283167,
        },
      }),
      children: [],
    },
    {
      distanceToOrigin: 228_116,
      createModel: generateCreateVenueModel({
        name: "Göteborg",
        coords: {
          lat: 57.69483118235473,
          lng: 11.995524355564582,
        },
      }),
      children: [
        {
          distanceToOrigin: 228840,
          createModel: generateCreateVenueModel({
            name: "Heden",
            coords: {
              lat: 57.7023151,
              lng: 11.9767316,
            },
          }),
          children: [
            {
              distanceToOrigin: 228486,
              createModel: generateCreateVenueModel({
                name: "Liseberg",
                coords: {
                  lat: 57.693742,
                  lng: 11.9896392,
                },
              }),
              children: [
                {
                  distanceToOrigin: 228269,
                  createModel: generateCreateVenueModel({
                    name: "Polketten",
                    coords: {
                      lat: 57.6947144,
                      lng: 11.9928409,
                    },
                  }),
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    },
  ];
  // Populated, rounded and sorted in beforeAll.
  const distancesToOrigin: {
    profileId: VenueEntity["profileId"];
    distance: number;
  }[] = [];
  // Populated and sorted (using swedish locale) in beforeAll.
  const rootVenueIds: VenueModel["id"][] = [];
  // Populated and sorted (using swedish locale) in beforeAll.
  const leafVenueIds: VenueModel["id"][] = [];
  // Assigned in beforeAll.
  let totalCreatedVenueCount = 0;
  let totalCreatedNotPermanentlyClosedVenueCount = 0;

  beforeAll(async () => {
    // Semi-random order. We are still creating venues in a top-down fashion.
    async function createTestVenuesInRandomOrder(venues: TestVenue[]) {
      if (venues.length === 0) return;

      for (const venue of faker.helpers.shuffle(venues)) {
        totalCreatedVenueCount++;
        if (!venue.createModel.permanentlyClosed) {
          totalCreatedNotPermanentlyClosedVenueCount++;
        }

        const created = await VenueDao.create(venue.createModel);
        distancesToOrigin.push({
          profileId: created.id,
          distance: Math.round(venue.distanceToOrigin),
        });
        if (venue.createModel.parentId === null) {
          rootVenueIds.push(created.id);
        }
        if (venue.children.length === 0) {
          leafVenueIds.push(created.id);
        }
        venue.children.forEach((it) => (it.createModel.parentId = created.id));
      }

      await createTestVenuesInRandomOrder(
        faker.helpers.shuffle(venues.flatMap((it) => it.children))
      );
    }
    await createTestVenuesInRandomOrder(testVenues);
    rootVenueIds.sort((a, b) => a.localeCompare(b, "sv-SE"));
    leafVenueIds.sort((a, b) => a.localeCompare(b, "sv-SE"));
    distancesToOrigin.sort((a, b) => a.distance - b.distance);
  });

  test("validate test data assumptions", () => {
    expect(distancesToOrigin).toHaveLength(totalCreatedVenueCount);
    expect(totalCreatedNotPermanentlyClosedVenueCount).not.toEqual(
      totalCreatedVenueCount
    );
    expect(rootVenueIds.length).not.toEqual(leafVenueIds.length);
  });

  /**
   * Retrieve all results matching the given filter.
   *
   * This helper function allows tests to focus on the actual data rather than pagination.
   */
  async function findAllByFilter(
    filterModel: Omit<VenueFilterModel, "pageKey">
  ) {
    const retrievedVenues: Awaited<
      ReturnType<
        ReturnType<typeof getDbClient>["venueEntity"]["findManyByFilter"]
      >
    > = [];
    for (
      let firstIteration = true, pageKey = null;
      firstIteration || pageKey !== null;
      firstIteration = false
    ) {
      const result = await getDbClient().venueEntity.findManyByFilter({
        ...filterModel,
        pageKey,
      });

      // Sanity check to avoid infinite loop
      if (!firstIteration) {
        expect(result).not.toHaveLength(0);
      }

      // Ensure result size does not exceed page size
      // (note that page size + 1 items should be returned as the
      // extra item is used as a key to retrieve the next page!)
      expect(result).toHaveLength(
        Math.min(result.length, env.RESULT_PAGE_SIZE + 1)
      );

      // Verify assumptions about pageKey
      if (!firstIteration) {
        expect(result[0].profileId).toEqual(pageKey);
      }

      retrievedVenues.push(...result.slice(0, env.RESULT_PAGE_SIZE));

      pageKey = result.at(env.RESULT_PAGE_SIZE)?.profileId ?? null;
    }
    // Ensure list does not contain duplicate profiles
    expect(
      new Set(retrievedVenues.map((it) => it.profileId)).size ===
        retrievedVenues.length
    ).toBeTruthy();

    return retrievedVenues;
  }

  async function expandToReferenceModel(
    this: void,
    result: Awaited<ReturnType<typeof findAllByFilter>>
  ): Promise<
    (VenueReferenceModel & {
      nameSimilarity: number | null;
      distance: number | null;
    })[]
  > {
    return Promise.all(
      result.map(async (it) => ({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ...(await VenueDao.getReferenceById(it.profileId))!,
        nameSimilarity: it.nameSimilarity,
        distance: it.distance,
      }))
    );
  }

  test("sorts by and prioritizes name similarity over distance when a name query is given", async () => {
    const result = await findAllByFilter({
      near: origin,
      nameQuery: "södra v",
      level: "any",
      includePermanentlyClosed: true,
    }).then(expandToReferenceModel);

    expect(result).toHaveLength(2);
    result.forEach((it) => {
      expect(it).not.toMatchObject<Partial<typeof it>>({
        nameSimilarity: null,
      });
      expect(it).not.toMatchObject<Partial<typeof it>>({
        distance: null,
      });
    });
    // Ensure name outranks distance
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(result[0].distance).toBeGreaterThan(result[1].distance!);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(result[0].nameSimilarity).toBeGreaterThan(result[1].nameSimilarity!);
    expect(result[0]).toMatchObject<Partial<(typeof result)[0]>>({
      name: "Södra Vi",
    });
    expect(result[1]).toMatchObject<Partial<(typeof result)[0]>>({
      name: "Södra salen",
    });
  });

  test("sorts by distance when lat/lng but no name query is given", async () => {
    const result = await findAllByFilter({
      near: origin,
      nameQuery: null,
      level: "any",
      includePermanentlyClosed: true,
    });

    expect(result).toHaveLength(totalCreatedVenueCount);
    result.forEach((it) => {
      expect(it).toMatchObject<Partial<typeof it>>({
        nameSimilarity: null,
      });
      expect(it).not.toMatchObject<Partial<typeof it>>({
        distance: null,
      });
    });
    // Is result returned in distance order?
    expect(result).toEqual(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      [...result].sort((a, b) => a.distance! - b.distance!)
    );
    // Do these distances match what we would expect?
    expect(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      result.map((it) => ({ ...it, distance: Math.round(it.distance!) }))
    ).toMatchObject(distancesToOrigin);
  });

  test("sorts by name no lat/lng or name query is given", async () => {
    const result = await findAllByFilter({
      near: null,
      nameQuery: null,
      level: "any",
      includePermanentlyClosed: true,
    }).then(expandToReferenceModel);

    expect(result).toHaveLength(totalCreatedVenueCount);
    result.forEach((it) => {
      expect(it).toMatchObject<Partial<typeof it>>({
        nameSimilarity: null,
        distance: null,
      });
    });
    expect(result).toEqual(
      result.sort((a, b) => a.name.localeCompare(b.name, "sv-SE"))
    );
  });

  test("can limit results to root nodes", async () => {
    const result = await findAllByFilter({
      near: origin,
      nameQuery: null,
      level: "root",
      includePermanentlyClosed: true,
    });

    expect(result).toHaveLength(rootVenueIds.length);
  });

  test("can limit results to leaf nodes", async () => {
    const result = await findAllByFilter({
      near: origin,
      nameQuery: null,
      level: "leaf",
      includePermanentlyClosed: true,
    });

    expect(result).toHaveLength(leafVenueIds.length);
  });

  test("can limit results to open venues only", async () => {
    const result = await findAllByFilter({
      near: origin,
      nameQuery: null,
      level: "any",
      includePermanentlyClosed: false,
    });

    expect(result).toHaveLength(totalCreatedNotPermanentlyClosedVenueCount);
  });

  test("invalid page key returns empty result set", async () => {
    const filter: VenueFilterModel = {
      near: origin,
      nameQuery: null,
      level: "any",
      includePermanentlyClosed: false,
      pageKey: null,
    };
    const firstPage = await getDbClient().venueEntity.findManyByFilter(filter);

    // Sanity check: using a valid id should produce results
    filter.pageKey = firstPage[0].profileId;
    await expect(
      getDbClient().venueEntity.findManyByFilter(filter)
    ).resolves.toEqual(firstPage);

    filter.pageKey = "anInvalidPageKey";
    await expect(
      getDbClient().venueEntity.findManyByFilter(filter)
    ).resolves.toEqual([]);
  });
});
