import { IndividualReferenceModel } from "@/model/profiles/individuals/profile_reference";
import { BaseProfileModel, ProfileModel } from "@/model/profiles/profile";
import { OrganizationTag, ProfileType } from "@prisma/client";

/**
 * Represents the full profile of an organization.
 */
export interface OrganizationModel extends BaseProfileModel {
  type: typeof ProfileType.organization;
  tags: OrganizationTag[];
  members: {
    title: string;
    profileReference: IndividualReferenceModel;
  }[];
}

export function isOrganizationModel(
  profile: ProfileModel
): profile is OrganizationModel {
  return profile.type === "organization";
}
