import { generateCoordsModel } from "@/__test__/model/profiles/coords";
import { generateBaseProfileReferenceModel } from "@/__test__/model/profiles/profile_reference";
import { VenueReferenceModel } from "@/model/profiles/venues/profile_reference";
import { ProfileType } from "@prisma/client";

export function generateVenueReferenceModel(
  overrides: Partial<VenueReferenceModel> = {}
): VenueReferenceModel {
  return {
    ...generateBaseProfileReferenceModel(),
    type: ProfileType.venue,
    coords: generateCoordsModel(),
    permanentlyClosed: false,
    ...overrides,
  };
}
