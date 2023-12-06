import { generateLinkModel } from "@/__test__/model/profiles/link";
import { BasePatchProfileModel } from "@/model/profiles/base/patch";
import { faker } from "@faker-js/faker";
import { ProfileType } from "@prisma/client";

export function generateBasePatchProfileModel(
  id: BasePatchProfileModel["id"],
  overrides: Partial<Omit<BasePatchProfileModel, "id">> = {}
): BasePatchProfileModel {
  return {
    id,
    type: faker.helpers.arrayElement(Object.values(ProfileType)),
    name: faker.helpers.maybe(() => faker.company.name()),
    description: faker.helpers.maybe(() => faker.lorem.paragraphs(3)),
    images: {},
    links: faker.helpers.maybe(() =>
      Array.from({ length: faker.number.int({ min: 0, max: 10 }) }).map(() =>
        generateLinkModel()
      )
    ),
    ...overrides,
  };
}
