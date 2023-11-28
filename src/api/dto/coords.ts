import z from "@/api/zod";

export const CoordsDtoSchema = z.object({
  lat: z.number().min(-90).max(90).describe("Latitude"),
  lng: z.number().min(-180).max(180).describe("Longitude"),
});
