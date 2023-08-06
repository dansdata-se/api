import { ProfileEntity, type PrismaClient } from "@prisma/client";

export function buildProfileEntityModelExtends(prisma: PrismaClient) {
  return {
    /**
     * Finds the ids of profiles whose name is similar to the given query string.
     *
     * The returned ids are sorted by similarity.
     */
    async findIdsByNameQuery(
      nameQuery: string,
      limit: number,
      offset: number
    ): Promise<
      {
        id: ProfileEntity["id"];
        /**
         * The similarity of the search result in the range [0, 1]
         */
        similarity: number;
      }[]
    > {
      // The syntax highlighter does not support a line break here
      // prettier-ignore
      return await prisma.$queryRaw<{ id: ProfileEntity["id"], similarity: number }[]>`
        SELECT
          id,
          SIMILARITY(${nameQuery}, name) as similarity
        FROM profiles.profiles
        WHERE ${nameQuery} % name
        ORDER BY
          similarity DESC,
          -- Secondary sort by id to ensure consistent result order for identical query
          id
        LIMIT ${limit}
        OFFSET ${offset};
      `;
    },
  };
}
