import { BaseUpdateProfileDtoSchema } from "@/api/dto/profiles/base/update";
import { CreateOrganizationDtoSchema } from "@/api/dto/profiles/organizations/create";
import { registry } from "@/api/registry";
import z from "@/api/zod";

export type UpdateOrganizationDto = z.infer<typeof UpdateOrganizationDtoSchema>;
export const UpdateOrganizationDtoSchema = registry.register(
  "UpdateOrganizationDto",
  CreateOrganizationDtoSchema.merge(BaseUpdateProfileDtoSchema)
    .partial()
    .refine((o) => Object.keys(o).length > 0, {
      message: "At least one field must be present.",
    })
);
