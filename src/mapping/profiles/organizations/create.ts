import { CreateOrganizationDto } from "@/api/dto/profiles/organizations/create";
import { mapBaseCreateProfileDtoToModel } from "@/mapping/profiles/create";
import { CreateOrganizationModel } from "@/model/profiles/organizations/create";
import { ProfileType } from "@prisma/client";

export function mapCreateOrganizationDtoToModel(
  dto: CreateOrganizationDto
): CreateOrganizationModel {
  return {
    ...mapBaseCreateProfileDtoToModel(dto, ProfileType.organization),
    tags: dto.tags,
    members: dto.members,
  };
}
