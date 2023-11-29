import { defineEndpoints } from "@/api";
import { ErrorCode } from "@/api/dto/error";
import { KeyPagedDataDtoSchema } from "@/api/dto/pagination";
import { IndividualFilterParametersSchema } from "@/api/dto/profiles/individuals/filter";
import { IndividualReferenceDtoSchema } from "@/api/dto/profiles/individuals/reference";
import { StatusCodes } from "@/api/status_codes";
import { withParsedObject } from "@/api/util";
import z from "@/api/zod";
import { IndividualDao } from "@/db/dao/profiles/individual";
import { mapIndividualFilterParametersToModel } from "@/mapping/profiles/individuals/filter";
import { mapIndividualReferenceModelToDto } from "@/mapping/profiles/individuals/reference";
import { NextApiResponse } from "next";

type PageOfIndividualReferences = z.infer<
  ReturnType<
    typeof KeyPagedDataDtoSchema<
      typeof IndividualReferenceDtoSchema,
      typeof IndividualReferenceDtoSchema.shape.id
    >
  >
>;

export default defineEndpoints({
  GET: {
    authentication: null,
    docs: {
      method: "get",
      path: "/api/v1/profiles/individuals/",
      tags: ["Profiles", "Individuals"],
      summary: "List profiles for individuals",
      description: `List profiles for individuals.

The profiles are sorted (in descending order of precedence) by:
* name
* id

Note: The number of parameters is intentionally kept low to increase the
likelyhood of a cache hit.
`,
      request: {
        query: IndividualFilterParametersSchema,
      },
      responses: {
        [StatusCodes.success.ok]: {
          description: "Ok",
          content: {
            "application/json": {
              schema: KeyPagedDataDtoSchema(
                IndividualReferenceDtoSchema,
                IndividualReferenceDtoSchema.shape.id
              ),
            },
          },
        },
      },
    },
    async handler(req, res) {
      await withParsedObject(
        IndividualFilterParametersSchema,
        req.query,
        res,
        ErrorCode.invalidParameters,
        async (params) => {
          const filterModel = mapIndividualFilterParametersToModel(params);

          const page = await IndividualDao.getManyReferences(filterModel);

          const dto: PageOfIndividualReferences = {
            data: page.data.map(mapIndividualReferenceModelToDto),
            nextPageKey: page.nextPageKey,
          };
          (res as NextApiResponse<PageOfIndividualReferences>)
            .status(StatusCodes.success.ok)
            .json(dto);
        }
      );
    },
  },
});
