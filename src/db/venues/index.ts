import { CoordsModel } from "@/model/profiles/coords";
import { VenueEntity, type PrismaClient } from "@prisma/client";

export function extendWithVenueFeatures<T extends PrismaClient>(prisma: T) {
  return prisma.$extends({
    model: {
      venueEntity: {
        /**
         * Finds the ids of venues near a certain geographical location.
         *
         * The returned ids are sorted by distance.
         */
        async findManyNear(
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
      },
    },
    result: {
      venueEntity: {
        rootParentId: {
          needs: { profileId: true },
          async compute(data) {
            const rootParent = await prisma.$queryRaw<{ profileId: string }[]>`
              WITH RECURSIVE parent_query AS (
                SELECT
                  parent_id,
                  0 AS depth
                FROM profiles.venues
                WHERE profile_id = ${data.profileId}
                  AND parent_id IS NOT NULL
                UNION ALL
                  SELECT
                    profiles.venues.parent_id as parent_id,
                    parent_query.depth + 1 AS depth
                  FROM parent_query, profiles.venues
                  WHERE profiles.venues.profile_id = parent_query.parent_id
                    AND profiles.venues.parent_id IS NOT NULL
              )
              SELECT parent_id as "profileId", depth
              FROM parent_query
              ORDER BY depth DESC
              LIMIT 1;
            `;

            return rootParent.length > 0 &&
              data.profileId !== rootParent[0].profileId
              ? rootParent[0].profileId
              : null;
          },
        },
        coords: {
          needs: { profileId: true },
          async compute(data): Promise<CoordsModel> {
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
      },
    },
  });
}
