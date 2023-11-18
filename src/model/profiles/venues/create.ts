import { CoordsModel } from "@/model/profiles/coords";
import { BaseCreateProfileModel } from "@/model/profiles/create";
import { ProfileEntity, ProfileType } from "@prisma/client";

/**
 * Represents the information required to create the profile of a venue.
 */
export interface CreateVenueModel extends BaseCreateProfileModel {
  type: typeof ProfileType.venue;
  coords: CoordsModel;
  permanentlyClosed: boolean;
  parentId: ProfileEntity["id"] | null;
}
