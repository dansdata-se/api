import { ImagesModel } from "@/model/profiles/images";
import { ImageModel } from "@/model/storage/image";
import { faker } from "@faker-js/faker";
import cuid2 from "@paralleldrive/cuid2";

export function generateImageModel(
  overrides: Partial<ImageModel> = {}
): ImageModel {
  return {
    id: cuid2.createId(),
    cloudflareId: faker.string.uuid(),
    ...overrides,
  };
}

export function generateImagesModel(
  overrides: Partial<ImagesModel> = {}
): ImagesModel {
  return {
    cover:
      faker.helpers.maybe(() => generateImageModel(), { probability: 0.75 }) ??
      null,
    poster:
      faker.helpers.maybe(() => generateImageModel(), { probability: 0.75 }) ??
      null,
    square:
      faker.helpers.maybe(() => generateImageModel(), { probability: 0.75 }) ??
      null,
    ...overrides,
  };
}
