import { generateBaseCreateProfileModel } from "@/__test__/model/profiles/base/create";
import { CreateIndividualModel } from "@/model/profiles/individuals/create";
import { faker } from "@faker-js/faker";
import { createId } from "@paralleldrive/cuid2";
import { IndividualTag, ProfileType } from "@prisma/client";

export function generateCreateIndividualModel(
  overrides: Partial<CreateIndividualModel> = {}
): CreateIndividualModel {
  return {
    ...generateBaseCreateProfileModel(),
    type: ProfileType.individual,
    name: faker.person.fullName(),
    organizations: Array.from({
      length: faker.number.int({ min: 0, max: 10 }),
    }).map(() => ({
      organizationId: createId(),
      title: faker.person.jobTitle(),
    })),
    tags: faker.helpers.arrayElements(Object.values(IndividualTag)),
    ...overrides,
  };
}
