import { CoordsModel } from "@/model/profiles/coords";
import { BaseProfileModel, ProfileModel } from "@/model/profiles/profile";
import { VenueReferenceModel } from "@/model/profiles/venues/profile_reference";
import { ProfileType } from "@prisma/client";

/**
 * Represents the full profile of a venue.
 */
export interface VenueModel extends BaseProfileModel {
  type: typeof ProfileType.venue;
  coords: CoordsModel;
  permanentlyClosed: boolean;
  ancestors: VenueReferenceModel[];
  children: VenueReferenceModel[];
}

export function isVenueModel(profile: ProfileModel): profile is VenueModel {
  return profile.type === "venue";
}
