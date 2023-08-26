import { OrganizationTag } from "@prisma/client";

/**
 * Represents an {@link OrganizationTag} with related information.
 */
export interface OrganizationTagDetailsModel {
  tag: OrganizationTag;
  label: string;
  description: string;
}
