import { IndividualReferenceDto } from "@/api/dto/profiles/individuals/reference";
import { mapBaseProfileReferenceModelToDto } from "@/mapping/profiles/base/reference";
import { IndividualReferenceModel } from "@/model/profiles/individuals/reference";

export function mapIndividualReferenceModelToDto(
  model: IndividualReferenceModel
): IndividualReferenceDto {
  return {
    ...mapBaseProfileReferenceModelToDto(model),
    tags: model.tags,
  };
}
