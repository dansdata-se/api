import { CoordsModel } from "@/model/profiles/coords";
import { ImagesModel } from "@/model/profiles/images";
import { LinkModel } from "@/model/profiles/link";
import {
  IndividualTag,
  OrganizationTag,
  ProfileEntity,
  ProfileType,
} from "@prisma/client";

type BaseProfileModel = {
  id: ProfileEntity["id"];
  type: ProfileType;
  name: string;
  description: string;
  links: LinkModel[];
  images: ImagesModel;
};

type ProfileReferenceModel = {
  id: BaseProfileModel["id"];
  type: ProfileType;
  name: BaseProfileModel["name"];
  images: BaseProfileModel["images"];
} & (
  | {
      type: typeof ProfileType.organization;
      tags: Array<OrganizationTag>;
    }
  | {
      type: typeof ProfileType.individual;
      tags: Array<IndividualTag>;
    }
);

export type OrganizationProfileModel = BaseProfileModel & {
  type: typeof ProfileType.organization;
  members: Array<
    ProfileReferenceModel & { type: typeof ProfileType.individual }
  >;
};
export type IndividualProfileModel = BaseProfileModel & {
  type: typeof ProfileType.individual;
  organizations: Array<
    ProfileReferenceModel & { type: typeof ProfileType.organization }
  >;
};
export type VenueProfileModel = BaseProfileModel & {
  type: typeof ProfileType.venue;
  coords: CoordsModel;
  parent: (ProfileReferenceModel & { type: typeof ProfileType.venue }) | null;
  children: Array<ProfileReferenceModel & { type: typeof ProfileType.venue }>;
};

export type ProfileModel =
  | IndividualProfileModel
  | OrganizationProfileModel
  | VenueProfileModel;

export function isOrganizationModel(
  profile: ProfileModel
): profile is OrganizationProfileModel {
  return profile.type === "organization";
}
export function isIndividualModel(
  profile: ProfileModel
): profile is IndividualProfileModel {
  return profile.type === "individual";
}
export function isVenueModel(
  profile: ProfileModel
): profile is VenueProfileModel {
  return profile.type === "venue";
}
