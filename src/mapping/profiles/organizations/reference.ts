import { OrganizationReferenceDto } from "@/api/dto/profiles/organizations/reference";
import { mapBaseProfileReferenceModelToDto } from "@/mapping/profiles/base/reference";
import { OrganizationReferenceModel } from "@/model/profiles/organizations/reference";

export function mapOrganizationReferenceModelToDto(
  model: OrganizationReferenceModel
): OrganizationReferenceDto {
  return {
    ...mapBaseProfileReferenceModelToDto(model),
    tags: model.tags,
  };
}
