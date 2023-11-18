import { CreateVenueDto } from "@/api/dto/profiles/venues/create";
import { mapBaseCreateProfileDtoToModel } from "@/mapping/profiles/create";
import { CreateVenueModel } from "@/model/profiles/venues/create";
import { ProfileType } from "@prisma/client";

export function mapCreateVenueDtoToModel(
  dto: CreateVenueDto
): CreateVenueModel {
  return {
    ...mapBaseCreateProfileDtoToModel(dto, ProfileType.venue),
    coords: dto.coords,
    permanentlyClosed: dto.permanentlyClosed,
    parentId: dto.parentId,
  };
}
