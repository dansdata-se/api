import { extendWithVenueFeatures } from "@/db/venues";
import { PrismaClient } from "@prisma/client";

export const prisma = extendWithVenueFeatures(new PrismaClient());
