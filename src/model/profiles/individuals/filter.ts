import { KeyPagedParameterModel } from "@/model/pagination";
import { BaseProfileReferenceModel } from "@/model/profiles/base/reference";
import { IndividualTag } from "@prisma/client";

export interface IndividualFilterModel
  extends KeyPagedParameterModel<BaseProfileReferenceModel["id"]> {
  tags: Set<IndividualTag>;
  organizationIds: Set<BaseProfileReferenceModel["id"]>;
}
