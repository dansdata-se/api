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
});
