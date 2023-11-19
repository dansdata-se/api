import { BaseProfileReferenceModel } from "@/model/profiles/base/reference";
import { ProfileReferenceModel } from "@/model/profiles/reference";
import { OrganizationTag, ProfileType } from "@prisma/client";

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

export function isOrganizationReferenceModel(
  profile: ProfileReferenceModel
): profile is OrganizationReferenceModel {
  return profile.type === "organization";
}
