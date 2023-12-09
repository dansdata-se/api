/**
 * @group integration
 */

import { mockCreateImageUploadUrlFetchResponses } from "@/__test__/cloudflare";
import { withTestDatabaseForEach } from "@/__test__/db";
import { generateCreateIndividualModel } from "@/__test__/model/profiles/individuals/create";
import { generateCreateOrganizationModel } from "@/__test__/model/profiles/organizations/create";
import { generatePatchOrganizationModel } from "@/__test__/model/profiles/organizations/patch";
import { BaseProfileDao } from "@/db/dao/profiles/base";
import { IndividualDao } from "@/db/dao/profiles/individual";
import { OrganizationDao } from "@/db/dao/profiles/organization";
import { ImageDao } from "@/db/dao/storage/image";
import env from "@/env";
import { CreateIndividualModel } from "@/model/profiles/individuals/create";
import { CreateOrganizationModel } from "@/model/profiles/organizations/create";
import { PatchOrganizationModel } from "@/model/profiles/organizations/patch";
import { OrganizationModel } from "@/model/profiles/organizations/profile";
import { OrganizationReferenceModel } from "@/model/profiles/organizations/reference";
import { faker } from "@faker-js/faker";
import cuid2 from "@paralleldrive/cuid2";
import fetch from "jest-fetch-mock";

