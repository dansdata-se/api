import { generateBaseProfileModel } from "@/__test__/model/profiles/base/profile";
import { generateCoordsModel } from "@/__test__/model/profiles/coords";
import { generateVenueReferenceModel } from "@/__test__/model/profiles/venues/reference";
import { VenueModel } from "@/model/profiles/venues/profile";
import { faker } from "@faker-js/faker";
import { ProfileType } from "@prisma/client";

export function generateVenueModel(
  overrides: Partial<VenueModel> = {}
): VenueModel {
  return {
    ...generateBaseProfileModel(),
    type: ProfileType.venue,
    name: faker.commerce.department(),
    coords: generateCoordsModel(),
    permanentlyClosed: faker.datatype.boolean({ probability: 0.9 }),
    ancestors: Array.from({
      length: faker.number.int({ min: 0, max: 10 }),
    }).map(() => generateVenueReferenceModel()),
    children: Array.from({
      length: faker.number.int({ min: 0, max: 10 }),
    }).map(() => generateVenueReferenceModel()),
    ...overrides,
  };
}
