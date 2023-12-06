/**
 * @group integration
 */

import { withTestDatabaseForEach } from "@/__test__/db";
import { generateCoordsModel } from "@/__test__/model/profiles/coords";
import { generateCreateVenueModel } from "@/__test__/model/profiles/venues/create";
import { getDbClient } from "@/db";
import { VenueDao } from "@/db/dao/profiles/venue";
import { mapVenueModelToReferenceModel } from "@/mapping/profiles/venues/profile";
import { VenueModel } from "@/model/profiles/venues/profile";
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
