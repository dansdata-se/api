import { defineEndpoints } from "@/api";
import { ErrorCode } from "@/api/dto/error";
import { KeyPagedDataDtoSchema } from "@/api/dto/pagination";
import { OrganizationFilterParametersSchema } from "@/api/dto/profiles/organizations/filter";
import { OrganizationReferenceDtoSchema } from "@/api/dto/profiles/organizations/reference";
import { StatusCodes } from "@/api/status_codes";
import { withParsedObject } from "@/api/util";
import z from "@/api/zod";
import { OrganizationDao } from "@/db/dao/profiles/organization";
import { mapOrganizationFilterParametersToModel } from "@/mapping/profiles/organizations/filter";
import { mapOrganizationReferenceModelToDto } from "@/mapping/profiles/organizations/reference";
import { NextApiResponse } from "next";

type PageOfOrganizationReferences = z.infer<
  ReturnType<
    typeof KeyPagedDataDtoSchema<
      typeof OrganizationReferenceDtoSchema,
      typeof OrganizationReferenceDtoSchema.shape.id
    >
  >
>;

export default defineEndpoints({
  GET: {
    authentication: null,
    docs: {
      method: "get",
      path: "/api/v1/profiles/organizations/",
      tags: ["Profiles", "Organizations"],
      summary: "List profiles for organizations",
      description: `List profiles for organizations.

The profiles are sorted (in descending order of precedence) by:
* name
* id

Note: The number of parameters is intentionally kept low to increase the
likelyhood of a cache hit.
`,
      request: {
        query: OrganizationFilterParametersSchema,
      },
      responses: {
        [StatusCodes.success.ok]: {
          description: "Ok",
          content: {
            "application/json": {
              schema: KeyPagedDataDtoSchema(
                OrganizationReferenceDtoSchema,
                OrganizationReferenceDtoSchema.shape.id
              ),
            },
          },
        },
      },
    },
    async handler(req, res) {
      await withParsedObject(
        OrganizationFilterParametersSchema,
        req.query,
        res,
        ErrorCode.invalidParameters,
        async (params) => {
          const filterModel = mapOrganizationFilterParametersToModel(params);

          const page = await OrganizationDao.getManyReferences(filterModel);

          const dto: PageOfOrganizationReferences = {
            data: page.data.map(mapOrganizationReferenceModelToDto),
            nextPageKey: page.nextPageKey,
          };
          (res as NextApiResponse<PageOfOrganizationReferences>)
            .status(StatusCodes.success.ok)
            .json(dto);
        }
      );
    },
  },
});
