import { getDbClient } from "@/db";
import { BaseProfileDao } from "@/db/dao/profiles/base";
import { BaseProfileModel } from "@/model/profiles/base";
import { BaseProfileReferenceModel } from "@/model/profiles/base_reference";
import { CoordsModel } from "@/model/profiles/coords";
import { CreateVenueModel } from "@/model/profiles/venues/create";
import { VenueModel } from "@/model/profiles/venues/profile";
import { VenueReferenceModel } from "@/model/profiles/venues/profile_reference";
import { isNonNull } from "@/util/is_defined";
import { ProfileType } from "@prisma/client";

function hasVenueProfileType<T extends { type: ProfileType }>(
  value: T
): value is T & { type: typeof ProfileType.venue } {
  return value.type === ProfileType.venue;
}

export type VenueDaoType = typeof VenueDao;
/**
 * DAO for working with profiles representing venues
 */
export const VenueDao = {
  /**
   * Create a new organization profile
   */
  async create(model: CreateVenueModel): Promise<VenueModel> {
    const profileId = await BaseProfileDao.create(model);
    await getDbClient().venueEntity.create(profileId, model);
    const profile = await this.getById(profileId);
    if (profile === null) {
      throw new Error(
        `Profile id ${profileId} successfully created but could not be retrieved`
      );
    }
    return profile;
  },
  /**
   * Delete a profile by its id
   * @throws {import("@/db/dao/profiles/base").ProfileInUseError} if the profile cannot be deleted due to being linked to one or more events
   */
  async delete(id: BaseProfileModel["id"]): Promise<boolean> {
    return await BaseProfileDao.delete(id);
  },
  /**
   * Retrieve a full venue profile by its id
   */
  async getById(id: VenueModel["id"]): Promise<VenueModel | null> {
    const baseModel = await BaseProfileDao.getById(id);
    if (baseModel === null) return null;
    if (!hasVenueProfileType(baseModel)) return null;

    const entity = await getDbClient().venueEntity.findUnique({
      where: {
        profileId: id,
      },
      include: {
        childVenues: {
          select: {
            profileId: true,
          },
        },
        ancestors: {
          select: {
            parentId: true,
          },
          orderBy: {
            distance: "desc",
          },
        },
      },
    });
    if (!entity) return null;

    const ancestors = (
      await Promise.all(
        entity.ancestors.map((it) => VenueDao.getReferenceById(it.parentId))
      )
    )
      // If we get null, the profile was likely deleted since our initial query.
      // Silently ignore this.
      .filter(isNonNull);
    const children = (
      await Promise.all(
        entity.childVenues.map((m) => VenueDao.getReferenceById(m.profileId))
      )
    )
      // If we get null, the profile was likely deleted since our initial query.
      // Silently ignore this.
      .filter(isNonNull);

    return {
      ...baseModel,
      permanentlyClosed: entity.permanentlyClosed,
      coords: await entity.coords,
      ancestors,
      children,
    };
  },
  /**
   * Retrieve a venue reference by its id
   *
   * Profile references are used when we need to refer to a profile without this
   * reference including further references to other profiles and so forth.
   *
   * Profile references typically contain just enough data for a client to
   * render a nice looking link for end users without having to look up the full
   * profile first.
   */
  async getReferenceById(
    id: VenueReferenceModel["id"]
  ): Promise<VenueReferenceModel | null> {
    const baseModel = await BaseProfileDao.getReferenceById(id);
    if (baseModel === null) return null;
    if (!hasVenueProfileType(baseModel)) return null;
    return expandBaseModelToReference(baseModel);
  },
  /**
   * Retrieve an individual reference by its id
   *
   * Profile references are used when we need to refer to a profile without this
   * reference including further references to other profiles and so forth.
   *
   * Profile references typically contain just enough data for a client to
   * render a nice looking link for end users without having to look up the full
   * profile first.
   */
  async getReferenceByNameQuery(
    nameQuery: string,
    limit: number,
    offset: number
  ): Promise<VenueReferenceModel[]> {
    return (
      await Promise.all(
        (
          await BaseProfileDao.getReferencesByNameQuery(
            nameQuery,
            limit,
            offset
          )
        )
          .filter(isNonNull)
          .filter(hasVenueProfileType)
          .map(expandBaseModelToReference)
      )
    ).filter(isNonNull);
  },
  /**
   * Retrieve a list of venues based on their proximity to given coordinates.
   *
   * Profile references are used when we need to refer to a profile without this
   * reference including further references to other profiles and so forth.
   *
   * Profile references typically contain just enough data for a client to
   * render a nice looking link for end users without having to look up the full
   * profile first.
   */
  async getReferencesByProximity(
    coords: CoordsModel,
    maxDistance: number
  ): Promise<VenueReferenceModel[]> {
    return await getDbClient()
      .venueEntity.findIdsNear(coords, maxDistance)
      .then((idAndDistance) =>
        idAndDistance.map((it) => this.getReferenceById(it.profileId))
      )
      .then((promises) => Promise.all(promises))
      .then((entities) => entities.filter(isNonNull));
  },
};

async function expandBaseModelToReference(
  baseModel: BaseProfileReferenceModel & { type: typeof ProfileType.venue }
): Promise<VenueReferenceModel | null> {
  const entity = await getDbClient().venueEntity.findUnique({
    where: {
      profileId: baseModel.id,
    },
    select: {
      coords: true,
      permanentlyClosed: true,
    },
  });
  if (!entity) return null;

  const coords = await entity.coords;

  return {
    ...baseModel,
    permanentlyClosed: entity.permanentlyClosed,
    coords,
  };
}
