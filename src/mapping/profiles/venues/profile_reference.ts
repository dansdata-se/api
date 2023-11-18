import { VenueReferenceDto } from "@/api/dto/profiles/venues/profile_reference";
import { mapBaseProfileReferenceModelToDto } from "@/mapping/profiles/base_reference";
import { VenueReferenceModel } from "@/model/profiles/venues/profile_reference";

export function mapVenueReferenceModelToDto(
  model: VenueReferenceModel
): VenueReferenceDto {
  return {
    ...mapBaseProfileReferenceModelToDto(model),
    coords: model.coords,
    permanentlyClosed: model.permanentlyClosed,
  };
}
