import { defineEndpoints } from "@/api";
import { placeholderAuth } from "@/api/auth/methods/placeholder_auth";
import { ErrorCode, ErrorDto } from "@/api/dto/error";
import { BaseProfileDtoSchema } from "@/api/dto/profiles/base/profile";
import { PatchProfileDtoSchema } from "@/api/dto/profiles/patch";
import { ProfileDto, ProfileDtoSchema } from "@/api/dto/profiles/profile";
import { StatusCodes } from "@/api/status_codes";
import { withParsedObject } from "@/api/util";
import z from "@/api/zod";
import { BaseProfileDao, ProfileInUseError } from "@/db/dao/profiles/base";
import { IndividualDao } from "@/db/dao/profiles/individual";
import { OrganizationDao } from "@/db/dao/profiles/organization";
import { VenueDao } from "@/db/dao/profiles/venue";
import { mapPatchIndividualDtoToModel } from "@/mapping/profiles/individuals/patch";
import { mapIndividualModelToDto } from "@/mapping/profiles/individuals/profile";
import { mapOrganizationModelToDto } from "@/mapping/profiles/organizations/profile";
import { mapVenueModelToDto } from "@/mapping/profiles/venues/profile";
import { ProfileModel } from "@/model/profiles/profile";
import { ProfileType } from "@prisma/client";
import { NextApiResponse } from "next";

const pathParametersSchema = z.object({
  id: BaseProfileDtoSchema.shape.id.openapi({
    description: "Profile ID",
  }),
});

export default defineEndpoints({
  GET: {
    authentication: null,
    docs: {
      method: "get",
      path: "/api/v1/profiles/{id}/",
      tags: ["Profiles"],
      summary: "Retrieve a specific profile",
      request: {
        params: pathParametersSchema,
      },
      responses: {
        [StatusCodes.success.ok]: {
          description: "Ok",
          content: {
            "application/json": {
              schema: ProfileDtoSchema,
            },
          },
        },
        [StatusCodes.clientError.notFound]: {
          description: "Not found\n\nThe profile was not found.",
        },
      },
    },
    async handler(req, res) {
      await withParsedObject(
        pathParametersSchema,
        req.query,
        res,
        ErrorCode.invalidParameters,
        async ({ id }) => {
          const type = await BaseProfileDao.getTypeById(id);

          let model: ProfileModel | null;
          let dto: ProfileDto | null;
          switch (type) {
            case null:
              model = null;
              dto = null;
              break;
            case ProfileType.individual:
              model = await IndividualDao.getById(id);
              dto = model ? mapIndividualModelToDto(model) : null;
              break;
            case ProfileType.organization:
              model = await OrganizationDao.getById(id);
              dto = model ? mapOrganizationModelToDto(model) : null;
              break;
            case ProfileType.venue:
              model = await VenueDao.getById(id);
              dto = model ? mapVenueModelToDto(model) : null;
              break;
            default:
              throw new Error(
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                `Profile type '${type}' has not been implemented`
              );
          }

          if (dto) {
            (res as NextApiResponse<ProfileDto>)
              .status(StatusCodes.success.ok)
              .json(dto);
          } else {
            (res as NextApiResponse<ErrorDto>)
              .status(StatusCodes.clientError.notFound)
              .json({
                code: ErrorCode.notFound,
                message: "The profile was not found",
              });
          }
        }
      );
    },
  },
  PATCH: {
    authentication: placeholderAuth,
    docs: {
      method: "patch",
      path: "/api/v1/profiles/{id}/",
      tags: ["Profiles"],
      summary: "Update a profile",
      request: {
        params: pathParametersSchema,
        body: {
          required: true,
          content: {
            "application/json": {
              schema: PatchProfileDtoSchema,
            },
          },
        },
      },
      responses: {
        [StatusCodes.success.ok]: {
          description: "Ok",
          content: {
            "application/json": {
              schema: ProfileDtoSchema,
            },
          },
        },
        [StatusCodes.clientError.notFound]: {
          description: "Not found\n\nThe profile was not found.",
        },
      },
    },
    async handler(req, res) {
      await withParsedObject(
        pathParametersSchema,
        req.query,
        res,
        ErrorCode.invalidParameters,
        async ({ id }) =>
          await withParsedObject(
            PatchProfileDtoSchema,
            req.body,
            res,
            ErrorCode.invalidBody,
            async (patchDto) => {
              const type = await BaseProfileDao.getTypeById(id);

              let model: ProfileModel | null;
              let responseDto: ProfileDto | null;
              switch (type) {
                case null:
                  model = null;
                  responseDto = null;
                  break;
                case ProfileType.individual:
                  model = await IndividualDao.patch(
                    mapPatchIndividualDtoToModel(patchDto, id)
                  );
                  responseDto = model ? mapIndividualModelToDto(model) : null;
                  break;
                case ProfileType.organization:
                case ProfileType.venue:
                  return (res as NextApiResponse<ErrorDto>)
                    .status(StatusCodes.serverError.notImplemented)
                    .json({
                      code: ErrorCode.notImplemented,
                      message: "Not implemented",
                    });
                default:
                  throw new Error(
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    `Profile type '${type}' has not been implemented`
                  );
              }

              if (responseDto) {
                (res as NextApiResponse<ProfileDto>)
                  .status(StatusCodes.success.ok)
                  .json(responseDto);
              } else {
                (res as NextApiResponse<ErrorDto>)
                  .status(StatusCodes.clientError.notFound)
                  .json({
                    code: ErrorCode.notFound,
                    message: "The profile was not found",
                  });
              }
            }
          )
      );
    },
  },
  DELETE: {
    authentication: placeholderAuth,
    docs: {
      method: "delete",
      path: "/api/v1/profiles/{id}/",
      tags: ["Profiles"],
      summary: "Delete a profile",
      request: {
        params: pathParametersSchema,
      },
      responses: {
        [StatusCodes.success.noContent]: {
          description: "No content\n\nThe profile was successfully deleted.",
        },
        [StatusCodes.clientError.notFound]: {
          description: "Not found\n\nThe profile was not found.",
        },
      },
    },
    async handler(req, res) {
      await withParsedObject(
        pathParametersSchema,
        req.query,
        res,
        ErrorCode.invalidParameters,
        async ({ id }) => {
          try {
            const type = await BaseProfileDao.getTypeById(id);

            let deleted: boolean;
            switch (type) {
              case null:
                deleted = false;
                break;
              case ProfileType.individual:
                deleted = await IndividualDao.delete(id);
                break;
              case ProfileType.organization:
                deleted = await OrganizationDao.delete(id);
                break;
              case ProfileType.venue:
                deleted = await VenueDao.delete(id);
                break;
              default:
                throw new Error(
                  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                  `Profile type '${type}' has not been implemented`
                );
            }

            if (deleted) {
              (res as NextApiResponse<void>)
                .status(StatusCodes.success.noContent)
                .end();
            } else {
              (res as NextApiResponse<ErrorDto>)
                .status(StatusCodes.clientError.notFound)
                .json({
                  code: ErrorCode.notFound,
                  message: "The profile was not found",
                });
            }
          } catch (e) {
            if (e instanceof ProfileInUseError) {
              (res as NextApiResponse<ErrorDto>)
                .status(StatusCodes.clientError.forbidden)
                .json({
                  code: ErrorCode.forbidden,
                  message: `The profile is in use and cannot be deleted.`,
                });
              return;
            }
            throw e;
          }
        }
      );
    },
  },
});
