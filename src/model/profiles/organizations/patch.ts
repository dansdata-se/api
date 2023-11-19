import { BasePatchProfileModel } from "@/model/profiles/base/patch";
import { OrganizationTag, ProfileEntity, ProfileType } from "@prisma/client";

/**
 * Represents the information required to update the profile of an organization.
 */
export interface PatchOrganizationModel extends BasePatchProfileModel {
  type: typeof ProfileType.organization;
  tags?: OrganizationTag[];
  members?: {
    title: string;
    individualId: ProfileEntity["id"];
  }[];
}
