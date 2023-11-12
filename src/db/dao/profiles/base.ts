import { getDbClient } from "@/db";
import { mapImageEntitiesToImagesModel } from "@/mapping/storage/image";
import { BaseProfileModel } from "@/model/profiles/base";
import { BaseProfileReferenceModel } from "@/model/profiles/base_reference";
import { BaseCreateProfileModel } from "@/model/profiles/create";
import { isNonNull } from "@/util/is_defined";
import { ProfileType } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export class InvalidProfileError extends Error {
  constructor(
    message: string,
    public innerException?: PrismaClientKnownRequestError
  ) {
    super(message);
  }
}

export class InvalidProfileImageReferenceError extends InvalidProfileError {
  constructor(innerException: PrismaClientKnownRequestError) {
    super("One or more image ids are invalid", innerException);
  }
}

export class ProfileInUseError extends Error {
  constructor(
    message: string,
    public innerException: PrismaClientKnownRequestError
  ) {
    super(message);
  }
}

export type BaseProfileDaoType = typeof BaseProfileDao;
/**
 * DAO for working with profiles based on their common fields
 */
export const BaseProfileDao = {
  /**
   * Create a new organization profile
   * @throws {InvalidProfileImageReferenceError} when one or more image ids do not correspond to existing images
   */
  async create(model: BaseCreateProfileModel): Promise<BaseProfileModel["id"]> {
    const result = await getDbClient()
      .profileEntity.create({
        data: {
          name: model.name,
          description: model.description,
          type: model.type,
          coverImageId: model.images.coverId ?? undefined,
          posterImageId: model.images.posterId ?? undefined,
          squareImageId: model.images.squareId ?? undefined,
          links: {
            createMany: {
              data: model.links,
              skipDuplicates: true,
            },
          },
        },
        select: {
          id: true,
        },
      })
      .catch((e) => {
        if (e instanceof PrismaClientKnownRequestError) {
          // https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
          switch (e.code) {
            // "Foreign key constraint failed on the field: {field_name}"
            case "P2003":
              if (e.message.toLocaleLowerCase().includes("image")) {
                throw new InvalidProfileImageReferenceError(e);
              }
              break;
          }
        }
        throw e;
      });
    return result.id;
  },
  /**
   * Delete a profile by its id
   * @throws {ProfileLinkedToEventError} if the profile cannot be deleted due to being linked to one or more events
   */
  async delete(id: BaseProfileModel["id"]): Promise<boolean> {
    return await getDbClient()
      .profileEntity.delete({
        where: {
          id,
        },
      })
      .then(() => true)
      .catch((e) => {
        if (e instanceof PrismaClientKnownRequestError) {
          // https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
          switch (e.code) {
            // "Foreign key constraint failed on the field: {field_name}"
            case "P2003":
              if (e.message.toLocaleLowerCase().includes("event")) {
                throw new ProfileInUseError(
                  "The profile is linked to at least one event",
                  e
                );
              }
              break;
            // "An operation failed because it depends on one or more records that were required but not found. {cause}"
            case "P2025":
              return false;
          }
        }
        throw e;
      });
  },
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
  /**
   * Retrieve the profile type given its id
   */
  async getTypeById(id: BaseProfileModel["id"]): Promise<ProfileType | null> {
    const result = await getDbClient().profileEntity.findUnique({
      where: {
        id,
      },
      select: {
        type: true,
      },
    });
    if (result === null) return null;

    return result.type;
  },
};
