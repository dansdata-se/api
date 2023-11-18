import z from "@/api/zod";

export const CoordsDtoSchema = z.object({
  lat: z.number().min(-90).max(90).openapi({
    description: "Latitude",
  }),
  lng: z.number().min(-180).max(180).openapi({
    description: "Longitude",
  }),
});
