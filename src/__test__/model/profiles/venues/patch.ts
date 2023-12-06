import { generateBasePatchProfileModel } from "@/__test__/model/profiles/base/patch";
import { generateCoordsModel } from "@/__test__/model/profiles/coords";
import { PatchVenueModel } from "@/model/profiles/venues/patch";
import { faker } from "@faker-js/faker";
import { ProfileType } from "@prisma/client";

export function generatePatchVenueModel(
  id: PatchVenueModel["id"],
  overrides: Partial<Omit<PatchVenueModel, "id">> = {}
): PatchVenueModel {
  return {
    ...generateBasePatchProfileModel(id),
    type: ProfileType.venue,
    name: faker.helpers.maybe(() => faker.commerce.department()),
    coords: faker.helpers.maybe(() => generateCoordsModel()),
    permanentlyClosed: faker.helpers.maybe(() =>
      faker.datatype.boolean({ probability: 0.2 })
    ),
    parentId: null,
    ...overrides,
  };
}
