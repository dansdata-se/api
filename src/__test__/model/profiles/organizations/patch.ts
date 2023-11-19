import { generateBasePatchProfileModel } from "@/__test__/model/profiles/base/patch";
import { PatchOrganizationModel } from "@/model/profiles/organizations/patch";
import { faker } from "@faker-js/faker";
import { createId } from "@paralleldrive/cuid2";
import { OrganizationTag, ProfileType } from "@prisma/client";

export function generatePatchOrganizationModel(
  overrides: Partial<PatchOrganizationModel> = {}
): PatchOrganizationModel {
  return {
    ...generateBasePatchProfileModel(),
    type: ProfileType.organization,
    name: faker.helpers.maybe(() => faker.person.fullName()),
    members: faker.helpers.maybe(() =>
      Array.from({ length: faker.number.int({ min: 0, max: 10 }) }).map(() => ({
        individualId: createId(),
        title: faker.person.jobTitle(),
      }))
    ),
    tags: faker.helpers.maybe(() =>
      faker.helpers.arrayElements(Object.values(OrganizationTag))
    ),
    ...overrides,
  };
}
