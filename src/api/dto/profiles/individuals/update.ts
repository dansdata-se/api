import { CreateIndividualDtoSchema } from "@/api/dto/profiles/individuals/create";
import { BaseUpdateProfileDtoSchema } from "@/api/dto/profiles/update";
import { registry } from "@/api/registry";
import z from "@/api/zod";

export type UpdateIndividualDto = z.infer<typeof UpdateIndividualDtoSchema>;
export const UpdateIndividualDtoSchema = registry.register(
  "UpdateIndividualDto",
  CreateIndividualDtoSchema.merge(BaseUpdateProfileDtoSchema)
    .partial()
    .refine((o) => Object.keys(o).length > 0, {
      message: "At least one field must be present.",
    })
);
