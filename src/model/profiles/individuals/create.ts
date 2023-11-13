import { BaseCreateProfileModel } from "@/model/profiles/create";
import { IndividualTag, ProfileEntity, ProfileType } from "@prisma/client";

/**
 * Represents the information required to create the profile of an individual.
 */
export interface CreateIndividualModel extends BaseCreateProfileModel {
  type: typeof ProfileType.individual;
  tags: IndividualTag[];
  organizations: {
    title: string;
    organizationId: ProfileEntity["id"];
  }[];
}
