import { generateBasePatchProfileModel } from "@/__test__/model/profiles/base/patch";
import { PatchOrganizationModel } from "@/model/profiles/organizations/patch";
import { faker } from "@faker-js/faker";
import { OrganizationTag, ProfileType } from "@prisma/client";

export function generatePatchOrganizationModel(
  id: PatchOrganizationModel["id"],
  overrides: Partial<Omit<PatchOrganizationModel, "id">> = {}
): PatchOrganizationModel {
  return {
    ...generateBasePatchProfileModel(id),
    type: ProfileType.organization,
    name: faker.helpers.maybe(() => faker.person.fullName()),
    members: [],
    tags: faker.helpers.maybe(() =>
      faker.helpers.arrayElements(Object.values(OrganizationTag))
    ),
    ...overrides,
  };
}
