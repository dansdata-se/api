import { exportedForTesting as dbTesting, getDbClient } from "@/db";
import { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import AsyncLock from "async-lock";
import { spawn } from "child_process";
import path from "path";
import { GenericContainer, Wait } from "testcontainers";

const lock = new AsyncLock();

/**
 * Creates a single test database instance to be used by all tests in this {@link describe}
 */
export function withTestDatabaseForAll({ enableQueryLogging = false } = {}): {
  get value(): StartedPostgreSqlContainer;
} {
  const testDbController = withTestDatabase({ enableQueryLogging });
  let dbContainer: StartedPostgreSqlContainer;
  beforeAll(
    async () => (dbContainer = await testDbController.before()),
    30_000
  );
  afterAll(testDbController.after, 10_000);
  return {
    get value() {
      return dbContainer;
    },
  };
}

/**
 * Creates one test database instance per test to be used in this {@link describe}
 */
export function withTestDatabaseForEach({ enableQueryLogging = false } = {}): {
  get value(): StartedPostgreSqlContainer;
} {
  const testDbController = withTestDatabase({ enableQueryLogging });
  let dbContainer: StartedPostgreSqlContainer;
  beforeEach(
    async () => (dbContainer = await testDbController.before()),
    30_000
  );
  afterEach(testDbController.after, 10_000);
  return {
    get value() {
      return dbContainer;
    },
  };
}

function withTestDatabase({ enableQueryLogging = false } = {}): {
  before(this: void): Promise<StartedPostgreSqlContainer>;
  after(this: void): Promise<void>;
} {
  let dbContainer: StartedPostgreSqlContainer;
  return {
    async before(this: void) {
      try {
        dbContainer = new StartedPostgreSqlContainer(
          /*
           * This section is adapted from
           * https://github.com/testcontainers/testcontainers-node/blob/9941583b2627df93d4e579426e236da5ff2e127f/packages/modules/postgresql/src/postgresql-container.ts#L29-L39
           */
          await (
            await GenericContainer.fromDockerfile(
              path.join(__dirname, "../../../database/")
            ).build("dansdata-test-db", { deleteOnExit: false })
          )
            .withExposedPorts(5432)
            .withWaitStrategy(
              Wait.forLogMessage(
                /.*database system is ready to accept connections.*/,
                2
              )
            )
            .withStartupTimeout(120_000)
            .start(),
          "dansdata",
          "postgres",
          "password"
        );

        await applyDbMigrations(dbContainer.getConnectionUri());
        dbTesting.overridePrismaClient(
          dbTesting.createPrismaClient({
            connectionString: dbContainer.getConnectionUri(),
            enableQueryLogging,
          })
        );
        return dbContainer;
      } catch (e) {
        console.error(e);
        // Jest does not stop the test automatically if there's an exception in beforeEach.
        // Use process.exit as a workaround.
        // https://github.com/jestjs/jest/issues/2713
        await dbContainer?.stop();
        process.exit(1);
      }
    },
    async after(this: void) {
      await getDbClient().$disconnect();
      await dbContainer?.stop();
    },
  };
}

function applyDbMigrations(connectionString: string): Promise<void> {
  return lock.acquire("applyDbMigrations", (done) =>
    spawn("npx", ["prisma", "migrate", "deploy"], {
      stdio: "inherit",
      env: {
        ...process.env,
        POSTGRES_PRISMA_URL: connectionString,
        POSTGRES_URL_NON_POOLING: connectionString,
      },
    }).addListener("exit", (code) => {
      if (code === 0) {
        done();
      } else {
        done(new Error(`Prisma existed with code ${code}`));
      }
    })
  );
}
