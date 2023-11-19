import { LinkModel } from "@/model/profiles/link";
import { ImageModel } from "@/model/storage/image";
import { ProfileType } from "@prisma/client";

/**
 * Represents the common properties for creating profiles.
 */
export interface BaseCreateProfileModel {
  type: ProfileType;
  name: string;
  description: string;
  links: LinkModel[];
  images: {
    coverId: ImageModel["id"] | null;
    posterId: ImageModel["id"] | null;
    squareId: ImageModel["id"] | null;
  };
}
