import { generateBaseProfileModel } from "@/__test__/model/profiles/base/profile";
import { generateOrganizationReferenceModel } from "@/__test__/model/profiles/organizations/reference";
import { IndividualModel } from "@/model/profiles/individuals/profile";
import { faker } from "@faker-js/faker";
import { IndividualTag, ProfileType } from "@prisma/client";

export function generateIndividualModel(
  overrides: Partial<IndividualModel> = {}
): IndividualModel {
  return {
    ...generateBaseProfileModel(),
    type: ProfileType.individual,
    name: faker.company.name(),
    organizations: Array.from({
      length: faker.number.int({ min: 0, max: 10 }),
    }).map(() => ({
      profileReference: generateOrganizationReferenceModel(),
      title: faker.person.jobTitle(),
    })),
    tags: faker.helpers.arrayElements(Object.values(IndividualTag)),
    ...overrides,
  };
}
