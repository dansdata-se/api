import z from "@/api/zod";
import { CloudflareResultDtoSchema } from "@/cloudflare/dto/result";

// Partial schema - covers the parts we are interested in.
export type CloudflareImageDto = z.infer<typeof CloudflareImageDtoSchema>;
export const CloudflareImageDtoSchema = CloudflareResultDtoSchema.merge(
  z.object({
    result: z.object({
      id: z.string(),
      meta: z.record(z.string()),
      uploaded: z.string().datetime(),
      draft: z.optional(z.boolean()),
    }),
  })
);
