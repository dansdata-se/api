import { generateLinkModel } from "@/__test__/model/profiles/link";
import { BaseCreateProfileModel } from "@/model/profiles/create";
import { faker } from "@faker-js/faker";
import { createId } from "@paralleldrive/cuid2";
import { ProfileType } from "@prisma/client";

export function generateBaseCreateProfileModel(
  overrides: Partial<BaseCreateProfileModel> = {}
): BaseCreateProfileModel {
  return {
    type: faker.helpers.arrayElement(Object.values(ProfileType)),
    name: faker.company.name(),
    description: faker.lorem.paragraphs(3),
    images: {
      coverId: faker.helpers.maybe(() => createId()) ?? null,
      posterId: faker.helpers.maybe(() => createId()) ?? null,
      squareId: faker.helpers.maybe(() => createId()) ?? null,
    },
    links: Array.from({ length: faker.number.int({ min: 0, max: 10 }) }).map(
      () => generateLinkModel()
    ),
    ...overrides,
  };
}
