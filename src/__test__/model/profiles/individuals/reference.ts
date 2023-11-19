import { generateBaseProfileReferenceModel } from "@/__test__/model/profiles/base/reference";
import { IndividualReferenceModel } from "@/model/profiles/individuals/reference";
import { faker } from "@faker-js/faker";
import { IndividualTag, ProfileType } from "@prisma/client";

export function generateIndividualReferenceModel(
  overrides: Partial<IndividualReferenceModel> = {}
): IndividualReferenceModel {
  return {
    ...generateBaseProfileReferenceModel(),
    type: ProfileType.individual,
    name: faker.person.fullName(),
    tags: faker.helpers.arrayElements(Object.values(IndividualTag)),
    ...overrides,
  };
}
