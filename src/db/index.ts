import {
  buildVenueEntityModelExtends,
  buildVenueEntityResultExtends,
} from "@/db/venues";
import env from "@/env";
import { PrismaClient } from "@prisma/client";

export type DbClient = ReturnType<typeof createPrismaClient>;
function createPrismaClient({
  connectionString = env.POSTGRES_PRISMA_URL,
  enableQueryLogging = false,
}: {
  connectionString?: string;
  enableQueryLogging?: boolean;
} = {}) {
  const prismaClient = new PrismaClient({
    datasources: {
      db: {
        url: connectionString,
      },
    },
    log: enableQueryLogging
      ? [
          {
            emit: "stdout",
            level: "query",
          },
        ]
      : undefined,
  });
  return prismaClient.$extends({
    model: {
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
