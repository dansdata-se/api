import { KeyPagedParameterModel } from "@/model/pagination";
import { BaseProfileReferenceModel } from "@/model/profiles/base/reference";
import { OrganizationTag } from "@prisma/client";

export interface OrganizationFilterModel
  extends KeyPagedParameterModel<BaseProfileReferenceModel["id"]> {
  tags: Set<OrganizationTag>;
  memberIds: Set<BaseProfileReferenceModel["id"]>;
}
