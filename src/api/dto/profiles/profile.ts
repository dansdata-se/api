import { IndividualDtoSchema } from "@/api/dto/profiles/individuals/profile";
import { OrganizationDtoSchema } from "@/api/dto/profiles/organizations/profile";
import { VenueDtoSchema } from "@/api/dto/profiles/venues/profile";
import { registry } from "@/api/registry";
import z from "@/api/zod";

export type ProfileDto = z.infer<typeof ProfileDtoSchema>;
export const ProfileDtoSchema = registry.register(
  "ProfileDto",
  z.union([IndividualDtoSchema, OrganizationDtoSchema, VenueDtoSchema])
);
