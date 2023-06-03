import { ImageModel } from "@/model/storage/image";

export type ImagesModel = {
  cover: ImageModel | null;
  poster: ImageModel | null;
  square: ImageModel | null;
};
