import { defineEndpoints } from "@/api";
import {
  IndividualTagDetailsDto,
  IndividualTagDetailsDtoSchema,
} from "@/api/dto/profiles/individuals/tag_details";
import { StatusCodes } from "@/api/status_codes";
import { IndividualDao } from "@/db/dao/profiles/individual";
import { NextApiResponse } from "next";

export default defineEndpoints({
  GET: {
    authentication: null,
    docs: {
      method: "get",
      path: "/api/v1/profiles/individuals/tags/",
      tags: ["Profiles", "Individuals"],
      summary: "List possible individual tags",
      responses: {
        [StatusCodes.success.ok]: {
          description: "Ok\n\nA list of all supported individual tags.",
          content: {
            "application/json": {
              schema: IndividualTagDetailsDtoSchema.array(),
            },
          },
        },
      },
    },
    async handler(_, res) {
      const tags = await IndividualDao.tags();
      (res as NextApiResponse<IndividualTagDetailsDto[]>)
        .status(StatusCodes.success.ok)
        .json(tags);
    },
  },
});
