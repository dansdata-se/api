import { buildProfileEntityModelExtends } from "@/db/profiles";
import {
  buildVenueEntityModelExtends,
  buildVenueEntityResultExtends,
} from "@/db/venues";
import env from "@/env";
import { PrismaClient } from "@prisma/client";

export type DbClient = ReturnType<typeof createPrismaClient>;
function createPrismaClient(
  connectionString: string = env.POSTGRES_PRISMA_URL
) {
  const prismaClient = new PrismaClient({
    datasources: {
      db: {
        url: connectionString,
      },
    },
  });
  return prismaClient.$extends({
    model: {
      profileEntity: buildProfileEntityModelExtends(prismaClient),
      venueEntity: buildVenueEntityModelExtends(prismaClient),
    },
    result: {
      venueEntity: buildVenueEntityResultExtends(prismaClient),
    },
  });
}

class OverridableDbClient {
  private client: DbClient | null = null;

  get value(): DbClient {
    if (this.client === null) {
      this.client = createPrismaClient();
    }
    return this.client;
  }
  set value(client: DbClient) {
    this.client = client;
  }
}

const dbClient = new OverridableDbClient();
export const getDbClient = () => dbClient.value;

export const exportedForTesting = {
  createPrismaClient,
  overridePrismaClient(prismaClient: ReturnType<typeof createPrismaClient>) {
    dbClient.value = prismaClient;
  },
};
