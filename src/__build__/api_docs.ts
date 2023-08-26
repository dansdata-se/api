import { registry } from "@/api/registry";
import { OpenApiGeneratorV31 } from "@asteasolutions/zod-to-openapi";
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
    "**/__test__",
  ];

  function walkDir(dir: string, callback: (filePath: string) => void) {
    readdirSync(dir).forEach((fileName) => {
      const filePath = path.join(dir, fileName);
      if (statSync(filePath).isDirectory()) {
        if (
          excludedDirs.every((dirPath) =>
            dirPath.startsWith("**/")
              ? path.basename(filePath) !== dirPath.substring(3)
              : !pathEqual(filePath, dirPath)
          )
        ) {
          walkDir(filePath, callback);
        }
      } else if (
        filePath.endsWith(".ts") &&
        !filePath.endsWith(".test.ts") &&
        !filePath.endsWith(".d.ts")
      ) {
        callback(filePath);
      }
    });
  }

  const imports: Promise<unknown>[] = [];
  walkDir(srcDir, (filePath) => {
    imports.push(import(filePath));
  });
  await Promise.all(imports);
}

function getOpenApiDocumentation() {
  const generator = new OpenApiGeneratorV31(registry.definitions);

  return generator.generateDocument({
    openapi: "3.1.0",
    info: {
      title: "Dansdata API",
      description: `
**PRE-ALPHA - NOT READY FOR PRODUCTION USE**

The Dansdata API provides information about social dancing in Sweden.

## Using the API

Our goal is to make the API available to everyone, as freely as possible.
Please keep your usage at a reasonable level to help make this possible!

Data retrieved from the Dansdata API is licensed under
[CC BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/?ref=chooser-v1).

### Requirements

All use of the Dansdata API must adhere to the following requirements.
If your use does not, it will be limited or actively prevented.

* Provide a valid [\`HTTP Referer\`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer) or
[\`User-Agent\`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/User-Agent)
identifying your application.
* Include a valid [\`From\`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/From) header
in case we need to contact you about your usage.
* Clearly display attribution as suitable to your medium.
    * Example: The text "Using data from Dansdata" or "Dansinformation från Dansdata" and a user-visible link to [https://dansdata.se](https://dansdata.se).
* Keep your usage at a reasonable level.
    * Do not send cache-busting headers.
    * Limit bulk scraping to a single thread with at most one request per second.
    * Discuss heavy use cases with us beforehand.

### Heavy Use

Request volumes that affect our ability to provide data freely may be limited or actively prevented.

Please contact us if your application(s) needs to/makes heavy use of the API to discuss options and prevent interruptions.

### Privacy

See the Dansdata [Privacy Policy](https://dansdata.se/privacy).

## Where does the Data Come From?

Dansdata collects dance information directly from organizers,
bands and other people involved in the swedish social dancing scene.

While we try to limit publish access to trusted sources,
we cannot guarantee 100% accuracy in the information provided. Please consider Dansdata the
"wikipedia", rather than the "encyclopedia britannica", of dance information. 

## About Dansdata

Dansdata is an open source project aiming to provide Swedish social dancing information as freely as possible.
`,
      version: "v1",
      // TODO(FelixZY): Update with correct url once legal pages are in place.
      termsOfService: "https://dansdata.se/TODO",
      license: {
        name: "CC BY-SA 4.0",
        url: "http://creativecommons.org/licenses/by-sa/4.0/?ref=chooser-v1",
      },
      contact: {
        name: "Support",
        email: "dansdata@googlegroups.com",
      },
    },
    tags: [
      {
        name: "Profiles",
        description:
          "Descriptions and images for organizations, individuals and venues.",
      },
      {
        name: "Organizations",
        description:
          "Descriptions and images for organizations - e.g. bands, associations or companies.",
      },
      {
        name: "Individuals",
        description:
          "Descriptions and images for individuals - e.g. musicians, instructors and photographers.",
      },
      {
        name: "Storage",
        description: "Images and other file-related endpoints.",
      },
    ],
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

void writeDocumentation();
