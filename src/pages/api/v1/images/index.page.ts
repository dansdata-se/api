import { defineEndpoints } from "@/api";
import { placeholderAuth } from "@/api/auth";
import {
  CreateImageUploadUrlDto,
  CreateImageUploadUrlDtoSchema,
} from "@/api/dto/storage/image";
import { StatusCodes } from "@/api/status_codes";
import { ImageDao } from "@/db/dao/storage/image";
import { NextApiResponse } from "next";

export default defineEndpoints({
  POST: {
    authenticated: true,
    docs: {
      method: "post",
      path: "/api/v1/images/",
      tags: ["Storage"],
      security: [{ [placeholderAuth.name]: [] }],
      summary: "Create an image upload url",
      responses: {
        [StatusCodes.success.created]: {
          description:
            "Created\n\nAn upload url was successfully created.\n\nPlease see [Cloudflare's documentation](https://developers.cloudflare.com/images/cloudflare-images/upload-images/direct-creator-upload/) for details on how to use this url to upload an image.",
          content: {
            "application/json": {
              schema: CreateImageUploadUrlDtoSchema,
            },
          },
        },
      },
    },
    async handler(_, res) {
      const { id, uploadURL } = await ImageDao.createImageUploadUrl(
        // TODO(FelixZY): replace with proper userId once auth is in place.
        ""
      );
      (res as NextApiResponse<CreateImageUploadUrlDto>)
        .status(StatusCodes.success.created)
        .json({
          id,
          uploadURL,
        });
    },
  },
});
