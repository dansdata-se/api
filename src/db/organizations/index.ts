import env from "@/env";
import { OrganizationFilterModel } from "@/model/profiles/organizations/filter";
import {
  OrganizationEntity,
  OrganizationTag,
  Prisma,
  type PrismaClient,
} from "@prisma/client";

export function buildOrganizationEntityModelExtends(prisma: PrismaClient) {
  return {
    /**
     * Finds the ids of organizations matching the given {@link OrganizationFilterModel}.
     *
     * The profiles are sorted (in descending order of precedence) by:
     * * name similarity
     * * name (alphabetically)
     * * id
     */
    async findManyByFilter(
      filterModel: OrganizationFilterModel
    ): Promise<
      ({ profileId: OrganizationEntity["profileId"] } & (
        | { nameSimilarity: number }
        | { nameSimilarity: null }
      ))[]
    > {
      // The syntax highlighter does not support a line break here
      // prettier-ignore
      return await prisma.$queryRaw<({ profileId: OrganizationEntity["profileId"] } & ({ nameSimilarity: number } | { nameSimilarity: null }))[]>`
        WITH
          -- 1: Retreive the full organization profiles
          organization_profiles AS (
            SELECT
              profiles.profiles.*,
              profiles.organizations.*
            FROM profiles.organizations
            INNER JOIN profiles.profiles
              ON profiles.profiles.id = profiles.organizations.profile_id
          ),
          -- 2: Apply filters
          filtered_organization_profiles AS (
            SELECT *
            FROM organization_profiles
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
                          ? [OrganizationTag.performer]
                          : Array.from(filterModel.tags)
                        ).map((it) => Prisma.sql`${it}::profiles.organization_tag`)
                      )
                    }
                  ]
              )
              AND
              -- Filter by individual members
              (
                ${filterModel.memberIds.size === 0}
                  OR EXISTS(
                    SELECT 1
                    FROM profiles.organization_members
                    WHERE
                      profiles.organization_members.organization_id = profile_id
                        AND profiles.organization_members.individual_id IN (${
                          Prisma.join(
                            // Note: Calling Prisma.join with an empty array results in
                            // TypeError: Expected `join([])` to be called with an array of multiple elements, but got an empty array
                            filterModel.memberIds.size === 0
                              ? [""]
                              : Array.from(filterModel.memberIds)
                          )
                        })
                    GROUP BY
                      profiles.organization_members.organization_id
                    HAVING
                      COUNT(DISTINCT profiles.organization_members.individual_id) = ${filterModel.memberIds.size}
                  )
              )
            )
          ),
          -- 3: Extend the result set with calculated values such as
          -- name similarity.
          filtered_organization_profiles_and_calculated_values AS (
            SELECT
              *,
              CASE WHEN ${filterModel.nameQuery === null} THEN NULL
                   ELSE SIMILARITY(name, ${filterModel.nameQuery})
              END AS name_similarity
            FROM filtered_organization_profiles
          ),
          -- 4: Sort result set - we now have the full list of organizations
          full_organization_listing(profile_id, name_similarity) AS (
            SELECT
              profile_id,
              name_similarity
            FROM filtered_organization_profiles_and_calculated_values
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
            FROM full_organization_listing
          )
        -- 6: Extract the requested page from the full organization listing
        SELECT
          profile_id AS "profileId",
          name_similarity AS "nameSimilarity"
        FROM full_organization_listing
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
                        FROM profiles.organizations
                      )
                    )
          END
      `;
    },
  };
}
