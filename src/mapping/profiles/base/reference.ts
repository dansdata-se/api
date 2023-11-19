import { BaseProfileReferenceDto } from "@/api/dto/profiles/base/reference";
import { mapImagesModelToDto } from "@/mapping/storage/image";
import { BaseProfileReferenceModel } from "@/model/profiles/base/reference";

export function mapBaseProfileReferenceModelToDto<
  T extends BaseProfileReferenceModel,
>(model: T): BaseProfileReferenceDto & { type: T["type"] } {
  return {
    id: model.id,
    type: model.type,
    name: model.name,
    images: mapImagesModelToDto(model.images),
  };
}
