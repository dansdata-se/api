import { BasePatchProfileModel } from "@/model/profiles/base/patch";
import { IndividualTag, ProfileEntity, ProfileType } from "@prisma/client";

/**
 * Represents the information required to update the profile of an individual.
 */
export interface PatchIndividualModel extends BasePatchProfileModel {
  type: typeof ProfileType.individual;
  tags?: IndividualTag[];
  organizations?: {
    title: string;
    organizationId: ProfileEntity["id"];
  }[];
}
