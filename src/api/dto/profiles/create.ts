import { CreateIndividualDtoSchema } from "@/api/dto/profiles/individuals/create";
import { CreateOrganizationDtoSchema } from "@/api/dto/profiles/organizations/create";
import { CreateVenueDtoSchema } from "@/api/dto/profiles/venues/create";
import { registry } from "@/api/registry";
import z from "@/api/zod";

export type CreateProfileDto = z.infer<typeof CreateProfileDtoSchema>;
export const CreateProfileDtoSchema = registry.register(
  "CreateProfileDto",
  z.union([
    CreateIndividualDtoSchema,
    CreateOrganizationDtoSchema,
    CreateVenueDtoSchema,
  ])
);
