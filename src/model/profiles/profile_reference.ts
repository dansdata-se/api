import { CoordsModel } from "@/model/profiles/coords";
import { ImagesModel } from "@/model/profiles/images";
import {
  IndividualTag,
  OrganizationTag,
  ProfileEntity,
  ProfileType,
} from "@prisma/client";

/**
 * Represents the common properties for profile references.
 *
 * Profile references are used when we need to include references to other
 * profiles (e.g. organization members) without including the full profile or
 * further references from the referenced profile.
 *
 * @see {@link ProfileReferenceModel}
 */
export interface BaseProfileReferenceModel {
  id: ProfileEntity["id"];
  type: ProfileType;
  name: string;
  images: ImagesModel;
}

/**
 * Represents a reference to an Organization.
 *
 * Profile references are used when we need to include references to other
 * profiles (e.g. organization members) without including the full profile or
 * further references from the referenced profile.
 *
 * @see {@link ProfileReferenceModel}
 */
export type OrganizationReferenceModel = BaseProfileReferenceModel & {
  type: typeof ProfileType.organization;
  tags: OrganizationTag[];
};

/**
 * Represents a reference to an Individual.
 *
 * Profile references are used when we need to include references to other
 * profiles (e.g. organization members) without including the full profile or
 * further references from the referenced profile.
 *
 * @see {@link ProfileReferenceModel}
 */
export type IndividualReferenceModel = BaseProfileReferenceModel & {
  type: typeof ProfileType.individual;
  tags: IndividualTag[];
};
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
};

/**
 * Represents a reference to a profile.
 *
 * Profile references are used when we need to include references to other
 * profiles (e.g. organization members) without including the full profile or
 * further references from the referenced profile.
 *
 * Example use case: A client is viewing the profile for a band. It may then
 * wish to list the band's members and provide links to view these profiles.
 * In this case, the client may wish to show images and names but has no need
 * to know that band member A is also a member of organization Z. In this case,
 * the active band would be a full profile whereas the band members would be
 * profile references.
 */
export type ProfileReferenceModel =
  | OrganizationReferenceModel
  | IndividualReferenceModel
  | VenueReferenceModel;

export function isOrganizationReferenceModel(
  profile: ProfileReferenceModel
): profile is OrganizationReferenceModel {
  return profile.type === "organization";
}
export function isIndividualReferenceModel(
  profile: ProfileReferenceModel
): profile is IndividualReferenceModel {
  return profile.type === "individual";
}
export function isVenueReferenceModel(
  profile: ProfileReferenceModel
): profile is VenueReferenceModel {
  return profile.type === "venue";
}
