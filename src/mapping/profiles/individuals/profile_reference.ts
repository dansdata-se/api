import { IndividualReferenceDto } from "@/api/dto/profiles/individuals/profile_reference";
import { mapBaseProfileReferenceModelToDto } from "@/mapping/profiles/base_reference";
import { IndividualReferenceModel } from "@/model/profiles/individuals/profile_reference";

export function mapIndividualReferenceModelToDto(
  model: IndividualReferenceModel
): IndividualReferenceDto {
  return {
    ...mapBaseProfileReferenceModelToDto(model),
    tags: model.tags,
  };
}
