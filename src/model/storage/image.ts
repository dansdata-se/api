import { CreateImageUploadUrlDTO } from "@/api/dto/storage/image";
import { ImageEntity } from "@prisma/client";

export type ImageUploadUrlModel = CreateImageUploadUrlDTO;
export type ImageModel = ImageEntity;
