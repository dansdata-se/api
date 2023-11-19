import { defineEndpoints } from "@/api";
import {
  OrganizationTagDetailsDto,
  OrganizationTagDetailsDtoSchema,
} from "@/api/dto/profiles/organizations/tag_details";
import { StatusCodes } from "@/api/status_codes";
import { OrganizationDao } from "@/db/dao/profiles/organization";
import { NextApiResponse } from "next";

export default defineEndpoints({
  GET: {
    authentication: null,
    docs: {
      method: "get",
      path: "/api/v1/profiles/organizations/tags/",
      tags: ["Profiles", "Organizations"],
      summary: "List possible organization tags",
      responses: {
        [StatusCodes.success.ok]: {
          description: "Ok\n\nA list of all supported organization tags.",
          content: {
            "application/json": {
              schema: OrganizationTagDetailsDtoSchema.array(),
            },
          },
        },
      },
    },
    async handler(_, res) {
      const tags = await OrganizationDao.tags();
      (res as NextApiResponse<OrganizationTagDetailsDto[]>)
        .status(StatusCodes.success.ok)
        .json(tags);
    },
  },
});
