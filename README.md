# Dansdata API

Open API for retrieving information about social dances in Sweden.

## Getting Started

_The project makes use of VSCode's [devcontainer feature](https://code.visualstudio.com/docs/devcontainers/containers) to create a basic, common development environment. The following instructions assume you are using this environment. If you do not want to use a devcontainer, necessary steps to configure your local environment can be deduced from files in the [`.devcontainer`](./.devcontainer) directory._

To initialize/update your development database to match your current state:

```
$ npm run dev:db:push
```

To run the API locally

```
$ npm run dev
```

To create a new database migration:

```
$ npm run dev:db:migrate -- dev -- --name my_migration_name
```

To use [prisma studio](https://www.prisma.io/studio)

```
$ npm run dev:db:studio
```

### Environment Variables

This project uses environment variables for database connections and more.

Certain variables, such as cloudflare credentials, need to be configured manually for some features to work.

Please see [`src/env/index.ts`](src/env/index.ts) for more details.

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
DROP SCHEMA public CASCADE;
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
