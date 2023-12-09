import env from "@/env";
import { IndividualFilterModel } from "@/model/profiles/individuals/filter";
import {
  IndividualEntity,
  IndividualTag,
  Prisma,
  type PrismaClient,
} from "@prisma/client";

export function buildIndividualEntityModelExtends(prisma: PrismaClient) {
  return {
    /**
     * Finds the ids of individuals matching the given {@link IndividualFilterModel}.
     *
     * The profiles are sorted (in descending order of precedence) by:
     * * name similarity
     * * name (alphabetically)
     * * id
     */
    async findManyByFilter(
      filterModel: IndividualFilterModel
    ): Promise<
      ({ profileId: IndividualEntity["profileId"] } & (
        | { nameSimilarity: number }
        | { nameSimilarity: null }
      ))[]
    > {
      // The syntax highlighter does not support a line break here
      // prettier-ignore
      return await prisma.$queryRaw<({ profileId: IndividualEntity["profileId"] } & ({ nameSimilarity: number } | { nameSimilarity: null }))[]>`
        WITH
          -- 1: Retreive the full individual profiles
          individual_profiles AS (
            SELECT
              profiles.profiles.*,
              profiles.individuals.*
            FROM profiles.individuals
            INNER JOIN profiles.profiles
              ON profiles.profiles.id = profiles.individuals.profile_id
          ),
          -- 2: Apply filters
          filtered_individual_profiles AS (
            SELECT *
            FROM individual_profiles
            WHERE (
              -- Filter by name query
              (
                ${filterModel.nameQuery === null}
                  OR name % ${filterModel.nameQuery}
              )
              AND
              -- Filter by tags
              (
                ${filterModel.tags.size === 0}
                  OR tags @> ARRAY[
                    ${
                      Prisma.join(
                        // Note: Calling Prisma.join with an empty array results in
                        // TypeError: Expected `join([])` to be called with an array of multiple elements, but got an empty array
                        (filterModel.tags.size === 0
                          ? [IndividualTag.musician]
                          : Array.from(filterModel.tags)
                        ).map((it) => Prisma.sql`${it}::profiles.individual_tag`)
                      )
                    }
                  ]
              )
              AND
              -- Filter by related organizations
              (
                ${filterModel.organizationIds.size === 0}
                  OR EXISTS(
                    SELECT 1
                    FROM profiles.organization_members
                    WHERE
                      profiles.organization_members.individual_id = profile_id
                        AND profiles.organization_members.organization_id IN (${
                          Prisma.join(
                            // Note: Calling Prisma.join with an empty array results in
                            // TypeError: Expected `join([])` to be called with an array of multiple elements, but got an empty array
                            filterModel.organizationIds.size === 0
                              ? [""]
                              : Array.from(filterModel.organizationIds)
                          )
                        })
                    GROUP BY
                      profiles.organization_members.individual_id
                    HAVING
                      COUNT(DISTINCT profiles.organization_members.organization_id) = ${filterModel.organizationIds.size}
                  )
              )
            )
          ),
          -- 3: Extend the result set with calculated values such as
          -- name similarity.
          filtered_individual_profiles_and_calculated_values AS (
            SELECT
              *,
              CASE WHEN ${filterModel.nameQuery === null} THEN NULL
                   ELSE SIMILARITY(name, ${filterModel.nameQuery})
              END AS name_similarity
            FROM filtered_individual_profiles
          ),
          -- 4: Sort result set - we now have the full list of individuals
          full_individual_listing(profile_id, name_similarity) AS (
            SELECT
              profile_id,
              name_similarity
            FROM filtered_individual_profiles_and_calculated_values
            ORDER BY
              name_similarity DESC,
              name ASC,
              -- Sort by id if all else fails to ensure a consistent return order
              profile_id ASC
          ),
          -- 5: Map each id in the result set to its offset from 0 (row index)
          profile_id_to_offset(profile_id, row_offset) AS (
            SELECT
              profile_id,
              (ROW_NUMBER() OVER ()) - 1 AS row_offset
            FROM full_individual_listing
          )
        -- 6: Extract the requested page from the full individual listing
        SELECT
          profile_id AS "profileId",
          name_similarity AS "nameSimilarity"
        FROM full_individual_listing
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
                        FROM profiles.individuals
                      )
                    )
          END
      `;
    },
  };
}
