import { registry } from "@/api/registry";
import z from "@/api/zod";
import { imageToUrl, placeholderImage } from "@/cloudflare";

export type CreateImageUploadUrlDto = z.infer<
  typeof CreateImageUploadUrlDtoSchema
>;
export const CreateImageUploadUrlDtoSchema = registry.register(
  "CreateImageUploadUrlDto",
  z.object({
    id: z.string().openapi({
      description:
        "An id for this image upload.\n\nThis id can be used to refer to the uploaded image e.g. when adding images to a profile.",
    }),
    uploadURL: z.string().url().openapi({
      description:
        "A url to which an image can be uploaded.\n\nPlease see [Cloudflare's documentation](https://developers.cloudflare.com/images/cloudflare-images/upload-images/direct-creator-upload/) for details on how to use this url to upload an image.",
    }),
  })
);

export const UploadedImageReferenceDtoSchema = z
  .string()
  .max(100)
  .trim()
  .min(5)
  .optional()
  .openapi({
    // Techincally the cloudflareId
    description: "The id of a previously uploaded image.",
  });

export type ImageDto = z.infer<typeof ImageDtoSchema>;
export const ImageDtoSchema = registry.register(
  "ImageDto",
  z.object({
    cover: z
      .string()
      .url()
      .nullable()
      .openapi({
        description: `Base URL for a landscape oriented image.

Append one of these postfixes to complete the url:

| Postfix | Image dimensions |
|--|--|
| \`/coverxl\` | 1800x945 |
| \`/coverlg\` | 1200x630 |
| \`/covermd\` | 600x315 |
| \`/coversm\` | 360x189 |
`,
        example: imageToUrl({
          id: "123e4567-e89b-12d3-a456-426614174000",
          cloudflareId: placeholderImage.cover.cloudflareId,
          variant: "cover",
        }),
      }),
    poster: z
      .string()
      .url()
      .nullable()
      .openapi({
        description: `Base URL for a portrait oriented image.

Append one of these postfixes to complete the url:

| Postfix | Image dimensions |
|--|--|
| \`/posterxl\` | 1400x1960 |
| \`/posterlg\` | 1000x1400 |
| \`/postermd\` | 600x840 |
| \`/postersm\` | 320x448 |
`,
        example: imageToUrl({
          id: "123e4567-e89b-12d3-a456-426614174000",
          cloudflareId: placeholderImage.poster.cloudflareId,
          variant: "poster",
        }),
      }),
    square: z
      .string()
      .url()
      .nullable()
      .openapi({
        description: `Base URL for a square image.

Append one of these postfixes to complete the url:

| Postfix | Image dimensions |
|--|--|
| \`/squarexl\` | 1500x1500 |
| \`/squarelg\` | 900x900 |
| \`/squaremd\` | 600x600 |
| \`/squaresm\` | 320x320 |
`,
        example: imageToUrl({
          id: "123e4567-e89b-12d3-a456-426614174000",
          cloudflareId: placeholderImage.square.cloudflareId,
          variant: "square",
        }),
      }),
  })
);
