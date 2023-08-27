import { defineEndpoints } from "@/api";
import { placeholderAuth } from "@/api/auth";
import { ErrorCode, ErrorDto } from "@/api/dto/error";
import {
  CreateImageUploadUrlDto,
  CreateImageUploadUrlDtoSchema,
} from "@/api/dto/storage/image";
import { ImageDAO } from "@/db/dao/storage/image";
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
        "201": {
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
      try {
        const { id, uploadURL } = await ImageDAO.createImageUploadUrl(
          // TODO(FelixZY): replace with proper userId once auth is in place.
          ""
        );
        (res as NextApiResponse<CreateImageUploadUrlDto>).status(201).json({
          id,
          uploadURL,
        });
      } catch (e) {
        res.setHeader("content-type", "application/json");
        return (res as NextApiResponse<ErrorDto>).status(500).json({
          code: ErrorCode.internalServerError,
          message: "Could not create an image upload url.",
        });
      }
    },
  },
});
