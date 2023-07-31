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

const cloudflareAccountHash = process.env.CLOUDFLARE_ACCOUNT_HASH;
if (cloudflareAccountHash === undefined) {
  if (process.env.NODE_ENV === "development") {
    logger.warn(
      "CLOUDFLARE_ACCOUNT_HASH was not set. Using placeholder images for local development."
    );
  } else {
    logger.warn(
      "CLOUDFLARE_ACCOUNT_HASH was not set. It will not be possible to generate valid image URLs."
    );
  }
}

export function imageToUrl(image: ImageModel): string {
  if (cloudflareAccountHash === undefined) {
    switch (image.variant) {
      case "cover":
        return `https://imagedelivery.net/${placeholderImage.accountHash}/${placeholderImage.cover.cloudflareId}`;
      case "poster":
        return `https://imagedelivery.net/${placeholderImage.accountHash}/${placeholderImage.poster.cloudflareId}`;
      case "square":
        return `https://imagedelivery.net/${placeholderImage.accountHash}/${placeholderImage.square.cloudflareId}`;
    }
  } else {
    return `https://imagedelivery.net/${cloudflareAccountHash}/${image.cloudflareId}`;
  }
}
