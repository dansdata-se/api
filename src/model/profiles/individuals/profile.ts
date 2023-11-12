import { BaseProfileModel } from "@/model/profiles/base";
import { OrganizationReferenceModel } from "@/model/profiles/organizations/profile_reference";
import { ProfileModel } from "@/model/profiles/profile";
import { IndividualTag, ProfileType } from "@prisma/client";

/**
 * Represents the full profile of an individual.
 */
export interface IndividualModel extends BaseProfileModel {
  type: typeof ProfileType.individual;
  tags: IndividualTag[];
  organizations: {
    title: string;
    profileReference: OrganizationReferenceModel;
  }[];
}

export function isIndividualModel(
  profile: ProfileModel
): profile is IndividualModel {
  return profile.type === "individual";
}
