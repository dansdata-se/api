import { registry } from "@/api/registry";
import { OpenAPIGenerator } from "@asteasolutions/zod-to-openapi";
import {
  accessSync,
  constants,
  mkdirSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "fs";
import path from "path";
import { pathEqual } from "path-equal";

const srcDir = path.resolve(`${__dirname}/../../src`);
accessSync(srcDir, constants.R_OK | constants.W_OK);

const publicDir = path.resolve(`${__dirname}/../../public`);
accessSync(publicDir, constants.R_OK | constants.W_OK);

const v1DocJsonPath = path.join(publicDir, "api/v1/dansdata.api.json");

async function loadAllProjectModules() {
  const excludedDirs = [
    // Exclude build directory to avoid executing build-scripts.
    __dirname,
  ];

  function walkDir(dir: string, callback: (filePath: string) => void) {
    readdirSync(dir).forEach((fileName) => {
      const filePath = path.join(dir, fileName);
      if (statSync(filePath).isDirectory()) {
        if (excludedDirs.every((path) => !pathEqual(filePath, path))) {
          walkDir(filePath, callback);
        }
      } else if (filePath.endsWith(".ts") && !filePath.endsWith(".test.ts")) {
        callback(filePath);
      }
    });
  }

  const imports: Array<Promise<any>> = [];
  walkDir(srcDir, (filePath) => {
    imports.push(import(filePath));
  });
  await Promise.all(imports);
}

function getOpenApiDocumentation() {
  const generator = new OpenAPIGenerator(registry.definitions, "3.0.3");

  return generator.generateDocument({
    info: {
      title: "Dansdata API",
      description: `
**PRE-ALPHA - NOT READY FOR PRODUCTION USE**

The Dansdata API provides information about social dancing in Sweden.

## Using the API

The API is available to everyone, for free. If you are using our data, we want you to add a user-visible link back to
[https://dansdata.se](https://dansdata.se) similar to "Using data from Dansdata" or "Dansinformation från Dansdata".

Data retrieved from the Dansdata API is licensed under
[CC BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/?ref=chooser-v1)

## About Dansdata

Dansdata is an open source project aiming to provide Swedish social dancing information as freely as possible.
`,
      version: "v1",
      // TODO(FelixZY): Update with correct url once legal pages are in place.
      termsOfService: "https://dansdata.se/TODO",
      contact: {
        name: "Support",
        email: "dansdata@googlegroups.com",
      },
    },
    servers: [
      {
        url: "/",
        description: "Current Environment",
      },
      { url: "https://api.dansdata.se", description: "Production Environment" },
    ],
  });
}

async function writeDocumentation() {
  // Hack: we import _every_ project file (excluding test files) to make sure
  // DTOs etc.have registered with the registry before we try to generate the
  // documentation.
  await loadAllProjectModules();

  const docs = getOpenApiDocumentation();

  mkdirSync(path.dirname(v1DocJsonPath), { recursive: true });
  writeFileSync(v1DocJsonPath, JSON.stringify(docs), {
    encoding: "utf-8",
  });
}

writeDocumentation();
