import { IndividualDto } from "@/api/dto/profiles/individuals/profile";
import { mapBaseProfileModelToDto } from "@/mapping/profiles/base";
import { mapOrganizationReferenceModelToDto } from "@/mapping/profiles/organizations/profile_reference";
import { IndividualModel } from "@/model/profiles/individuals/profile";

export function mapIndividualModelToDto(model: IndividualModel): IndividualDto {
  return {
    ...mapBaseProfileModelToDto(model),
    tags: model.tags,
    organizations: model.organizations.map((it) => ({
      ...mapOrganizationReferenceModelToDto(it.profileReference),
      title: it.title,
    })),
  };
}
