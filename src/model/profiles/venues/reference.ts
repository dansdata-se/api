import { BaseProfileReferenceModel } from "@/model/profiles/base/reference";
import { CoordsModel } from "@/model/profiles/coords";
import { ProfileReferenceModel } from "@/model/profiles/reference";
import { ProfileType } from "@prisma/client";

/**
 * Represents a reference to a Venue.
 *
 * Profile references are used when we need to include references to other
 * profiles (e.g. organization members) without including the full profile or
 * further references from the referenced profile.
 *
 * @see {@link ProfileReferenceModel}
 */
export type VenueReferenceModel = BaseProfileReferenceModel & {
  type: typeof ProfileType.venue;
  coords: CoordsModel;
  permanentlyClosed: boolean;
};

export function isVenueReferenceModel(
  profile: ProfileReferenceModel
): profile is VenueReferenceModel {
  return profile.type === "venue";
}
