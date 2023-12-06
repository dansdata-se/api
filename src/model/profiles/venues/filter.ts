import { KeyPagedParameterModel } from "@/model/pagination";
import { BaseProfileReferenceModel } from "@/model/profiles/base/reference";
import { CoordsModel } from "@/model/profiles/coords";

export interface VenueFilterModel
  extends KeyPagedParameterModel<BaseProfileReferenceModel["id"]> {
  near: CoordsModel | null;
  nameQuery: string | null;
  level: "root" | "leaf" | "any";
  includePermanentlyClosed: boolean;
}
