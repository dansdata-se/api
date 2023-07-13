import { LinkModel } from "@/model/profiles/link";
import { faker } from "@faker-js/faker";

export function generateLinkModel(
  overrides: Partial<LinkModel> = {}
): LinkModel {
  return {
    url: faker.internet.url(),
    ...overrides,
  };
}
