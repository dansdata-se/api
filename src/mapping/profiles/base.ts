import { BaseProfileDto } from "@/api/dto/profiles/base";
import { mapImagesModelToDto } from "@/mapping/storage/image";
import { BaseProfileModel } from "@/model/profiles/base";
import { BaseProfileReferenceModel } from "@/model/profiles/base_reference";

export function mapBaseProfileModelToDto<T extends BaseProfileModel>(
  model: T
): BaseProfileDto & { type: T["type"] } {
  return {
    id: model.id,
    type: model.type,
    name: model.name,
    description: model.description,
    images: mapImagesModelToDto(model.images),
    links: model.links.map((it) => ({ url: it.url })),
  };
}

export function mapBaseProfileModelToReferenceModel<T extends BaseProfileModel>(
  model: T
): BaseProfileReferenceModel & { type: T["type"] } {
  return {
    id: model.id,
    type: model.type,
    name: model.name,
    images: model.images,
  };
}
