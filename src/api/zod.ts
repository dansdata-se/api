import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
// eslint-disable-next-line no-restricted-imports
import z from "zod";

extendZodWithOpenApi(z);

export default z;
