import { IndividualTag } from "@prisma/client";

/**
 * Represents an {@link IndividualTag} with related information.
 */
export interface IndividualTagDetailsModel {
  tag: IndividualTag;
  label: string;
  description: string;
}
