import { CoordsModel } from "@/model/profiles/coords";
import { faker } from "@faker-js/faker";

export function generateCoordsModel(
  overrides: Partial<CoordsModel> = {}
): CoordsModel {
  return {
    lng: faker.location.longitude(),
    lat: faker.location.latitude(),
    ...overrides,
  };
}
