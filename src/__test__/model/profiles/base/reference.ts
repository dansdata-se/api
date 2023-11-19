import { generateImagesModel } from "@/__test__/model/profiles/images";
import { BaseProfileReferenceModel } from "@/model/profiles/base/reference";
import { faker } from "@faker-js/faker";
import cuid2 from "@paralleldrive/cuid2";
import { ProfileType } from "@prisma/client";

export function generateBaseProfileReferenceModel(
  overrides: Partial<BaseProfileReferenceModel> = {}
): BaseProfileReferenceModel {
  return {
    id: cuid2.createId(),
    type: faker.helpers.arrayElement(Object.values(ProfileType)),
    name: faker.company.name(),
    images: generateImagesModel(),
    ...overrides,
  };
}
