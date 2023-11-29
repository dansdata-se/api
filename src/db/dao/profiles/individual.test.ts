/**
 * @group integration
 */

import { mockCreateImageUploadUrlFetchResponses } from "@/__test__/cloudflare";
import { withTestDatabaseForEach } from "@/__test__/db";
import { generateCreateIndividualModel } from "@/__test__/model/profiles/individuals/create";
import { generatePatchIndividualModel } from "@/__test__/model/profiles/individuals/patch";
import { generateCreateOrganizationModel } from "@/__test__/model/profiles/organizations/create";
import { BaseProfileDao } from "@/db/dao/profiles/base";
import { IndividualDao } from "@/db/dao/profiles/individual";
import { OrganizationDao } from "@/db/dao/profiles/organization";
import { ImageDao } from "@/db/dao/storage/image";
import env from "@/env";
import { CreateIndividualModel } from "@/model/profiles/individuals/create";
import { PatchIndividualModel } from "@/model/profiles/individuals/patch";
import { IndividualModel } from "@/model/profiles/individuals/profile";
import { IndividualReferenceModel } from "@/model/profiles/individuals/reference";
import { CreateOrganizationModel } from "@/model/profiles/organizations/create";
import { faker } from "@faker-js/faker";
import fetch from "jest-fetch-mock";

