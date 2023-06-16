import { prisma } from "@/db";
import { BaseProfileDAO } from "@/db/dao/profiles/base_profile";
import { IndividualDAO } from "@/db/dao/profiles/individual";
import { OrganizationModel } from "@/model/profiles/profile";
import { OrganizationReferenceModel } from "@/model/profiles/profile_reference";
import { isNonNull } from "@/util/is_defined";
import { ProfileType } from "@prisma/client";

function hasOrganizationProfileType<T extends { type: ProfileType }>(
  value: T
): value is T & { type: typeof ProfileType.organization } {
  return value.type === ProfileType.organization;
}

export type OrganizationDAOType = typeof OrganizationDAO;
/**
 * DAO for working with profiles representing organizations
 */
export const OrganizationDAO = {
  /**
   * Retrieve a full organization profile by its id
   */
  async getById(
    id: OrganizationModel["id"]
  ): Promise<OrganizationModel | null> {
    const baseModel = await BaseProfileDAO.getById(id);
    if (baseModel === null) return null;
    if (!hasOrganizationProfileType(baseModel)) return null;

    const entity = await prisma.organizationEntity.findUnique({
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
        entity.members.map((m) =>
          IndividualDAO.getReferenceById(m.individualId)
        )
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
    const baseModel = await BaseProfileDAO.getReferenceById(id);
    if (baseModel === null) return null;
    if (!hasOrganizationProfileType(baseModel)) return null;

    const tags =
      (
        await prisma.organizationEntity.findUnique({
          where: {
            profileId: id,
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
  },
};
