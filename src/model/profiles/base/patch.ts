import { LinkModel } from "@/model/profiles/link";
import { ImageModel } from "@/model/storage/image";
import { ProfileEntity, ProfileType } from "@prisma/client";

/**
 * Represents the common properties for updating profiles.
 */
export interface BasePatchProfileModel {
  id: ProfileEntity["id"];
  type: ProfileType;
  name?: string;
  description?: string;
  links?: LinkModel[];
  images?: {
    coverId?: ImageModel["id"] | null;
    posterId?: ImageModel["id"] | null;
    squareId?: ImageModel["id"] | null;
  };
}
