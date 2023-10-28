import { generateCoordsModel } from "@/__test__/model/profiles/coords";
import { generateBaseProfileModel } from "@/__test__/model/profiles/profile";
import { VenueModel } from "@/model/profiles/venues/profile";
import { ProfileType } from "@prisma/client";

export function generateVenueModel(
  overrides: Partial<VenueModel> = {}
): VenueModel {
  return {
    ...generateBaseProfileModel(),
    type: ProfileType.venue,
    coords: generateCoordsModel(),
    permanentlyClosed: false,
    ancestors: [],
    children: [],
    ...overrides,
  };
}
