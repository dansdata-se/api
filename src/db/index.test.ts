/**
 * @group integration
 */

describe("Database", () => {
  test("Postgres envvars are available in tests", () => {
    // On fail: did you configure `.env.test.local`?
    expect(process.env.POSTGRES_URL).not.toBeUndefined();
    expect(process.env.POSTGRES_PRISMA_URL).not.toBeUndefined();
    expect(process.env.POSTGRES_URL_NON_POOLING).not.toBeUndefined();
    expect(process.env.POSTGRES_USER).not.toBeUndefined();
    expect(process.env.POSTGRES_HOST).not.toBeUndefined();
    expect(process.env.POSTGRES_PASSWORD).not.toBeUndefined();
    expect(process.env.POSTGRES_DATABASE).not.toBeUndefined();
  });
});
