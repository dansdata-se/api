import { ImagesModel } from "@/model/profiles/images";
import { ProfileEntity, ProfileType } from "@prisma/client";

/**
 * Represents the common properties for profile references.
 *
 * Profile references are used when we need to include references to other
 * profiles (e.g. organization members) without including the full profile or
 * further references from the referenced profile.
 */
export interface BaseProfileReferenceModel {
  id: ProfileEntity["id"];
  type: ProfileType;
  name: string;
  images: ImagesModel;
}
