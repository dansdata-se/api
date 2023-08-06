import { prisma } from "@/db";
import { imageEntitiesToImagesModel } from "@/db/dao/storage/image";
import { BaseProfileModel } from "@/model/profiles/profile";
import { BaseProfileReferenceModel } from "@/model/profiles/profile_reference";
import { isNonNull } from "@/util/is_defined";

export type BaseProfileDAOType = typeof BaseProfileDAO;
/**
 * DAO for working with profiles based on their common fields
 */
export const BaseProfileDAO = {
  /**
   * Retrieve a full profile by its id
   */
  async getById(id: BaseProfileModel["id"]): Promise<BaseProfileModel | null> {
    const entity = await prisma.profileEntity.findUnique({
      where: {
        id,
      },
      include: {
        links: true,
        images: {
          select: {
            image: true,
          },
        },
      },
    });
    if (entity === null) return null;

    return {
      id: entity.id,
      type: entity.type,
      name: entity.name,
      description: entity.description,
      links: entity.links.map((l) => ({ url: l.url })),
      images: imageEntitiesToImagesModel(entity.images.map((it) => it.image)),
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
    const entity = await prisma.profileEntity.findUnique({
      where: {
        id,
      },
      include: {
        images: {
          select: {
            image: true,
          },
        },
      },
    });
    if (entity === null) return null;

    return {
      id: entity.id,
      type: entity.type,
      name: entity.name,
      images: imageEntitiesToImagesModel(entity.images.map((it) => it.image)),
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
    const entities = await prisma.profileEntity.findIdsByNameQuery(
      nameQuery,
      limit,
      offset
    );
    return await Promise.all(
      entities.map(({ id }) => this.getReferenceById(id))
    ).then((it) => it.filter(isNonNull));
  },
};
