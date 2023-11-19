/**
 * @group integration
 */

import { mockCreateImageUploadUrlFetchResponses } from "@/__test__/cloudflare";
import { withTestDatabaseForEach } from "@/__test__/db";
import { generateCreateIndividualModel } from "@/__test__/model/profiles/individuals/create";
import { generateCreateOrganizationModel } from "@/__test__/model/profiles/organizations/create";
import { BaseProfileDao } from "@/db/dao/profiles/base";
import { IndividualDao } from "@/db/dao/profiles/individual";
import { OrganizationDao } from "@/db/dao/profiles/organization";
import { ImageDao } from "@/db/dao/storage/image";
import { CreateIndividualModel } from "@/model/profiles/individuals/create";
import { CreateOrganizationModel } from "@/model/profiles/organizations/create";
import { OrganizationModel } from "@/model/profiles/organizations/profile";
import { OrganizationReferenceModel } from "@/model/profiles/organizations/reference";
import { faker } from "@faker-js/faker";
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
    const createModel: CreateIndividualModel = generateCreateIndividualModel({
      images: {
        coverId: null,
        posterId: null,
        squareId: null,
      },
      organizations: [],
    });
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
        organizations: [],
      });
    const individual1Model = await IndividualDao.create(createIndividual1Model);
    const createIndividual2Model: CreateIndividualModel =
      generateCreateIndividualModel({
        images: {
          coverId: null,
          posterId: posterImageId,
          squareId: squareImageId,
        },
        organizations: [],
      });
    const individual2Model = await IndividualDao.create(createIndividual2Model);
    const createModel: CreateOrganizationModel =
      generateCreateOrganizationModel({
        images: {
          coverId: null,
          posterId: null,
          squareId: null,
        },
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
    const createModel: CreateIndividualModel = generateCreateIndividualModel({
      images: {
        coverId: null,
        posterId: null,
        squareId: null,
      },
      organizations: [],
    });
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
      generateCreateOrganizationModel({
        images: {
          coverId: null,
          posterId: null,
          squareId: null,
        },
        members: [],
      });

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
});
