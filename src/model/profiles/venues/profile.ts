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
  /**
   * _All ancestors_ of this venue, starting from the root ancestor and ending with
   * the venue's direct parent.
   */
  ancestors: VenueReferenceModel[];
  /**
   * _Direct_ children of this venue.
   *
   * Note that this array does not contain children's children as this could
   * theoretically explode in size (though in practice, that would be most unexpected).
   */
  children: VenueReferenceModel[];
}

export function isVenueModel(profile: ProfileModel): profile is VenueModel {
  return profile.type === "venue";
}
