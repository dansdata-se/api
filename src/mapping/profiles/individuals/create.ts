import { CreateIndividualDto } from "@/api/dto/profiles/individuals/create";
import { mapBaseCreateProfileDtoToModel } from "@/mapping/profiles/base/create";
import { CreateIndividualModel } from "@/model/profiles/individuals/create";
import { ProfileType } from "@prisma/client";

export function mapCreateIndividualDtoToModel(
  dto: CreateIndividualDto
): CreateIndividualModel {
  return {
    ...mapBaseCreateProfileDtoToModel(dto, ProfileType.individual),
    tags: dto.tags,
    organizations: dto.organizations,
  };
}
