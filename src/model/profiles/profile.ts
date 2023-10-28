import { ImagesModel } from "@/model/profiles/images";
import { IndividualModel } from "@/model/profiles/individuals/profile";
import { LinkModel } from "@/model/profiles/link";
import { OrganizationModel } from "@/model/profiles/organizations/profile";
import { VenueModel } from "@/model/profiles/venues/profile";
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

/**
 * Represents a full profile.
 */
export type ProfileModel = IndividualModel | OrganizationModel | VenueModel;
