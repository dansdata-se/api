import { CoordsModel } from "@/model/profiles/coords";
import { CreateVenueModel } from "@/model/profiles/venues/create";
import { ProfileEntity, VenueEntity, type PrismaClient } from "@prisma/client";

export function buildVenueEntityModelExtends(prisma: PrismaClient) {
  return {
    /**
     * Create a new Venue profile
     */
    async create(
      profileId: ProfileEntity["id"],
      model: CreateVenueModel
    ): Promise<void> {
      await prisma.$executeRaw`
        INSERT INTO
          profiles.venues(
            profile_id,
            parent_id,
            coords,
            permanently_closed
          )
        VALUES
          (
            ${profileId},
            ${model.parentId},
            ST_MakePoint(${model.coords.lng}, ${model.coords.lat}),
            ${model.permanentlyClosed}
          );
      `;
    },
    /**
     * Finds the ids of venues near a certain geographical location.
     *
     * The returned ids are sorted by distance.
     */
    async findIdsNear(
      coords: CoordsModel,
      maxDistance: number
    ): Promise<
      {
        profileId: VenueEntity["profileId"];
        /**
         * The distance from the given coordinates in meters
         */
        distance: number;
      }[]
    > {
      // Skip `WHERE ST_DWithin` for really large distance values.
      // 2_000_000 = almost the size of Europe.
      if (maxDistance >= 2_000_000) {
        // The syntax highlighter does not support a line break here
        // prettier-ignore
        return await prisma.$queryRaw<{ profileId: VenueEntity["profileId"], distance: number }[]>`
          SELECT
            profile_id as "profileId",
            ROUND(
              ST_DistanceSphere(
                coords::geometry,
                ST_MakePoint(${coords.lng}, ${coords.lat})
              )
            ) as distance
          FROM profiles.venues
          ORDER BY distance ASC;
        `;
      }
      // The syntax highlighter does not support a line break here
      // prettier-ignore
      return await prisma.$queryRaw<{ profileId: VenueEntity["profileId"], distance: number }[]>`
        SELECT
          profile_id as "profileId",
          ROUND(
            ST_DistanceSphere(
              coords::geometry,
              ST_MakePoint(${coords.lng}, ${coords.lat})
            )
          ) as distance
        FROM profiles.venues
        WHERE ST_DWithin(
          coords,
          ST_MakePoint(${coords.lng}, ${coords.lat}),
          ${maxDistance}
        )
        ORDER BY distance ASC;
      `;
    },
  };
}

export function buildVenueEntityResultExtends(prisma: PrismaClient) {
  return {
    coords: {
      needs: { profileId: true },
      async compute(data: {
        profileId: VenueEntity["profileId"];
      }): Promise<CoordsModel> {
        return (
          await prisma.$queryRaw<CoordsModel[]>`
                SELECT ST_X(coords::geometry) AS lng, ST_Y(coords::geometry) AS lat
                FROM profiles.venues
                WHERE profile_id = ${data.profileId}
                LIMIT 1
              `
        )[0];
      },
    },
  };
}
