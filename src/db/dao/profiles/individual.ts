import { prisma } from "@/db";
import { BaseProfileDAO } from "@/db/dao/profiles/base_profile";
import { OrganizationDAO } from "@/db/dao/profiles/organization";
import { IndividualTagDetailsModel } from "@/model/profiles/individuals/tag_details";
import { IndividualModel } from "@/model/profiles/profile";
import {
  BaseProfileReferenceModel,
  IndividualReferenceModel,
} from "@/model/profiles/profile_reference";
import { isNonNull } from "@/util/is_defined";
import { ProfileType } from "@prisma/client";

function hasIndividualProfileType<T extends { type: ProfileType }>(
  value: T
): value is T & { type: typeof ProfileType.individual } {
  return value.type === ProfileType.individual;
}

export type IndividualDAOType = typeof IndividualDAO;
/**
 * DAO for working with profiles representing individuals
 */
export const IndividualDAO = {
  /**
   * Retrieve a full individual profile by its id
   */
  async getById(id: IndividualModel["id"]): Promise<IndividualModel | null> {
    const baseModel = await BaseProfileDAO.getById(id);
    if (baseModel === null) return null;
    if (!hasIndividualProfileType(baseModel)) return null;

    const entity = await prisma.individualEntity.findUnique({
      where: {
        profileId: id,
      },
      include: {
        organizations: {
          select: {
            organizationId: true,
            title: true,
          },
        },
      },
    });
    if (entity === null) return null;

    const organizations = (
      await Promise.all(
        entity.organizations.map(
          async (o) => await OrganizationDAO.getReferenceById(o.organizationId)
        )
      )
    )
      // If we get null, the profile was likely deleted since our initial query.
      // Silently ignore this.
      .filter(isNonNull);

    return {
      ...baseModel,
      tags: entity.tags,
      organizations,
    };
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
  async getReferenceById(
    id: IndividualReferenceModel["id"]
  ): Promise<IndividualReferenceModel | null> {
    const baseModel = await BaseProfileDAO.getReferenceById(id);
    if (baseModel === null) return null;
    if (!hasIndividualProfileType(baseModel)) return null;
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
  ): Promise<IndividualReferenceModel[]> {
    return await Promise.all(
      (await BaseProfileDAO.getReferencesByNameQuery(nameQuery, limit, offset))
        .filter(isNonNull)
        .filter(hasIndividualProfileType)
        .map(expandBaseModelToReference)
    );
  },
  /**
   * Retrieve a list of individual tags with human-readable label and description
   */
  async tags(): Promise<IndividualTagDetailsModel[]> {
    const tags = await prisma.individualTagDetailEntity.findMany({
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
  baseModel: BaseProfileReferenceModel & { type: typeof ProfileType.individual }
): Promise<IndividualReferenceModel> {
  const tags =
    (
      await prisma.individualEntity.findUnique({
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
