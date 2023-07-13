import { faker } from "@faker-js/faker";
import cuid2 from "@paralleldrive/cuid2";
import { VenueEntity } from "@prisma/client";

export function generateVenueEntity(
  overrides: Partial<
    VenueEntity & {
      rootParentId: Promise<VenueEntity["profileId"] | null>;
      coords: Promise<{ lat: number; lng: number }>;
      childVenues: { profileId: VenueEntity["profileId"] }[];
    }
  > = {}
): VenueEntity & {
  rootParentId: Promise<VenueEntity["profileId"] | null>;
  coords: Promise<{ lat: number; lng: number }>;
  childVenues: { profileId: VenueEntity["profileId"] }[];
} {
  return {
    profileId: cuid2.createId(),
    coords: Promise.resolve({
      lng: faker.location.longitude(),
      lat: faker.location.latitude(),
    }),
    parentId: null,
    rootParentId: Promise.resolve(null),
    childVenues: [],
    ...overrides,
  };
}
