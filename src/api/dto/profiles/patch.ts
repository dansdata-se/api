import { PatchIndividualDtoSchema } from "@/api/dto/profiles/individuals/patch";
import { PatchOrganizationDtoSchema } from "@/api/dto/profiles/organizations/patch";
import { registry } from "@/api/registry";
import z from "@/api/zod";

export type PatchProfileDto = z.infer<typeof PatchProfileDtoSchema>;
export const PatchProfileDtoSchema = registry.register(
  "PatchProfileDto",
  z.union([PatchIndividualDtoSchema, PatchOrganizationDtoSchema])
);
