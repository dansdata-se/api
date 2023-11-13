import { generateIndividualReferenceModel } from "@/__test__/model/profiles/individuals/profile_reference";
import { generateBaseProfileModel } from "@/__test__/model/profiles/profile";
import { OrganizationModel } from "@/model/profiles/organizations/profile";
import { faker } from "@faker-js/faker";
import { OrganizationTag, ProfileType } from "@prisma/client";

export function generateOrganizationModel(
  overrides: Partial<OrganizationModel> = {}
): OrganizationModel {
  return {
    ...generateBaseProfileModel(),
    type: ProfileType.organization,
    name: faker.company.name(),
    members: Array.from({ length: faker.number.int({ min: 0, max: 10 }) }).map(
      () => ({
        profileReference: generateIndividualReferenceModel(),
        title: faker.person.jobTitle(),
      })
    ),
    tags: faker.helpers.arrayElements(Object.values(OrganizationTag)),
    ...overrides,
  };
}
