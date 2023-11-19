/**
 * @group integration
 */

import { withTestDatabaseForEach } from "@/__test__/db";
import { generateCoordsModel } from "@/__test__/model/profiles/coords";
import { generateCreateVenueModel } from "@/__test__/model/profiles/venues/create";
import { getDbClient } from "@/db";
import { VenueDao } from "@/db/dao/profiles/venue";
import { mapVenueModelToReferenceModel } from "@/mapping/profiles/venues/profile";
import { CreateVenueModel } from "@/model/profiles/venues/create";
import { VenueModel } from "@/model/profiles/venues/profile";
import { faker } from "@faker-js/faker";
import { ProfileType } from "@prisma/client";
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
          images: {
            coverId: null,
            posterId: null,
            squareId: null,
          },
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
    const model = await VenueDao.create(
      generateCreateVenueModel({
        images: {
          coverId: null,
          posterId: null,
          squareId: null,
        },
        parentId: null,
      })
    );
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
        images: {
          coverId: null,
          posterId: null,
          squareId: null,
        },
        parentId: null,
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
    const model1 = await VenueDao.create(
      generateCreateVenueModel({
        images: {
          coverId: null,
          posterId: null,
          squareId: null,
        },
        parentId: null,
      })
    );
    const model2 = await VenueDao.create(
      generateCreateVenueModel({
        images: {
          coverId: null,
          posterId: null,
          squareId: null,
        },
        parentId: null,
      })
    );

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
      images: {
        coverId: null,
        posterId: null,
        squareId: null,
      },
      parentId: null,
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

    const rootCreate = generateCreateVenueModel({
      images: {
        coverId: null,
        posterId: null,
        squareId: null,
      },
      parentId: null,
    });
    const sub1Create = generateCreateVenueModel({
      images: {
        coverId: null,
        posterId: null,
        squareId: null,
      },
    });
    const sub2Create = generateCreateVenueModel({
      images: {
        coverId: null,
        posterId: null,
        squareId: null,
      },
    });
    const leafCreate = generateCreateVenueModel({
      images: {
        coverId: null,
        posterId: null,
        squareId: null,
      },
    });

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

  test.each([0, 10, 1_000, 15_000, 50_000, 100_000, Infinity])(
    "find venues within %s m of the origin",
    async (maxDistance) => {
      // Arrange
      const db = getDbClient();
      const origin = {
        lat: 58.41616195587502,
        lng: 15.625933242341707,
      };
      // Sorted by distance
      const cities: {
        distanceToOrigin: number;
        createModel: CreateVenueModel;
      }[] = [
        {
          distanceToOrigin: 618,
          createModel: generateCreateVenueModel({
            name: "Linköping",
            coords: {
              lat: 58.4118163514212,
              lng: 15.619312724913462,
            },
            images: {
              coverId: null,
              posterId: null,
              squareId: null,
            },
            parentId: null,
          }),
        },
        {
          distanceToOrigin: 12_556,
          createModel: generateCreateVenueModel({
            name: "Ljungsbro",
            coords: {
              lat: 58.50563179706094,
              lng: 15.494221140260903,
            },
            images: {
              coverId: null,
              posterId: null,
              squareId: null,
            },
            parentId: null,
          }),
        },
        {
          distanceToOrigin: 24_246,
          createModel: generateCreateVenueModel({
            name: "Borensberg",
            coords: {
              lat: 58.55553782832458,
              lng: 15.305118297934813,
            },
            images: {
              coverId: null,
              posterId: null,
              squareId: null,
            },
            parentId: null,
          }),
        },
        {
          distanceToOrigin: 35_272,
          createModel: generateCreateVenueModel({
            name: "Norrköping",
            coords: {
              lat: 58.5776551226464,
              lng: 16.148422882592975,
            },
            images: {
              coverId: null,
              posterId: null,
              squareId: null,
            },
            parentId: null,
          }),
        },
        {
          distanceToOrigin: 75_577,
          createModel: generateCreateVenueModel({
            name: "Södra Vi",
            coords: {
              lat: 57.7422407209703,
              lng: 15.792965255566815,
            },
            images: {
              coverId: null,
              posterId: null,
              squareId: null,
            },
            parentId: null,
          }),
        },
        {
          distanceToOrigin: 96_033,
          createModel: generateCreateVenueModel({
            name: "Örebro",
            coords: {
              lat: 59.24684390768979,
              lng: 15.16925002256166,
            },
            images: {
              coverId: null,
              posterId: null,
              squareId: null,
            },
            parentId: null,
          }),
        },
        {
          distanceToOrigin: 112_111,
          createModel: generateCreateVenueModel({
            name: "Jönköping",
            coords: {
              lat: 57.78247783258018,
              lng: 14.141843832283167,
            },
            images: {
              coverId: null,
              posterId: null,
              squareId: null,
            },
            parentId: null,
          }),
        },
        {
          distanceToOrigin: 228_116,
          createModel: generateCreateVenueModel({
            name: "Göteborg",
            coords: {
              lat: 57.69483118235473,
              lng: 11.995524355564582,
            },
            images: {
              coverId: null,
              posterId: null,
              squareId: null,
            },
            parentId: null,
          }),
        },
      ];
      // Randomize insertion order
      for (const city of faker.helpers.shuffle(cities)) {
        await VenueDao.create(city.createModel);
      }

      // Act
      const result = await db.venueEntity.findIdsNear(origin, maxDistance);

      // Assert
      const expected = cities.filter((it) => it.distanceToOrigin < maxDistance);
      if (maxDistance === Infinity) {
        expect(expected.length).toBeGreaterThan(0);
      }
      expect(result).toHaveLength(expected.length);
      expect(result.map((it) => it.distance)).toEqual(
        expected.map((it) => it.distanceToOrigin)
      );
    }
  );
});
