import { generateBaseCreateProfileModel } from "@/__test__/model/profiles/base/create";
import { CreateOrganizationModel } from "@/model/profiles/organizations/create";
import { faker } from "@faker-js/faker";
import { OrganizationTag, ProfileType } from "@prisma/client";

export function generateCreateOrganizationModel(
  overrides: Partial<CreateOrganizationModel> = {}
): CreateOrganizationModel {
  return {
    ...generateBaseCreateProfileModel(),
    type: ProfileType.organization,
    name: faker.company.name(),
    members: [],
    tags: faker.helpers.arrayElements(Object.values(OrganizationTag)),
    ...overrides,
  };
}
