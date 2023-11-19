import type { registry } from "@/api/registry";
import { NextApiRequest } from "next";

export interface AuthenticationMethod {
  securityScheme:
    | ReturnType<typeof registry.registerComponent<"securitySchemes">>
    | "undocumented";
  /**
   * Whether or not the given request contains valid authentication information
   */
  isAuthenticated(req: NextApiRequest): boolean;
}
