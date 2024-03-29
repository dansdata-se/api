import { BaseCreateProfileDto } from "@/api/dto/profiles/base/create";
import { BaseCreateProfileModel } from "@/model/profiles/base/create";
import { ProfileType } from "@prisma/client";

export function mapBaseCreateProfileDtoToModel<T extends ProfileType>(
  dto: BaseCreateProfileDto,
  type: T
): BaseCreateProfileModel & { type: T } {
  return {
    type,
    name: dto.name,
    description: dto.description,
    images: dto.images,
    links: dto.links.map((l) => ({ url: l.url })),
  };
}
