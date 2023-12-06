import { VenueFilterParameters } from "@/api/dto/profiles/venues/filter";
import { VenueFilterModel } from "@/model/profiles/venues/filter";

export function mapVenueFilterParametersToModel(
  params: VenueFilterParameters
): VenueFilterModel {
  let near: VenueFilterModel["near"] = null;
  if (
    params.lat !== params.lng &&
    (params.lat === undefined || params.lng === undefined)
  ) {
    throw new Error("lat+lng must both be either defined or undefined");
  } else if (
    params.lat !== undefined &&
    // Second check technically not necessary but needed to make TS happy
    params.lng !== undefined
  ) {
    near = {
      lat: params.lat,
      lng: params.lng,
    };
  }
  return {
    near,
    nameQuery: params.qName ?? null,
    level: params.level,
    includePermanentlyClosed: params.closed,
    pageKey: params.pageKey ?? null,
  };
}
