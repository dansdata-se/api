import { BasePatchProfileDtoSchema } from "@/api/dto/profiles/base/patch";
import { CreateIndividualDtoSchema } from "@/api/dto/profiles/individuals/create";
import { registry } from "@/api/registry";
import z from "@/api/zod";

export type PatchIndividualDto = z.infer<typeof PatchIndividualDtoSchema>;
export const PatchIndividualDtoSchema = registry.register(
  "PatchIndividualDto",
  BasePatchProfileDtoSchema.merge(
    z.object({
      tags: CreateIndividualDtoSchema.shape.tags.optional(),
      organizations: CreateIndividualDtoSchema.shape.organizations.optional(),
    })
  ).refine(
    (dto) => {
      const dtoKeys = Object.keys(dto);
      const containsValidChanges = Object.keys(PatchIndividualDtoSchema).some(
        (key) => dtoKeys.includes(key)
      );

      // HACK(FelixZY): Typescript does not allow a direct `return containsChanges`
      // as we are referencing `PatchIndividualDtoSchema` in this function:
      // ```
      // 'PatchIndividualDtoSchema' implicitly has type 'any' because it does not
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
