import { placeholderImage } from "@/cloudflare";
import {
  CloudflareDirectUploadDto,
  CloudflareDirectUploadDtoSchema,
  CloudflareDirectUploadParameters,
} from "@/cloudflare/dto/direct_upload";
import { CloudflareImageDtoSchema } from "@/cloudflare/dto/image";
import {
  CloudflareResultDto,
  CloudflareResultDtoSchema,
} from "@/cloudflare/dto/result";
import env, { ENVVAR_UNSET } from "@/env";
import logger from "@/logger";
import { MissingEnvError } from "envsafe";
import wretch, { FetchLike } from "wretch";
import FormDataAddon from "wretch/addons/formData";

const api = wretch("https://api.cloudflare.com/client/v4/") //
  .addon(FormDataAddon)
  .middlewares([
    (next: FetchLike): FetchLike =>
      async (url, opts) => {
        if (
          // Tests generally use mocks and should be allowed to proceed.
          process.env.NODE_ENV !== "test" &&
          [
            env.CLOUDFLARE_ACCOUNT_ID,
            env.CLOUDFLARE_ACCOUNT_HASH,
            env.CLOUDFLARE_API_TOKEN,
          ].includes(ENVVAR_UNSET)
        ) {
          throw new MissingEnvError(
            "Missing envvars for Cloudflare credentials. " +
              "The Cloudflare API cannot be used."
          );
        }
        return next(url, opts);
      },
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
  .auth(`Bearer ${env.CLOUDFLARE_API_TOKEN}`);

function logResultMessagesAndErrors<T extends CloudflareResultDto>(
  result: T
): T {
  const { messages, errors } = result;

  if (messages.length > 0 || errors.length > 0) {
    logger.warn(
      { cloudflare: { errors, messages } },
      "Cloudflare API returned errors or messages"
    );
  }

  return result;
}

export const cloudflareApi = {
  images: {
    createImageUploadUrl: (
      params: CloudflareDirectUploadParameters
    ): Promise<CloudflareDirectUploadDto> => {
      return (
        api
          .url(`accounts/${env.CLOUDFLARE_ACCOUNT_ID}/images/v2/direct_upload`)
          .formData({
            ...params,
            metadata: JSON.stringify(params.metadata),
          })
          .resolve(
            async (r) =>
              await CloudflareDirectUploadDtoSchema.parseAsync(await r.json())
          )
          .post()
          .then(logResultMessagesAndErrors)
          // Fake response in local development for developers without access to cloudflare.
          .catch((e) => {
            if (
              process.env.NODE_ENV !== "production" &&
              e instanceof MissingEnvError
            ) {
              return Promise.resolve<CloudflareDirectUploadDto>({
                messages: [
                  {
                    // Hopefully unused. Docs state that the code must be >1000
                    code: 999_999,
                    message:
                      "This response was faked as you have not configured environment variables for accessing the Cloudflare API",
                  },
                ],
                errors: [],
                success: true,
                result: {
                  id: placeholderImage.cover.cloudflareId,
                  uploadURL: "https://localhost/not-a-real-url",
                },
              });
            } else return Promise.reject(e);
          })
      );
    },

    isUploaded: (cloudflareImageId: string): Promise<boolean> => {
      return (
        api
          .url(
            `accounts/${env.CLOUDFLARE_ACCOUNT_ID}/images/v1/${cloudflareImageId}`
          )
          .resolve((r) =>
            r
              .notFound(() => false)
              .json(async (r) => await CloudflareImageDtoSchema.parseAsync(r))
          )
          .get()
          .then((r) => {
            if (typeof r === "boolean") return r;

            logResultMessagesAndErrors(r);
            return !r.result.draft;
          })
          // Fake response in local development for developers without access to cloudflare.
          .catch((e) => {
            if (
              process.env.NODE_ENV !== "production" &&
              e instanceof MissingEnvError
            ) {
              return cloudflareImageId === placeholderImage.cover.cloudflareId;
            } else return Promise.reject(e);
          })
      );
    },

    delete: (cloudflareImageId: string) => {
      return (
        api
          .url(
            `accounts/${env.CLOUDFLARE_ACCOUNT_ID}/images/v1/${cloudflareImageId}`
          )
          .resolve(
            async (r) =>
              await CloudflareResultDtoSchema.parseAsync(await r.json())
          )
          .delete()
          .then(logResultMessagesAndErrors)
          // Fake response in local development for developers without access to cloudflare.
          .catch((e) => {
            if (
              process.env.NODE_ENV !== "production" &&
              e instanceof MissingEnvError
            ) {
              return Promise.resolve<CloudflareResultDto>({
                messages: [
                  {
                    // Hopefully unused. Docs state that the code must be >1000
                    code: 999_999,
                    message:
                      "This response was faked as you have not configured environment variables for accessing the Cloudflare API",
                  },
                ],
                errors: [],
                success: true,
              });
            } else return Promise.reject(e);
          })
      );
    },
  },
};
