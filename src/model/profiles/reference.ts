import { IndividualReferenceModel } from "@/model/profiles/individuals/reference";
import { OrganizationReferenceModel } from "@/model/profiles/organizations/reference";
import { VenueReferenceModel } from "@/model/profiles/venues/reference";

/**
 * Represents a reference to a profile.
 *
 * Profile references are used when we need to include references to other
 * profiles (e.g. organization members) without including the full profile or
 * further references from the referenced profile.
 *
 * Example use case: A client is viewing the profile for a band. It may then
 * wish to list the band's members and provide links to view these profiles.
 * In this case, the client may wish to show images and names but has no need
 * to know that band member A is also a member of organization Z. In this case,
 * the active band would be a full profile whereas the band members would be
 * profile references.
 */
export type ProfileReferenceModel =
  | OrganizationReferenceModel
  | IndividualReferenceModel
  | VenueReferenceModel;
