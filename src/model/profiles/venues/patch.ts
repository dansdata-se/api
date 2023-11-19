import { BasePatchProfileModel } from "@/model/profiles/base/patch";
import { CoordsModel } from "@/model/profiles/coords";
import { ProfileEntity, ProfileType } from "@prisma/client";

/**
 * Represents the information required to update the profile of a venue.
 */
export interface PatchVenueModel extends BasePatchProfileModel {
  type: typeof ProfileType.venue;
  coords?: CoordsModel;
  permanentlyClosed?: boolean;
  parentId?: ProfileEntity["id"] | null;
}
