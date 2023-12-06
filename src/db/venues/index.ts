import { CoordsModel } from "@/model/profiles/coords";
import { CreateVenueModel } from "@/model/profiles/venues/create";
import { PatchVenueModel } from "@/model/profiles/venues/patch";
import {
  PrismaPromise,
  ProfileEntity,
  VenueEntity,
  type PrismaClient,
} from "@prisma/client";

export function buildVenueEntityModelExtends(prisma: PrismaClient) {
  return {
    /**
     * Create a new Venue profile
     */
    async create(
      profileId: ProfileEntity["id"],
      model: CreateVenueModel
    ): Promise<void> {
      await prisma.$executeRaw`
        INSERT INTO
          profiles.venues(
            profile_id,
            parent_id,
            coords,
            permanently_closed
          )
        VALUES
          (
            ${profileId},
            ${model.parentId},
            ST_MakePoint(${model.coords.lng}, ${model.coords.lat}),
            ${model.permanentlyClosed}
          );
      `;
    },
    /**
     * Update an existing Venue profile
     */
    async update(model: PatchVenueModel): Promise<void> {
      const queries: PrismaPromise<unknown>[] = [];
      if (model.coords !== undefined) {
        queries.push(prisma.$executeRaw`
          UPDATE profiles.venues
          SET coords=ST_MakePoint(${model.coords.lng}, ${model.coords.lat})
          WHERE profile_id=${model.id};
        `);
      }
      if (model.permanentlyClosed !== undefined) {
        queries.push(prisma.$executeRaw`
          UPDATE profiles.venues
          SET permanently_closed=${model.permanentlyClosed}
          WHERE profile_id=${model.id};
        `);
      }
      if (model.parentId !== undefined) {
        queries.push(prisma.$executeRaw`
          UPDATE profiles.venues
          SET parent_id=${model.parentId}
          WHERE profile_id=${model.id};
        `);
      }

      await Promise.all(queries);
    },
  };
}

export function buildVenueEntityResultExtends(prisma: PrismaClient) {
  return {
    coords: {
      needs: { profileId: true },
      async compute(data: {
        profileId: VenueEntity["profileId"];
      }): Promise<CoordsModel> {
        return (
          await prisma.$queryRaw<CoordsModel[]>`
                SELECT ST_X(coords::geometry) AS lng, ST_Y(coords::geometry) AS lat
                FROM profiles.venues
                WHERE profile_id = ${data.profileId}
                LIMIT 1
              `
        )[0];
      },
    },
  };
}
