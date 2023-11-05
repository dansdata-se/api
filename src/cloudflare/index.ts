import env, { ENVVAR_UNSET } from "@/env";
import logger from "@/logger";
import { ImageModel } from "@/model/storage/image";

// Placeholder images for use e.g. in local development
export const placeholderImage = {
  accountHash: "G8sMfYZUPWZLbBSEOOpxuw",
  cover: {
    cloudflareId: "9f67602f-43ba-4cee-7bd8-768b0c000f00",
  },
  poster: {
    cloudflareId: "5fe2e728-7683-4dda-85ae-1672d4690400",
  },
  square: {
    cloudflareId: "c261d5e6-7121-4589-6a0e-c54778609c00",
  },
};

export function imageToUrl(image: ImageModel): string {
  if (
    process.env.NODE_ENV !== "production" &&
    env.CLOUDFLARE_ACCOUNT_HASH === ENVVAR_UNSET
  ) {
    logger.warn(
      "Missing envvars for Cloudflare credentials. " +
        "Falling back on placeholder image url."
    );
    switch (image.variant) {
      case "cover":
        return `https://imagedelivery.net/${placeholderImage.accountHash}/${placeholderImage.cover.cloudflareId}/`;
      case "poster":
        return `https://imagedelivery.net/${placeholderImage.accountHash}/${placeholderImage.poster.cloudflareId}/`;
      case "square":
        return `https://imagedelivery.net/${placeholderImage.accountHash}/${placeholderImage.square.cloudflareId}/`;
    }
  } else {
    return `https://imagedelivery.net/${env.CLOUDFLARE_ACCOUNT_HASH}/${image.cloudflareId}/`;
  }
}
