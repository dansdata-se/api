import { getDbClient } from "@/db";
import { BaseProfileDao } from "@/db/dao/profiles/base";
import { OrganizationDao } from "@/db/dao/profiles/organization";
import env from "@/env";
import { KeyPagedDataModel } from "@/model/pagination";
import { BaseProfileModel } from "@/model/profiles/base/profile";
import { BaseProfileReferenceModel } from "@/model/profiles/base/reference";
import { CreateIndividualModel } from "@/model/profiles/individuals/create";
import { IndividualFilterModel } from "@/model/profiles/individuals/filter";
import { PatchIndividualModel } from "@/model/profiles/individuals/patch";
import { IndividualModel } from "@/model/profiles/individuals/profile";
import { IndividualReferenceModel } from "@/model/profiles/individuals/reference";
import { IndividualTagDetailsModel } from "@/model/profiles/individuals/tag_details";
import { isNonNull } from "@/util/is_defined";
import { ProfileType } from "@prisma/client";

function hasIndividualProfileType<T extends { type: ProfileType }>(
  value: T
): value is T & { type: typeof ProfileType.individual } {
  return value.type === ProfileType.individual;
}

export type IndividualDaoType = typeof IndividualDao;
/**
 * DAO for working with profiles representing individuals
 */
export const IndividualDao = {
  /**
   * Create a new individual profile
   */
  async create(model: CreateIndividualModel): Promise<IndividualModel> {
    const profileId = await BaseProfileDao.create(model);
    await getDbClient().individualEntity.create({
      data: {
        profileId,
        tags: model.tags,
        organizations: {
          createMany: {
            data: model.organizations,
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
   * Update an individual's profile
   */
  async patch(model: PatchIndividualModel): Promise<IndividualModel | null> {
    await BaseProfileDao.patch(model);
    await getDbClient().individualEntity.update({
      where: {
        profileId: model.id,
      },
      data: {
        tags: model.tags,
        organizations: model.organizations && {
          deleteMany: {},
          createMany: {
            data: model.organizations,
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
   * Retrieve a full individual profile by its id
   */
  async getById(id: IndividualModel["id"]): Promise<IndividualModel | null> {
    const baseModel = await BaseProfileDao.getById(id);
    if (baseModel === null) return null;
    if (!hasIndividualProfileType(baseModel)) return null;

    const entity = await getDbClient().individualEntity.findUnique({
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
        entity.organizations.map(async (o) => {
          const profileReference = await OrganizationDao.getReferenceById(
            o.organizationId
          );
          if (profileReference === null) {
            return null;
          }
          return {
            title: o.title,
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
    const baseModel = await BaseProfileDao.getReferenceById(id);
    if (baseModel === null) return null;
    if (!hasIndividualProfileType(baseModel)) return null;
    return expandBaseModelToReference(baseModel);
  },
  /**
   * Retrieve a page of profile references from the full dataset of individuals.
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
    filterModel: IndividualFilterModel
  ): Promise<
    KeyPagedDataModel<IndividualReferenceModel, IndividualReferenceModel["id"]>
  > {
    return await getDbClient()
      .individualEntity.findMany({
        cursor: filterModel.pageKey
          ? {
              profileId: filterModel.pageKey,
            }
          : undefined,
        where: {
          tags: filterModel.tags.size
            ? {
                hasSome: Array.from(filterModel.tags),
              }
            : undefined,
          organizations: filterModel.organizationIds.size
            ? {
                some: {
                  organizationId: {
                    in: Array.from(filterModel.organizationIds),
                  },
                },
              }
            : undefined,
        },
        take: env.RESULT_PAGE_SIZE + 1,
        orderBy: [
          {
            profile: {
              name: "asc",
            },
          },
          {
            profile: {
              id: "asc",
            },
          },
        ],
        select: {
          profileId: true,
        },
      })
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
   * Retrieve a list of individual tags with human-readable label and description
   */
  async tags(): Promise<IndividualTagDetailsModel[]> {
    const tags = await getDbClient().individualTagDetailEntity.findMany({
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
      await getDbClient().individualEntity.findUnique({
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
