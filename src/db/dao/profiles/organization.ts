import { getDbClient } from "@/db";
import { BaseProfileDao } from "@/db/dao/profiles/base";
import { IndividualDao } from "@/db/dao/profiles/individual";
import env from "@/env";
import { KeyPagedDataModel } from "@/model/pagination";
import { BaseProfileModel } from "@/model/profiles/base/profile";
import { BaseProfileReferenceModel } from "@/model/profiles/base/reference";
import { CreateOrganizationModel } from "@/model/profiles/organizations/create";
import { OrganizationFilterModel } from "@/model/profiles/organizations/filter";
import { PatchOrganizationModel } from "@/model/profiles/organizations/patch";
import { OrganizationModel } from "@/model/profiles/organizations/profile";
import { OrganizationReferenceModel } from "@/model/profiles/organizations/reference";
import { OrganizationTagDetailsModel } from "@/model/profiles/organizations/tag_details";
import { isNonNull } from "@/util/is_defined";
import { ProfileType } from "@prisma/client";

function hasOrganizationProfileType<T extends { type: ProfileType }>(
  value: T
): value is T & { type: typeof ProfileType.organization } {
  return value.type === ProfileType.organization;
}

export type OrganizationDaoType = typeof OrganizationDao;
/**
 * DAO for working with profiles representing organizations
 */
export const OrganizationDao = {
  /**
   * Create a new organization profile
   */
  async create(model: CreateOrganizationModel): Promise<OrganizationModel> {
    const profileId = await BaseProfileDao.create(model);
    await getDbClient().organizationEntity.create({
      data: {
        profileId,
        tags: model.tags,
        members: {
          createMany: {
            data: model.members,
          },
        },
      },
    });
    const profile = await this.getById(profileId);
    if (profile === null) {
      throw new Error(
        `Profile id ${profileId} successfully created but could not be retrieved`
      );
    }
    return profile;
  },
  /**
   * Update an organization's profile
   */
  async patch(
    model: PatchOrganizationModel
  ): Promise<OrganizationModel | null> {
    await BaseProfileDao.patch(model);
    await getDbClient().organizationEntity.update({
      where: {
        profileId: model.id,
      },
      data: {
        tags: model.tags,
        members: model.members && {
          deleteMany: {},
          createMany: {
            data: model.members,
          },
        },
      },
    });
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
   * Retrieve a full organization profile by its id
   */
  async getById(
    id: OrganizationModel["id"]
  ): Promise<OrganizationModel | null> {
    const baseModel = await BaseProfileDao.getById(id);
    if (baseModel === null) return null;
    if (!hasOrganizationProfileType(baseModel)) return null;

    const entity = await getDbClient().organizationEntity.findUnique({
      where: {
        profileId: id,
      },
      include: {
        members: {
          select: {
            individualId: true,
            title: true,
          },
        },
      },
    });
    if (entity === null) return null;

    const members = (
      await Promise.all(
        entity.members.map(async (m) => {
          const profileReference = await IndividualDao.getReferenceById(
            m.individualId
          );
          if (profileReference === null) {
            return null;
          }
          return {
            title: m.title,
            profileReference,
          };
        })
      )
    )
      // If we get null, the profile was likely deleted since our initial query.
      // Silently ignore this.
      .filter(isNonNull);

    return {
      ...baseModel,
      tags: entity.tags,
      members,
    };
  },
  /**
   * Retrieve an organization reference by its id
   *
   * Profile references are used when we need to refer to a profile without this
   * reference including further references to other profiles and so forth.
   *
   * Profile references typically contain just enough data for a client to
   * render a nice looking link for end users without having to look up the full
   * profile first.
   */
  async getReferenceById(
    id: OrganizationReferenceModel["id"]
  ): Promise<OrganizationReferenceModel | null> {
    const baseModel = await BaseProfileDao.getReferenceById(id);
    if (baseModel === null) return null;
    if (!hasOrganizationProfileType(baseModel)) return null;
    return expandBaseModelToReference(baseModel);
  },
  /**
   * Retrieve a page of profile references from the full dataset of organizations.
   *
   * The dataset is sorted in alphabetical order.
   *
   * Profile references are used when we need to refer to a profile without this
   * reference including further references to other profiles and so forth.
   *
   * Profile references typically contain just enough data for a client to
   * render a nice looking link for end users without having to look up the full
   * profile first.
   */
  async getManyReferences(
    filterModel: OrganizationFilterModel
  ): Promise<
    KeyPagedDataModel<
      OrganizationReferenceModel,
      OrganizationReferenceModel["id"]
    >
  > {
    return await getDbClient()
      .organizationEntity.findManyByFilter(filterModel)
      .then((results) => results.map((it) => it.profileId))
      .then(async (ids) => {
        const data = await Promise.all(
          ids
            .slice(0, env.RESULT_PAGE_SIZE)
            .flatMap((id) => this.getReferenceById(id))
        ).then((refs) => refs.filter(isNonNull));
        const nextPageKey = ids.at(env.RESULT_PAGE_SIZE) ?? null;
        return {
          data,
          nextPageKey,
        };
      });
  },
  /**
   * Retrieve a list of organization tags with human-readable label and description
   */
  async tags(): Promise<OrganizationTagDetailsModel[]> {
    const tags = await getDbClient().organizationTagDetailEntity.findMany({
      select: {
        tag: true,
        label: true,
        description: true,
      },
    });
    return tags;
  },
};

async function expandBaseModelToReference(
  baseModel: BaseProfileReferenceModel & {
    type: typeof ProfileType.organization;
  }
): Promise<OrganizationReferenceModel> {
  const tags =
    (
      await getDbClient().organizationEntity.findUnique({
        where: {
          profileId: baseModel.id,
        },
        select: {
          tags: true,
        },
      })
    )?.tags ?? [];

  return {
    ...baseModel,
    tags,
  };
}
