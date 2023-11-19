import { VenueReferenceDto } from "@/api/dto/profiles/venues/reference";
import { mapBaseProfileReferenceModelToDto } from "@/mapping/profiles/base/reference";
import { VenueReferenceModel } from "@/model/profiles/venues/reference";

export function mapVenueReferenceModelToDto(
  model: VenueReferenceModel
): VenueReferenceDto {
  return {
    ...mapBaseProfileReferenceModelToDto(model),
    coords: model.coords,
    permanentlyClosed: model.permanentlyClosed,
  };
}