describe("IndividualDao integration tests", () => {
  withTestDatabaseForEach();

  beforeAll(() => {
    fetch.enableMocks();
  });

  beforeEach(() => {
    fetch.resetMocks();
  });

  test("getById returns null if base profile is not found", async () => {
    await expect(
      IndividualDao.getById("thisIdDoesNotExist")
    ).resolves.toBeNull();
  });

  test("getById returns null for profile where type != individual", async () => {
    // Arrange
    const createModel: CreateOrganizationModel =
      generateCreateOrganizationModel({
        images: {
          coverId: null,
          posterId: null,
          squareId: null,
        },
        members: [],
      });
    const organization = await OrganizationDao.create(createModel);

    // Act
    const profile = await IndividualDao.getById(organization.id);

    // Assert
    await expect(BaseProfileDao.getTypeById(organization.id)).resolves.toEqual(
      createModel.type
    );
    expect(profile).toBeNull();
  });

  test("create and retrieve full individual profile", async () => {
    // Arrange
    const cloudflareMockResponses = mockCreateImageUploadUrlFetchResponses();
    const { id: coverImageId } =
      await ImageDao.createImageUploadUrl("testUser");
    const { id: posterImageId } =
      await ImageDao.createImageUploadUrl("testUser");
    const { id: squareImageId } =
      await ImageDao.createImageUploadUrl("testUser");
    const createOrg1Model: CreateOrganizationModel =
      generateCreateOrganizationModel({
        images: {
          coverId: coverImageId,
          posterId: null,
          squareId: squareImageId,
        },
        members: [],
      });
    const org1Model = await OrganizationDao.create(createOrg1Model);
    const createOrg2Model: CreateOrganizationModel =
      generateCreateOrganizationModel({
        images: {
          coverId: null,
          posterId: posterImageId,
          squareId: squareImageId,
        },
        members: [],
      });
    const org2Model = await OrganizationDao.create(createOrg2Model);
    const createModel: CreateIndividualModel = generateCreateIndividualModel({
      images: {
        coverId: null,
        posterId: null,
        squareId: null,
      },
      organizations: [
        {
          organizationId: org1Model.id,
          title: faker.person.jobTitle(),
        },
        {
          organizationId: org2Model.id,
          title: faker.person.jobTitle(),
        },
      ],
    });

    // Act
    const createdProfile = await IndividualDao.create(createModel);
    const retrievedProfile = await IndividualDao.getById(createdProfile.id);

    // Assert
    expect(cloudflareMockResponses).toHaveLength(3);
    expect(createdProfile).toEqual(retrievedProfile);
    expect(createdProfile).toEqual<IndividualModel>({
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
      organizations: [
        {
          profileReference: {
            type: org1Model.type,
            id: org1Model.id,
            name: org1Model.name,
            tags: org1Model.tags,
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
          title: createModel.organizations[0].title,
        },
        {
          profileReference: {
            type: org2Model.type,
            id: org2Model.id,
            name: org2Model.name,
            tags: org2Model.tags,
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
          title: createModel.organizations[1].title,
        },
      ],
    });
  });

  test("getReferenceById returns null if the base profile is not found", async () => {
    await expect(
      IndividualDao.getReferenceById("thisIdDoesNotExist")
    ).resolves.toBeNull();
  });

  test("getReferenceById returns null for profile where type != individual", async () => {
    // Arrange
    const createModel: CreateOrganizationModel =
      generateCreateOrganizationModel({
        images: {
          coverId: null,
          posterId: null,
          squareId: null,
        },
        members: [],
      });
    const organization = await OrganizationDao.create(createModel);

    // Act
    const profile = await IndividualDao.getReferenceById(organization.id);

    // Assert
    await expect(BaseProfileDao.getTypeById(organization.id)).resolves.toEqual(
      createModel.type
    );
    expect(profile).toBeNull();
  });

  test("create and retrieve individual profile reference", async () => {
    // Arrange
    const createModel: CreateIndividualModel = generateCreateIndividualModel({
      images: {
        coverId: null,
        posterId: null,
        squareId: null,
      },
      organizations: [],
    });

    // Act
    const createdProfile = await IndividualDao.create(createModel);
    const retrievedProfile = await IndividualDao.getReferenceById(
      createdProfile.id
    );

    expect(createdProfile).toEqual<IndividualModel>({
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
      organizations: [],
      tags: createModel.tags,
    });
    expect(retrievedProfile).toEqual<IndividualReferenceModel>({
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
    { count: 0, pages: 0 },
    { count: 1, pages: 1 },
    { count: env.RESULT_PAGE_SIZE - 1, pages: 1 },
    { count: env.RESULT_PAGE_SIZE, pages: 1 },
    { count: env.RESULT_PAGE_SIZE + 1, pages: 2 },
    { count: Math.floor(env.RESULT_PAGE_SIZE * 2.6), pages: 3 },
    { count: env.RESULT_PAGE_SIZE * 3, pages: 3 },
  ])(
    "list $count profiles (requiring $pages pages) without filtering",
    async ({ count, pages }) => {
      // Arrange
      for (let i = 0; i < count; i++) {
        await IndividualDao.create(
          generateCreateIndividualModel({
            images: {
              coverId: null,
              posterId: null,
              squareId: null,
            },
            organizations: [],
          })
        );
      }

      for (
        let pageIndex = 0, previousPageKey = null;
        pageIndex < Math.max(pages, 1);
        pageIndex++
      ) {
        // Act
        const page = await IndividualDao.getManyReferences({
          organizationIds: new Set([]),
          tags: new Set([]),
          pageKey: previousPageKey,
        });

        // Assert
        expect(page.data).toHaveLength(
          Math.min(
            env.RESULT_PAGE_SIZE,
            Math.max(0, count - env.RESULT_PAGE_SIZE * pageIndex)
          )
        );
        if (pageIndex > 0) {
          expect(previousPageKey).toEqual(page.data[0].id);
        }
        if (pageIndex + 1 < pages) {
          expect(page.nextPageKey).not.toBeNull();
        } else {
          expect(page.nextPageKey).toBeNull();
        }

        previousPageKey = page.nextPageKey;
      }
    }
  );

  test("getManyReferences sorts names as expected in a swedish locale", async () => {
    // Arrange
    const unsortedNames = ["Örjan", "Åsa", "Britt", "Niklas", "Ängla", "Per"];
    const sortedNames = ["Britt", "Niklas", "Per", "Åsa", "Ängla", "Örjan"];
    for (const name of unsortedNames) {
      await IndividualDao.create(
        generateCreateIndividualModel({
          name,
          images: {
            coverId: null,
            posterId: null,
            squareId: null,
          },
          organizations: [],
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
      const page = await IndividualDao.getManyReferences({
        organizationIds: new Set([]),
        tags: new Set([]),
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

  test("create and patch full individual profile", async () => {
    // Arrange
    const createModel: CreateIndividualModel = generateCreateIndividualModel({
      images: {
        coverId: null,
        posterId: null,
        squareId: null,
      },
      organizations: [],
    });
    const patchModel: PatchIndividualModel = generatePatchIndividualModel({
      images: {},
      organizations: [],
    });

    // Act
    const createdProfile = await IndividualDao.create(createModel);
    patchModel.id = createdProfile.id;

    await IndividualDao.patch(patchModel);
    const patchedProfile = await IndividualDao.getById(patchModel.id);

    // Assert
    expect(createdProfile).toEqual<IndividualModel>({
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
      organizations: [],
      tags: createModel.tags,
    });
    expect(patchedProfile).toEqual<IndividualModel>({
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
      organizations: [],
      tags: patchModel.tags ?? createModel.tags,
    });
  });

  test.each([0, 1, 2])(
    "patch can update the organization list to have %s organizations",
    async (patchedOrgCount) => {
      // Arrange
      const createOrg1Model: CreateOrganizationModel =
        generateCreateOrganizationModel({
          images: {
            coverId: null,
            posterId: null,
            squareId: null,
          },
          members: [],
        });
      const org1Model = await OrganizationDao.create(createOrg1Model);
      const createOrg2Model: CreateOrganizationModel =
        generateCreateOrganizationModel({
          images: {
            coverId: null,
            posterId: null,
            squareId: null,
          },
          members: [],
        });
      const org2Model = await OrganizationDao.create(createOrg2Model);
      const createOrg3Model: CreateOrganizationModel =
        generateCreateOrganizationModel({
          images: {
            coverId: null,
            posterId: null,
            squareId: null,
          },
          members: [],
        });
      const org3Model = await OrganizationDao.create(createOrg3Model);
      const createModel: CreateIndividualModel = generateCreateIndividualModel({
        images: {
          coverId: null,
          posterId: null,
          squareId: null,
        },
        organizations: [
          {
            organizationId: org1Model.id,
            title: "technician",
          },
          {
            organizationId: org2Model.id,
            title: "drummer",
          },
          {
            organizationId: org3Model.id,
            title: "singer",
          },
        ],
      });
      const createdModel = await IndividualDao.create(createModel);
      const organizations = faker.helpers.shuffle([
        org1Model,
        org2Model,
        org3Model,
      ]);
      const patchModel: PatchIndividualModel = generatePatchIndividualModel({
        id: createdModel.id,
        images: {},
        organizations: Array.from({
          length: patchedOrgCount,
        }).map((_, i) => ({
          organizationId: organizations[i].id,
          title: faker.person.jobTitle(),
        })),
      });

      // Act
      await IndividualDao.patch(patchModel);
      const patchedProfile = await IndividualDao.getById(patchModel.id);

      // Assert
      expect(patchedProfile).not.toBeNull();
      expect(patchedProfile?.organizations).toHaveLength(patchedOrgCount);
      expect(patchedProfile).toMatchObject<
        Pick<IndividualModel, "organizations">
      >({
        organizations: patchedProfile?.organizations ?? [],
      });
    }
  );
});
