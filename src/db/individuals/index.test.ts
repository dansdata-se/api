/**
 * @group integration
 */

import { withTestDatabaseForAll } from "@/__test__/db";
import { generateCreateIndividualModel } from "@/__test__/model/profiles/individuals/create";
import { generateCreateOrganizationModel } from "@/__test__/model/profiles/organizations/create";
import { getDbClient } from "@/db";
import { IndividualDao } from "@/db/dao/profiles/individual";
import { OrganizationDao } from "@/db/dao/profiles/organization";
import env from "@/env";
import { IndividualFilterModel } from "@/model/profiles/individuals/filter";
import { IndividualModel } from "@/model/profiles/individuals/profile";
import { IndividualReferenceModel } from "@/model/profiles/individuals/reference";
import { OrganizationModel } from "@/model/profiles/organizations/profile";
import { faker } from "@faker-js/faker";
import { IndividualTag, ProfileType } from "@prisma/client";

describe("Individuals manual SQL: findManyByFilter", () => {
  withTestDatabaseForAll();

  const testData = {
    Storbandet: {
      "Stina Lundgren": "Trummor",
      "Joseph Axelsson": "Sång och bas",
      "Klas Öberg": "Keyboard",
      "Sanna Lund": "Gitarr",
    },
    "Stora Bandet": {
      "Stina Lundgren": "Trummor",
      "Joseph Axelsson": "Bastuba",
      "Klas Öberg": "Sång",
      "Märta Bergman": "Sång",
    },
    Musikbokarna: {
      "Eira Andersson": "VD",
      "Karl Sjögren": "Ekonomi",
      "Joseph Axelsson": "Sälj",
    },
    "Dansfoto AB": {
      "Eira Andersson": "Fotograf",
      "Klas Öberg": "Fotograf",
      "Sanna Lund": "Fotograf",
      "Cornelis Olsson": "Ekonomi",
    },
    Dansskolan: {
      "Melwin Nordström": "Ordförande och instruktör",
      "Stina Lundgren": "Musiklärare",
    },
  };

  type TestOrganizationNameType = keyof typeof testData;
  // HACK(FelixZY): Extract the names of all individuals.
  // https://stackoverflow.com/a/49402091/1137077
  type KeysOfUnion<T> = T extends T ? keyof T : never;
  type TestIndividualNameType = KeysOfUnion<
    (typeof testData)[TestOrganizationNameType]
  >;

  // @ts-expect-error 2739 - Record is constructed in beforeAll
  const individuals: Record<TestIndividualNameType, IndividualModel> = {};
  // @ts-expect-error 2739 - Record is constructed in beforeAll
  const organizations: Record<TestOrganizationNameType, OrganizationModel> = {};

  beforeAll(async () => {
    // Create profiles in random order
    const createProfileModels = faker.helpers.shuffle([
      ...Array.from(
        new Set(Object.values(testData).flatMap((it) => Object.keys(it)))
      ).map((name) => generateCreateIndividualModel({ name })),
      ...Object.keys(testData)
        .flat()
        .map((name) => generateCreateOrganizationModel({ name })),
    ]);
    for (const createModel of faker.helpers.shuffle(createProfileModels)) {
      switch (createModel.type) {
        case ProfileType.organization:
          organizations[createModel.name as TestOrganizationNameType] =
            await OrganizationDao.create(createModel);
          break;
        case ProfileType.individual:
          individuals[createModel.name as TestIndividualNameType] =
            await IndividualDao.create(createModel);
          break;
        default:
          // @ts-expect-error 2339 - The presence of this error indicates that the switch is exhaustive
          throw new Error(`Not implemented: '${createModel.type}'`);
      }
    }

    // Link individuals with their organizations
    for (const orgName of Object.keys(
      organizations
    ) as TestOrganizationNameType[]) {
      for (const [indName, title] of Object.entries(testData[orgName]) as [
        TestIndividualNameType,
        string,
      ][]) {
        const organization = organizations[orgName];
        const individual = individuals[indName];

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        individuals[indName] = (await IndividualDao.patch({
          id: individual.id,
          type: individual.type,
          organizations: [
            ...individual.organizations.map((it) => ({
              organizationId: it.profileReference.id,
              title: it.title,
            })),
            {
              organizationId: organization.id,
              title,
            },
          ],
        }))!;

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        organizations[orgName] = (await OrganizationDao.getById(
          organization.id
        ))!;
      }
    }
  });

  test("validate test data assumptions", () => {
    expect(Object.keys(organizations)).toHaveLength(
      Object.keys(testData).length
    );
    expect(
      Object.values(organizations).every((it) => it !== null)
    ).toBeTruthy();

    expect(Object.keys(individuals)).toHaveLength(
      new Set(Object.values(testData).flatMap((it) => Object.keys(it))).size
    );
    expect(Object.values(individuals).every((it) => it !== null)).toBeTruthy();
  });

  /**
   * Retrieve all results matching the given filter.
   *
   * This helper function allows tests to focus on the actual data rather than pagination.
   */
  async function findAllByFilter(
    filterModel: Omit<IndividualFilterModel, "pageKey">
  ) {
    const retrievedVenues: Awaited<
      ReturnType<
        ReturnType<typeof getDbClient>["individualEntity"]["findManyByFilter"]
      >
    > = [];
    for (
      let firstIteration = true, pageKey = null;
      firstIteration || pageKey !== null;
      firstIteration = false
    ) {
      const result = await getDbClient().individualEntity.findManyByFilter({
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
    (IndividualReferenceModel & {
      nameSimilarity: number | null;
    })[]
  > {
    return Promise.all(
      result.map(async (it) => ({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ...(await IndividualDao.getReferenceById(it.profileId))!,
        nameSimilarity: it.nameSimilarity,
      }))
    );
  }

  test("sorts by and prioritizes name similarity when a name query is given", async () => {
    const result = await findAllByFilter({
      nameQuery: "stina lund",
      tags: new Set(),
      organizationIds: new Set(),
    }).then(expandToReferenceModel);

    expect(result).toHaveLength(2);
    result.forEach((it) => {
      expect(it).not.toMatchObject<Partial<typeof it>>({
        nameSimilarity: null,
      });
    });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(result[0].nameSimilarity).toBeGreaterThan(result[1].nameSimilarity!);
    expect(result[0]).toMatchObject<{ name: TestIndividualNameType }>({
      name: "Stina Lundgren",
    });
    expect(result[1]).toMatchObject<{ name: TestIndividualNameType }>({
      name: "Sanna Lund",
    });
  });

  test("sorts by name no name query is given", async () => {
    const result = await findAllByFilter({
      nameQuery: null,
      tags: new Set(),
      organizationIds: new Set(),
    }).then(expandToReferenceModel);

    expect(result).toHaveLength(Object.keys(individuals).length);
    result.forEach((it) => {
      expect(it).toMatchObject<Partial<typeof it>>({
        nameSimilarity: null,
      });
    });
    expect(result).toEqual(
      result.sort((a, b) => a.name.localeCompare(b.name, "sv-SE"))
    );
  });

  test("can limit results to individuals that are members of a specific organization", async () => {
    const result = await findAllByFilter({
      nameQuery: null,
      tags: new Set(),
      organizationIds: new Set([organizations.Dansskolan.id]),
    }).then(expandToReferenceModel);

    // Assert
    expect(
      result.map((it) => it.name).sort((a, b) => a.localeCompare(b, "sv-SE"))
    ).toEqual(
      organizations.Dansskolan.members
        .map((it) => it.profileReference.name)
        .sort((a, b) => a.localeCompare(b, "sv-SE"))
    );
  });

  test("can limit results to individuals that are members of multiple organizations", async () => {
    const result = await findAllByFilter({
      nameQuery: null,
      tags: new Set(),
      organizationIds: new Set([
        organizations.Storbandet.id,
        organizations["Stora Bandet"].id,
      ]),
    }).then(expandToReferenceModel);

    // Assert
    expect(
      result.map((it) => it.name).sort((a, b) => a.localeCompare(b, "sv-SE"))
    ).toEqual(
      organizations.Storbandet.members
        .filter((member) =>
          organizations["Stora Bandet"].members
            .map((it) => it.profileReference.id)
            .includes(member.profileReference.id)
        )
        .map((it) => it.profileReference.name)
        .sort((a, b) => a.localeCompare(b, "sv-SE"))
    );
  });

  test("can limit results to a single tag", async () => {
    // Arrange
    const allTags = Object.values(IndividualTag);
    let tagFilter = new Set<IndividualTag>();
    let result: Awaited<ReturnType<typeof expandToReferenceModel>> = [];

    // Act
    // Find a tag with more than 0 results.
    // This is necessary to reduce test flakiness as the tags
    // in the test dataset are completely randomized.
    for (const tag of allTags) {
      tagFilter = new Set([tag]);

      result = await findAllByFilter({
        nameQuery: null,
        tags: tagFilter,
        organizationIds: new Set(),
      }).then(expandToReferenceModel);

      if (result.length > 0) {
        break;
      }
    }

    // Assert
    expect(result).not.toHaveLength(0);
    expect(
      result.every((it) =>
        Array.from(tagFilter).every((tag) => it.tags.includes(tag))
      )
    ).toBeTruthy();
  });

  test("can limit results to multiple tags", async () => {
    // Arrange
    const allTags = Object.values(IndividualTag);
    let tagFilter = new Set<IndividualTag>();
    let result: Awaited<ReturnType<typeof expandToReferenceModel>> = [];

    // Act
    // Find two different tags that yield more than 0 results.
    // This is necessary to reduce test flakiness as the tags
    // in the test dataset are completely randomized.
    for (const tag1 of allTags) {
      for (const tag2 of allTags) {
        if (tag1 === tag2) {
          continue;
        }

        tagFilter = new Set([tag1, tag2]);

        result = await findAllByFilter({
          nameQuery: null,
          tags: tagFilter,
          organizationIds: new Set(),
        }).then(expandToReferenceModel);

        if (result.length > 0) {
          break;
        }
      }
    }

    // Assert
    expect(result).not.toHaveLength(0);
    expect(
      result.every((it) =>
        Array.from(tagFilter).every((tag) => it.tags.includes(tag))
      )
    ).toBeTruthy();
  });

  test("invalid page key returns empty result set", async () => {
    const filter: IndividualFilterModel = {
      nameQuery: null,
      tags: new Set(),
      organizationIds: new Set(),
      pageKey: null,
    };
    const firstPage =
      await getDbClient().individualEntity.findManyByFilter(filter);

    // Sanity check: using a valid id should produce results
    filter.pageKey = firstPage[0].profileId;
    await expect(
      getDbClient().individualEntity.findManyByFilter(filter)
    ).resolves.toEqual(firstPage);

    filter.pageKey = "anInvalidPageKey";
    await expect(
      getDbClient().individualEntity.findManyByFilter(filter)
    ).resolves.toEqual([]);
  });
});
