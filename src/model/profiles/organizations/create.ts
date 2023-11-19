import { BaseCreateProfileModel } from "@/model/profiles/base/create";
import { OrganizationTag, ProfileEntity, ProfileType } from "@prisma/client";

/**
 * Represents the information required to create the profile of an organization.
 */
export interface CreateOrganizationModel extends BaseCreateProfileModel {
  type: typeof ProfileType.organization;
  tags: OrganizationTag[];
  members: {
    title: string;
    individualId: ProfileEntity["id"];
  }[];
}
