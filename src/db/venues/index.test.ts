/**
 * @group integration
 */

import { generateVenueModel } from "@/__test__/model/profiles/profile";
import { prisma } from "@/db";
import { faker } from "@faker-js/faker";
import cuid2 from "@paralleldrive/cuid2";
import { Prisma } from "@prisma/client";

describe("Venues manual SQL", () => {
  beforeEach(async () => {
    await expect(prisma.profileEntity.count()).resolves.toBe(0);
    await expect(prisma.venueEntity.count()).resolves.toBe(0);
  });

  afterEach(async () => {
    await prisma.profileEntity.deleteMany();
  });

  test("retrieve coordinates for a venue", async () => {
    const linkoping = {
      id: cuid2.createId(),
      name: "Linköping",
      coords: {
        lat: 58.41616195587502,
        lng: 15.625933242341707,
      },
    };

    await prisma.$executeRaw`
      INSERT INTO profiles.profiles(id, type, name, description)
      VALUES (${Prisma.join([
        linkoping.id,
        Prisma.sql`'venue'::profiles.profile_type`,
        linkoping.name,
        "",
      ])});
    `;

    await prisma.$executeRaw`
      INSERT INTO profiles.venues(profile_id, parent_id, coords)
      VALUES (${Prisma.join([
        linkoping.id,
        null,
        Prisma.sql`ST_MakePoint(${linkoping.coords.lng}, ${linkoping.coords.lat})`,
      ])});
    `;

    await expect(prisma.profileEntity.count()).resolves.toEqual(1);
    await expect(prisma.venueEntity.count()).resolves.toEqual(1);

    const coords = await prisma.venueEntity
      .findUnique({
        select: {
          coords: true,
        },
        where: {
          profileId: linkoping.id,
        },
      })
      .then((it) => it?.coords);

    expect(coords?.lat).toBeCloseTo(linkoping.coords.lat, 6);
    expect(coords?.lng).toBeCloseTo(linkoping.coords.lng, 6);
  });

  test("retrieve the ancestors for a venue", async () => {
    const root = generateVenueModel();
    const sub1 = generateVenueModel({
      ancestors: [root],
    });
    const sub2 = generateVenueModel({
      ancestors: [root, sub1],
    });
    const leaf = generateVenueModel({
      ancestors: [root, sub1, sub2],
    });

    const tree = [root, sub1, sub2, leaf];

    await prisma.$executeRaw`
      INSERT INTO profiles.profiles(id, type, name, description)
      VALUES ${Prisma.join(
        tree.map(
          (branch) =>
            Prisma.sql`(${Prisma.join([
              branch.id,
              Prisma.sql`'venue'::profiles.profile_type`,
              branch.name,
              "",
            ])})`
        )
      )};
    `;

    await prisma.$executeRaw`
      INSERT INTO profiles.venues(profile_id, parent_id, coords)
      VALUES ${Prisma.join(
        tree.map(
          (branch) =>
            Prisma.sql`(${Prisma.join([
              branch.id,
              branch.ancestors.at(-1)?.id ?? null,
              Prisma.sql`ST_MakePoint(${branch.coords.lng}, ${branch.coords.lat})`,
            ])})`
        )
      )};
    `;

    await expect(prisma.profileEntity.count()).resolves.toEqual(tree.length);
    await expect(prisma.venueEntity.count()).resolves.toEqual(tree.length);

    const actual = await prisma.venueEntity
      .findMany({
        select: {
          profileId: true,
          ancestorIds: true,
        },
      })
      .then((result) =>
        Promise.all(
          result.map(async (it) => ({
            id: it.profileId,
            ancestorIds: await it.ancestorIds,
          }))
        )
      )
      .then((result) =>
        // Restore original list order
        result.sort(
          (a, b) =>
            tree.findIndex((branch) => branch.id === a.id) -
            tree.findIndex((branch) => branch.id === b.id)
        )
      );

    expect(actual).toEqual(
      tree.map((it) => ({
        id: it.id,
        ancestorIds: it.ancestors.map((it) => it.id),
      }))
    );
  });

  test("find venues near a set of coordinates", async () => {
    const origin = {
      lat: 58.41616195587502,
      lng: 15.625933242341707,
    };
    // Sorted by distance
    const cities: {
      id: string;
      name: string;
      distanceToOrigin: number;
      coords: {
        lat: number;
        lng: number;
      };
    }[] = [
      {
        id: cuid2.createId(),
        name: "Linköping",
        distanceToOrigin: 618,
        coords: {
          lat: 58.4118163514212,
          lng: 15.619312724913462,
        },
      },
      {
        id: cuid2.createId(),
        name: "Ljungsbro",
        distanceToOrigin: 12_556,
        coords: {
          lat: 58.50563179706094,
          lng: 15.494221140260903,
        },
      },
      {
        id: cuid2.createId(),
        name: "Borensberg",
        distanceToOrigin: 24_246,
        coords: {
          lat: 58.55553782832458,
          lng: 15.305118297934813,
        },
      },
      {
        id: cuid2.createId(),
        name: "Norrköping",
        distanceToOrigin: 35_272,
        coords: {
          lat: 58.5776551226464,
          lng: 16.148422882592975,
        },
      },
      {
        id: cuid2.createId(),
        name: "Södra Vi",
        distanceToOrigin: 75_577,
        coords: {
          lat: 57.7422407209703,
          lng: 15.792965255566815,
        },
      },
      {
        id: cuid2.createId(),
        name: "Örebro",
        distanceToOrigin: 96_033,
        coords: {
          lat: 59.24684390768979,
          lng: 15.16925002256166,
        },
      },
      {
        id: cuid2.createId(),
        name: "Jönköping",
        distanceToOrigin: 112_111,
        coords: {
          lat: 57.78247783258018,
          lng: 14.141843832283167,
        },
      },
      {
        id: cuid2.createId(),
        name: "Göteborg",
        distanceToOrigin: 228_116,
        coords: {
          lat: 57.69483118235473,
          lng: 11.995524355564582,
        },
      },
    ];

    await prisma.$executeRaw`
      INSERT INTO profiles.profiles(id, type, name, description)
      VALUES ${Prisma.join(
        // Randomize insertion order
        faker.helpers.shuffle(
          cities.map(
            (it) =>
              Prisma.sql`(${Prisma.join([
                it.id,
                Prisma.sql`'venue'::profiles.profile_type`,
                it.name,
                "",
              ])})`
          )
        )
      )};
    `;

    await prisma.$executeRaw`
      INSERT INTO profiles.venues(profile_id, parent_id, coords)
      VALUES ${Prisma.join(
        cities.map(
          (it) =>
            Prisma.sql`(${Prisma.join([
              it.id,
              null,
              Prisma.sql`ST_MakePoint(${it.coords.lng}, ${it.coords.lat})`,
            ])})`
        )
      )};
    `;

    await expect(prisma.profileEntity.count()).resolves.toEqual(cities.length);
    await expect(prisma.venueEntity.count()).resolves.toEqual(cities.length);

    await expect(
      prisma.venueEntity.findManyNear(origin, 10)
    ).resolves.toHaveLength(0);

    for (const distance of [1_000, 15_000, 50_000, 100_000]) {
      const actual = await prisma.venueEntity
        .findManyNear(origin, distance)
        .then((ids) =>
          prisma.venueEntity.findMany({
            select: {
              profileId: true,
              coords: true,
            },
            where: {
              profileId: {
                in: ids.map((it) => it.profileId),
              },
            },
          })
        )
        .then((venues) =>
          Promise.all(
            venues.map(async (it) => ({
              id: it.profileId,
              coords: await it.coords,
            }))
          )
        );
      const expected = cities.filter((it) => it.distanceToOrigin < distance);
      expect(actual).toHaveLength(expected.length);
      expect(actual.map((it) => it.id)).toEqual(expected.map((it) => it.id));
      actual.forEach(({ coords }, i) => {
        expect(coords.lat).toBeCloseTo(expected[i].coords.lat, 6);
        expect(coords.lng).toBeCloseTo(expected[i].coords.lng, 6);
      });
    }

    const actual = await prisma.venueEntity.findManyNear(origin, Infinity);
    expect(actual.map((it) => it.distance)).toEqual(
      cities.map((it) => it.distanceToOrigin)
    );
  });
});
