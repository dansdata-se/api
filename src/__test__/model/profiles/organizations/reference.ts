import { generateBaseProfileReferenceModel } from "@/__test__/model/profiles/base/reference";
import { OrganizationReferenceModel } from "@/model/profiles/organizations/reference";
import { faker } from "@faker-js/faker";
import { OrganizationTag, ProfileType } from "@prisma/client";

export function generateOrganizationReferenceModel(
  overrides: Partial<OrganizationReferenceModel> = {}
): OrganizationReferenceModel {
  return {
    ...generateBaseProfileReferenceModel(),
    type: ProfileType.organization,
    name: faker.company.name(),
    tags: faker.helpers.arrayElements(Object.values(OrganizationTag)),
    ...overrides,
  };
}
