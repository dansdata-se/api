import { getDbClient } from "@/db";
import { BaseProfileDao } from "@/db/dao/profiles/base";
import env from "@/env";
import { KeyPagedDataModel } from "@/model/pagination";
import { BaseProfileModel } from "@/model/profiles/base/profile";
import { BaseProfileReferenceModel } from "@/model/profiles/base/reference";
import { CreateVenueModel } from "@/model/profiles/venues/create";
import { VenueFilterModel } from "@/model/profiles/venues/filter";
import { PatchVenueModel } from "@/model/profiles/venues/patch";
import { VenueModel } from "@/model/profiles/venues/profile";
import { VenueReferenceModel } from "@/model/profiles/venues/reference";
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
   * Create a new venue profile
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
   * Update a venue's profile
   */
  async patch(model: PatchVenueModel): Promise<VenueModel | null> {
    await BaseProfileDao.patch(model);
    await getDbClient().venueEntity.update(model);
    const profile = await this.getById(model.id);
    if (profile === null) {
      throw new Error(
        `Profile id ${model.id} successfully updated but could not be retrieved`
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
   * Retrieve a page of venue references from the full dataset of venues.
   *
   * The dataset is sorted (in descending order of precedence) by:
   * * name similarity
   * * distance
   * * name
   * * id
   *
   * Profile references are used when we need to refer to a profile without this
   * reference including further references to other profiles and so forth.
   *
   * Profile references typically contain just enough data for a client to
   * render a nice looking link for end users without having to look up the full
   * profile first.
   */
  async getManyReferences(
    filterModel: VenueFilterModel
  ): Promise<
    KeyPagedDataModel<VenueReferenceModel, VenueReferenceModel["id"]>
  > {
    return await getDbClient()
      .venueEntity.findManyByFilter(filterModel)
      .then((results) => results.map((it) => it.profileId))
      .then(async (ids) => {
        const data = await Promise.all(
          ids
            .slice(0, env.RESULT_PAGE_SIZE)
            .flatMap((id) => this.getReferenceById(id))
        )
          // If we get null, the profile was likely deleted since our initial query.
          // Silently ignore this.
          .then((refs) => refs.filter(isNonNull));
        const nextPageKey = ids.at(env.RESULT_PAGE_SIZE) ?? null;
        return {
          data,
          nextPageKey,
        };
      });
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
