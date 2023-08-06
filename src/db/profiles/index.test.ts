/**
 * @group integration
 */

import { prisma } from "@/db";
import { faker } from "@faker-js/faker";
import cuid2 from "@paralleldrive/cuid2";
import { Prisma } from "@prisma/client";

describe("Base profiles manual SQL", () => {
  beforeEach(async () => {
    await expect(prisma.profileEntity.count()).resolves.toBe(0);
  });

  afterEach(async () => {
    await prisma.profileEntity.deleteMany();
  });

  test("find profiles based on their name", async () => {
    await prisma.$executeRaw`
      INSERT INTO profiles.profiles(id, type, name, description)
      VALUES ${Prisma.join(
        // Randomize insertion order
        faker.helpers.shuffle([
          Prisma.sql`(${Prisma.join([
            cuid2.createId(),
            Prisma.sql`'venue'::profiles.profile_type`,
            "Linköping",
            "",
          ])})`,
          Prisma.sql`(${Prisma.join([
            cuid2.createId(),
            Prisma.sql`'venue'::profiles.profile_type`,
            "Lidköping",
            "",
          ])})`,
          Prisma.sql`(${Prisma.join([
            cuid2.createId(),
            Prisma.sql`'venue'::profiles.profile_type`,
            "Göteborg",
            "",
          ])})`,
        ])
      )};
    `;

    await expect(prisma.profileEntity.count()).resolves.toEqual(3);

    const results = await prisma.profileEntity.findIdsByNameQuery(
      // Note the use of lower-case to ensure case insensitivity!
      "linköping",
      500,
      0
    );
    expect(results).toHaveLength(2);

    const profiles = await prisma.profileEntity.findMany({
      where: {
        id: {
          in: results.map((it) => it.id),
        },
      },
    });
    const profileLookup = Object.fromEntries(
      profiles.map((p) => [
        p.name,
        results.find((it) => it.id === p.id)?.similarity,
      ])
    );

    expect(profileLookup["Linköping"]).toEqual(1.0);
    expect(profileLookup["Lidköping"]).toBeLessThan(1.0);
    expect(profileLookup["Lidköping"]).toBeGreaterThan(0.5);
  });

  test.each(
    [500, 100, 99, 10, 1, 0].flatMap((limit) =>
      [0, 1, 10, 99, 100, 500].map((offset) => ({
        limit,
        offset,
      }))
    )
  )("limit($limit)/offset($offset)", async ({ limit, offset }) => {
    const entries = Array.from({ length: 100 })
      .map(
        () =>
          [
            cuid2.createId(),
            Prisma.sql`'venue'::profiles.profile_type`,
            "Linköping",
            "",
          ] as const
      )
      // Ids are used as a secondary sort order to ensure consistent results
      .sort(([idA], [idB]) => idA.localeCompare(idB));
    await prisma.$executeRaw`
      INSERT INTO profiles.profiles(id, type, name, description)
      VALUES ${Prisma.join(
        entries.map((entry) => Prisma.sql`(${Prisma.join([...entry])})`)
      )};
    `;

    await expect(prisma.profileEntity.count()).resolves.toEqual(entries.length);

    const results = await prisma.profileEntity.findIdsByNameQuery(
      "Linköping",
      limit,
      offset
    );
    expect(results).toHaveLength(
      Math.max(0, Math.min(entries.length, limit, entries.length - offset))
    );
    expect(results.map((it) => it.id)).toEqual(
      entries.slice(offset, offset + limit).map(([id]) => id)
    );
  });
});
