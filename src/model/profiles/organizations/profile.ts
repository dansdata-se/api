import { BaseProfileModel } from "@/model/profiles/base/profile";
import { IndividualReferenceModel } from "@/model/profiles/individuals/reference";
import { ProfileModel } from "@/model/profiles/profile";
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
