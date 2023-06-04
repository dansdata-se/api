# Dansdata API

Open API for retrieving information about social dances in Sweden.

## Getting Started

_The project makes use of VSCode's [devcontainer feature](https://code.visualstudio.com/docs/devcontainers/containers) to create a basic, common development environment. The following instructions assume you are using this environment. If you do not want to use a devcontainer, necessary steps to configure your local environment can be deduced from files in the [`.devcontainer`](./.devcontainer) directory._

Create a `.env.development.local` file at the project root. Developers with access to the Dansdata
Vercel project (for security reasons, such access is limited) can use `npm run dev:vercel:pull` to
generate this file, but it can also be created manually with the following content:

```sh
# Created by Vercel CLI
VERCEL="1"
VERCEL_ENV="development"
TURBO_REMOTE_ONLY="true"
NX_DAEMON="false"
VERCEL_URL=""
VERCEL_GIT_PROVIDER=""
VERCEL_GIT_PREVIOUS_SHA=""
VERCEL_GIT_REPO_SLUG=""
VERCEL_GIT_REPO_OWNER=""
VERCEL_GIT_REPO_ID=""
VERCEL_GIT_COMMIT_REF=""
VERCEL_GIT_COMMIT_SHA=""
VERCEL_GIT_COMMIT_MESSAGE=""
VERCEL_GIT_COMMIT_AUTHOR_LOGIN=""
VERCEL_GIT_COMMIT_AUTHOR_NAME=""
VERCEL_GIT_PULL_REQUEST_ID=""
VERCEL_ANALYTICS_ID=""
VERCEL_WEB_ANALYTICS_ID=""
POSTGRES_URL="postgres://default:postgres@db:5432/verceldb"
POSTGRES_PRISMA_URL="postgres://default:postgres@db:5432/verceldb?pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NON_POOLING="postgres://default:postgres@db:5432/verceldb"
POSTGRES_USER="default"
POSTGRES_HOST="db"
POSTGRES_PASSWORD="postgres"
POSTGRES_DATABASE="verceldb"
PLACEHOLDER_AUTH_KEY="mysuperstrongauthkey"
```

To initialize/update your development database to match your current state:

```
$ npm run dev:db:push
```

To run the API locally

```
$ npm run dev
```

To use [prisma studio](https://www.prisma.io/studio)

```
$ npm run dev:db:studio
```

### Testing

Unit tests can be run using

```
$ npm run test:unit
```

To run integration tests, you need to create a `.env.test.local` file at the project root (using
the same variables as `.env.development.local`). These tests can then be executing using

```
$ npm run test:integration
```

To run all tests, simply use

```
$ npm run test:all
```

The group a test is in is determined by an initial documentation comment, e.g.:

```typescript
/**
 * @group unit
 */
```

See also [jest-runner-groups](https://www.npmjs.com/package/jest-runner-groups).

### Resetting the development database

Ususally `npm run dev:db:push` should be enough to apply your prisma changes to the database.
However, sometimes it is necessary to perform a deeper clean.

To do this, connect to the database (the devcontainer comes with the SQLTools extension
preconfigured for such a connection - use the database icon in the left bar of vscode) and run

```sql
DROP SCHEMA auth CASCADE;
DROP SCHEMA events CASCADE;
DROP SCHEMA portal CASCADE;
DROP SCHEMA profiles CASCADE;
DROP SCHEMA storage CASCADE;
```

Then use `npm run dev:db:push` to re-initialize your development database.

## Contributing

Dansdata is a project by dancers, for dancers. Contributions are welcome!

Please see [`CONTRIBUTING.md`](./CONTRIBUTING.md) for guidelines.

## About Dansdata.se

Dansdata (lit. "dance data") is an open API for information relating to social dancing in Sweden.

[Felix Zedén Yverås](https://fzy.se) is the project's current maintainer.

## License

[MIT](./LICENCE)
