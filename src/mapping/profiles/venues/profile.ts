import { VenueDto } from "@/api/dto/profiles/venues/profile";
import {
  mapBaseProfileModelToDto,
  mapBaseProfileModelToReferenceModel,
} from "@/mapping/profiles/base";
import { mapVenueReferenceModelToDto } from "@/mapping/profiles/venues/profile_reference";
import { VenueModel } from "@/model/profiles/venues/profile";
import { VenueReferenceModel } from "@/model/profiles/venues/profile_reference";

export function mapVenueModelToDto(model: VenueModel): VenueDto {
  return {
    ...mapBaseProfileModelToDto(model),
    coords: model.coords,
    permanentlyClosed: model.permanentlyClosed,
    ancestors: model.ancestors.map(mapVenueReferenceModelToDto),
    children: model.children.map(mapVenueReferenceModelToDto),
  };
}

export function mapVenueModelToReferenceModel(
  model: VenueModel
): VenueReferenceModel {
  return {
    ...mapBaseProfileModelToReferenceModel(model),
    coords: model.coords,
    permanentlyClosed: model.permanentlyClosed,
  };
}
