import { IndividualModel } from "@/model/profiles/individuals/profile";
import { OrganizationModel } from "@/model/profiles/organizations/profile";
import { VenueModel } from "@/model/profiles/venues/profile";

/**
 * Represents a full profile.
 */
export type ProfileModel = IndividualModel | OrganizationModel | VenueModel;
