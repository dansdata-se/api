import {
  BaseProfileReferenceModel,
  ProfileReferenceModel,
} from "@/model/profiles/profile_reference";
import { IndividualTag, ProfileType } from "@prisma/client";

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

export function isIndividualReferenceModel(
  profile: ProfileReferenceModel
): profile is IndividualReferenceModel {
  return profile.type === "individual";
}
