import { generateBasePatchProfileModel } from "@/__test__/model/profiles/base/patch";
import { generateCoordsModel } from "@/__test__/model/profiles/coords";
import { PatchVenueModel } from "@/model/profiles/venues/patch";
import { faker } from "@faker-js/faker";
import { createId } from "@paralleldrive/cuid2";
import { ProfileType } from "@prisma/client";

export function generatePatchVenueModel(
  overrides: Partial<PatchVenueModel> = {}
): PatchVenueModel {
  return {
    ...generateBasePatchProfileModel(),
    type: ProfileType.venue,
    name: faker.helpers.maybe(() => faker.commerce.department()),
    coords: faker.helpers.maybe(() => generateCoordsModel()),
    permanentlyClosed: faker.helpers.maybe(() =>
      faker.datatype.boolean({ probability: 0.2 })
    ),
    parentId: faker.helpers.maybe(() =>
      faker.datatype.boolean() ? createId() : null
    ),
    ...overrides,
  };
}
