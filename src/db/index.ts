import { buildProfileEntityModelExtends } from "@/db/profiles";
import {
  buildVenueEntityModelExtends,
  buildVenueEntityResultExtends,
} from "@/db/venues";
import env from "@/env";
import { PrismaClient } from "@prisma/client";

const prismaClient = new PrismaClient({
  datasources: {
    db: {
      url: env.POSTGRES_PRISMA_URL,
    },
  },
});
export const prisma = prismaClient.$extends({
  model: {
    profileEntity: buildProfileEntityModelExtends(prismaClient),
    venueEntity: buildVenueEntityModelExtends(prismaClient),
  },
  result: {
    venueEntity: buildVenueEntityResultExtends(prismaClient),
  },
});
