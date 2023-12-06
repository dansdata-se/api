import env from "@/env";
import { CoordsModel } from "@/model/profiles/coords";
import { CreateVenueModel } from "@/model/profiles/venues/create";
import { VenueFilterModel } from "@/model/profiles/venues/filter";
import { PatchVenueModel } from "@/model/profiles/venues/patch";
import {
  PrismaPromise,
  ProfileEntity,
  VenueEntity,
  type PrismaClient,
} from "@prisma/client";

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
     * Update an existing Venue profile
     */
    async update(model: PatchVenueModel): Promise<void> {
      const queries: PrismaPromise<unknown>[] = [];
      if (model.coords !== undefined) {
        queries.push(prisma.$executeRaw`
          UPDATE profiles.venues
          SET coords=ST_MakePoint(${model.coords.lng}, ${model.coords.lat})
          WHERE profile_id=${model.id};
        `);
      }
      if (model.permanentlyClosed !== undefined) {
        queries.push(prisma.$executeRaw`
          UPDATE profiles.venues
          SET permanently_closed=${model.permanentlyClosed}
          WHERE profile_id=${model.id};
        `);
      }
      if (model.parentId !== undefined) {
        queries.push(prisma.$executeRaw`
          UPDATE profiles.venues
          SET parent_id=${model.parentId}
          WHERE profile_id=${model.id};
        `);
      }

      await Promise.all(queries);
    },
    /**
     * Finds the ids of venues matching the given {@link VenueFilterModel}.
     *
     * The profiles are sorted (in descending order of precedence) by:
     * * name similarity
     * * distance
     * * name (alphabetically)
     * * id
     */
    async findManyByFilter(
      filterModel: VenueFilterModel
    ): Promise<
      ({ profileId: VenueEntity["profileId"] } & (
        | { nameSimilarity: number }
        | { nameSimilarity: null }
      ) &
        ({ distance: number } | { distance: null }))[]
    > {
      // The syntax highlighter does not support a line break here
      // prettier-ignore
      return await prisma.$queryRaw<({ profileId: VenueEntity["profileId"] } & ({ nameSimilarity: number } | { nameSimilarity: null }) & ({ distance: number } | { distance: null }))[]>`
        WITH
          -- 1: Retreive the full venue profiles
          venue_profiles AS (
            SELECT
              profiles.profiles.*,
              profiles.venues.*
            FROM profiles.venues
            INNER JOIN profiles.profiles
              ON profiles.profiles.id = profiles.venues.profile_id
          ),
          -- 2: Apply filters
          filtered_venue_profiles AS (
            SELECT *
            FROM venue_profiles
            WHERE (
              -- Filter by name query
              (
                ${filterModel.nameQuery === null}
                  OR name % ${filterModel.nameQuery}
              )
              AND
              -- Filter by permanently closed
              (
                ${filterModel.includePermanentlyClosed}
                  OR permanently_closed = FALSE
              )
              AND
              -- Filter by node level
              (
                CASE WHEN ${
                  filterModel.level === "root"
                } AND profile_id IN (SELECT * FROM profiles.venue_tree_root_nodes) THEN TRUE
                    WHEN ${
                      filterModel.level === "leaf"
                    } AND profile_id IN (SELECT * FROM profiles.venue_tree_leaf_nodes) THEN TRUE
                    WHEN ${filterModel.level === "any"} THEN TRUE
                    ELSE FALSE
                END
              )
            )
          ),
          -- 3: Extend the result set with calculated values such as
          -- name similarity and distance.
          filtered_venue_profiles_and_calculated_values AS (
            SELECT
              *,
              CASE WHEN ${filterModel.nameQuery === null} THEN NULL
                   ELSE SIMILARITY(name, ${filterModel.nameQuery})
              END AS name_similarity,
              CASE WHEN ${filterModel.near === null} THEN NULL
                   ELSE ST_DistanceSphere(
                          coords::geometry,
                          ST_MakePoint(${filterModel.near?.lng ?? 0}, ${
                            filterModel.near?.lat ?? 0
                          })
                        )
              END AS distance
            FROM filtered_venue_profiles
          ),
          -- 4: Sort result set - we now have the full list of venues
          full_venue_listing(profile_id, name_similarity, distance) AS (
            SELECT
              profile_id,
              name_similarity,
              distance
            FROM filtered_venue_profiles_and_calculated_values
            ORDER BY
              name_similarity DESC,
              distance ASC,
              name ASC,
              -- Sort by id if all else fails to ensure a consistent return order
              profile_id ASC
          ),
          -- 5: Map each id in the result set to its offset from 0 (row index)
          profile_id_to_offset(profile_id, row_offset) AS (
            SELECT
              profile_id,
              (ROW_NUMBER() OVER ()) - 1 AS row_offset
            FROM full_venue_listing
          )
        -- 6: Extract the requested page from the full venue listing
        SELECT
          profile_id AS "profileId",
          name_similarity AS "nameSimilarity",
          distance
        FROM full_venue_listing
        -- page size + 1 to allow the caller to determine if there is another page after this one
        LIMIT ${env.RESULT_PAGE_SIZE + 1}
        OFFSET
          CASE WHEN ${filterModel.pageKey === null} THEN 0
               ELSE COALESCE(
                      -- Calculate row index of the given page key
                      (
                        SELECT row_offset
                        FROM profile_id_to_offset
                        WHERE profile_id = ${filterModel.pageKey}
                        -- profile_id column is unique. Return quickly
                        LIMIT 1
                      ),
                      -- Return empty set for invalid page key
                      (
                        SELECT COUNT(*)
                        FROM profiles.venues
                      )
                    )
          END
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
