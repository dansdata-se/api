import { ImagesModel } from "@/model/profiles/images";
import { ImageModel } from "@/model/storage/image";
import { faker } from "@faker-js/faker";
import cuid2 from "@paralleldrive/cuid2";
import { ImageVariant } from "@prisma/client";

export function generateImageModel(
  overrides: Partial<ImageModel> = {}
): ImageModel {
  return {
    id: cuid2.createId(),
    cloudflareId: faker.string.uuid(),
    variant: faker.helpers.arrayElement(Object.values(ImageVariant)),
    ...overrides,
  };
}

export function generateImagesModel(
  overrides: Partial<ImagesModel> = {}
): ImagesModel {
  return {
    cover:
      faker.helpers.maybe(
        () =>
          generateImageModel({
            variant: ImageVariant.cover,
          }),
        { probability: 0.75 }
      ) ?? null,
    poster:
      faker.helpers.maybe(
        () =>
          generateImageModel({
            variant: ImageVariant.poster,
          }),
        { probability: 0.75 }
      ) ?? null,
    square:
      faker.helpers.maybe(
        () =>
          generateImageModel({
            variant: ImageVariant.square,
          }),
        { probability: 0.75 }
      ) ?? null,
    ...overrides,
  };
}
