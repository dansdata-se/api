/**
 * @group integration
 */

import { mockCreateImageUploadUrlFetchResponses } from "@/__test__/cloudflare";
import { withTestDatabaseForEach } from "@/__test__/db";
import { generateCreateIndividualModel } from "@/__test__/model/profiles/individuals/create";
import { generateCreateVenueModel } from "@/__test__/model/profiles/venues/create";
import { generatePatchVenueModel } from "@/__test__/model/profiles/venues/patch";
import { BaseProfileDao } from "@/db/dao/profiles/base";
import { IndividualDao } from "@/db/dao/profiles/individual";
import { VenueDao } from "@/db/dao/profiles/venue";
import { ImageDao } from "@/db/dao/storage/image";
import { mapVenueModelToReferenceModel } from "@/mapping/profiles/venues/profile";
import { BaseProfileModel } from "@/model/profiles/base/profile";
import { CreateIndividualModel } from "@/model/profiles/individuals/create";
import { CreateVenueModel } from "@/model/profiles/venues/create";
import { PatchVenueModel } from "@/model/profiles/venues/patch";
import { VenueModel } from "@/model/profiles/venues/profile";
import { VenueReferenceModel } from "@/model/profiles/venues/reference";
import cuid2 from "@paralleldrive/cuid2";
import fetch from "jest-fetch-mock";

