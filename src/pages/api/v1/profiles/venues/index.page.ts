import { defineEndpoints } from "@/api";
import { placeholderAuth } from "@/api/auth";
import { ErrorCode } from "@/api/dto/error";
import { CreateVenueDtoSchema } from "@/api/dto/profiles/venues/create";
import { VenueDto, VenueDtoSchema } from "@/api/dto/profiles/venues/profile";
import { StatusCodes } from "@/api/status_codes";
import { withParsedObject } from "@/api/util";
import { VenueDao } from "@/db/dao/profiles/venue";
import { mapCreateVenueDtoToModel } from "@/mapping/profiles/venues/create";
import { mapVenueModelToDto } from "@/mapping/profiles/venues/profile";
import { NextApiResponse } from "next";

export default defineEndpoints({
  POST: {
    authenticated: true,
    docs: {
      method: "post",
      path: "/api/v1/profiles/venues/",
      tags: ["Profiles", "Venues"],
      security: [{ [placeholderAuth.name]: [] }],
      summary: "Create a profile for a venue",
      request: {
        body: {
          required: true,
          content: {
            "application/json": {
              schema: CreateVenueDtoSchema,
            },
          },
        },
      },
      responses: {
        [StatusCodes.success.created]: {
          description: "Created",
          content: {
            "application/json": {
              schema: VenueDtoSchema,
            },
          },
        },
      },
    },
    async handler(req, res) {
      await withParsedObject(
        CreateVenueDtoSchema,
        req.body,
        res,
        ErrorCode.invalidBody,
        async (dto) => {
          const createProfileModel = mapCreateVenueDtoToModel(dto);
          const profileModel = await VenueDao.create(createProfileModel);
          return (res as NextApiResponse<VenueDto>)
            .status(StatusCodes.success.created)
            .json(mapVenueModelToDto(profileModel));
        }
      );
    },
  },
});
