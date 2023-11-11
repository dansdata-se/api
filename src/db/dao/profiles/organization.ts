import { getDbClient } from "@/db";
import { BaseProfileDao } from "@/db/dao/profiles/base";
import { IndividualDao } from "@/db/dao/profiles/individual";
import { OrganizationModel } from "@/model/profiles/organizations/profile";
import { OrganizationReferenceModel } from "@/model/profiles/organizations/profile_reference";
import { OrganizationTagDetailsModel } from "@/model/profiles/organizations/tag_details";
import { BaseProfileReferenceModel } from "@/model/profiles/profile_reference";
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
  ): Promise<OrganizationReferenceModel[]> {
    return await Promise.all(
      (await BaseProfileDao.getReferencesByNameQuery(nameQuery, limit, offset))
        .filter(isNonNull)
        .filter(hasOrganizationProfileType)
        .map(expandBaseModelToReference)
    );
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
