import { PatchVenueDto } from "@/api/dto/profiles/venues/patch";
import { mapBasePatchProfileDtoToModel } from "@/mapping/profiles/base/patch";
import { PatchVenueModel } from "@/model/profiles/venues/patch";
import { ProfileType } from "@prisma/client";

export function mapPatchVenueDtoToModel(
  dto: PatchVenueDto,
  id: PatchVenueModel["id"]
): PatchVenueModel {
  return {
    ...mapBasePatchProfileDtoToModel(dto, id, ProfileType.venue),
    coords: dto.coords,
    permanentlyClosed: dto.permanentlyClosed,
    parentId: dto.parentId,
  };
}
