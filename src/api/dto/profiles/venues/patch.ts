import { BasePatchProfileDtoSchema } from "@/api/dto/profiles/base/patch";
import { CreateVenueDtoSchema } from "@/api/dto/profiles/venues/create";
import { registry } from "@/api/registry";
import z from "@/api/zod";

export type PatchVenueDto = z.infer<typeof PatchVenueDtoSchema>;
export const PatchVenueDtoSchema = registry.register(
  "PatchVenueDto",
  BasePatchProfileDtoSchema.merge(
    z.object({
      coords: CreateVenueDtoSchema.shape.coords.optional(),
      permanentlyClosed:
        CreateVenueDtoSchema.shape.permanentlyClosed.optional(),
      parentId: CreateVenueDtoSchema.shape.parentId.optional(),
    })
  ).refine(
    (dto) => {
      const dtoKeys = Object.keys(dto);
      const containsValidChanges = Object.keys(PatchVenueDtoSchema).some(
        (key) => dtoKeys.includes(key)
      );

      // HACK(FelixZY): Typescript does not allow a direct `return containsChanges`
      // as we are referencing `PatchVenueDtoSchema` in this function:
      // ```
      // 'PatchVenueDtoSchema' implicitly has type 'any' because it does not
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
