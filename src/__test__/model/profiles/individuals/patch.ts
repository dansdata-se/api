import { generateBasePatchProfileModel } from "@/__test__/model/profiles/base/patch";
import { PatchIndividualModel } from "@/model/profiles/individuals/patch";
import { faker } from "@faker-js/faker";
import { IndividualTag, ProfileType } from "@prisma/client";

export function generatePatchIndividualModel(
  id: PatchIndividualModel["id"],
  overrides: Partial<Omit<PatchIndividualModel, "id">> = {}
): PatchIndividualModel {
  return {
    ...generateBasePatchProfileModel(id),
    type: ProfileType.individual,
    name: faker.helpers.maybe(() => faker.person.fullName()),
    organizations: [],
    tags: faker.helpers.maybe(() =>
      faker.helpers.arrayElements(Object.values(IndividualTag))
    ),
    ...overrides,
  };
}
