import z from "@/api/zod";

export type CloudflareResultDto = z.infer<typeof CloudflareResultDtoSchema>;
export const CloudflareResultDtoSchema = z.object({
  errors: z.array(
    z.object({
      code: z.number(),
      message: z.string(),
    })
  ),
  messages: z.array(
    z.object({
      code: z.number(),
      message: z.string(),
    })
  ),
  success: z.boolean(),
});
