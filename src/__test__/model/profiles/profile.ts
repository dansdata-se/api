import { generateCoordsModel } from "@/__test__/model/profiles/coords";
import { generateImagesModel } from "@/__test__/model/profiles/images";
import { generateLinkModel } from "@/__test__/model/profiles/link";
import { BaseProfileModel, VenueModel } from "@/model/profiles/profile";
import { faker } from "@faker-js/faker";
import cuid2 from "@paralleldrive/cuid2";
import { ProfileType } from "@prisma/client";

export function generateBaseProfileModel(
  overrides: Partial<BaseProfileModel> = {}
): BaseProfileModel {
  return {
    id: cuid2.createId(),
    type: faker.helpers.arrayElement(Object.values(ProfileType)),
    name: faker.company.name(),
    description: faker.lorem.paragraphs(3),
    images: generateImagesModel(),
    links: Array.from({ length: faker.number.int({ min: 0, max: 10 }) }).map(
      () => generateLinkModel()
    ),
    ...overrides,
  };
}

export function generateVenueModel(
  overrides: Partial<VenueModel> = {}
): VenueModel {
  return {
    ...generateBaseProfileModel(),
    type: ProfileType.venue,
    coords: generateCoordsModel(),
    parent: null,
    rootParent: null,
    children: [],
    ...overrides,
  };
}
