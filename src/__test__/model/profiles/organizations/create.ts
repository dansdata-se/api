import { generateBaseCreateProfileModel } from "@/__test__/model/profiles/create";
import { CreateOrganizationModel } from "@/model/profiles/organizations/create";
import { faker } from "@faker-js/faker";
import { createId } from "@paralleldrive/cuid2";
import { OrganizationTag, ProfileType } from "@prisma/client";

export function generateCreateOrganizationModel(
  overrides: Partial<CreateOrganizationModel> = {}
): CreateOrganizationModel {
  return {
    ...generateBaseCreateProfileModel(),
    type: ProfileType.organization,
    name: faker.company.name(),
    members: Array.from({ length: faker.number.int({ min: 0, max: 10 }) }).map(
      () => ({
        individualId: createId(),
        title: faker.person.jobTitle(),
      })
    ),
    tags: faker.helpers.arrayElements(Object.values(OrganizationTag)),
    ...overrides,
  };
}
