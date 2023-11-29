import { IndividualFilterParameters } from "@/api/dto/profiles/individuals/filter";
import { IndividualFilterModel } from "@/model/profiles/individuals/filter";

export function mapIndividualFilterParametersToModel(
  params: IndividualFilterParameters
): IndividualFilterModel {
  return {
    tags: new Set(params.tags),
    organizationIds: new Set(params.orgs),
    pageKey: params.pageKey ?? null,
  };
}
