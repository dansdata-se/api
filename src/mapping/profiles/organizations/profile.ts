import { OrganizationDto } from "@/api/dto/profiles/organizations/profile";
import { mapBaseProfileModelToDto } from "@/mapping/profiles/base/profile";
import { mapIndividualReferenceModelToDto } from "@/mapping/profiles/individuals/reference";
import { OrganizationModel } from "@/model/profiles/organizations/profile";

export function mapOrganizationModelToDto(
  model: OrganizationModel
): OrganizationDto {
  return {
    ...mapBaseProfileModelToDto(model),
    tags: model.tags,
    members: model.members.map((it) => ({
      ...mapIndividualReferenceModelToDto(it.profileReference),
      title: it.title,
    })),
  };
}
