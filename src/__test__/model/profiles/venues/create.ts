import { generateBaseCreateProfileModel } from "@/__test__/model/profiles/base/create";
import { generateCoordsModel } from "@/__test__/model/profiles/coords";
import { CreateVenueModel } from "@/model/profiles/venues/create";
import { faker } from "@faker-js/faker";
import { createId } from "@paralleldrive/cuid2";
import { ProfileType } from "@prisma/client";

export function generateCreateVenueModel(
  overrides: Partial<CreateVenueModel> = {}
): CreateVenueModel {
  return {
    ...generateBaseCreateProfileModel(),
    type: ProfileType.venue,
    name: faker.commerce.department(),
    coords: generateCoordsModel(),
    permanentlyClosed: faker.datatype.boolean({ probability: 0.2 }),
    parentId: faker.datatype.boolean() ? createId() : null,
    ...overrides,
  };
}
