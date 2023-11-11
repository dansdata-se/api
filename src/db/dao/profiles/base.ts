import { getDbClient } from "@/db";
import { mapImageEntitiesToImagesModel } from "@/mapping/storage/image";
import { BaseProfileModel } from "@/model/profiles/profile";
import { BaseProfileReferenceModel } from "@/model/profiles/profile_reference";
import { isNonNull } from "@/util/is_defined";

export type BaseProfileDaoType = typeof BaseProfileDao;
/**
 * DAO for working with profiles based on their common fields
 */
export const BaseProfileDao = {
  /**
   * Retrieve a full profile by its id
   */
  async getById(id: BaseProfileModel["id"]): Promise<BaseProfileModel | null> {
    const entity = await getDbClient().profileEntity.findUnique({
      where: {
        id,
      },
      include: {
        links: true,
        coverImage: true,
        posterImage: true,
        squareImage: true,
      },
    });
    if (entity === null) return null;

    return {
      id: entity.id,
      type: entity.type,
      name: entity.name,
      description: entity.description,
      links: entity.links.map((l) => ({ url: l.url })),
      images: mapImageEntitiesToImagesModel({
        cover: entity.coverImage,
        poster: entity.posterImage,
        square: entity.squareImage,
      }),
    };
  },
  /**
   * Retrieve a profile reference by its id
   *
   * Profile references are used when we need to refer to a profile without this
   * reference including further references to other profiles and so forth.
   *
   * Profile references typically contain just enough data for a client to
   * render a nice looking link for end users without having to look up the full
   * profile first.
   */
  async getReferenceById(
    id: BaseProfileModel["id"]
  ): Promise<BaseProfileReferenceModel | null> {
    const entity = await getDbClient().profileEntity.findUnique({
      where: {
        id,
      },
      include: {
        coverImage: true,
        posterImage: true,
        squareImage: true,
      },
    });
    if (entity === null) return null;

    return {
      id: entity.id,
      type: entity.type,
      name: entity.name,
      images: mapImageEntitiesToImagesModel({
        cover: entity.coverImage,
        poster: entity.posterImage,
        square: entity.squareImage,
      }),
    };
  },
  /**
   * Retrieve profile references matching a given profile name query
   *
   * Profile references are used when we need to refer to a profile without this
   * reference including further references to other profiles and so forth.
   *
   * Profile references typically contain just enough data for a client to
   * render a nice looking link for end users without having to look up the full
   * profile first.
   */
  async getReferencesByNameQuery(
    nameQuery: string,
    limit: number,
    offset: number
  ): Promise<BaseProfileReferenceModel[]> {
    const entities = await getDbClient().profileEntity.findIdsByNameQuery(
      nameQuery,
      limit,
      offset
    );
    return await Promise.all(
      entities.map(({ id }) => this.getReferenceById(id))
    ).then((it) => it.filter(isNonNull));
  },
};
