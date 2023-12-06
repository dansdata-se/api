import { generateBaseCreateProfileModel } from "@/__test__/model/profiles/base/create";
import { CreateIndividualModel } from "@/model/profiles/individuals/create";
import { faker } from "@faker-js/faker";
import { IndividualTag, ProfileType } from "@prisma/client";

export function generateCreateIndividualModel(
  overrides: Partial<CreateIndividualModel> = {}
): CreateIndividualModel {
  return {
    ...generateBaseCreateProfileModel(),
    type: ProfileType.individual,
    name: faker.person.fullName(),
    organizations: [],
    tags: faker.helpers.arrayElements(Object.values(IndividualTag)),
    ...overrides,
  };
}
