import { ImagesModel } from "@/model/profiles/images";
import { LinkModel } from "@/model/profiles/link";
import { ProfileEntity, ProfileType } from "@prisma/client";

/**
 * Represents the common properties for full profiles.
 */
export interface BaseProfileModel {
  id: ProfileEntity["id"];
  type: ProfileType;
  name: string;
  description: string;
  links: LinkModel[];
  images: ImagesModel;
}
