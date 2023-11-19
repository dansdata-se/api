import { generateBasePatchProfileModel } from "@/__test__/model/profiles/base/patch";
import { PatchIndividualModel } from "@/model/profiles/individuals/patch";
import { faker } from "@faker-js/faker";
import { createId } from "@paralleldrive/cuid2";
import { IndividualTag, ProfileType } from "@prisma/client";

export function generatePatchIndividualModel(
  overrides: Partial<PatchIndividualModel> = {}
): PatchIndividualModel {
  return {
    ...generateBasePatchProfileModel(),
    type: ProfileType.individual,
    name: faker.helpers.maybe(() => faker.person.fullName()),
    organizations: faker.helpers.maybe(() =>
      Array.from({
        length: faker.number.int({ min: 0, max: 10 }),
      }).map(() => ({
        organizationId: createId(),
        title: faker.person.jobTitle(),
      }))
    ),
    tags: faker.helpers.maybe(() =>
      faker.helpers.arrayElements(Object.values(IndividualTag))
    ),
    ...overrides,
  };
}
