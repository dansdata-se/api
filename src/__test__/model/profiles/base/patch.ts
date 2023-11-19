import { generateLinkModel } from "@/__test__/model/profiles/link";
import { BasePatchProfileModel } from "@/model/profiles/base/patch";
import { faker } from "@faker-js/faker";
import { createId } from "@paralleldrive/cuid2";
import { ProfileType } from "@prisma/client";

export function generateBasePatchProfileModel(
  overrides: Partial<BasePatchProfileModel> = {}
): BasePatchProfileModel {
  return {
    id: createId(),
    type: faker.helpers.arrayElement(Object.values(ProfileType)),
    name: faker.helpers.maybe(() => faker.company.name()),
    description: faker.helpers.maybe(() => faker.lorem.paragraphs(3)),
    images: {
      coverId: faker.helpers.maybe(
        () => faker.helpers.maybe(() => createId()) ?? null
      ),
      posterId: faker.helpers.maybe(
        () => faker.helpers.maybe(() => createId()) ?? null
      ),
      squareId: faker.helpers.maybe(
        () => faker.helpers.maybe(() => createId()) ?? null
      ),
    },
    links: faker.helpers.maybe(() =>
      Array.from({ length: faker.number.int({ min: 0, max: 10 }) }).map(() =>
        generateLinkModel()
      )
    ),
    ...overrides,
  };
}
