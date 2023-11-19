import { BasePatchProfileDtoSchema } from "@/api/dto/profiles/base/patch";
import { CreateOrganizationDtoSchema } from "@/api/dto/profiles/organizations/create";
import { registry } from "@/api/registry";
import z from "@/api/zod";

export type PatchOrganizationDto = z.infer<typeof PatchOrganizationDtoSchema>;
export const PatchOrganizationDtoSchema = registry.register(
  "PatchOrganizationDto",
  BasePatchProfileDtoSchema.merge(
    z.object({
      tags: CreateOrganizationDtoSchema.shape.tags.optional(),
      members: CreateOrganizationDtoSchema.shape.members.optional(),
    })
  ).refine(
    (dto) => {
      const dtoKeys = Object.keys(dto);
      const containsValidChanges = Object.keys(PatchOrganizationDtoSchema).some(
        (key) => dtoKeys.includes(key)
      );

      // HACK(FelixZY): Typescript does not allow a direct `return containsChanges`
      // as we are referencing `PatchOrganizationDtoSchema` in this function:
      // ```
      // 'PatchOrganizationDtoSchema' implicitly has type 'any' because it does not
      // have a type annotation and is referenced directly or indirectly in its own initializer.
      // ts(7022)
      // ```
      if (containsValidChanges) {
        return true;
      } else {
        return false;
      }
    },
    {
      message: "At least one field modification is required",
    }
  )
);
