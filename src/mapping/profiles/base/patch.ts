import { BasePatchProfileDto } from "@/api/dto/profiles/base/patch";
import { BasePatchProfileModel } from "@/model/profiles/base/patch";
import { ProfileType } from "@prisma/client";

export function mapBasePatchProfileDtoToModel<T extends ProfileType>(
  dto: BasePatchProfileDto,
  id: BasePatchProfileModel["id"],
  type: T
): BasePatchProfileModel & { type: T } {
  return {
    id,
    type,
    name: dto.name,
    description: dto.description,
    images: dto.images,
    links: dto.links?.map((l) => ({ url: l.url })),
  };
}