describe("VenueDao integration tests", () => {
  withTestDatabaseForEach();

  beforeAll(() => {
    fetch.enableMocks();
  });

  beforeEach(() => {
    fetch.resetMocks();
  });

  test("getById returns null if base profile is not found", async () => {
    await expect(VenueDao.getById("thisIdDoesNotExist")).resolves.toBeNull();
  });

  test("getById returns null for profile where type != venue", async () => {
    // Arrange
    const createModel: CreateIndividualModel = generateCreateIndividualModel();
    const individual = await IndividualDao.create(createModel);

    // Act
    const profile = await VenueDao.getById(individual.id);

    // Assert
    await expect(BaseProfileDao.getTypeById(individual.id)).resolves.toEqual(
      createModel.type
    );
    expect(profile).toBeNull();
  });

  test("create and retrieve full venue profile", async () => {
    // Arrange
    const cloudflareMockResponses = mockCreateImageUploadUrlFetchResponses();
    const { id: coverImageId } =
      await ImageDao.createImageUploadUrl("testUser");
    const { id: posterImageId } =
      await ImageDao.createImageUploadUrl("testUser");
    const { id: squareImageId } =
      await ImageDao.createImageUploadUrl("testUser");
    const venueLevel1CreateModel: CreateVenueModel = generateCreateVenueModel({
      images: {
        coverId: coverImageId,
        posterId: posterImageId,
        squareId: squareImageId,
      },
    });
    const venueLevel2CreateModel1: CreateVenueModel = generateCreateVenueModel({
      images: {
        coverId: coverImageId,
        posterId: null,
        squareId: squareImageId,
      },
    });
    const venueLevel2CreateModel2: CreateVenueModel = generateCreateVenueModel({
      images: {
        coverId: null,
        posterId: posterImageId,
        squareId: null,
      },
    });
    const venueLevel3CreateModel: CreateVenueModel = generateCreateVenueModel();

    // Act
    const venueLevel1Created = await VenueDao.create(venueLevel1CreateModel);

    venueLevel2CreateModel1.parentId = venueLevel1Created.id;
    const venueLevel2Created1 = await VenueDao.create(venueLevel2CreateModel1);

    venueLevel2CreateModel2.parentId = venueLevel1Created.id;
    const venueLevel2Created2 = await VenueDao.create(venueLevel2CreateModel2);

    venueLevel3CreateModel.parentId = venueLevel2Created1.id;
    const venueLevel3Created = await VenueDao.create(venueLevel3CreateModel);

    const venueLevel1Retrieved = await VenueDao.getById(venueLevel1Created.id);
    const venueLevel2Retrieved1 = await VenueDao.getById(
      venueLevel2Created1.id
    );
    const venueLevel2Retrieved2 = await VenueDao.getById(
      venueLevel2Created2.id
    );
    const venueLevel3Retrieved = await VenueDao.getById(venueLevel3Created.id);

    // Assert
    expect(cloudflareMockResponses).toHaveLength(3);
    expect(venueLevel1Retrieved).not.toBeNull();
    expect(venueLevel2Retrieved1).not.toBeNull();
    expect(venueLevel2Retrieved2).not.toBeNull();
    expect(venueLevel3Retrieved).not.toBeNull();
    if (
      venueLevel1Retrieved === null ||
      venueLevel2Retrieved1 === null ||
      venueLevel2Retrieved2 === null ||
      venueLevel3Retrieved === null
    ) {
      return;
    }

    expect(venueLevel1Retrieved).toEqual<VenueModel>({
      id: venueLevel1Created.id,
      type: venueLevel1CreateModel.type,
      name: venueLevel1CreateModel.name,
      description: venueLevel1CreateModel.description,
      coords: venueLevel1CreateModel.coords,
      links: venueLevel1CreateModel.links,
      permanentlyClosed: venueLevel1CreateModel.permanentlyClosed,
      ancestors: [],
      children: [
        mapVenueModelToReferenceModel(venueLevel2Retrieved1),
        mapVenueModelToReferenceModel(venueLevel2Retrieved2),
      ],
      images: {
        cover: {
          id: coverImageId,
          cloudflareId: cloudflareMockResponses[0].id,
        },
        poster: {
          id: posterImageId,
          cloudflareId: cloudflareMockResponses[1].id,
        },
        square: {
          id: squareImageId,
          cloudflareId: cloudflareMockResponses[2].id,
        },
      },
    });
    expect(venueLevel2Retrieved1).toEqual<VenueModel>({
      id: venueLevel2Created1.id,
      type: venueLevel2CreateModel1.type,
      name: venueLevel2CreateModel1.name,
      description: venueLevel2CreateModel1.description,
      coords: venueLevel2CreateModel1.coords,
      links: venueLevel2CreateModel1.links,
      permanentlyClosed: venueLevel2CreateModel1.permanentlyClosed,
      ancestors: [mapVenueModelToReferenceModel(venueLevel1Retrieved)],
      children: [mapVenueModelToReferenceModel(venueLevel3Retrieved)],
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
    });
    expect(venueLevel2Retrieved2).toEqual<VenueModel>({
      id: venueLevel2Created2.id,
      type: venueLevel2CreateModel2.type,
      name: venueLevel2CreateModel2.name,
      description: venueLevel2CreateModel2.description,
      coords: venueLevel2CreateModel2.coords,
      links: venueLevel2CreateModel2.links,
      permanentlyClosed: venueLevel2CreateModel2.permanentlyClosed,
      ancestors: [mapVenueModelToReferenceModel(venueLevel1Retrieved)],
      children: [],
      images: {
        cover: null,
        poster: {
          id: posterImageId,
          cloudflareId: cloudflareMockResponses[1].id,
        },
        square: null,
      },
    });
    expect(venueLevel3Retrieved).toEqual<VenueModel>({
      id: venueLevel3Created.id,
      type: venueLevel3CreateModel.type,
      name: venueLevel3CreateModel.name,
      description: venueLevel3CreateModel.description,
      coords: venueLevel3CreateModel.coords,
      links: venueLevel3CreateModel.links,
      permanentlyClosed: venueLevel3CreateModel.permanentlyClosed,
      ancestors: [
        mapVenueModelToReferenceModel(venueLevel1Retrieved),
        mapVenueModelToReferenceModel(venueLevel2Retrieved1),
      ],
      children: [],
      images: {
        cover: null,
        poster: null,
        square: null,
      },
    });
  });

  test("getReferenceById returns null if the base profile is not found", async () => {
    await expect(
      VenueDao.getReferenceById("thisIdDoesNotExist")
    ).resolves.toBeNull();
  });

  test("getReferenceById returns null for profile where type != venue", async () => {
    // Arrange
    const createModel: CreateIndividualModel = generateCreateIndividualModel();
    const individual = await IndividualDao.create(createModel);

    // Act
    const profile = await VenueDao.getReferenceById(individual.id);

    // Assert
    await expect(BaseProfileDao.getTypeById(individual.id)).resolves.toEqual(
      createModel.type
    );
    expect(profile).toBeNull();
  });

  test("getReferenceById resolves profile reference", async () => {
    // Arrange
    const createModel: CreateVenueModel = generateCreateVenueModel();

    // Act
    const createdProfile = await VenueDao.create(createModel);
    const retrievedProfile = await VenueDao.getReferenceById(createdProfile.id);

    // Assert
    expect(createdProfile).toEqual<VenueModel>({
      id: createdProfile.id,
      type: createModel.type,
      name: createModel.name,
      description: createModel.description,
      coords: createModel.coords,
      links: createModel.links,
      permanentlyClosed: createModel.permanentlyClosed,
      ancestors: [],
      children: [],
      images: {
        cover: null,
        poster: null,
        square: null,
      },
    });
    expect(retrievedProfile).toEqual<VenueReferenceModel>({
      id: createdProfile.id,
      type: createModel.type,
      name: createModel.name,
      coords: createModel.coords,
      permanentlyClosed: createModel.permanentlyClosed,
      images: {
        cover: null,
        poster: null,
        square: null,
      },
    });
  });

  test("create and patch full venue profile", async () => {
    // Arrange
    const venueLevel1CreateModel: CreateVenueModel = generateCreateVenueModel();
    const venueLevel2CreateModel: CreateVenueModel = generateCreateVenueModel();

    const venueLevel1PatchModel: PatchVenueModel = generatePatchVenueModel(
      cuid2.createId()
    );
    const venueLevel2PatchModel: PatchVenueModel = generatePatchVenueModel(
      cuid2.createId()
    );

    // Act
    const venueLevel1Created = await VenueDao.create(venueLevel1CreateModel);
    venueLevel1PatchModel.id = venueLevel1Created.id;
    venueLevel2PatchModel.parentId = venueLevel1Created.id;

    const venueLevel2Created = await VenueDao.create(venueLevel2CreateModel);
    venueLevel2PatchModel.id = venueLevel2Created.id;

    await VenueDao.patch(venueLevel1PatchModel);
    const venueLevel2Patched = await VenueDao.patch(venueLevel2PatchModel);
    const venueLevel1Patched = await VenueDao.getById(venueLevel1PatchModel.id);

    // Assert
    expect(venueLevel1Created).toMatchObject<
      Omit<VenueModel, keyof BaseProfileModel>
    >({
      coords: venueLevel1CreateModel.coords,
      permanentlyClosed: venueLevel1CreateModel.permanentlyClosed,
      ancestors: [],
      children: [],
    });
    expect(venueLevel2Created).toMatchObject<
      Omit<VenueModel, keyof BaseProfileModel>
    >({
      coords: venueLevel2CreateModel.coords,
      permanentlyClosed: venueLevel2CreateModel.permanentlyClosed,
      ancestors: [],
      children: [],
    });

    expect(venueLevel1Patched).not.toBeNull();
    expect(venueLevel2Patched).not.toBeNull();
    if (venueLevel1Patched === null || venueLevel2Patched === null) {
      return;
    }

    expect(venueLevel1Patched).toMatchObject<
      Omit<VenueModel, keyof BaseProfileModel>
    >({
      coords: venueLevel1PatchModel.coords ?? venueLevel1CreateModel.coords,
      permanentlyClosed:
        venueLevel1PatchModel.permanentlyClosed ??
        venueLevel1CreateModel.permanentlyClosed,
      ancestors: [],
      children: [mapVenueModelToReferenceModel(venueLevel2Patched)],
    });
    expect(venueLevel2Patched).toMatchObject<
      Omit<VenueModel, keyof BaseProfileModel>
    >({
      coords: venueLevel2PatchModel.coords ?? venueLevel2CreateModel.coords,
      permanentlyClosed:
        venueLevel2PatchModel.permanentlyClosed ??
        venueLevel2CreateModel.permanentlyClosed,
      ancestors: [mapVenueModelToReferenceModel(venueLevel1Patched)],
      children: [],
    });
  });
});
