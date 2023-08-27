import { defineEndpoints } from "@/api";
import {
  OrganizationTagDetailsDto,
  OrganizationTagDetailsDtoSchema,
} from "@/api/dto/profiles/organizations/tag_details";
import { OrganizationDao } from "@/db/dao/profiles/organization";
import { NextApiResponse } from "next";

export default defineEndpoints({
  GET: {
    authenticated: false,
    docs: {
      method: "get",
      path: "/api/v1/profiles/organizations/tags/",
      tags: ["Profiles", "Organizations"],
      summary: "List possible organization tags",
      responses: {
        "200": {
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
        .status(200)
        .json(tags);
    },
  },
});
