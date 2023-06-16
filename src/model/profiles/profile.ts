import { CoordsModel } from "@/model/profiles/coords";
import { ImagesModel } from "@/model/profiles/images";
import { LinkModel } from "@/model/profiles/link";
import {
  IndividualReferenceModel,
  OrganizationReferenceModel,
  VenueReferenceModel,
} from "@/model/profiles/profile_reference";
import {
  IndividualTag,
  OrganizationTag,
  ProfileEntity,
  ProfileType,
} from "@prisma/client";

/**
 * Represents the common properties for full profiles.
 */
export type BaseProfileModel = {
  id: ProfileEntity["id"];
  type: ProfileType;
  name: string;
  description: string;
  links: LinkModel[];
  images: ImagesModel;
};

/**
 * Represents the full profile of an organization.
 */
export type OrganizationModel = BaseProfileModel & {
  type: typeof ProfileType.organization;
  tags: Array<OrganizationTag>;
  members: Array<IndividualReferenceModel>;
};

/**
 * Represents the full profile of an individual.
 */
export type IndividualModel = BaseProfileModel & {
  type: typeof ProfileType.individual;
  tags: Array<IndividualTag>;
  organizations: Array<OrganizationReferenceModel>;
};

/**
 * Represents the full profile of a venue.
 */
export type VenueModel = BaseProfileModel & {
  type: typeof ProfileType.venue;
  coords: CoordsModel;
  parent: VenueReferenceModel | null;
  children: Array<VenueReferenceModel>;
};

/**
 * Represents a full profile.
 */
export type ProfileModel = IndividualModel | OrganizationModel | VenueModel;

export function isOrganizationModel(
  profile: ProfileModel
): profile is OrganizationModel {
  return profile.type === "organization";
}
export function isIndividualModel(
  profile: ProfileModel
): profile is IndividualModel {
  return profile.type === "individual";
}
export function isVenueModel(profile: ProfileModel): profile is VenueModel {
  return profile.type === "venue";
}
