import { NextRestFramework } from "next-rest-framework";

const servers: { url: string; description?: string }[] = [
  {
    url: "/",
    description: "Current Environment",
  },
  { url: "https://api.dansdata.se", description: "Production Environment" },
];

export const { defineCatchAllHandler, defineEndpoints } = NextRestFramework({
  apiRoutesPath: "src/pages/api",
  exposeOpenApiSpec: true,
  swaggerUiPath: undefined, // Not used by us
  openApiJsonPath: "/api/v1/dansdata.api.json",
  openApiYamlPath: "/api/v1/dansdata.api.yml",
  openApiSpecOverrides: {
    info: {
      title: "Dansdata API",
      description: `
**PRE-ALPHA - NOT READY FOR PRODUCTION USE**

The Dansdata API provides information about social dancing in Sweden.

## Using the API

To use the API you need to register for an API account.
This can be done via the Dansdata Portal at <a href="https://portal.dansdata.se">portal.dansdata.se</a>.

## About Dansdata

Dansdata is an open source project aiming to provide Swedish social dancing information as freely as possible.
`,
      version: "v0",
      // TODO(FelixZY): Update with correct url once legal pages are in place.
      termsOfService: "https://dansdata.se/TODO",
      contact: {
        name: "Support",
        email: "dansdata@googlegroups.com",
      },
    },
    servers,
    components: {
      securitySchemes: {
        apikey: {
          type: "apiKey",
          name: "apikey",
          in: "header",
        },
      },
    },
    security: {
      apikey: [],
    },
  },
});
