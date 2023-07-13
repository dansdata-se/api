import { prisma } from "@/db";
import { BaseProfileDAO } from "@/db/dao/profiles/base_profile";
import { CoordsModel } from "@/model/profiles/coords";
import { VenueModel } from "@/model/profiles/profile";
import { VenueReferenceModel } from "@/model/profiles/profile_reference";
import { isNonNull } from "@/util/is_defined";
import { ProfileType } from "@prisma/client";

function hasVenueProfileType<T extends { type: ProfileType }>(
  value: T
): value is T & { type: typeof ProfileType.venue } {
  return value.type === ProfileType.venue;
}

export type VenueDAOType = typeof VenueDAO;
/**
 * DAO for working with profiles representing venues
 */
export const VenueDAO = {
  /**
   * Retrieve a full venue profile by its id
   */
  async getById(id: VenueModel["id"]): Promise<VenueModel | null> {
    const baseModel = await BaseProfileDAO.getById(id);
    if (baseModel === null) return null;
    if (!hasVenueProfileType(baseModel)) return null;

    const entity = await prisma.venueEntity.findUnique({
      where: {
        profileId: id,
      },
      include: {
        childVenues: {
          select: {
            profileId: true,
          },
        },
      },
    });
    if (!entity) return null;

    const rootParentId = await entity.rootParentId;
    const rootParent = rootParentId
      ? await VenueDAO.getReferenceById(rootParentId)
      : null;
    const parent = entity.parentId
      ? await VenueDAO.getReferenceById(entity.parentId)
      : null;
    const children = (
      await Promise.all(
        entity.childVenues.map((m) => VenueDAO.getReferenceById(m.profileId))
      )
    )
      // If we get null, the profile was likely deleted since our initial query.
      // Silently ignore this.
      .filter(isNonNull);

    return {
      ...baseModel,
      coords: await entity.coords,
      rootParent,
      parent,
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
    const baseModel = await BaseProfileDAO.getReferenceById(id);
    if (baseModel === null) return null;
    if (!hasVenueProfileType(baseModel)) return null;

    const entity = await prisma.venueEntity.findUnique({
      where: {
        profileId: id,
      },
      select: {
        coords: true,
        rootParentId: true,
      },
    });
    if (!entity) return null;

    const coords = await entity.coords;
    const rootParentId = await entity.rootParentId;
    const rootParent = rootParentId
      ? await VenueDAO.getReferenceById(rootParentId)
      : null;

    return {
      ...baseModel,
      rootParent,
      coords,
    };
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
    return await prisma.venueEntity
      .findManyNear(coords, maxDistance)
      .then((entities) =>
        entities.map((it) => this.getReferenceById(it.profileId))
      )
      .then((entities) => Promise.all(entities))
      .then((entities) => entities.filter(isNonNull));
  },
};
