import { OrganizationFilterParameters } from "@/api/dto/profiles/organizations/filter";
import { OrganizationFilterModel } from "@/model/profiles/organizations/filter";

export function mapOrganizationFilterParametersToModel(
  params: OrganizationFilterParameters
): OrganizationFilterModel {
  return {
    nameQuery: params.qName ?? null,
    tags: new Set(params.tags),
    memberIds: new Set(params.members),
    pageKey: params.pageKey ?? null,
  };
}