describe("OrganizationDao integration tests", () => {
  withTestDatabaseForEach();

  beforeAll(() => {
    fetch.enableMocks();
  });

  beforeEach(() => {
    fetch.resetMocks();
  });

  test("getById returns null if base profile is not found", async () => {
    await expect(
      OrganizationDao.getById("thisIdDoesNotExist")
    ).resolves.toBeNull();
  });

  test("getById returns null for profile where type != organization", async () => {
    // Arrange
    const createModel: CreateIndividualModel = generateCreateIndividualModel();
    const individual = await IndividualDao.create(createModel);

    // Act
    const profile = await OrganizationDao.getById(individual.id);

    // Assert
    await expect(BaseProfileDao.getTypeById(individual.id)).resolves.toEqual(
      createModel.type
    );
    expect(profile).toBeNull();
  });

  test("create and retrieve full organization profile", async () => {
    // Arrange
    const cloudflareMockResponses = mockCreateImageUploadUrlFetchResponses();
    const { id: coverImageId } =
      await ImageDao.createImageUploadUrl("testUser");
    const { id: posterImageId } =
      await ImageDao.createImageUploadUrl("testUser");
    const { id: squareImageId } =
      await ImageDao.createImageUploadUrl("testUser");
    const createIndividual1Model: CreateIndividualModel =
      generateCreateIndividualModel({
        images: {
          coverId: coverImageId,
          posterId: null,
          squareId: squareImageId,
        },
      });
    const individual1Model = await IndividualDao.create(createIndividual1Model);
    const createIndividual2Model: CreateIndividualModel =
      generateCreateIndividualModel({
        images: {
          coverId: null,
          posterId: posterImageId,
          squareId: squareImageId,
        },
      });
    const individual2Model = await IndividualDao.create(createIndividual2Model);
    const createModel: CreateOrganizationModel =
      generateCreateOrganizationModel({
        members: [
          {
            individualId: individual1Model.id,
            title: faker.person.jobTitle(),
          },
          {
            individualId: individual2Model.id,
            title: faker.person.jobTitle(),
          },
        ],
      });

    // Act
    const createdProfile = await OrganizationDao.create(createModel);
    const retrievedProfile = await OrganizationDao.getById(createdProfile.id);

    // Assert
    expect(cloudflareMockResponses).toHaveLength(3);
    expect(createdProfile).toEqual(retrievedProfile);
    expect(createdProfile).toEqual<OrganizationModel>({
      id: createdProfile.id,
      type: createModel.type,
      name: createModel.name,
      description: createModel.description,
      links: createModel.links,
      images: {
        cover: null,
        poster: null,
        square: null,
      },
      tags: createModel.tags,
      members: [
        {
          profileReference: {
            type: individual1Model.type,
            id: individual1Model.id,
            name: individual1Model.name,
            tags: individual1Model.tags,
            images: {
              cover: {
                id: coverImageId,
                cloudflareId: cloudflareMockResponses[0].id,
              },
              poster: null,
              square: {
                id: squareImageId,
                cloudflareId: cloudflareMockResponses[2].id,
              },
            },
          },
          title: createModel.members[0].title,
        },
        {
          profileReference: {
            type: individual2Model.type,
            id: individual2Model.id,
            name: individual2Model.name,
            tags: individual2Model.tags,
            images: {
              cover: null,
              poster: {
                id: posterImageId,
                cloudflareId: cloudflareMockResponses[1].id,
              },
              square: {
                id: squareImageId,
                cloudflareId: cloudflareMockResponses[2].id,
              },
            },
          },
          title: createModel.members[1].title,
        },
      ],
    });
  });

  test("getReferenceById returns null if the base profile is not found", async () => {
    await expect(
      OrganizationDao.getReferenceById("thisIdDoesNotExist")
    ).resolves.toBeNull();
  });

  test("getReferenceById returns null for profile where type != organization", async () => {
    // Arrange
    const createModel: CreateIndividualModel = generateCreateIndividualModel();
    const individual = await IndividualDao.create(createModel);

    // Act
    const profile = await OrganizationDao.getReferenceById(individual.id);

    // Assert
    await expect(BaseProfileDao.getTypeById(individual.id)).resolves.toEqual(
      createModel.type
    );
    expect(profile).toBeNull();
  });

  test("getReferenceById resolves profile reference", async () => {
    // Arrange
    const createModel: CreateOrganizationModel =
      generateCreateOrganizationModel();

    // Act
    const createdProfile = await OrganizationDao.create(createModel);
    const retrievedProfile = await OrganizationDao.getReferenceById(
      createdProfile.id
    );

    expect(createdProfile).toEqual<OrganizationModel>({
      id: createdProfile.id,
      type: createModel.type,
      name: createModel.name,
      description: createModel.description,
      links: createModel.links,
      images: {
        cover: null,
        poster: null,
        square: null,
      },
      members: [],
      tags: createModel.tags,
    });
    expect(retrievedProfile).toEqual<OrganizationReferenceModel>({
      id: createdProfile.id,
      type: createModel.type,
      name: createModel.name,
      images: {
        cover: null,
        poster: null,
        square: null,
      },
      tags: createModel.tags,
    });
  });

  test.each([
    0,
    1,
    env.RESULT_PAGE_SIZE - 1,
    env.RESULT_PAGE_SIZE,
    env.RESULT_PAGE_SIZE + 1,
    Math.floor(env.RESULT_PAGE_SIZE * 2.6),
    env.RESULT_PAGE_SIZE * 3,
  ])(
    "getManyReferences paginates %s profiles (with minimal filters) correctly",
    async (profileCount) => {
      // Arrange
      const pageCount = Math.ceil(profileCount / env.RESULT_PAGE_SIZE);
      for (let i = 0; i < profileCount; i++) {
        await OrganizationDao.create(generateCreateOrganizationModel());
      }

      for (
        let pageIndex = 0, pageKey = null;
        pageIndex < Math.max(pageCount, 1);
        pageIndex++
      ) {
        // Act
        const page = await OrganizationDao.getManyReferences({
          nameQuery: null,
          tags: new Set(),
          memberIds: new Set(),
          pageKey,
        });

        // Assert
        expect(page.data).toHaveLength(
          Math.min(
            env.RESULT_PAGE_SIZE,
            Math.max(0, profileCount - env.RESULT_PAGE_SIZE * pageIndex)
          )
        );
        if (pageIndex > 0) {
          expect(pageKey).toEqual(page.data[0].id);
        }
        if (pageIndex + 1 < pageCount) {
          expect(page.nextPageKey).not.toBeNull();
        } else {
          expect(page.nextPageKey).toBeNull();
        }

        pageKey = page.nextPageKey;
      }
    }
  );

  // This currently depends on our database backend.
  // However, by ensuring our testing environment matches what we would expect,
  // we can also be fairly confident about what steps to take to ensure the production
  // environment does what we expect as well.
  test("getManyReferences sorts names as expected in a swedish locale", async () => {
    // Arrange
    const unsortedNames = ["Örjan", "Åsa", "Britt", "Niklas", "Ängla", "Per"];
    const sortedNames = ["Britt", "Niklas", "Per", "Åsa", "Ängla", "Örjan"];
    for (const name of unsortedNames) {
      await OrganizationDao.create(
        generateCreateOrganizationModel({
          name,
        })
      );
    }

    // Act
    const retrievedNames: string[] = [];
    for (
      let firstIteration = true, previousPageKey = null;
      firstIteration || previousPageKey !== null;
      firstIteration = false
    ) {
      // Act
      const page = await OrganizationDao.getManyReferences({
        nameQuery: null,
        tags: new Set(),
        memberIds: new Set(),
        pageKey: previousPageKey,
      });
      // Sanity check to avoid infinite loop
      expect(page.data).not.toHaveLength(0);

      retrievedNames.push(...page.data.map((it) => it.name));

      previousPageKey = page.nextPageKey;
    }

    // Assert
    expect(retrievedNames).toEqual(sortedNames);
  });

  test("create and patch full organization profile", async () => {
    // Arrange
    const createModel: CreateOrganizationModel =
      generateCreateOrganizationModel();
    const patchModel: PatchOrganizationModel = generatePatchOrganizationModel(
      cuid2.createId()
    );

    // Act
    const createdProfile = await OrganizationDao.create(createModel);
    patchModel.id = createdProfile.id;

    await OrganizationDao.patch(patchModel);
    const patchedProfile = await OrganizationDao.getById(patchModel.id);

    // Assert
    expect(createdProfile).toEqual<OrganizationModel>({
      id: createdProfile.id,
      type: createModel.type,
      name: createModel.name,
      description: createModel.description,
      links: createModel.links,
      images: {
        cover: null,
        poster: null,
        square: null,
      },
      members: [],
      tags: createModel.tags,
    });
    expect(patchedProfile).toEqual<OrganizationModel>({
      id: createdProfile.id,
      type: patchModel.type,
      name: patchModel.name ?? createModel.name,
      description: patchModel.description ?? createModel.description,
      links: patchModel.links ?? createModel.links,
      images: {
        cover: null,
        poster: null,
        square: null,
      },
      members: [],
      tags: patchModel.tags ?? createModel.tags,
    });
  });

  test.each([0, 1, 2])(
    "patch can update the members list to have %s members",
    async (patchedMemberCount) => {
      // Arrange
      const createIndividual1Model: CreateIndividualModel =
        generateCreateIndividualModel();
      const individual1Model = await IndividualDao.create(
        createIndividual1Model
      );
      const createIndividual2Model: CreateIndividualModel =
        generateCreateIndividualModel();
      const individual2Model = await IndividualDao.create(
        createIndividual2Model
      );
      const createIndividual3Model: CreateIndividualModel =
        generateCreateIndividualModel();
      const individual3Model = await IndividualDao.create(
        createIndividual3Model
      );
      const createModel: CreateOrganizationModel =
        generateCreateOrganizationModel({
          members: [
            {
              individualId: individual1Model.id,
              title: "technician",
            },
            {
              individualId: individual2Model.id,
              title: "drummer",
            },
            {
              individualId: individual3Model.id,
              title: "singer",
            },
          ],
        });
      const createdModel = await OrganizationDao.create(createModel);

      const members = faker.helpers.shuffle([
        individual1Model,
        individual2Model,
        individual3Model,
      ]);
      const patchModel: PatchOrganizationModel = generatePatchOrganizationModel(
        createdModel.id,
        {
          members: Array.from({
            length: patchedMemberCount,
          }).map((_, i) => ({
            individualId: members[i].id,
            title: faker.person.jobTitle(),
          })),
        }
      );

      // Act
      await OrganizationDao.patch(patchModel);
      const patchedProfile = await OrganizationDao.getById(patchModel.id);

      // Assert
      expect(patchedProfile).not.toBeNull();
      expect(patchedProfile?.members).toHaveLength(patchedMemberCount);
      expect(patchedProfile).toMatchObject<Pick<OrganizationModel, "members">>({
        members: patchedProfile?.members ?? [],
      });
    }
  );
});
