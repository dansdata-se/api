import { defineEndpoints } from "@/api";
import { placeholderAuth } from "@/api/auth/methods/placeholder_auth";
import { ErrorCode } from "@/api/dto/error";
import { CreateIndividualDtoSchema } from "@/api/dto/profiles/individuals/create";
import {
  IndividualDto,
  IndividualDtoSchema,
} from "@/api/dto/profiles/individuals/profile";
import { StatusCodes } from "@/api/status_codes";
import { withParsedObject } from "@/api/util";
import { IndividualDao } from "@/db/dao/profiles/individual";
import { mapCreateIndividualDtoToModel } from "@/mapping/profiles/individuals/create";
import { mapIndividualModelToDto } from "@/mapping/profiles/individuals/profile";
import { NextApiResponse } from "next";

export default defineEndpoints({
  POST: {
    authentication: placeholderAuth,
    docs: {
      method: "post",
      path: "/api/v1/profiles/individuals/",
      tags: ["Profiles", "Individuals"],
      summary: "Create a profile for an individual",
      request: {
        body: {
          required: true,
          content: {
            "application/json": {
              schema: CreateIndividualDtoSchema,
            },
          },
        },
      },
      responses: {
        [StatusCodes.success.created]: {
          description: "Created",
          content: {
            "application/json": {
              schema: IndividualDtoSchema,
            },
          },
        },
      },
    },
    async handler(req, res) {
      await withParsedObject(
        CreateIndividualDtoSchema,
        req.body,
        res,
        ErrorCode.invalidBody,
        async (dto) => {
          const createProfileModel = mapCreateIndividualDtoToModel(dto);
          const profileModel = await IndividualDao.create(createProfileModel);
          return (res as NextApiResponse<IndividualDto>)
            .status(StatusCodes.success.created)
            .json(mapIndividualModelToDto(profileModel));
        }
      );
    },
  },
});
