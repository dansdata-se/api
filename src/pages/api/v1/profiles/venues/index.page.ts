import { defineEndpoints } from "@/api";
import { ErrorCode, ErrorDto } from "@/api/dto/error";
import { KeyPagedDataDtoSchema } from "@/api/dto/pagination";
import { VenueFilterParametersSchema } from "@/api/dto/profiles/venues/filter";
import { VenueReferenceDtoSchema } from "@/api/dto/profiles/venues/reference";
import { StatusCodes } from "@/api/status_codes";
import { withParsedObject } from "@/api/util";
import z from "@/api/zod";
import { VenueDao } from "@/db/dao/profiles/venue";
import { mapVenueFilterParametersToModel } from "@/mapping/profiles/venues/filter";
import { mapVenueReferenceModelToDto } from "@/mapping/profiles/venues/reference";
import { NextApiResponse } from "next";

type PageOfVenueReferences = z.infer<
  ReturnType<
    typeof KeyPagedDataDtoSchema<
      typeof VenueReferenceDtoSchema,
      typeof VenueReferenceDtoSchema.shape.id
    >
  >
>;

export default defineEndpoints({
  GET: {
    authentication: null,
    docs: {
      method: "get",
      path: "/api/v1/profiles/venues/",
      tags: ["Profiles", "Venues"],
      summary: "List profiles for venues",
      description: `List profiles for venues.

The profiles are sorted (in descending order of precedence) by:
* name similarity
* distance
* name
* id

Note: The number of parameters is intentionally kept low to increase the
likelyhood of a cache hit.
`,
      request: {
        query: VenueFilterParametersSchema,
      },
      responses: {
        [StatusCodes.success.ok]: {
          description: "Ok",
          content: {
            "application/json": {
              schema: KeyPagedDataDtoSchema(
                VenueReferenceDtoSchema,
                VenueReferenceDtoSchema.shape.id
              ),
            },
          },
        },
      },
    },
    async handler(req, res) {
      await withParsedObject(
        VenueFilterParametersSchema,
        req.query,
        res,
        ErrorCode.invalidParameters,
        async (params) => {
          if (
            params.lat !== params.lng &&
            (params.lat === undefined || params.lng === undefined)
          ) {
            (res as NextApiResponse<ErrorDto>)
              .status(StatusCodes.clientError.badRequest)
              .json({
                code: ErrorCode.invalidParameters,
                message:
                  params.lat === undefined
                    ? "lat is required"
                    : "lng is required",
              });
            return;
          }
          const filterModel = mapVenueFilterParametersToModel(params);
          const page = await VenueDao.getManyReferences(filterModel);

          (res as NextApiResponse<PageOfVenueReferences>)
            .status(StatusCodes.success.ok)
            .json({
              data: page.data.map(mapVenueReferenceModelToDto),
              nextPageKey: page.nextPageKey,
            });
        }
      );
    },
  },
});
