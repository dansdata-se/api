import { defineEndpoints } from "@/api";
import { placeholderAuth } from "@/api/auth/methods/placeholder_auth";
import { ErrorCode, ErrorDto } from "@/api/dto/error";
import { CreateProfileDtoSchema } from "@/api/dto/profiles/create";
import { ProfileDto, ProfileDtoSchema } from "@/api/dto/profiles/profile";
import { StatusCodes } from "@/api/status_codes";
import { withParsedObject } from "@/api/util";
import { IndividualDao } from "@/db/dao/profiles/individual";
import { OrganizationDao } from "@/db/dao/profiles/organization";
import { VenueDao } from "@/db/dao/profiles/venue";
import { mapCreateIndividualDtoToModel } from "@/mapping/profiles/individuals/create";
import { mapIndividualModelToDto } from "@/mapping/profiles/individuals/profile";
import { mapCreateOrganizationDtoToModel } from "@/mapping/profiles/organizations/create";
import { mapOrganizationModelToDto } from "@/mapping/profiles/organizations/profile";
import { mapCreateVenueDtoToModel } from "@/mapping/profiles/venues/create";
import { mapVenueModelToDto } from "@/mapping/profiles/venues/profile";
import { ProfileModel } from "@/model/profiles/profile";
import { ProfileType } from "@prisma/client";
import { NextApiResponse } from "next";

export default defineEndpoints({
  POST: {
    authentication: placeholderAuth,
    docs: {
      method: "post",
      path: "/api/v1/profiles/",
      tags: ["Profiles"],
      summary: "Create a profile",
      request: {
        body: {
          required: true,
          content: {
            "application/json": {
              schema: CreateProfileDtoSchema,
            },
          },
        },
      },
      responses: {
        [StatusCodes.success.created]: {
          description: "Created",
          content: {
            "application/json": {
              schema: ProfileDtoSchema,
            },
          },
        },
      },
    },
    async handler(req, res) {
      await withParsedObject(
        CreateProfileDtoSchema,
        req.body,
        res,
        ErrorCode.invalidBody,
        async (createDto) => {
          let model: ProfileModel;
          let responseDto: ProfileDto;
          switch (createDto.type) {
            case ProfileType.individual:
              model = await IndividualDao.create(
                mapCreateIndividualDtoToModel(createDto)
              );
              responseDto = mapIndividualModelToDto(model);
              break;
            case ProfileType.organization:
              model = await OrganizationDao.create(
                mapCreateOrganizationDtoToModel(createDto)
              );
              responseDto = mapOrganizationModelToDto(model);
              break;
            case ProfileType.venue:
              model = await VenueDao.create(
                mapCreateVenueDtoToModel(createDto)
              );
              responseDto = mapVenueModelToDto(model);
              break;
            default:
              return (res as NextApiResponse<ErrorDto>)
                .status(StatusCodes.serverError.notImplemented)
                .json({
                  code: ErrorCode.notImplemented,
                  // @ts-expect-error 2339 - The presence of this error indicates that the switch is exhaustive
                  message: `Profile type '${createDto.type}' has not been implemented`,
                });
          }

          (res as NextApiResponse<ProfileDto>)
            .status(StatusCodes.success.ok)
            .json(responseDto);
        }
      );
    },
  },
});
