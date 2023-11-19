import { PatchOrganizationDto } from "@/api/dto/profiles/organizations/patch";
import { mapBasePatchProfileDtoToModel } from "@/mapping/profiles/base/patch";
import { PatchOrganizationModel } from "@/model/profiles/organizations/patch";
import { ProfileType } from "@prisma/client";

export function mapPatchOrganizationDtoToModel(
  dto: PatchOrganizationDto,
  id: PatchOrganizationModel["id"]
): PatchOrganizationModel {
  return {
    ...mapBasePatchProfileDtoToModel(dto, id, ProfileType.organization),
    tags: dto.tags,
    members: dto.members,
  };
}
