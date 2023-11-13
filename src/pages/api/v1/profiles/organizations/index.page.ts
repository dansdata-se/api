import { defineEndpoints } from "@/api";
import { placeholderAuth } from "@/api/auth";
import { ErrorCode } from "@/api/dto/error";
import { CreateOrganizationDtoSchema } from "@/api/dto/profiles/organizations/create";
import {
  OrganizationDto,
  OrganizationDtoSchema,
} from "@/api/dto/profiles/organizations/profile";
import { StatusCodes } from "@/api/status_codes";
import { withParsedObject } from "@/api/util";
import { OrganizationDao } from "@/db/dao/profiles/organization";
import { mapCreateOrganizationDtoToModel } from "@/mapping/profiles/organizations/create";
import { mapOrganizationModelToDto } from "@/mapping/profiles/organizations/profile";
import { NextApiResponse } from "next";

export default defineEndpoints({
  POST: {
    authenticated: true,
    docs: {
      method: "post",
      path: "/api/v1/profiles/organizations/",
      tags: ["Profiles", "Organizations"],
      security: [{ [placeholderAuth.name]: [] }],
      summary: "Create a profile for an organization",
      request: {
        body: {
          required: true,
          content: {
            "application/json": {
              schema: CreateOrganizationDtoSchema,
            },
          },
        },
      },
      responses: {
        [StatusCodes.success.created]: {
          description: "Created",
          content: {
            "application/json": {
              schema: OrganizationDtoSchema,
            },
          },
        },
      },
    },
    async handler(req, res) {
      await withParsedObject(
        CreateOrganizationDtoSchema,
        req.body,
        res,
        ErrorCode.invalidBody,
        async (dto) => {
          const createProfileModel = mapCreateOrganizationDtoToModel(dto);
          const profileModel = await OrganizationDao.create(createProfileModel);
          return (res as NextApiResponse<OrganizationDto>)
            .status(StatusCodes.success.created)
            .json(mapOrganizationModelToDto(profileModel));
        }
      );
    },
  },
});
