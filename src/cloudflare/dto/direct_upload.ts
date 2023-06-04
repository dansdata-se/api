import z from "@/api/zod";
import { CloudflareResultDTOSchema } from "@/cloudflare/dto/result";

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

export type CloudflareDirectUploadDTO = z.infer<
  typeof CloudflareDirectUploadDTOSchema
>;
export const CloudflareDirectUploadDTOSchema = CloudflareResultDTOSchema.merge(
  z.object({
    result: z.object({
      id: z.string(),
      uploadURL: z.string().url(),
    }),
  })
);
