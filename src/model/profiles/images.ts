import { ImageModel } from "@/model/storage/image";

export interface ImagesModel {
  cover: ImageModel | null;
  poster: ImageModel | null;
  square: ImageModel | null;
}
