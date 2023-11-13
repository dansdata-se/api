import { OrganizationReferenceDto } from "@/api/dto/profiles/organizations/profile_reference";
import { mapBaseProfileReferenceModelToDto } from "@/mapping/profiles/base_reference";
import { OrganizationReferenceModel } from "@/model/profiles/organizations/profile_reference";

export function mapOrganizationReferenceModelToDto(
  model: OrganizationReferenceModel
): OrganizationReferenceDto {
  return {
    ...mapBaseProfileReferenceModelToDto(model),
    tags: model.tags,
  };
}
