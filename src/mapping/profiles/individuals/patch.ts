import { PatchIndividualDto } from "@/api/dto/profiles/individuals/patch";
import { mapBasePatchProfileDtoToModel } from "@/mapping/profiles/base/patch";
import { PatchIndividualModel } from "@/model/profiles/individuals/patch";
import { ProfileType } from "@prisma/client";

export function mapPatchIndividualDtoToModel(
  dto: PatchIndividualDto,
  id: PatchIndividualModel["id"]
): PatchIndividualModel {
  return {
    ...mapBasePatchProfileDtoToModel(dto, id, ProfileType.individual),
    tags: dto.tags,
    organizations: dto.organizations,
  };
}
