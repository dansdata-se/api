import { faker } from "@faker-js/faker";
import cuid2 from "@paralleldrive/cuid2";
import { VenueEntity } from "@prisma/client";

export function generateVenueEntity(
  overrides: Partial<
    VenueEntity & {
      coords: Promise<{ lat: number; lng: number }>;
      ancestorIds: Promise<VenueEntity["profileId"][]>;
      childVenues: { profileId: VenueEntity["profileId"] }[];
    }
  > = {}
): VenueEntity & {
  coords: Promise<{ lat: number; lng: number }>;
  ancestorIds: Promise<VenueEntity["profileId"][]>;
  childVenues: { profileId: VenueEntity["profileId"] }[];
} {
  return {
    profileId: cuid2.createId(),
    coords: Promise.resolve({
      lng: faker.location.longitude(),
      lat: faker.location.latitude(),
    }),
    permanentlyClosed: false,
    parentId: null,
    ancestorIds: Promise.resolve([]),
    childVenues: [],
    ...overrides,
  };
}
