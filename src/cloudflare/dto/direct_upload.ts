import z from "@/api/zod";
import { CloudflareResultDtoSchema } from "@/cloudflare/dto/result";

export type CloudflareDirectUploadParameters = z.infer<
  typeof CloudflareDirectUploadParametersSchema
>;
export const CloudflareDirectUploadParametersSchema = z.object({
  expiry: z.optional(z.date()),
  metadata: z.object({
    uploaderId: z.string(),
  }),
  requireSignedURLs: z.optional(z.boolean()),
});

export type CloudflareDirectUploadDto = z.infer<
  typeof CloudflareDirectUploadDtoSchema
>;
export const CloudflareDirectUploadDtoSchema = CloudflareResultDtoSchema.merge(
  z.object({
    result: z.object({
      id: z.string(),
      uploadURL: z.string().url(),
    }),
  })
);
