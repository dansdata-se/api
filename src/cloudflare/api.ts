import {
  CloudflareDirectUploadDTOSchema,
  CloudflareDirectUploadParameters,
} from "@/cloudflare/dto/direct_upload";
import { CloudflareImageDTOSchema } from "@/cloudflare/dto/image";
import { CloudflareResultDTOSchema } from "@/cloudflare/dto/result";
import wretch, { FetchLike } from "wretch";
import FormDataAddon from "wretch/addons/formData";

const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN;
if (!cloudflareAccountId) {
  console.warn(
    "CLOUDFLARE_ACCOUNT_ID was not set. The cloudflare API will be unusable."
  );
}
if (!cloudflareApiToken) {
  console.warn(
    "CLOUDFLARE_API_TOKEN was not set. The cloudflare API will be unusable."
  );
}

const api = wretch("https://api.cloudflare.com/client/v4/") //
  .addon(FormDataAddon)
  .middlewares([
    // Logging middleware for debugging
    (next: FetchLike): FetchLike =>
      async (url, opts) => {
        console.debug("Calling Cloudflare API:", url);
        return next(url, opts);
      },
  ])
  .auth(`Bearer ${cloudflareApiToken}`);

export const cloudflareApi = {
  images: {
    createImageUploadUrl: (params: CloudflareDirectUploadParameters) =>
      api
        .url(`accounts/${cloudflareAccountId}/images/v2/direct_upload`)
        .formData({
          ...params,
          metadata: JSON.stringify(params.metadata),
        })
        .resolve(
          async (r) =>
            await CloudflareDirectUploadDTOSchema.parseAsync(await r.json())
        )
        .post(),

    isUploaded: (cloudflareImageId: string): Promise<boolean> =>
      api
        .url(`accounts/${cloudflareAccountId}/images/v1/${cloudflareImageId}`)
        .resolve((r) =>
          r
            .notFound(() => false)
            .json(
              async (r) =>
                !(await CloudflareImageDTOSchema.parseAsync(r)).result.draft
            )
        )
        .get(),

    delete: (cloudflareImageId: string) =>
      api
        .url(`accounts/${cloudflareAccountId}/images/v1/${cloudflareImageId}`)
        .resolve(
          async (r) =>
            await CloudflareResultDTOSchema.parseAsync(await r.json())
        )
        .delete(),
  },
};
