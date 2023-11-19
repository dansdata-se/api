import { VenueDto } from "@/api/dto/profiles/venues/profile";
import {
  mapBaseProfileModelToDto,
  mapBaseProfileModelToReferenceModel,
} from "@/mapping/profiles/base/profile";
import { mapVenueReferenceModelToDto } from "@/mapping/profiles/venues/reference";
import { VenueModel } from "@/model/profiles/venues/profile";
import { VenueReferenceModel } from "@/model/profiles/venues/reference";

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
