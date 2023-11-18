import { generateCoordsModel } from "@/__test__/model/profiles/coords";
import { generateBaseProfileReferenceModel } from "@/__test__/model/profiles/profile_reference";
import { VenueReferenceModel } from "@/model/profiles/venues/profile_reference";
import { faker } from "@faker-js/faker";
import { ProfileType } from "@prisma/client";

export function generateVenueReferenceModel(
  overrides: Partial<VenueReferenceModel> = {}
): VenueReferenceModel {
  return {
    ...generateBaseProfileReferenceModel(),
    type: ProfileType.venue,
    name: faker.commerce.department(),
    coords: generateCoordsModel(),
    permanentlyClosed: faker.datatype.boolean({ probability: 0.2 }),
    ...overrides,
  };
}
