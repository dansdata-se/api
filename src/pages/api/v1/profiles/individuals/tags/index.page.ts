import { defineEndpoints } from "@/api";
import {
  IndividualTagDetailsDTO,
  IndividualTagDetailsDTOSchema,
} from "@/api/dto/profiles/individuals/tag_details";
import { IndividualDAO } from "@/db/dao/profiles/individual";
import { NextApiResponse } from "next";

export default defineEndpoints({
  GET: {
    authenticated: false,
    docs: {
      method: "get",
      path: "/api/v1/profiles/individuals/tags/",
      tags: ["Profiles", "Individuals"],
      summary: "List possible individual tags",
      responses: {
        "200": {
          description: "Ok\n\nA list of all supported individual tags.",
          content: {
            "application/json": {
              schema: IndividualTagDetailsDTOSchema.array(),
            },
          },
        },
      },
    },
    async handler(_, res) {
      const tags = await IndividualDAO.tags();
      (res as NextApiResponse<IndividualTagDetailsDTO[]>)
        .status(200)
        .json(tags);
    },
  },
});
