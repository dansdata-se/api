import {
  CloudflareDirectUploadDTOSchema,
  CloudflareDirectUploadParameters,
} from "@/cloudflare/dto/direct_upload";
import { CloudflareImageDTOSchema } from "@/cloudflare/dto/image";
import { CloudflareResultDTOSchema } from "@/cloudflare/dto/result";
import logger from "@/logger";
import wretch, { FetchLike } from "wretch";
import FormDataAddon from "wretch/addons/formData";

const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN;
if (!cloudflareAccountId) {
  logger.warn(
    "CLOUDFLARE_ACCOUNT_ID was not set. The cloudflare API will be unusable."
  );
}
if (!cloudflareApiToken) {
  logger.warn(
    "CLOUDFLARE_API_TOKEN was not set. The cloudflare API will be unusable."
  );
}

const api = wretch("https://api.cloudflare.com/client/v4/") //
  .addon(FormDataAddon)
  .middlewares([
    // Logging middleware for debugging
    (next: FetchLike): FetchLike =>
      async (url, opts) => {
        logger.debug(
          {
            req: {
              url,
            },
          },
          "Calling Cloudflare API"
        );
        return next(url, opts);
      },
  ])
  .auth(cloudflareApiToken ? `Bearer ${cloudflareApiToken}` : "");

export const cloudflareApi = {
  images: {
    createImageUploadUrl: (params: CloudflareDirectUploadParameters) => {
      if (!cloudflareAccountId) {
        throw new Error(
          "CLOUDFLARE_ACCOUNT_ID is not set. The cloudflare API cannot be used."
        );
      }
      return api
        .url(`accounts/${cloudflareAccountId}/images/v2/direct_upload`)
        .formData({
          ...params,
          metadata: JSON.stringify(params.metadata),
        })
        .resolve(
          async (r) =>
            await CloudflareDirectUploadDTOSchema.parseAsync(await r.json())
        )
        .post();
    },

    isUploaded: (cloudflareImageId: string): Promise<boolean> => {
      if (!cloudflareAccountId) {
        throw new Error(
          "CLOUDFLARE_ACCOUNT_ID is not set. The cloudflare API cannot be used."
        );
      }
      return api
        .url(`accounts/${cloudflareAccountId}/images/v1/${cloudflareImageId}`)
        .resolve((r) =>
          r
            .notFound(() => false)
            .json(
              async (r) =>
                !(await CloudflareImageDTOSchema.parseAsync(r)).result.draft
            )
        )
        .get();
    },

    delete: (cloudflareImageId: string) => {
      if (!cloudflareAccountId) {
        throw new Error(
          "CLOUDFLARE_ACCOUNT_ID is not set. The cloudflare API cannot be used."
        );
      }
      return api
        .url(`accounts/${cloudflareAccountId}/images/v1/${cloudflareImageId}`)
        .resolve(
          async (r) =>
            await CloudflareResultDTOSchema.parseAsync(await r.json())
        )
        .delete();
    },
  },
};
